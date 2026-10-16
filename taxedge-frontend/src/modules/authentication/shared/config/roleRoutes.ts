import { ROUTE_PATHS } from '@/core/config/routePaths';
import { PERMISSIONS, type KnownPermission } from '../types/permission.types';
import type { Role, RoleProfile, RoleTier, ServiceDomain, StaffRole, WorkspaceArea } from '../types/role.types';

export const DOMAIN_LABELS: Readonly<Record<ServiceDomain, string>> = Object.freeze({
  GLOBAL: 'All services',
  CA: 'Chartered Accountancy (CA)',
  LOAN: 'Loans'
});

export const TIER_LABELS: Readonly<Record<RoleTier, string>> = Object.freeze({
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager',
  AGENT: 'Agent'
});

/** Presentation and navigation metadata per role. Authorization itself is decided by the server. */
export const ROLE_PROFILES: Readonly<Record<Role, RoleProfile>> = Object.freeze({
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrator',
    area: 'admin',
    domain: 'GLOBAL',
    tier: 'ADMINISTRATOR',
    landingRoute: ROUTE_PATHS.adminDashboard,
    dashboardTitle: 'Admin Dashboard',
    dashboardSummary: 'Provision staff accounts, oversee CA and loan operations, and monitor platform activity.'
  },
  CA_MANAGER: {
    role: 'CA_MANAGER',
    label: 'CA Manager',
    area: 'staff',
    domain: 'CA',
    tier: 'MANAGER',
    landingRoute: ROUTE_PATHS.staffDashboard,
    dashboardTitle: 'CA Manager Dashboard',
    dashboardSummary: 'Assign CA cases to your agents, review filings, and track compliance deadlines.'
  },
  CA_AGENT: {
    role: 'CA_AGENT',
    label: 'CA Agent',
    area: 'staff',
    domain: 'CA',
    tier: 'AGENT',
    landingRoute: ROUTE_PATHS.staffDashboard,
    dashboardTitle: 'CA Agent Dashboard',
    dashboardSummary: 'Work through your assigned CA cases, collect documents, and update filing status.'
  },
  LOAN_MANAGER: {
    role: 'LOAN_MANAGER',
    label: 'Loan Manager',
    area: 'staff',
    domain: 'LOAN',
    tier: 'MANAGER',
    landingRoute: ROUTE_PATHS.staffDashboard,
    dashboardTitle: 'Loan Manager Dashboard',
    dashboardSummary: 'Distribute loan applications to your agents, approve evaluations, and monitor disbursals.'
  },
  LOAN_AGENT: {
    role: 'LOAN_AGENT',
    label: 'Loan Agent',
    area: 'staff',
    domain: 'LOAN',
    tier: 'AGENT',
    landingRoute: ROUTE_PATHS.staffDashboard,
    dashboardTitle: 'Loan Agent Dashboard',
    dashboardSummary: 'Process your assigned loan applications, verify documents, and update application status.'
  }
});

export const STAFF_ROLES: readonly StaffRole[] = Object.freeze(['CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT']);

export const ADMIN_ROLES: readonly Role[] = Object.freeze(['ADMIN']);

/** Root path and dashboard permission for each workspace area. */
export const AREA_ACCESS: Readonly<Record<WorkspaceArea, { rootPath: string; permission: KnownPermission }>> =
  Object.freeze({
    admin: { rootPath: ROUTE_PATHS.adminRoot, permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },
    staff: { rootPath: ROUTE_PATHS.staffRoot, permission: PERMISSIONS.STAFF_DASHBOARD_VIEW }
  });
