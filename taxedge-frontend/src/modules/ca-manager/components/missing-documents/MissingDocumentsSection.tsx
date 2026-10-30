import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "Missing Documents": agents reported missing or unclear documents. Get them updated and send the case back. */
export default function MissingDocumentsSection() {
  const { entry } = useCaManagerSection('missing');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['missing']} entry={entry} />;
}
