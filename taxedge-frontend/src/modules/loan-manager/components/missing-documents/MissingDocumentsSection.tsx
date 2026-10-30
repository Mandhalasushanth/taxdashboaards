import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "Missing Documents": agents reported missing or unclear documents. Get them updated and send the case back. */
export default function MissingDocumentsSection() {
  const { entry } = useLoanManagerSection('missing');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['missing']} entry={entry} />;
}
