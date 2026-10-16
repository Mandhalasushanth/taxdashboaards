import type { IconName } from '@/shared';

export type CaSectionId =
  | 'overview'
  | 'incoming'
  | 'applications'
  | 'unassigned'
  | 'reviews'
  | 'agents'
  | 'tasks'
  | 'documents'
  | 'communication'
  | 'escalations'
  | 'reports'
  | 'notifications';

export type CaCounterKey = 'incoming' | 'unassigned' | 'reviews' | 'notifications';

export type CaNavCounters = Partial<Record<CaCounterKey, number>>;

export interface CaNavItem {
  readonly id: CaSectionId;
  readonly label: string;
  readonly iconName: IconName;
  readonly title: string;
  readonly description: string;
  readonly counterKey?: CaCounterKey;
}

export const CA_NAV_ITEMS: readonly CaNavItem[] = Object.freeze([
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'layout-dashboard',
    title: 'CA Operations Overview',
    description: 'Workload health, critical bottlenecks, review queues and real-time filing progress.'
  },
  {
    id: 'incoming',
    label: 'Incoming Submissions',
    iconName: 'inbox',
    title: 'Incoming Applications Queue',
    description: 'New and untriaged GST, ITR, and incorporation cases submitted by customers.',
    counterKey: 'incoming'
  },
  {
    id: 'applications',
    label: 'All CA Applications',
    iconName: 'file-spreadsheet',
    title: 'Chartered Accountancy Registry',
    description: 'Searchable master ledger of all GST, ITR, and incorporation customer files.'
  },
  {
    id: 'unassigned',
    label: 'Unassigned Queue',
    iconName: 'alert-circle',
    title: 'Unassigned Case Triage',
    description: 'CA files requiring immediate supervisor triage and executive agent allocation.',
    counterKey: 'unassigned'
  },
  {
    id: 'reviews',
    label: 'My Review Queue',
    iconName: 'list-checks',
    title: 'Manager Approval & Quality Review',
    description: 'Agent-prepared filings and tax drafts awaiting manager decision and sign-off.',
    counterKey: 'reviews'
  },
  {
    id: 'agents',
    label: 'CA Agents & Workload',
    iconName: 'users',
    title: 'CA Agent Capacity & Workload',
    description: 'Active agent directory, specialization skills, load balancing and SLA scores.'
  },
  {
    id: 'tasks',
    label: 'Tasks & Checklists',
    iconName: 'check-check',
    title: 'Tasks & Case Checklists',
    description: 'Outstanding operational milestones and service compliance checklists.'
  },
  {
    id: 'documents',
    label: 'Document Vault',
    iconName: 'layers',
    title: 'Document Verification Vault',
    description: 'Client tax forms, bank statements, and KYC records requiring CA verification.'
  },
  {
    id: 'communication',
    label: 'Customer Communication',
    iconName: 'message-square',
    title: 'Customer Queries & Messages',
    description: 'Clarifications, missing information requests, and real-time client discussions.'
  },
  {
    id: 'escalations',
    label: 'Deadlines & Escalations',
    iconName: 'clock',
    title: 'Deadlines & SLA Escalations',
    description: 'Overdue filings, critical SLA risks, and blocked cases requiring manager intervention.'
  },
  {
    id: 'reports',
    label: 'Operational Reports',
    iconName: 'bar-chart',
    title: 'Compliance Reports & Analytics',
    description: 'Filing throughput velocity, SLA performance, and agent productivity reports.'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    iconName: 'bell',
    title: 'Notifications & Alerts',
    description: 'System alerts, customer replies, document uploads, and milestone updates.',
    counterKey: 'notifications'
  }
]);

export function getCaNavItem(id: CaSectionId): CaNavItem {
  const item = CA_NAV_ITEMS.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`CA navigation item "${id}" is not configured.`);
  }
  return item;
}
