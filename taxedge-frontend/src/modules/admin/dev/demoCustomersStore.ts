import { CLOSED_STATUSES, workflowApi, type WorkflowCase } from '@/modules/workflow';
import { entityTypeFromPan, type Customer } from '../shared/customers.types';

/**
 * DEVELOPMENT ONLY. Builds the customer directory from the demo workflow applications, grouped by PAN,
 * the way the backend's customer query will. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
const ALL_CASES_PAGE = 1000;

const latest = (a: string, b: string) => (Date.parse(a) > Date.parse(b) ? a : b);
const earliest = (a: string, b: string) => (Date.parse(a) < Date.parse(b) ? a : b);

function toCustomer(cases: readonly WorkflowCase[]): Customer {
  const newest = cases.reduce((current, item) => (Date.parse(item.updatedAt) > Date.parse(current.updatedAt) ? item : current));
  return {
    id: newest.client.pan,
    name: newest.client.name,
    pan: newest.client.pan,
    email: newest.client.email,
    mobile: newest.client.mobile,
    city: newest.client.city,
    entityType: entityTypeFromPan(newest.client.pan),
    applications: cases.map((item) => ({
      caseId: item.id,
      referenceNumber: item.referenceNumber,
      service: item.service,
      serviceType: item.serviceType,
      status: item.status,
      submittedAt: item.submittedAt,
      updatedAt: item.updatedAt
    })),
    openCount: cases.filter((item) => !CLOSED_STATUSES.includes(item.status)).length,
    completedCount: cases.filter((item) => item.status === 'COMPLETED').length,
    firstSeenAt: cases.map((item) => item.submittedAt).reduce(earliest),
    lastActivityAt: cases.map((item) => item.updatedAt).reduce(latest)
  };
}

export const demoCustomersStore = Object.freeze({
  async list(): Promise<Customer[]> {
    const { items } = await workflowApi.listCases({ pageSize: ALL_CASES_PAGE });
    const byPan = items.reduce<Map<string, WorkflowCase[]>>(
      (groups, item) => groups.set(item.client.pan, [...(groups.get(item.client.pan) ?? []), item]),
      new Map()
    );
    return [...byPan.values()].map(toCustomer);
  }
});
