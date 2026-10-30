import { API_ENDPOINTS } from '@/core/api';
import { createMessagingApi } from '@/modules/admin';
import { invalidateCaAgentNavCounters } from './caAgentNavigationApi';

/** The CA Agent's messaging, scoped by the server to the contacts their role may reach. */
export const caAgentMessagingApi = createMessagingApi({
  contactsPath: API_ENDPOINTS.staff.communicationContacts,
  loadDemoGateway: () => import('../dev/demoCaAgentCommunicationStore').then((module) => module.demoCaAgentCommunicationStore),
  onRead: () => invalidateCaAgentNavCounters()
});
