import { API_ENDPOINTS } from '@/core/api';
import { invalidateAdminNavCounters } from './adminNavigationApi';
import { createMessagingApi } from './messagingClient';

/** The administrator's messaging: every CA and loan manager and agent. */
export const adminMessagingApi = createMessagingApi({
  contactsPath: API_ENDPOINTS.admin.communicationContacts,
  loadDemoGateway: () => import('../dev/demoCommunicationStore').then((module) => module.demoCommunicationStore),
  onRead: invalidateAdminNavCounters
});
