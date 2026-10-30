import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "Waiting on Customer": sent back for corrections. They return to To Verify when the customer resubmits. */
export default function WaitingOnCustomerSection() {
  const { entry } = useCaManagerSection('customer');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['customer']} entry={entry} />;
}
