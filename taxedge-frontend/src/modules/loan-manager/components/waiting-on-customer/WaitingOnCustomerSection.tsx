import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "Waiting on Customer": sent back for corrections. They return to To Verify when the customer resubmits. */
export default function WaitingOnCustomerSection() {
  const { entry } = useLoanManagerSection('customer');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['customer']} entry={entry} />;
}
