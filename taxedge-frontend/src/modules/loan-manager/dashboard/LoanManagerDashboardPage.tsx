import { AccountOverview, useAuthentication } from '@/modules/authentication';
import { RoleDashboardView } from '@/modules/workflow';
import { LOAN_MANAGER_DASHBOARD } from '../shared/loanManagerDashboard';
import './LoanManagerDashboardPage.css';

/** Loan Manager landing page: reached only by the LOAN_MANAGER role (route guards and, authoritatively, the server). */
export default function LoanManagerDashboardPage() {
  const { user } = useAuthentication();

  if (!user) {
    return null;
  }

  return (
    <RoleDashboardView config={LOAN_MANAGER_DASHBOARD}>
      <div className="tx-loan-manager-dashboard">
        <AccountOverview user={user} />
      </div>
    </RoleDashboardView>
  );
}
