import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "Ready to Assign": paid applications waiting for an agent. Compare workload before assigning. */
export default function ReadyToAssignSection() {
  const { entry } = useCaManagerSection('assign');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['assign']} entry={entry} />;
}
