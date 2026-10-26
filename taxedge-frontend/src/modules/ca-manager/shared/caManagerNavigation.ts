import type { IconName } from '@/shared';

export type CaSectionId =
  | 'overview'
  | 'applications'
  | 'reviews'
  | 'clients'
  | 'calendar'
  | 'agents'
  | 'documents'
  | 'communication'
  | 'reports'
  | 'incoming'
  | 'unassigned'
  | 'tasks'
  | 'escalations'
  | 'notifications';

export type CaCounterKey = 'applications' | 'reviews' | 'incoming' | 'unassigned' | 'notifications';

export type CaNavCounters = Partial<Record<CaCounterKey, number>>;

export interface CaNavItem {
  readonly id: CaSectionId;
  readonly label: string;
  readonly iconName: IconName;
  readonly title: string;
  readonly description: string;
  readonly counterKey?: CaCounterKey;
  readonly badgeTone?: 'orange' | 'danger';
}

export const CA_NAV_ITEMS: readonly CaNavItem[] = Object.freeze([
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'layout-dashboard',
    title: 'CA Operations Overview',
    description: 'Executive overview of active cases, bottlenecks, statutory deadlines and agent workloads.'
  },
  {
    id: 'applications',
    label: 'Case Ledger',
    iconName: 'file-spreadsheet',
    title: 'CA Case Ledger',
    description: 'Master register of GST, Income Tax Returns, and company incorporation customer filings.',
    counterKey: 'applications',
    badgeTone: 'orange'
  },
  {
    id: 'reviews',
    label: 'Review & Sign-Off',
    iconName: 'list-checks',
    title: 'Manager Review & Quality Sign-Off',
    description: 'Tax computation drafts and filing deliverables submitted by agents awaiting supervisor sign-off.',
    counterKey: 'reviews',
    badgeTone: 'danger'
  },
  {
    id: 'clients',
    label: 'Client Directory',
    iconName: 'users',
    title: 'Taxpayers & Business Clients',
    description: 'Corporate entities, LLP partners, and individual salaried/business taxpayers master list.'
  },
  {
    id: 'calendar',
    label: 'Tax Compliance Calendar',
    iconName: 'calendar',
    title: 'Statutory Compliance Calendar',
    description: 'Government filing deadlines for GSTR-1, GSTR-3B, Advance Tax, ITR, and TDS return schedules.'
  },
  {
    id: 'agents',
    label: 'Agent Workload & Capacity',
    iconName: 'user-check',
    title: 'CA Executive Directory & Capacity',
    description: 'Case load distribution, specialization tags, SLA performance metrics, and team capacity.'
  },
  {
    id: 'documents',
    label: 'Document Vault',
    iconName: 'layers',
    title: 'Client Document Verification Vault',
    description: 'Customer PAN cards, Aadhaar, Form 16, Bank statements, and balance sheets repository.'
  },
  {
    id: 'communication',
    label: 'Communications',
    iconName: 'message-square',
    title: 'Customer & Team Communication',
    description: 'Direct client discussions, missing document clarification requests, and internal notes.'
  },
  {
    id: 'reports',
    label: 'SLA Reports',
    iconName: 'bar-chart',
    title: 'Operational Velocity & SLA Reports',
    description: 'Average turnaround times (TAT), first-pass review yield, and monthly throughput reports.'
  }
]);

export function getCaNavItem(id: CaSectionId): CaNavItem {
  const item = CA_NAV_ITEMS.find((entry) => entry.id === id);
  if (item) return item;
  return CA_NAV_ITEMS[0];
}
