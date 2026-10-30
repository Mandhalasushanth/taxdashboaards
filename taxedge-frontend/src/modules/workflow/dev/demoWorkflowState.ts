import { ApiError } from '@/core/api';
import { ROLE_DOMAIN } from '@/modules/admin/shared/staff.types';
import { authStore } from '@/store';
import { STATUS_META } from '../shared/workflowStatuses';
import { buildSeedCases, type DemoCaseSeed } from './demoWorkflowSeeds';
import type { StaffOption, WorkflowActor, WorkflowCase, WorkflowNotification } from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. Persistence, staff directory and signed-in actor for the workflow demo backend.
 * Loaded only through the dev-guarded demo store; excluded from production builds.
 */
const STORAGE_KEY = 'taxedge.demo.workflow.v7';

export interface StoredNotification extends WorkflowNotification {
  readonly recipientId: string;
}

export interface DemoState {
  readonly cases: readonly WorkflowCase[];
  readonly notifications: readonly StoredNotification[];
}


export interface DirectoryEntry {
  readonly option: StaffOption;
  readonly username: string;
}

/** Staff come from the demo directory the admin manages, so accounts created there can receive work. */
export async function loadDirectory(): Promise<DirectoryEntry[]> {
  const { demoStaffStore } = await import('@/modules/admin/dev/demoStaffStore');
  const [managers, agents] = await Promise.all([demoStaffStore.list('MANAGER'), demoStaffStore.list('AGENT')]);
  return [...managers, ...agents].map((member) => ({
    username: member.username,
    option: { id: member.id, name: member.fullName, email: member.username, managerId: member.managerId, role: member.role, team: ROLE_DOMAIN[member.role], active: member.active }
  }));
}

/** The server resolves the actor from the session cookie; the demo resolves it from the signed-in user. */
export function resolveActor(directory: readonly DirectoryEntry[]): WorkflowActor {
  const user = authStore.getState().user;
  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Your session has expired. Please sign in again.', 401);
  }
  const member = directory.find((entry) => entry.username === user.username.toLowerCase())?.option;
  return { id: member?.id ?? `USR-${user.id}`, name: member?.name ?? user.displayName, role: user.role };
}

/** A stored case from an older demo version (unknown status, missing payment or files) would break the screens. */
const isCurrentCase = (value: unknown): boolean => {
  const item = value as Partial<WorkflowCase> | null;
  return Boolean(
    item &&
      typeof item.status === 'string' &&
      item.status in STATUS_META &&
      item.payment &&
      Array.isArray(item.documents) &&
      Array.isArray(item.outputs) &&
      Array.isArray(item.history) &&
      Array.isArray(item.notes)
  );
};

/** Returns the saved demo data, or null (so fresh sample data is loaded) when it is missing or outdated. */
function readState(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoState) : null;
    const valid = parsed !== null && Array.isArray(parsed.cases) && Array.isArray(parsed.notifications) && parsed.cases.every(isCurrentCase);
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(state: DemoState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the change still applies for this page session.
  }
}

let memoryState: DemoState | null = null;

/** Each role module ships the demo cases for its own queues; together they form the demo data set. */
async function loadSeeds(): Promise<DemoCaseSeed[]> {
  const modules = await Promise.all([
    import('@/modules/ca-manager/dev/demoCaManagerSeeds').then((module) => module.CA_MANAGER_DEMO_SEEDS),
    import('@/modules/ca-agent/dev/demoCaAgentSeeds').then((module) => module.CA_AGENT_DEMO_SEEDS),
    import('@/modules/loan-manager/dev/demoLoanManagerSeeds').then((module) => module.LOAN_MANAGER_DEMO_SEEDS),
    import('@/modules/loan-agent/dev/demoLoanAgentSeeds').then((module) => module.LOAN_AGENT_DEMO_SEEDS)
  ]);
  return modules.flat();
}

/** Storage is re-read on every request so changes made under another demo login are always visible. */
/**
 * A fresh system: every sample is a customer submission waiting for a manager. Staff exist only once the
 * administrator creates them, so no sample is pre-assigned to anyone.
 */
const asFreshSubmission = ([service, serviceType, client, pan, city, , priority, , daysAgo, dueIn, details]: DemoCaseSeed): DemoCaseSeed =>
  [service, serviceType, client, pan, city, 'SUBMITTED', priority, null, daysAgo, dueIn, details];

export async function loadState(staff: readonly StaffOption[]): Promise<DemoState> {
  const stored = readState();
  if (stored) {
    return stored;
  }
  memoryState ??= saveState({ cases: buildSeedCases((await loadSeeds()).map(asFreshSubmission), staff), notifications: [] });
  return memoryState;
}

export function saveState(state: DemoState): DemoState {
  memoryState = state;
  writeState(state);
  return state;
}

