/** CA Agent module. Other modules and the router import only from this file. */
export { CA_AGENT_MODULE_ROLE } from './shared/caAgent.config';

/** Route-level page, lazy-loaded by the router. */
export const loadCaAgentDashboardPage = () => import('./dashboard/CaAgentDashboardPage');
