import type { Role } from '../shared/types/role.types';

/**
 * DEVELOPMENT ONLY. Seed accounts for the in-browser demo gateway, one per role.
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
  },
  {
    id: 2,
    username: 'camanager@gmail.com',
    displayName: deriveDisplayNameFromUsername('camanager@gmail.com'),
    role: 'CA_MANAGER',
    active: true,
    salt: 'ae05e1204e132a44bbc8a9459fa5d19b',
    passwordHash: 'd3a2185c88444973734f5460baaf5e72df1fa0f0b3cf95d55a06a48b8aa3551f',
    permissions: ['STAFF_DASHBOARD_VIEW', 'CA_OPERATIONS_VIEW', 'CA_CASE_ASSIGN', 'TEAM_OVERSIGHT']
  },
  {
    id: 3,
    username: 'caagent@gmail.com',
    displayName: deriveDisplayNameFromUsername('caagent@gmail.com'),
    role: 'CA_AGENT',
    active: true,
    salt: '7b017a4a66eb8e2e467f34c7a6e54233',
    passwordHash: '6d8605fae7a5923f8d4b085fdbe524534bf9fc0d08d776f785ade02611507792',
    permissions: ['STAFF_DASHBOARD_VIEW', 'CA_OPERATIONS_VIEW', 'CA_CASE_UPDATE']
  },
  {
    id: 4,
    username: 'loanmanager@gmail.com',
    displayName: deriveDisplayNameFromUsername('loanmanager@gmail.com'),
    role: 'LOAN_MANAGER',
    active: true,
    salt: '84ef653e55f291a76e021026ea1dcd96',
    passwordHash: '86a3bfff9d1281071e6adb8afabb65d65c4b05c1c5424a20fb1f05efe2c403b3',
    permissions: ['STAFF_DASHBOARD_VIEW', 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_ASSIGN', 'TEAM_OVERSIGHT']
  },
  {
    id: 5,
    username: 'loanagent@gmail.com',
    displayName: deriveDisplayNameFromUsername('loanagent@gmail.com'),
    role: 'LOAN_AGENT',
    active: true,
    salt: '9f1452f39c709be4e4a211ed50c321e3',
    passwordHash: '8b8f550590986fbb7ec83dc23b9f57d5dcbe6f673fa25bb2cf53e128e4479789',
    permissions: ['STAFF_DASHBOARD_VIEW', 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_UPDATE']
  }
]);
