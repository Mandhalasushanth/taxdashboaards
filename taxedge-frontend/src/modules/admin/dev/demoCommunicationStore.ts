import type { StaffRole } from '@/modules/authentication';

/**
 * DEVELOPMENT ONLY. A sample staff directory and conversations kept in this browser's
 * localStorage while the backend is unavailable. Loaded through a dynamic import guarded by
 * `import.meta.env.DEV`; excluded from production bundles.
 */
const STORAGE_KEY = 'taxedge.demo.adminCommunication';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface StoredMessage {
  readonly id: string;
  readonly body: string;
  readonly sentAt: string;
  readonly fromAdmin: boolean;
  readonly read: boolean;
}

interface StoredContact {
  readonly id: string;
  readonly name: string;
  readonly role: StaffRole;
  readonly email: string;
  readonly messages: readonly StoredMessage[];
}

type SeedMessage = [fromAdmin: boolean, body: string, ageMs: number, read: boolean];

const DIRECTORY: readonly [name: string, role: StaffRole, conversation: readonly SeedMessage[]][] = Object.freeze([
  ['Priya Sharma', 'CA_MANAGER', [
    [true, 'Hi Priya, can you share the status of this week\'s ITR filings?', 3 * HOUR, true],
    [false, '42 of 50 are filed. The remaining 8 are waiting on Form 16 from clients.', 2 * HOUR, true],
    [false, 'I have asked the agents to follow up today.', 20 * MINUTE, false]
  ]],
  ['Arjun Nair', 'CA_MANAGER', [[false, 'GST annual return drafts are ready for your review.', DAY + 3 * HOUR, true]]],
  ['Kavya Reddy', 'CA_MANAGER', []],
  ['Rahul Verma', 'CA_AGENT', [
    [false, 'Client uploaded bank statements for the audit case.', 45 * MINUTE, false],
    [false, 'Should I start the reconciliation now?', 40 * MINUTE, false]
  ]],
  ['Sneha Patil', 'CA_AGENT', [[true, 'Please prioritise the TDS returns due this Friday.', 2 * DAY, true]]],
  ['Mohammed Irfan', 'CA_AGENT', []],
  ['Ananya Gupta', 'CA_AGENT', []],
  ['Rohit Desai', 'CA_AGENT', []],
  ['Neha Iyer', 'LOAN_MANAGER', [
    [true, 'How many home-loan files are pending lender submission?', 5 * HOUR, true],
    [false, 'Six files. Two are waiting for property valuation reports.', 4 * HOUR, true]
  ]],
  ['Siddharth Rao', 'LOAN_MANAGER', []],
  ['Vikram Rao', 'LOAN_AGENT', [[false, 'Customer KYC for the business loan is complete.', 3 * DAY, false]]],
  ['Pooja Menon', 'LOAN_AGENT', []],
  ['Karan Mehta', 'LOAN_AGENT', []],
  ['Divya Joshi', 'LOAN_AGENT', []]
]);

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@taxedge.in`;
}

function seed(): StoredContact[] {
  const now = Date.now();
  return DIRECTORY.map(([name, role, conversation], contactIndex) => ({
    id: `staff-${contactIndex + 1}`,
    name,
    role,
    email: emailFor(name),
    messages: conversation.map(([fromAdmin, body, ageMs, read], messageIndex) => ({
      id: `msg-${contactIndex + 1}-${messageIndex + 1}`,
      body,
      sentAt: new Date(now - ageMs).toISOString(),
      fromAdmin,
      read
    }))
  }));
}

function persist(contacts: StoredContact[]): StoredContact[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // Storage may be unavailable (private mode); changes then last for this page view only.
  }
  return contacts;
}

function load(): StoredContact[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredContact[]) : persist(seed());
  } catch {
    return seed();
  }
}

function unreadOf(contact: StoredContact): number {
  return contact.messages.filter((message) => !message.fromAdmin && !message.read).length;
}

function summarise(contact: StoredContact) {
  const last = contact.messages[contact.messages.length - 1];
  return {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    email: contact.email,
    unreadCount: unreadOf(contact),
    lastMessage: last ? { body: last.body, sentAt: last.sentAt, fromAdmin: last.fromAdmin } : null
  };
}

function update(contactId: string, change: (contact: StoredContact) => StoredContact): void {
  persist(load().map((contact) => (contact.id === contactId ? change(contact) : contact)));
}

export const demoCommunicationStore = Object.freeze({
  async listContacts(): Promise<unknown> {
    return load().map(summarise);
  },

  async listMessages(contactId: string): Promise<unknown> {
    return load().find((contact) => contact.id === contactId)?.messages ?? [];
  },

  async sendMessage(contactId: string, body: string): Promise<unknown> {
    const message: StoredMessage = { id: `msg-${Date.now()}`, body, sentAt: new Date().toISOString(), fromAdmin: true, read: false };
    update(contactId, (contact) => ({ ...contact, messages: [...contact.messages, message] }));
    return message;
  },

  async markRead(contactId: string): Promise<void> {
    update(contactId, (contact) => ({
      ...contact,
      messages: contact.messages.map((message) => (message.fromAdmin ? message : { ...message, read: true }))
    }));
  },

  /** Total unread messages from staff, used for the demo-mode Communication badges. */
  unreadCount(): number {
    return load().reduce((total, contact) => total + unreadOf(contact), 0);
  }
});
