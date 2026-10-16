import { ApiError } from '@/core/api';
import type { StaffRole } from '@/modules/authentication';
import { ROLE_DOMAIN, TIER_ROLES, type NewStaffInput, type StaffMember, type StaffTier, type UpdateStaffInput } from '../shared/staff.types';

/**
 * DEVELOPMENT ONLY. Sample managers and agents kept in this browser's localStorage while the backend
 * is unavailable. Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production.
 *
 * Passwords an administrator sets are stored only as a salted SHA-256 hash (the real backend uses a slow
 * hash such as BCrypt). The demo sign-in reads these records from the same storage key, so accounts
 * created or edited here can sign in. Hashes are never returned to the page.
 */
export const DEMO_STAFF_STORAGE_KEY = 'taxedge.demo.adminStaff';
const STORAGE_KEY = DEMO_STAFF_STORAGE_KEY;
const DAY = 86_400_000;

type Seed = [id: string, name: string, username: string, role: StaffRole, managerId: string | null, active: boolean, open: number, done: number, sla: number, joinedDaysAgo: number, lastLoginHoursAgo: number | null];

const SEEDS: readonly Seed[] = [
  ['MGR-101', 'Sanjay Verma', 'camanager@gmail.com', 'CA_MANAGER', null, true, 18, 64, 96, 540, 2],
  ['MGR-102', 'Neha Kulkarni', 'neha.kulkarni@taxedge.in', 'CA_MANAGER', null, true, 11, 41, 93, 300, 26],
  ['MGR-201', 'Ananya Deshmukh', 'loanmanager@gmail.com', 'LOAN_MANAGER', null, true, 9, 27, 89, 420, 5],
  ['MGR-202', 'Rahul Bansal', 'rahul.bansal@taxedge.in', 'LOAN_MANAGER', null, false, 0, 0, 0, 610, 900],
  ['AGT-301', 'Suresh Kumar', 'caagent@gmail.com', 'CA_AGENT', 'MGR-101', true, 14, 52, 93, 400, 1],
  ['AGT-302', 'Priya Sharma', 'priya.sharma@taxedge.in', 'CA_AGENT', 'MGR-101', true, 12, 57, 95, 380, 3],
  ['AGT-303', 'Imran Qureshi', 'imran.qureshi@taxedge.in', 'CA_AGENT', 'MGR-102', true, 9, 33, 88, 120, 30],
  ['AGT-401', 'Rajesh Patel', 'loanagent@gmail.com', 'LOAN_AGENT', 'MGR-201', true, 8, 19, 87, 260, 4],
  ['AGT-402', 'Kavita Iyer', 'kavita.iyer@taxedge.in', 'LOAN_AGENT', 'MGR-201', true, 6, 22, 91, 210, 20],
  ['AGT-403', 'Deepak Joshi', 'deepak.joshi@taxedge.in', 'LOAN_AGENT', 'MGR-201', false, 0, 3, 72, 90, 700]
];

function seed(): StaffMember[] {
  const now = Date.now();
  const names = new Map(SEEDS.map(([id, name]) => [id, name]));
  return SEEDS.map(([id, fullName, username, role, managerId, active, openCases, completedThisMonth, slaPercent, joined, login]) => ({
    id,
    fullName,
    username,
    role,
    managerId,
    managerName: managerId ? (names.get(managerId) ?? null) : null,
    active,
    openCases,
    completedThisMonth,
    slaPercent,
    joinedAt: new Date(now - joined * DAY).toISOString(),
    lastLoginAt: login === null ? null : new Date(now - login * 3_600_000).toISOString()
  }));
}

/** What is persisted: the public record plus the password hash, when one has been set. */
type StoredStaff = StaffMember & { readonly salt?: string; readonly passwordHash?: string };

async function hashPassword(salt: string, password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function credentialFor(password: string): Promise<{ salt: string; passwordHash: string }> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { salt, passwordHash: await hashPassword(salt, password) };
}

/** Strips credential fields so they never leave the store. */
function toPublic({ salt: _salt, passwordHash: _hash, ...member }: StoredStaff): StaffMember {
  return member;
}

function load(): StoredStaff[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredStaff[]) : persist(seed());
  } catch {
    return seed();
  }
}

function persist(items: StoredStaff[]): StoredStaff[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: keep working in memory for this page view.
  }
  return items;
}

const fail = (message: string): never => {
  throw new ApiError('VALIDATION_FAILED', message, 409);
};

export const demoStaffStore = Object.freeze({
  async list(tier: StaffTier): Promise<StaffMember[]> {
    return load().filter((member) => TIER_ROLES[tier].includes(member.role)).map(toPublic);
  },

  async create(input: NewStaffInput): Promise<StaffMember> {
    const items = load();
    const username = input.username.trim().toLowerCase();
    if (items.some((member) => member.username === username)) fail('An account with this email already exists.');
    const manager = input.managerId ? items.find((member) => member.id === input.managerId) : undefined;
    const prefix = input.role.endsWith('MANAGER') ? 'MGR' : 'AGT';
    const created: StoredStaff = {
      ...(await credentialFor(input.password)),
      id: `${prefix}-${Date.now().toString(36).toUpperCase()}`,
      fullName: input.fullName.trim(),
      username,
      role: input.role,
      managerId: manager?.id ?? null,
      managerName: manager?.fullName ?? null,
      active: true,
      openCases: 0,
      completedThisMonth: 0,
      slaPercent: 0,
      joinedAt: new Date().toISOString(),
      lastLoginAt: null
    };
    persist([...items, created]);
    return toPublic(created);
  },

  async update(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const items = load();
    const current = items.find((member) => member.id === id) ?? fail('This account no longer exists.');
    const username = input.username.trim().toLowerCase();
    if (items.some((member) => member.id !== id && member.username === username)) fail('An account with this email already exists.');
    const hasActiveAgents = items.some((member) => member.managerId === id && member.active);
    if (hasActiveAgents && ROLE_DOMAIN[input.role] !== ROLE_DOMAIN[current.role]) {
      fail('Move this manager’s active agents first; a manager with a team cannot switch domain.');
    }
    const manager = input.managerId ? items.find((member) => member.id === input.managerId) : undefined;
    // Seeded demo logins have no stored hash yet; their sign-in id can only change together with a new password.
    if (username !== current.username && !current.passwordHash && !input.password) {
      fail('Set a new password when changing this account’s sign-in email.');
    }
    const fullName = input.fullName.trim();
    const updated: StoredStaff = {
      ...current,
      ...(input.password ? await credentialFor(input.password) : {}),
      fullName,
      username,
      role: input.role,
      managerId: manager?.id ?? null,
      managerName: manager?.fullName ?? null
    };
    // Keep agents' "Reports to" name in step when a manager is renamed.
    persist(items.map((member) => (member.id === id ? updated : member.managerId === id ? { ...member, managerName: fullName } : member)));
    return toPublic(updated);
  },

  async setActive(id: string, active: boolean): Promise<void> {
    const items = load();
    // Same rule the backend enforces: a manager with active agents must hand them over first.
    if (!active && items.some((member) => member.managerId === id && member.active)) {
      fail('Reassign or deactivate this manager’s active agents first.');
    }
    persist(items.map((member) => (member.id === id ? { ...member, active } : member)));
  }
});
