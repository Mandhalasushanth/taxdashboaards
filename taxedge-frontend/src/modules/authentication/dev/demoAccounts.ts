import type { Role } from '../shared/types/role.types';

/**
 * DEVELOPMENT ONLY. The one built-in account: the administrator. Every manager and agent login is
 * created by the administrator in Admin → Managers / Agents; there are no other predefined users.
 * Only salted SHA-256 hashes are stored; this module is loaded through a dynamic import
 * guarded by `import.meta.env.DEV` and is excluded from production bundles.
 */
export interface DemoAccount {
  readonly id: number;
  readonly username: string;
  readonly displayName: string;
  readonly role: Role;
  readonly active: boolean;
  readonly salt: string;
  readonly passwordHash: string;
  readonly permissions: readonly string[];
}

import { deriveDisplayNameFromUsername } from '../shared/utils/displayNameUtils';
export { deriveDisplayNameFromUsername };

export const DEMO_ACCOUNTS: readonly DemoAccount[] = Object.freeze([
  {
    id: 1,
    username: 'admin@gmail.com',
    displayName: deriveDisplayNameFromUsername('admin@gmail.com'),
    role: 'ADMIN',
    active: true,
    salt: '97471fd84549dd0920bd8f48d8a4348e',
    passwordHash: 'a5a2907b0d8735b8278ece030134549e195dae4ed38d5878142584d52a20dd90',
    permissions: ['ADMIN_DASHBOARD_VIEW', 'USER_MANAGEMENT', 'CA_OPERATIONS_VIEW', 'LOAN_OPERATIONS_VIEW']
  }
]);

/** What each role may do; applied to every account the administrator creates. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly string[]>> = Object.freeze({
  ADMIN: ['ADMIN_DASHBOARD_VIEW', 'USER_MANAGEMENT', 'CA_OPERATIONS_VIEW', 'LOAN_OPERATIONS_VIEW'],
  CA_MANAGER: ['STAFF_DASHBOARD_VIEW', 'CA_OPERATIONS_VIEW', 'CA_CASE_ASSIGN', 'TEAM_OVERSIGHT'],
  CA_AGENT: ['STAFF_DASHBOARD_VIEW', 'CA_OPERATIONS_VIEW', 'CA_CASE_UPDATE'],
  LOAN_MANAGER: ['STAFF_DASHBOARD_VIEW', 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_ASSIGN', 'TEAM_OVERSIGHT'],
  LOAN_AGENT: ['STAFF_DASHBOARD_VIEW', 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_UPDATE']
});
