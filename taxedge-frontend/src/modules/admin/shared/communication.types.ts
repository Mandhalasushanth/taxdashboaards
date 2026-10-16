import type { StaffRole } from '@/modules/authentication';

/** A staff member the administrator can message, with a summary of the conversation. */
export interface StaffContact {
  readonly id: string;
  readonly name: string;
  readonly role: StaffRole;
  readonly email: string;
  readonly unreadCount: number;
  readonly lastMessage: MessagePreview | null;
}

export interface MessagePreview {
  readonly body: string;
  /** ISO-8601 timestamp. */
  readonly sentAt: string;
  readonly fromAdmin: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly body: string;
  /** ISO-8601 timestamp. */
  readonly sentAt: string;
  /** True when the administrator sent it; false when the staff member did. */
  readonly fromAdmin: boolean;
  /** For the administrator's own messages: whether the staff member has read it. */
  readonly read: boolean;
}

export type ContactRoleFilter = StaffRole | 'ALL';
