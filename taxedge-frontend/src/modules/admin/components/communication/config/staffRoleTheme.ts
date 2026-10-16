import type { StaffRole } from '@/modules/authentication';
import type { ContactRoleFilter } from '../../../shared/communication.types';

export interface StaffRoleTheme {
  /** Tab label, e.g. "CA Managers". */
  readonly pluralLabel: string;
  /** CSS modifier for the avatar and role tag colour. */
  readonly tone: 'navy' | 'blue' | 'orange' | 'green';
}

/** Colour and plural label per staff role, so each group is easy to tell apart in the list. */
export const STAFF_ROLE_THEME: Readonly<Record<StaffRole, StaffRoleTheme>> = Object.freeze({
  CA_MANAGER: { pluralLabel: 'CA Managers', tone: 'navy' },
  CA_AGENT: { pluralLabel: 'CA Agents', tone: 'blue' },
  LOAN_MANAGER: { pluralLabel: 'Loan Managers', tone: 'orange' },
  LOAN_AGENT: { pluralLabel: 'Loan Agents', tone: 'green' }
});

export const ROLE_FILTER_ORDER: readonly ContactRoleFilter[] = Object.freeze(['ALL', 'CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT']);
