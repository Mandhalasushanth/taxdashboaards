import { createDemoMessagingGateway } from '@/modules/admin/dev/demoMessagingEngine';
import { canCaAgentMessage } from '../shared/caAgentCommunication';

/**
 * DEVELOPMENT ONLY. The CA Agent's messaging gateway on the shared demo message store, limited by the
 * CA Agent contact rule. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
export const demoCaAgentCommunicationStore = createDemoMessagingGateway(canCaAgentMessage);
