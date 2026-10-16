import { AccountOverview, DOMAIN_LABELS, ROLE_PROFILES, TIER_LABELS, useCurrentUser } from '@/modules/authentication';
import { PageHeader, RoleBadge, useDocumentTitle } from '@/shared';
import { CA_AGENT_MODULE_ROLE } from '../shared/caAgent.config';
import './CaAgentDashboardPage.css';

const profile = ROLE_PROFILES[CA_AGENT_MODULE_ROLE];

export default function CaAgentDashboardPage() {
  const user = useCurrentUser();
  useDocumentTitle(profile.dashboardTitle);

  if (!user) {
    return null;
  }

  return (
    <div className="tx-ca-agent-dashboard">
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
