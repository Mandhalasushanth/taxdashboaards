import { createDemoMessagingGateway } from '@/modules/admin/dev/demoMessagingEngine';
import { canCaManagerMessage } from '../shared/caManagerCommunication';

/**
 * DEVELOPMENT ONLY. The CA Manager's messaging gateway on the shared demo message store, limited by the
 * CA Manager contact rule. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
export const demoCaManagerCommunicationStore = createDemoMessagingGateway(canCaManagerMessage);
