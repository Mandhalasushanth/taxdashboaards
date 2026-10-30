import { AccountOverview, useAuthentication } from '@/modules/authentication';
import { RoleDashboardView } from '@/modules/workflow';
import { CA_MANAGER_DASHBOARD } from '../shared/caManagerDashboard';
import './CaManagerDashboardPage.css';

/** CA Manager landing page: reached only by the CA_MANAGER role (route guards and, authoritatively, the server). */
export default function CaManagerDashboardPage() {
  const { user } = useAuthentication();

  if (!user) {
    return null;
  }

  return (
    <RoleDashboardView config={CA_MANAGER_DASHBOARD}>
      <div className="tx-ca-manager-dashboard">
        <AccountOverview user={user} />
      </div>
    </RoleDashboardView>
  );
}
