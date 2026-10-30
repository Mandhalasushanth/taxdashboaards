import { ApiError } from '@/core/api';
import type { Role } from '@/modules/authentication';
import { authStore } from '@/store';
import { validateMessageBody } from '../validation/communicationSchema';

/**
 * DEVELOPMENT ONLY. One message store shared by every workspace's demo gateway, so a message the
 * administrator sends really appears in the manager's inbox. Participants are the demo staff directory
 * plus the administrator. Each workspace passes its contact rule, mirroring what the server enforces.
 * Loaded through dynamic imports guarded by `import.meta.env.DEV`; excluded from production builds.
 */
const STORAGE_KEY = 'taxedge.demo.messages.v1';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const ADMIN_PARTICIPANT_ID = 'ADMIN';

export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly email: string;
  /** Agents only: the manager they report to. */
  readonly managerId: string | null;
  readonly active: boolean;
}

/** Whether `me` may message `other`; must match the backend's rule for the workspace. */
export type ContactRule = (me: Participant, other: Participant) => boolean;

interface StoredMessage {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly body: string;
  readonly sentAt: string;
  readonly read: boolean;
}

type Seed = [from: string, to: string, body: string, ageMs: number, read: boolean];

/** Sample conversations between the demo accounts (see the admin staff directory for the ids). */
const SEEDS: readonly Seed[] = [
  [ADMIN_PARTICIPANT_ID, 'MGR-101', 'Hi Sanjay, can you share the status of this week’s ITR filings?', 3 * HOUR, true],
  ['MGR-101', ADMIN_PARTICIPANT_ID, 'Most are filed. The rest are waiting on Form 16 from clients.', 2 * HOUR, false],
  [ADMIN_PARTICIPANT_ID, 'MGR-201', 'How many home-loan files are pending lender submission?', 5 * HOUR, true],
  ['MGR-201', ADMIN_PARTICIPANT_ID, 'Two, both waiting for property valuation reports.', 4 * HOUR, false],
  ['MGR-101', 'AGT-301', 'Please prioritise the GST returns due this week.', DAY, true],
  ['AGT-301', 'MGR-101', 'Client uploaded bank statements for the Anil Gupta ITR. Starting reconciliation.', 45 * MINUTE, false],
  ['AGT-302', 'MGR-101', 'Waiting on the rent agreement from Meera Iyer before I can continue.', 3 * HOUR, false],
  ['MGR-201', 'AGT-401', 'The Sai Krishna business loan is urgent — lender wants the file by Friday.', 6 * HOUR, true],
  ['AGT-401', 'MGR-201', 'KYC is complete; preparing the lender file now.', HOUR, false]
];

function seed(): StoredMessage[] {
  const now = Date.now();
  return SEEDS.map(([from, to, body, ageMs, read], index) => ({
    id: `msg-seed-${index + 1}`,
    from,
    to,
    body,
    sentAt: new Date(now - ageMs).toISOString(),
    read
  }));
}

function load(): StoredMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredMessage[]) : persist(seed());
  } catch {
    return seed();
  }
}

function persist(messages: StoredMessage[]): StoredMessage[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage may be unavailable (private mode); changes then last for this page view only.
  }
  return messages;
}

async function loadParticipants(): Promise<Participant[]> {
  const { demoStaffStore } = await import('./demoStaffStore');
  const staff = [...(await demoStaffStore.list('MANAGER')), ...(await demoStaffStore.list('AGENT'))];
  const admin: Participant = { id: ADMIN_PARTICIPANT_ID, name: 'Administrator', role: 'ADMIN', email: 'admin@gmail.com', managerId: null, active: true };
  return [admin, ...staff.map((member) => ({ id: member.id, name: member.fullName, role: member.role, email: member.username, managerId: member.managerId, active: member.active }))];
}

/** The server knows the caller from the session; the demo resolves it from the signed-in user. */
function resolveMe(participants: readonly Participant[]): Participant {
  const user = authStore.getState().user;
  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Your session has expired. Please sign in again.', 401);
  }
  const me = user.role === 'ADMIN'
    ? participants.find((entry) => entry.id === ADMIN_PARTICIPANT_ID)
    : participants.find((entry) => entry.email === user.username.toLowerCase());
  if (!me) {
    throw new ApiError('FORBIDDEN', 'Your account is not set up for messaging.', 403);
  }
  return me;
}

const between = (message: StoredMessage, a: string, b: string) =>
  (message.from === a && message.to === b) || (message.from === b && message.to === a);

/** Builds a gateway with the same contract as the HTTP one, scoped by the workspace's contact rule. */
export function createDemoMessagingGateway(canContact: ContactRule) {
  const context = async () => {
    const participants = await loadParticipants();
    const me = resolveMe(participants);
    const contacts = participants.filter((other) => other.id !== me.id && other.active && canContact(me, other));
    return { me, contacts };
  };

  const requireContact = async (contactId: string) => {
    const { me, contacts } = await context();
    const contact = contacts.find((entry) => entry.id === contactId);
    if (!contact) {
      throw new ApiError('FORBIDDEN', 'You cannot message this person from your workspace.', 403);
    }
    return { me, contact };
  };

  const unreadFrom = (messages: readonly StoredMessage[], me: Participant, contact: Participant) =>
    messages.filter((message) => message.from === contact.id && message.to === me.id && !message.read).length;

  return Object.freeze({
    async listContacts(): Promise<unknown> {
      const { me, contacts } = await context();
      const messages = load();
      return contacts.map((contact) => {
        const thread = messages.filter((message) => between(message, me.id, contact.id));
        const last = thread[thread.length - 1];
        return {
          id: contact.id,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          unreadCount: unreadFrom(thread, me, contact),
          lastMessage: last ? { body: last.body, sentAt: last.sentAt, fromMe: last.from === me.id } : null
        };
      });
    },

    async listMessages(contactId: string): Promise<unknown> {
      const { me, contact } = await requireContact(contactId);
      return load()
        .filter((message) => between(message, me.id, contact.id))
        .map((message) => ({ id: message.id, body: message.body, sentAt: message.sentAt, fromMe: message.from === me.id, read: message.read }));
    },

    async sendMessage(contactId: string, body: string): Promise<unknown> {
      const { me, contact } = await requireContact(contactId);
      const invalid = validateMessageBody(body);
      if (invalid) {
        throw new ApiError('VALIDATION_FAILED', invalid, 422);
      }
      const message: StoredMessage = { id: `msg-${Date.now()}`, from: me.id, to: contact.id, body: body.trim(), sentAt: new Date().toISOString(), read: false };
      persist([...load(), message]);
      return { id: message.id, body: message.body, sentAt: message.sentAt, fromMe: true, read: false };
    },

    async markRead(contactId: string): Promise<void> {
      const { me, contact } = await requireContact(contactId);
      persist(load().map((message) => (message.from === contact.id && message.to === me.id ? { ...message, read: true } : message)));
    },

    /** Unread messages from everyone this workspace may message; drives the Communication badge. */
    async unreadCount(): Promise<number> {
      const { me, contacts } = await context();
      const messages = load();
      return contacts.reduce((total, contact) => total + unreadFrom(messages, me, contact), 0);
    }
  });
}

export type DemoMessagingGateway = ReturnType<typeof createDemoMessagingGateway>;
