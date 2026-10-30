import { AccountOverview, useAuthentication } from '@/modules/authentication';
import { RoleDashboardView } from '@/modules/workflow';
import { LOAN_AGENT_DASHBOARD } from '../shared/loanAgentDashboard';
import './LoanAgentDashboardPage.css';

/** Loan Agent landing page: reached only by the LOAN_AGENT role (route guards and, authoritatively, the server). */
export default function LoanAgentDashboardPage() {
  const { user } = useAuthentication();

  if (!user) {
    return null;
  }

  return (
    <RoleDashboardView config={LOAN_AGENT_DASHBOARD}>
      <div className="tx-loan-agent-dashboard">
        <AccountOverview user={user} />
      </div>
    </RoleDashboardView>
  );
}
