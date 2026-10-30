import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "Ready to Assign": paid applications waiting for an agent. Compare workload before assigning. */
export default function ReadyToAssignSection() {
  const { entry } = useLoanManagerSection('assign');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['assign']} entry={entry} />;
}
