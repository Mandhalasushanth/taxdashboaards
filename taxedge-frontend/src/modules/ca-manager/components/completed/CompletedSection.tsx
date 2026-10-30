import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "Completed": delivered results. The customer can see them in the mobile app. */
export default function CompletedSection() {
  const { entry } = useCaManagerSection('completed');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['completed']} entry={entry} />;
}
