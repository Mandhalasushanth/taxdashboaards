import { AccountOverview, ROLE_PROFILES, useAuthentication } from '@/modules/authentication';
import { PageHeader, useDocumentTitle } from '@/shared';
import { StaffRolesCard } from '../components/overview/StaffRolesCard';
import './AdminDashboardPage.css';

/** Admin "Overview": reached only by the ADMIN role (enforced by route guards and, authoritatively, the server). */
export default function AdminDashboardPage() {
  const { user } = useAuthentication();
  const profile = ROLE_PROFILES.ADMIN;
  useDocumentTitle(profile.dashboardTitle);

  if (!user) {
    return null;
  }

  return (
    <div className="tx-admin-dashboard">
      <PageHeader eyebrow={`Welcome back, ${user.displayName}`} title={profile.dashboardTitle} description={profile.dashboardSummary} />
      <AccountOverview user={user} />
      <StaffRolesCard />
    </div>
  );
}
