import { API_ENDPOINTS } from '@/core/api';
import { createMessagingApi } from '@/modules/admin';
import { invalidateLoanManagerNavCounters } from './loanManagerNavigationApi';

/** The Loan Manager's messaging, scoped by the server to the contacts their role may reach. */
export const loanManagerMessagingApi = createMessagingApi({
  contactsPath: API_ENDPOINTS.staff.communicationContacts,
  loadDemoGateway: () => import('../dev/demoLoanManagerCommunicationStore').then((module) => module.demoLoanManagerCommunicationStore),
  onRead: () => invalidateLoanManagerNavCounters()
});
