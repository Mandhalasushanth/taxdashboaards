import { API_ENDPOINTS } from '@/core/api';
import { createMessagingApi } from '@/modules/admin';
import { invalidateLoanAgentNavCounters } from './loanAgentNavigationApi';

/** The Loan Agent's messaging, scoped by the server to the contacts their role may reach. */
export const loanAgentMessagingApi = createMessagingApi({
  contactsPath: API_ENDPOINTS.staff.communicationContacts,
  loadDemoGateway: () => import('../dev/demoLoanAgentCommunicationStore').then((module) => module.demoLoanAgentCommunicationStore),
  onRead: () => invalidateLoanAgentNavCounters()
});
