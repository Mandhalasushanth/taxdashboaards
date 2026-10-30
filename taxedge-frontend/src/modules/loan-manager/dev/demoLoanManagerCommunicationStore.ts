import { createDemoMessagingGateway } from '@/modules/admin/dev/demoMessagingEngine';
import { canLoanManagerMessage } from '../shared/loanManagerCommunication';

/**
 * DEVELOPMENT ONLY. The Loan Manager's messaging gateway on the shared demo message store, limited by the
 * Loan Manager contact rule. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
export const demoLoanManagerCommunicationStore = createDemoMessagingGateway(canLoanManagerMessage);
