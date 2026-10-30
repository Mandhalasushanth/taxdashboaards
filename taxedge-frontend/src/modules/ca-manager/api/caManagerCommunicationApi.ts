import { API_ENDPOINTS } from '@/core/api';
import { createMessagingApi } from '@/modules/admin';
import { invalidateCaManagerNavCounters } from './caManagerNavigationApi';

/** The CA Manager's messaging, scoped by the server to the contacts their role may reach. */
export const caManagerMessagingApi = createMessagingApi({
  contactsPath: API_ENDPOINTS.staff.communicationContacts,
  loadDemoGateway: () => import('../dev/demoCaManagerCommunicationStore').then((module) => module.demoCaManagerCommunicationStore),
  onRead: () => invalidateCaManagerNavCounters()
});
