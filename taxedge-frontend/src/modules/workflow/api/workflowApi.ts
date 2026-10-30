import { API_ENDPOINTS, ApiError, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
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

const { workflow: ENDPOINTS } = API_ENDPOINTS;

/** The browser demo replaces the backend only on the Vite dev server with demo auth switched on. */
const useDemo = () => import.meta.env.DEV && environment.demoAuthEnabled;
const loadDemo = () => import('../dev/demoWorkflowStore').then((module) => module.demoWorkflowStore);

const casePath = (id: string, suffix = '') => `${ENDPOINTS.cases}/${encodeURIComponent(id)}${suffix}`;

function toQueryString(params: Readonly<Record<string, unknown>>): string {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '' && value !== 'ALL' && value !== false)
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
  ).toString();
  return search ? `?${search}` : '';
}

function expectObject<T>(value: unknown, what: string): T {
  if (!value || typeof value !== 'object') {
    throw new ApiError('INVALID_RESPONSE', `The server returned an invalid ${what}.`);
  }
  return value as T;
}

function expectArray<T>(value: unknown, what: string): T[] {
  if (!Array.isArray(value)) {
    throw new ApiError('INVALID_RESPONSE', `The server returned an invalid ${what} list.`);
  }
  return value as T[];
}

/** HTTP route for each mutation type; every body carries the version it was based on. */
function sendMutation(id: string, expectedVersion: number, mutation: CaseMutation): Promise<unknown> {
  switch (mutation.type) {
    case 'ASSIGN':
      return apiClient.post(casePath(id, '/assignment'), { expectedVersion, ...mutation.input });
    case 'TRANSITION':
      return apiClient.post(casePath(id, '/transitions'), { expectedVersion, ...mutation.input });
    case 'DOCUMENTS_DOWNLOADED':
      return apiClient.post(casePath(id, '/documents/downloaded'), { expectedVersion });
    case 'REMOVE_OUTPUT':
      return apiClient.delete(casePath(id, `/outputs/${encodeURIComponent(mutation.outputId)}?expectedVersion=${expectedVersion}`));
    case 'NOTE':
      return apiClient.post(casePath(id, '/notes'), { expectedVersion, text: mutation.text });
    case 'DOCUMENT_REVIEW':
      return apiClient.post(casePath(id, `/documents/${encodeURIComponent(mutation.documentId)}/review`), {
        expectedVersion,
        decision: mutation.decision,
        reason: mutation.reason
      });
  }
}

/**
 * Single gateway to the workflow backend. Scope (team, assignment) and every rule are enforced by the
 * server from the session; the frontend never sends role or actor ids it could forge.
 */
export const workflowApi = Object.freeze({
  async listCases(query: CaseQuery): Promise<CasePage> {
    if (useDemo()) return (await loadDemo()).listCases(query);
    return expectObject<CasePage>(await apiClient.get<unknown>(`${ENDPOINTS.cases}${toQueryString({ ...query })}`), 'case page');
  },

  async getCase(id: string): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).getCase(id);
    return expectObject<WorkflowCase>(await apiClient.get<unknown>(casePath(id)), 'application');
  },

  async summary(): Promise<CaseSummary> {
    if (useDemo()) return (await loadDemo()).summary();
    return expectObject<CaseSummary>(await apiClient.get<unknown>(ENDPOINTS.summary), 'summary');
  },

  async submitCase(input: CaseIntakeInput): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).submitCase(input);
    return expectObject<WorkflowCase>(await apiClient.post<unknown>(ENDPOINTS.cases, input), 'application');
  },

  async mutate(id: string, expectedVersion: number, mutation: CaseMutation): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).mutate(id, expectedVersion, mutation);
    return expectObject<WorkflowCase>(await sendMutation(id, expectedVersion, mutation), 'application');
  },

  async uploadDocument(id: string, expectedVersion: number, documentId: string, file: File): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).uploadDocument(id, expectedVersion, documentId, file);
    const form = new FormData();
    form.append('file', file);
    form.append('expectedVersion', String(expectedVersion));
    return expectObject<WorkflowCase>(
      await apiClient.upload<unknown>(casePath(id, `/documents/${encodeURIComponent(documentId)}`), form),
      'application'
    );
  },

  async uploadOutput(id: string, expectedVersion: number, file: File): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).uploadOutput(id, expectedVersion, file);
    const form = new FormData();
    form.append('file', file);
    form.append('expectedVersion', String(expectedVersion));
    return expectObject<WorkflowCase>(await apiClient.upload<unknown>(casePath(id, '/outputs'), form), 'application');
  },

  async listAgents(): Promise<StaffOption[]> {
    if (useDemo()) return (await loadDemo()).listAgents();
    return expectArray<StaffOption>(await apiClient.get<unknown>(ENDPOINTS.agents), 'agent');
  },

  async workload(): Promise<AgentWorkload[]> {
    if (useDemo()) return (await loadDemo()).workload();
    return expectArray<AgentWorkload>(await apiClient.get<unknown>(ENDPOINTS.workload), 'workload');
  },

  async auditLog(query: AuditQuery): Promise<AuditPage> {
    if (useDemo()) return (await loadDemo()).auditLog(query);
    return expectObject<AuditPage>(await apiClient.get<unknown>(`${ENDPOINTS.audit}${toQueryString({ ...query })}`), 'audit page');
  },

  async notifications(): Promise<WorkflowNotification[]> {
    if (useDemo()) return (await loadDemo()).notifications();
    return expectArray<WorkflowNotification>(await apiClient.get<unknown>(ENDPOINTS.notifications), 'notification');
  },

  async markNotificationRead(id: string): Promise<void> {
    if (useDemo()) return (await loadDemo()).markNotificationRead(id);
    await apiClient.patch(`${ENDPOINTS.notifications}/${encodeURIComponent(id)}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    if (useDemo()) return (await loadDemo()).markAllNotificationsRead();
    await apiClient.post(ENDPOINTS.notificationsReadAll);
  }
});
