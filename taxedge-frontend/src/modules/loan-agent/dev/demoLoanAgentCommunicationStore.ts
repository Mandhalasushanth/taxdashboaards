import { createDemoMessagingGateway } from '@/modules/admin/dev/demoMessagingEngine';
import { canLoanAgentMessage } from '../shared/loanAgentCommunication';

/**
 * DEVELOPMENT ONLY. The Loan Agent's messaging gateway on the shared demo message store, limited by the
 * Loan Agent contact rule. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
export const demoLoanAgentCommunicationStore = createDemoMessagingGateway(canLoanAgentMessage);
