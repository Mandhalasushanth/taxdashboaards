import { apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { ChatMessage, MessagingApi, StaffContact } from '../shared/communication.types';
import { parseContactList, parseMessage, parseMessageList } from '../validation/communicationSchema';
import { createDataCache } from './adminDataCache';

/** The HTTP contract every workspace's messaging endpoint implements. */
export interface MessagingGateway {
  listContacts(): Promise<unknown>;
  listMessages(contactId: string): Promise<unknown>;
  sendMessage(contactId: string, body: string): Promise<unknown>;
  markRead(contactId: string): Promise<void>;
}

export interface MessagingClientOptions {
  /** e.g. `/admin/communication/contacts`; the server scopes the list to the session's role. */
  readonly contactsPath: string;
  /** Development-only stand-in for the backend; called only on the dev server with demo auth enabled. */
  readonly loadDemoGateway: () => Promise<MessagingGateway>;
  /** Called after messages are read, so sidebar and header badges refresh. */
  readonly onRead: () => void;
}

function httpGateway(contactsPath: string): MessagingGateway {
  const contactPath = (contactId: string, suffix: string) => `${contactsPath}/${encodeURIComponent(contactId)}/${suffix}`;
  return Object.freeze({
    listContacts: () => apiClient.get<unknown>(contactsPath),
    listMessages: (contactId: string) => apiClient.get<unknown>(contactPath(contactId, 'messages')),
    sendMessage: (contactId: string, body: string) => apiClient.post<unknown>(contactPath(contactId, 'messages'), { body }),
    markRead: async (contactId: string) => {
      await apiClient.post<unknown>(contactPath(contactId, 'read'));
    }
  });
}

/** Builds a workspace's messaging API: same parsing and caching everywhere, its own endpoint and rules. */
export function createMessagingApi({ contactsPath, loadDemoGateway, onRead }: MessagingClientOptions): MessagingApi {
  const cache = createDataCache<readonly StaffContact[]>();
  const http = httpGateway(contactsPath);
  // Statically removed from production builds, like the other demo stores.
  const gateway = () => (import.meta.env.DEV && environment.demoAuthEnabled ? loadDemoGateway() : Promise.resolve(http));

  return Object.freeze({
    cache,
    async fetchContacts() {
      const contacts = parseContactList(await (await gateway()).listContacts());
      cache.remember(contacts);
      return contacts;
    },
    async fetchConversation(contactId: string) {
      return parseMessageList(await (await gateway()).listMessages(contactId));
    },
    async send(contactId: string, body: string): Promise<ChatMessage> {
      const stored = parseMessage(await (await gateway()).sendMessage(contactId, body.trim()));
      if (!stored) {
        throw new Error('The server did not return the sent message.');
      }
      return stored;
    },
    async markRead(contactId: string) {
      await (await gateway()).markRead(contactId);
      onRead();
    }
  });
}
