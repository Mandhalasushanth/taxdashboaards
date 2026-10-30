import { AccountOverview, useAuthentication } from '@/modules/authentication';
import { RoleDashboardView } from '@/modules/workflow';
import { StaffRolesCard } from '../components/overview/StaffRolesCard';
import { ADMIN_DASHBOARD_CONFIG } from '../shared/adminWorkflow';
import './AdminDashboardPage.css';

/**
 * Admin "Overview": organisation-wide workflow monitoring, then staff roles and the account summary.
 * Reached only by the ADMIN role (enforced by route guards and, authoritatively, the server).
 */
export default function AdminDashboardPage() {
  const { user } = useAuthentication();

  if (!user) {
    return null;
  }

  return (
    <RoleDashboardView config={ADMIN_DASHBOARD_CONFIG}>
      <div className="tx-admin-dashboard">
        <StaffRolesCard />
        <AccountOverview user={user} />
      </div>
    </RoleDashboardView>
  );
}
