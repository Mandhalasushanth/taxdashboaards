import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { AREA_ACCESS, STAFF_ROLES, useCurrentUser, type Role } from '@/modules/authentication';
import { loadCaAgentDashboardPage } from '@/modules/ca-agent';
import {
  CA_MANAGER_SIDEBAR_ID,
  CaManagerHeaderActions,
  CaManagerProvider,
  CaManagerSidebar,
  loadCaManagerDashboardPage
} from '@/modules/ca-manager';
import { loadLoanAgentDashboardPage } from '@/modules/loan-agent';
import { loadLoanManagerDashboardPage } from '@/modules/loan-manager';
import { AuthenticationGuard } from '../guards/AuthenticationGuard';
import { PermissionGuard } from '../guards/PermissionGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { WorkspaceLayout, type SidebarControls } from '../layouts/WorkspaceLayout';

/** Each staff role has its own module; this picks the dashboard for the role the server assigned. */
const STAFF_DASHBOARDS: Partial<Record<Role, LazyExoticComponent<ComponentType>>> = Object.freeze({
  CA_MANAGER: lazy(loadCaManagerDashboardPage),
  CA_AGENT: lazy(loadCaAgentDashboardPage),
  LOAN_MANAGER: lazy(loadLoanManagerDashboardPage),
  LOAN_AGENT: lazy(loadLoanAgentDashboardPage)
});

function StaffDashboardRoute() {
  const user = useCurrentUser();
  const Dashboard = user ? STAFF_DASHBOARDS[user.role] : undefined;
  return Dashboard ? <Dashboard /> : <Navigate to={ROUTE_PATHS.unauthorized} replace />;
}

const StaffProfilePage = lazy(() => import('@/modules/admin/components/profile/ProfileSection'));

const renderCaSidebar = (controls: SidebarControls) => <CaManagerSidebar {...controls} />;
const renderCaActions = () => <CaManagerHeaderActions />;
const resolveCaTitle = () => 'CA Operations Workspace';

function StaffWorkspaceShell() {
  const user = useCurrentUser();

  if (user?.role === 'CA_MANAGER') {
    return (
      <CaManagerProvider>
        <WorkspaceLayout
          renderSidebar={renderCaSidebar}
          sidebarId={CA_MANAGER_SIDEBAR_ID}
          renderHeaderActions={renderCaActions}
          resolvePageTitle={resolveCaTitle}
        />
      </CaManagerProvider>
    );
  }

  return <WorkspaceLayout />;
}

/** CA Manager, CA Agent, Loan Manager and Loan Agent all land on /staff/dashboard. */
export const staffRoutes: RouteObject = {
  path: ROUTE_PATHS.staffRoot,
  element: <AuthenticationGuard />,
  children: [
    {
      element: <RoleGuard allowedRoles={STAFF_ROLES} />,
      children: [
        {
          element: <PermissionGuard permission={AREA_ACCESS.staff.permission} />,
          children: [
            {
              element: <StaffWorkspaceShell />,
              children: [
                { index: true, element: <Navigate to={ROUTE_PATHS.staffDashboard} replace /> },
                { path: ROUTE_PATHS.staffDashboard, element: <StaffDashboardRoute /> },
                { path: ROUTE_PATHS.staffProfile, element: <StaffProfilePage /> }
              ]
            }
          ]
        }
      ]
    }
  ]
};
