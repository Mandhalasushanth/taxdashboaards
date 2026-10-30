import { AccountOverview, useAuthentication } from '@/modules/authentication';
import { RoleDashboardView } from '@/modules/workflow';
import { CA_AGENT_DASHBOARD } from '../shared/caAgentDashboard';
import './CaAgentDashboardPage.css';

/** CA Agent landing page: reached only by the CA_AGENT role (route guards and, authoritatively, the server). */
export default function CaAgentDashboardPage() {
  const { user } = useAuthentication();

  if (!user) {
    return null;
  }

  return (
    <RoleDashboardView config={CA_AGENT_DASHBOARD}>
      <div className="tx-ca-agent-dashboard">
        <AccountOverview user={user} />
      </div>
    </RoleDashboardView>
  );
}
