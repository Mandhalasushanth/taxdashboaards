/** Loan Agent module. Other modules and the router import only from this file. */
export { LOAN_AGENT_MODULE_ROLE } from './shared/loanAgent.config';

/** Route-level page, lazy-loaded by the router. */
export const loadLoanAgentDashboardPage = () => import('./dashboard/LoanAgentDashboardPage');
