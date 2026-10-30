import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "Completed": delivered results. The customer can see them in the mobile app. */
export default function CompletedSection() {
  const { entry } = useLoanManagerSection('completed');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['completed']} entry={entry} />;
}
