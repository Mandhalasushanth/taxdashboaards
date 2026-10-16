import { AccountOverview, DOMAIN_LABELS, ROLE_PROFILES, TIER_LABELS, useCurrentUser } from '@/modules/authentication';
import { PageHeader, RoleBadge, useDocumentTitle } from '@/shared';
import { LOAN_MANAGER_MODULE_ROLE } from '../shared/loanManager.config';
import './LoanManagerDashboardPage.css';

const profile = ROLE_PROFILES[LOAN_MANAGER_MODULE_ROLE];

export default function LoanManagerDashboardPage() {
  const user = useCurrentUser();
  useDocumentTitle(profile.dashboardTitle);

  if (!user) {
    return null;
  }

  return (
    <div className="tx-loan-manager-dashboard">
      <PageHeader
        eyebrow={`Welcome back, ${user.displayName}`}
        title={profile.dashboardTitle}
        description={profile.dashboardSummary}
        badge={<RoleBadge areaLabel={DOMAIN_LABELS[profile.domain]} levelLabel={TIER_LABELS[profile.tier]} />}
      />
      <AccountOverview user={user} />
    </div>
  );
}
