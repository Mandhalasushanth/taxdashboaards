import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { ChatMessage, StaffContact } from '../shared/communication.types';
import { parseContactList, parseMessage, parseMessageList } from '../validation/communicationSchema';
import { createDataCache } from './adminDataCache';
import { invalidateAdminNavCounters } from './adminNavigationApi';

/** Last staff directory shown, so revisiting the page is instant. */
export const staffContactsCache = createDataCache<readonly StaffContact[]>();

interface CommunicationGateway {
  listContacts(): Promise<unknown>;
  listMessages(contactId: string): Promise<unknown>;
  sendMessage(contactId: string, body: string): Promise<unknown>;
  markRead(contactId: string): Promise<void>;
}

const contactPath = (contactId: string, suffix: string) =>
  `${API_ENDPOINTS.admin.communicationContacts}/${encodeURIComponent(contactId)}/${suffix}`;

const httpGateway: CommunicationGateway = Object.freeze({
  listContacts: () => apiClient.get<unknown>(API_ENDPOINTS.admin.communicationContacts),
  listMessages: (contactId: string) => apiClient.get<unknown>(contactPath(contactId, 'messages')),
  sendMessage: (contactId: string, body: string) => apiClient.post<unknown>(contactPath(contactId, 'messages'), { body }),
  markRead: async (contactId: string) => {
    await apiClient.post<unknown>(contactPath(contactId, 'read'));
  }
});

async function getGateway(): Promise<CommunicationGateway> {
  // Statically removed from production builds, like the demo authentication gateway.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoCommunicationStore } = await import('../dev/demoCommunicationStore');
    return demoCommunicationStore;
  }
  return httpGateway;
}

export async function fetchStaffContacts(): Promise<StaffContact[]> {
  const contacts = parseContactList(await (await getGateway()).listContacts());
  staffContactsCache.remember(contacts);
  return contacts;
}

export async function fetchConversation(contactId: string): Promise<ChatMessage[]> {
  return parseMessageList(await (await getGateway()).listMessages(contactId));
}

/** Sends a message and returns it as the server stored it. */
export async function sendStaffMessage(contactId: string, body: string): Promise<ChatMessage> {
  const stored = parseMessage(await (await getGateway()).sendMessage(contactId, body.trim()));
  if (!stored) {
    throw new Error('The server did not return the sent message.');
  }
  return stored;
}

/** Marks a conversation as read, then refreshes the Communication badges. */
export async function markConversationRead(contactId: string): Promise<void> {
  await (await getGateway()).markRead(contactId);
  invalidateAdminNavCounters();
}
