import { createDemoMessagingGateway } from './demoMessagingEngine';

/**
 * DEVELOPMENT ONLY. The administrator's messaging gateway: every active staff member, on the shared
 * demo message store. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
export const demoCommunicationStore = createDemoMessagingGateway((_me, other) => other.role !== 'ADMIN');
