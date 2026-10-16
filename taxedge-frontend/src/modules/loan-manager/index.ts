/** Loan Manager module. Other modules and the router import only from this file. */
export { LOAN_MANAGER_MODULE_ROLE } from './shared/loanManager.config';

/** Route-level page, lazy-loaded by the router. */
export const loadLoanManagerDashboardPage = () => import('./dashboard/LoanManagerDashboardPage');
