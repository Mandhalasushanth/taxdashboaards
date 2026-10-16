/** CA Manager module. Other modules and the router import only from this file. */
export { CA_MANAGER_MODULE_ROLE } from './shared/caManager.config';

/** Route-level page, lazy-loaded by the router. */
export const loadCaManagerDashboardPage = () => import('./dashboard/CaManagerDashboardPage');

export {
  CaManagerSidebar,
  CA_MANAGER_SIDEBAR_ID,
  type CaManagerSidebarProps
} from './components/shared/CaManagerSidebar';

export { CaManagerHeaderActions } from './components/shared/CaManagerHeaderActions';

export { CaManagerProvider, useCaManagerSection } from './shared/CaManagerContext';

export {
  CA_NAV_ITEMS,
  getCaNavItem,
  type CaNavItem,
  type CaSectionId,
  type CaNavCounters,
  type CaCounterKey
} from './shared/caManagerNavigation';

export * from './shared/caManager.types';
