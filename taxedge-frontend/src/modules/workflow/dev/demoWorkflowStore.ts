import { ApiError } from '@/core/api';
import { computeWorkload, isClosed, queryCases, summarizeCases } from '../services/caseQueries';
import {
  WorkflowRuleError,
  availableActions,
  canAddNote,
  canDownloadDocuments,
  canReviewDocuments,
  canUploadDocuments,
  canUploadOutput,
  canViewCase,
  teamOf,
  tierOf
} from '../services/transitionRules';
import { getServiceType } from '../shared/serviceTypes';
import { SERVICE_DEFINITIONS } from '../shared/workflowServices';
import { validateDocumentFile } from '../validation/documentValidation';
import { normalizeIntake, validateIntake } from '../validation/intakeValidation';
import { rememberUploadedFile, samplePreviewUrl, uploadedFileUrl } from './demoDocumentPreview';
import { applyMutation, commit, makeEvent, newId, notify, persistCase, reject, teamManagers, type Context } from './demoWorkflowMutations';
import { loadDirectory, loadState, resolveActor, saveState } from './demoWorkflowState';
import type {
  AgentWorkload,
  AuditPage,
  AuditQuery,
  CaseIntakeInput,
  CaseMutation,
  CasePage,
  CaseQuery,
  CaseSummary,
  StaffOption,
  WorkflowCase,
  WorkflowNotification
} from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. Browser stand-in for the workflow backend, persisted in localStorage. It applies the
 * same transition, ownership and validation rules the server must enforce, records an audit event for
 * every change, and keeps notifications per recipient. Excluded from production builds.
 */
const DAY = 86_400_000;

function toApiError(error: unknown): unknown {
  if (!(error instanceof WorkflowRuleError)) {
    return error;
  }
  const status = error.code === 'FORBIDDEN' ? 403 : error.code === 'CONFLICT' ? 409 : 422;
  return new ApiError(error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'VALIDATION_FAILED', error.message, status);
}

/** Loads staff, actor and state, runs the operation, and converts rule failures into API errors. */
async function run<T>(operation: (context: Context) => T): Promise<T> {
  try {
    const directory = await loadDirectory();
    const staff = directory.map((entry) => entry.option);
    const actor = resolveActor(directory);
    const state = await loadState(staff);
    return operation({ staff, actor, state });
  } catch (error) {
    throw toApiError(error);
  }
}

const fileUrl = (id: string, label: string, item: WorkflowCase, uploadedBy: string | null) =>
  uploadedFileUrl(id) ?? samplePreviewUrl(label, item.client.name, uploadedBy ?? item.client.name);

/** Mirrors the server: each case in a response carries the caller's allowed actions and short-lived file links. */
function withAccess(context: Context, item: WorkflowCase): WorkflowCase {
  return {
    ...item,
    documents: item.documents.map((doc) => ({ ...doc, fileUrl: doc.fileName ? fileUrl(doc.id, doc.label, item, doc.uploadedBy) : null })),
    outputs: item.outputs.map((output) => ({ ...output, fileUrl: fileUrl(output.id, output.fileName, item, output.uploadedBy) })),
    access: {
      actions: availableActions(context.actor, item),
      canAddNote: canAddNote(context.actor, item),
      canReviewDocuments: canReviewDocuments(context.actor, item),
      canUploadDocuments: canUploadDocuments(context.actor, item),
      canDownloadDocuments: canDownloadDocuments(context.actor, item),
      canUploadOutput: canUploadOutput(context.actor, item)
    }
  };
}

/** Every agent of the manager's team (CA or Loan) can receive work from any manager of that team. The admin sees all agents. */
function teamAgents(context: Context): StaffOption[] {
  const team = teamOf(context.actor.role);
  return context.staff.filter((member) => tierOf(member.role) === 'AGENT' && (team === null || member.team === team));
}

function visibleCases(context: Context): WorkflowCase[] {
  return context.state.cases.filter((item) => canViewCase(context.actor, item));
}

