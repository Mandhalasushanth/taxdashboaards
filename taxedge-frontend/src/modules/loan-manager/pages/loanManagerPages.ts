import type { ComponentType } from 'react';
import type { LoanManagerSectionId } from '../shared/loanManager.types';

type PageLoader = () => Promise<{ default: ComponentType }>;

/** The profile page opened from the sidebar footer. */
export const loadLoanManagerProfilePage: PageLoader = () => import('../components/profile/LoanManagerProfileSection');

/**
 * Lazy page loader for every Loan Manager menu section, so each section ships as its own chunk.
 * "overview" is the dashboard; the rest live in loan-manager/components/<section>/.
 */
export const LOAN_MANAGER_PAGE_LOADERS: Readonly<Record<LoanManagerSectionId, PageLoader>> = Object.freeze({
  overview: () => import('../dashboard/LoanManagerDashboardPage'),
  verify: () => import('../components/to-verify/ToVerifySection'),
  customer: () => import('../components/waiting-on-customer/WaitingOnCustomerSection'),
  payment: () => import('../components/awaiting-payment/AwaitingPaymentSection'),
  assign: () => import('../components/ready-to-assign/ReadyToAssignSection'),
  missing: () => import('../components/missing-documents/MissingDocumentsSection'),
  working: () => import('../components/with-agents/WithAgentsSection'),
  completed: () => import('../components/completed/CompletedSection'),
  agents: () => import('../components/agents/AgentsSection'),
  audit: () => import('../components/audit-log/AuditLogSection'),
  communication: () => import('../components/communication/CommunicationSection'),
  notifications: () => import('../components/notifications/NotificationsSection')
});
