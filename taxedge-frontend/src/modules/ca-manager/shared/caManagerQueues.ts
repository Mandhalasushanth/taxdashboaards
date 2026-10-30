import type { QueuePreset } from '@/modules/workflow';
import { CA_MANAGER_SERVICES } from './caManager.config';
import { getCaManagerNavItem } from './caManagerNavigation';
import type { CaManagerQueueSectionId } from './caManager.types';

type PresetSettings = Omit<QueuePreset, 'id' | 'title' | 'description' | 'services' | 'kpis'> & Partial<Pick<QueuePreset, 'services' | 'kpis'>>;

/** Title and description come from the menu entry, so the sidebar and the page header always agree. */
function preset(id: CaManagerQueueSectionId, settings: PresetSettings): QueuePreset {
  const item = getCaManagerNavItem(id);
  return { id: 'ca-manager-' + id, title: item.label, description: item.description, services: CA_MANAGER_SERVICES, kpis: [], sort: 'dueDate', ...settings };
}

/** One queue per step of the CA Manager's work, in the order the work happens. */
export const CA_MANAGER_QUEUES: Readonly<Record<CaManagerQueueSectionId, QueuePreset>> = Object.freeze({
  verify: preset('verify', { sort: 'submittedAt', allowIntake: true, emptyTitle: 'No applications yet', emptyMessage: 'Applications from customers appear here automatically.' }),
  customer: preset('customer', { statuses: ['CORRECTION_NEEDED'], emptyTitle: 'Nobody to wait on', emptyMessage: 'Applications you send back to customers appear here.' }),
  payment: preset('payment', { statuses: ['PAYMENT_PENDING'], emptyTitle: 'No pending payments', emptyMessage: 'Applications appear here after you send a payment request.' }),
  assign: preset('assign', { statuses: ['PAID'], emptyTitle: 'Nothing to assign', emptyMessage: 'Paid applications appear here, ready for an agent.' }),
  missing: preset('missing', { statuses: ['DOCS_MISSING'], emptyTitle: 'No missing documents', emptyMessage: 'When an agent reports missing documents, the case appears here.' }),
  working: preset('working', { statuses: ['ASSIGNED', 'PORTAL_WORK'], emptyTitle: 'No work in progress', emptyMessage: 'Assigned applications appear here while agents work on them.' }),
  completed: preset('completed', { statuses: ['COMPLETED'], sort: 'updatedAt', emptyTitle: 'Nothing completed yet', emptyMessage: 'Delivered results appear here.' })
});