function findVisible(context: Context, id: string): WorkflowCase {
  const item = context.state.cases.find((candidate) => candidate.id === id);
  return item && canViewCase(context.actor, item) ? item : reject('FORBIDDEN', 'This application does not exist or you cannot access it.');
}

function requireVersion(item: WorkflowCase, expectedVersion: number): void {
  if (item.version !== expectedVersion) {
    reject('CONFLICT', 'This application was updated by someone else. Reload it and try again.');
  }
}

export const demoWorkflowStore = Object.freeze({
  listCases: (query: CaseQuery): Promise<CasePage> =>
    run((context) => {
      const page = queryCases(visibleCases(context), query);
      return { ...page, items: page.items.map((item) => withAccess(context, item)) };
    }),

  getCase: (id: string): Promise<WorkflowCase> => run((context) => withAccess(context, findVisible(context, id))),

  summary: (): Promise<CaseSummary> => run((context) => summarizeCases(visibleCases(context))),

  submitCase: (raw: CaseIntakeInput): Promise<WorkflowCase> =>
    run((context) => {
      const tier = tierOf(context.actor.role);
      const definition = SERVICE_DEFINITIONS[raw.service];
      if (tier === 'AGENT' || (tier === 'MANAGER' && teamOf(context.actor.role) !== definition.team)) {
        reject('FORBIDDEN', 'You cannot record applications for this service.');
      }
      const type = getServiceType(raw.serviceType, raw.service);
      if (type.id !== raw.serviceType || type.service !== raw.service) {
        reject('VALIDATION_FAILED', 'Choose a service type offered under this service.');
      }
      const errors = validateIntake(raw);
      const firstError = Object.values(errors)[0];
      if (firstError) reject('VALIDATION_FAILED', firstError);
      const input = normalizeIntake(raw);
      const duplicate = context.state.cases.find((item) => item.serviceType === input.serviceType && item.client.pan === input.client.pan && !isClosed(item));
      if (duplicate) reject('CONFLICT', `An open ${type.label} application already exists for this PAN (${duplicate.referenceNumber}).`);
      const now = Date.now();
      const sequence = context.state.cases.length + 1001;
      const id = `CASE-${sequence}`;
      const base: WorkflowCase = {
        id,
        referenceNumber: `TE-${definition.shortLabel.slice(0, 3).toUpperCase()}-${new Date(now).getFullYear()}-${sequence}`,
        service: input.service,
        serviceType: type.id,
        team: definition.team,
        client: input.client,
        details: input.details,
        status: 'SUBMITTED',
        priority: input.priority,
        assignment: { managerId: null, managerName: null, agentId: null, agentName: null, assignedAt: null, instructions: null },
        dueDate: new Date(now + definition.slaDays * DAY).toISOString(),
        submittedAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
        version: 0,
        documents: type.documents.map((doc, index) => ({
          id: `${id}-D${index + 1}`, typeId: `doc-${index + 1}`, label: doc.label, required: doc.required, state: 'MISSING', fileName: null, uploadedBy: null, uploadedAt: null, version: 0, rejectionReason: null
        })),
        payment: { state: 'NOT_REQUESTED', amount: null, requestedAt: null, paidAt: null, reference: null },
        documentsDownloadedAt: null,
        outputs: [],
        openIssue: null,
        notes: [],
        history: []
      };
      const event = makeEvent(context.actor, base, 'SUBMITTED', 'SUBMITTED', `Recorded on behalf of ${input.client.name}.`, { fromStatus: null });
      const created = commit(base, {}, event);
      saveState({
        cases: [created, ...context.state.cases],
        notifications: [...notify(teamManagers(context, created), created, `New ${type.label} application ${created.referenceNumber} is waiting for verification.`), ...context.state.notifications]
      });
      return withAccess(context, created);
    }),

  mutate: (id: string, expectedVersion: number, mutation: CaseMutation): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      return withAccess(context, applyMutation(context, item, mutation));
    }),

  uploadDocument: (id: string, expectedVersion: number, documentId: string, file: File): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      if (!canUploadDocuments(context.actor, item)) reject('FORBIDDEN', 'Documents can be uploaded for the customer only while they are being checked or fixed.');
      const fileError = validateDocumentFile(file);
      if (fileError) reject('VALIDATION_FAILED', fileError);
      const doc = item.documents.find((entry) => entry.id === documentId) ?? reject('VALIDATION_FAILED', 'Document not found.');
      rememberUploadedFile(doc.id, file);
      const now = new Date().toISOString();
      const documents = item.documents.map((entry) =>
        entry.id === doc.id ? { ...entry, state: 'UPLOADED' as const, fileName: file.name, uploadedBy: context.actor.name, uploadedAt: now, version: entry.version + 1, rejectionReason: null } : entry
      );
      return withAccess(context, persistCase(context, commit(item, { documents }, makeEvent(context.actor, item, 'DOCUMENT_UPLOADED', null, `${doc.label} (v${doc.version + 1})`))));
    }),

  uploadOutput: (id: string, expectedVersion: number, file: File): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      if (!canUploadOutput(context.actor, item)) reject('FORBIDDEN', 'Results can be uploaded only by the assigned agent during portal work.');
      const fileError = validateDocumentFile(file);
      if (fileError) reject('VALIDATION_FAILED', fileError);
      const output = { id: newId('OUT'), fileName: file.name, uploadedBy: context.actor.name, uploadedAt: new Date().toISOString() };
      rememberUploadedFile(output.id, file);
      const event = makeEvent(context.actor, item, 'OUTPUT_UPLOADED', null, file.name, { clientVisible: false });
      return withAccess(context, persistCase(context, commit(item, { outputs: [...item.outputs, output] }, event)));
    }),

  listAgents: (): Promise<StaffOption[]> =>
    run((context) => {
      const tier = tierOf(context.actor.role);
      if (tier === 'AGENT') reject('FORBIDDEN', 'Only managers and administrators can view the agent directory.');
      return teamAgents(context);
    }),

  workload: (): Promise<AgentWorkload[]> =>
    run((context) => {
      if (tierOf(context.actor.role) === 'AGENT') reject('FORBIDDEN', 'Only managers and administrators can view team workload.');
      const agents = teamAgents(context);
      return computeWorkload(agents, visibleCases(context));
    }),

  auditLog: (query: AuditQuery): Promise<AuditPage> =>
    run((context) => {
      if (tierOf(context.actor.role) === 'AGENT') reject('FORBIDDEN', 'Audit logs are available to managers and administrators.');
      const search = (query.search ?? '').trim().toLowerCase();
      const cases = visibleCases(context).filter((item) => !query.service || query.service === 'ALL' || item.service === query.service);
      const references = new Map(cases.map((item) => [item.id, item.referenceNumber]));
      const events = cases
        .flatMap((item) => item.history)
        .filter((event) => !search || [event.actorName, event.action, references.get(event.caseId) ?? '', event.note ?? ''].some((value) => value.toLowerCase().includes(search)))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      const pageSize = Math.max(1, query.pageSize ?? 20);
      const page = Math.min(Math.max(1, query.page ?? 1), Math.max(1, Math.ceil(events.length / pageSize)));
      const items = events.slice((page - 1) * pageSize, page * pageSize).map((event) => ({ ...event, referenceNumber: references.get(event.caseId) }));
      return { items, total: events.length, page, pageSize };
    }),

  notifications: (): Promise<WorkflowNotification[]> =>
    run((context) => context.state.notifications.filter((entry) => entry.recipientId === context.actor.id)),

  markNotificationRead: (id: string): Promise<void> =>
    run((context) => {
      saveState({ ...context.state, notifications: context.state.notifications.map((entry) => (entry.id === id && entry.recipientId === context.actor.id ? { ...entry, read: true } : entry)) });
    }),

  markAllNotificationsRead: (): Promise<void> =>
    run((context) => {
      saveState({ ...context.state, notifications: context.state.notifications.map((entry) => (entry.recipientId === context.actor.id ? { ...entry, read: true } : entry)) });
    })
});
