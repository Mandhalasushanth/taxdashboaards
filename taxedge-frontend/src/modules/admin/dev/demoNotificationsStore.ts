import type { NotificationCategory } from '../shared/notifications.types';

/**
 * DEVELOPMENT ONLY. Sample notifications kept in this browser's localStorage while the backend
 * is unavailable, so the page can be exercised. Loaded through a dynamic import guarded by
 * `import.meta.env.DEV`; excluded from production bundles.
 */
const STORAGE_KEY = 'taxedge.demo.adminNotifications';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface StoredNotification {
  readonly id: string;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  readonly createdAt: string;
  readonly read: boolean;
  readonly link: string | null;
}

type Seed = [category: NotificationCategory, title: string, message: string, ageMs: number, read: boolean, link: string | null];

const SEEDS: readonly Seed[] = Object.freeze([
  ['APPLICATION', 'New ITR filing application', 'A new ITR-2 filing request was submitted and is waiting to be assigned.', 12 * MINUTE, false, '/admin/applications'],
  ['DOCUMENT', 'Documents uploaded', 'Form 16 and bank statements were uploaded for a pending GST registration.', 48 * MINUTE, false, '/admin/applications'],
  ['SLA', 'SLA breach: loan application', 'A home-loan application has passed its 7-day processing turnaround.', 3 * HOUR, false, '/admin/applications'],
  ['PAYMENT', 'Payment received', 'An online payment for GST return filing was received and reconciled.', 6 * HOUR, true, '/admin/revenue'],
  ['APPLICATION', 'Application reassigned', 'A CA manager reassigned a TDS return case to another agent.', DAY + 2 * HOUR, true, '/admin/applications'],
  ['SYSTEM', 'Security policy updated', 'Password and lockout settings were changed in Settings.', DAY + 5 * HOUR, true, '/admin/settings'],
  ['DOCUMENT', 'Document verification pending', 'Three uploaded KYC documents are awaiting verification.', 3 * DAY, false, '/admin/customers'],
  ['PAYMENT', 'Payment overdue', 'An invoice for audit services is 10 days past its payment terms.', 4 * DAY, true, '/admin/revenue']
]);

function seed(): StoredNotification[] {
  const now = Date.now();
  return SEEDS.map(([category, title, message, ageMs, read, link], index) => ({
    id: `demo-${index + 1}`,
    category,
    title,
    message,
    createdAt: new Date(now - ageMs).toISOString(),
    read,
    link
  }));
}

function load(): StoredNotification[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : persist(seed());
  } catch {
    return seed();
  }
}

function persist(items: StoredNotification[]): StoredNotification[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable (private mode); changes then last for this page view only.
  }
  return items;
}

export const demoNotificationsStore = Object.freeze({
  async list(): Promise<unknown> {
    return load();
  },

  async setRead(id: string, read: boolean): Promise<void> {
    persist(load().map((item) => (item.id === id ? { ...item, read } : item)));
  },

  async readAll(): Promise<void> {
    persist(load().map((item) => ({ ...item, read: true })));
  },

  async remove(id: string): Promise<void> {
    persist(load().filter((item) => item.id !== id));
  },

  /** Unread count, used for the demo-mode bell and sidebar badges. */
  unreadCount(): number {
    return load().filter((item) => !item.read).length;
  }
});
