import type {
  ApplicationItem,
  ApplicationsKpiSummary,
  AssignStaffInput,
  NewApplicationInput,
  UpdateStatusInput
} from '../shared/applications.types';
import { createInitialApplications } from './demoApplicationsSeeds';

export const DEMO_APPLICATIONS_STORAGE_KEY = 'taxedge.demo.adminApplications';
const STORAGE_KEY = DEMO_APPLICATIONS_STORAGE_KEY;

let memoryCache: ApplicationItem[] | null = null;

function load(): ApplicationItem[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Local storage unavailable, continue with memoryCache
  }

  if (memoryCache) {
    return memoryCache;
  }

  const initial = createInitialApplications();
  memoryCache = initial;
  persist(initial);
  return initial;
}

function persist(items: ApplicationItem[]): ApplicationItem[] {
  memoryCache = items;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // Keep in-memory cache if localStorage is unavailable or full
  }
  return items;
}

export const demoApplicationsStore = Object.freeze({
  async list(): Promise<ApplicationItem[]> {
    try {
      return load();
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<ApplicationItem | undefined> {
    try {
      return load().find((app) => app.id === id);
    } catch {
      return undefined;
    }
  },

  async create(input: NewApplicationInput): Promise<ApplicationItem> {
    try {
      const items = load();
      const count = items.length + 101;
      const id = `APP-2025-0${count}`;
      const now = new Date().toISOString();

      const newApp: ApplicationItem = {
        id,
        vertical: input.vertical,
        service: input.service,
        serviceName: input.service.replace(/_/g, ' '),
        assessmentYear: input.assessmentYear,
        financialYear: input.financialYear,
        requestedAmount: input.requestedAmount,
        targetLender: input.targetLender,
        customer: {
          name: input.customerName.trim(),
          email: input.customerEmail.trim().toLowerCase(),
          phone: input.customerPhone.trim(),
          pan: input.customerPan.trim().toUpperCase(),
          residentStatus: input.residentStatus,
          state: input.state,
          city: input.city || input.state
        },
        status: 'NEW',
        priority: input.priority,
        managerId: input.managerId ?? null,
        managerName: input.managerId ? 'Assigned Manager' : null,
        agentId: input.agentId ?? null,
        agentName: input.agentId ? 'Assigned Agent' : null,
        slaHours: input.vertical === 'TAX_CA' ? 48 : 72,
        createdAt: now,
        updatedAt: now,
        documents: [],
        timeline: [
          {
            id: `TL-${Date.now()}`,
            stage: 'NEW',
            title: 'Application Created',
            description: 'Directly logged by Operations Administrator.',
            timestamp: now,
            actorName: 'Admin',
            actorRole: 'ADMINISTRATOR'
          }
        ],
        queries: [],
        internalNotes: input.internalNotes || ''
      };

      const updated = [newApp, ...items];
      persist(updated);
      return newApp;
    } catch (err) {
      throw new Error(`Failed to create application: ${(err as Error).message}`);
    }
  },

  async updateStatus(input: UpdateStatusInput): Promise<ApplicationItem> {
    try {
      const items = load();
      const appIndex = items.findIndex((a) => a.id === input.applicationId);
      if (appIndex === -1) throw new Error(`Application ${input.applicationId} not found.`);

      const app = items[appIndex];
      const now = new Date().toISOString();

      const newTimelineStep = {
        id: `TL-${Date.now()}`,
        stage: input.nextStatus,
        title: `Status updated to ${input.nextStatus.replace(/_/g, ' ')}`,
        description: input.note || `Stage updated to ${input.nextStatus}`,
        timestamp: now,
        actorName: 'Operations Admin',
        actorRole: 'ADMINISTRATOR'
      };

      const updatedApp: ApplicationItem = {
        ...app,
        status: input.nextStatus,
        updatedAt: now,
        timeline: [newTimelineStep, ...app.timeline],
        ...(input.referenceNumber
          ? app.vertical === 'TAX_CA'
            ? { filingAckNumber: input.referenceNumber }
            : { sanctionLetterNumber: input.referenceNumber }
          : {})
      };

      const updated = items.map((item, index) => (index === appIndex ? updatedApp : item));
      persist(updated);
      return updatedApp;
    } catch (err) {
      throw new Error(`Failed to update status: ${(err as Error).message}`);
    }
  },

  async assignStaff(input: AssignStaffInput): Promise<ApplicationItem> {
    try {
      const items = load();
      const appIndex = items.findIndex((a) => a.id === input.applicationId);
      if (appIndex === -1) throw new Error(`Application ${input.applicationId} not found.`);

      const app = items[appIndex];
      const now = new Date().toISOString();

      const newTimelineStep = {
        id: `TL-${Date.now()}`,
        stage: app.status,
        title: 'Staff Assignment Updated',
        description: input.auditNote || 'Case assignment modified by administrator.',
        timestamp: now,
        actorName: 'Operations Admin',
        actorRole: 'ADMINISTRATOR'
      };

      const updatedApp: ApplicationItem = {
        ...app,
        managerId: input.managerId,
        managerName: input.managerId ? 'Manager ' + input.managerId : null,
        agentId: input.agentId,
        agentName: input.agentId ? 'Agent ' + input.agentId : null,
        status: app.status === 'NEW' && input.agentId ? 'IN_PROGRESS' : app.status,
        updatedAt: now,
        timeline: [newTimelineStep, ...app.timeline]
      };

      const updated = items.map((item, index) => (index === appIndex ? updatedApp : item));
      persist(updated);
      return updatedApp;
    } catch (err) {
      throw new Error(`Failed to assign staff: ${(err as Error).message}`);
    }
  },

  async addQuery(
    applicationId: string,
    senderName: string,
    senderRole: string,
    message: string
  ): Promise<ApplicationItem> {
    try {
      const items = load();
      const appIndex = items.findIndex((a) => a.id === applicationId);
      if (appIndex === -1) throw new Error(`Application ${applicationId} not found.`);

      const app = items[appIndex];
      const now = new Date().toISOString();

      const newQuery = {
        id: `QRY-${Date.now()}`,
        senderName,
        senderRole,
        message,
        timestamp: now,
        status: 'OPEN' as const
      };

      const updatedApp: ApplicationItem = {
        ...app,
        status: 'QUERY_RAISED',
        updatedAt: now,
        queries: [...app.queries, newQuery]
      };

      const updated = items.map((item, index) => (index === appIndex ? updatedApp : item));
      persist(updated);
      return updatedApp;
    } catch (err) {
      throw new Error(`Failed to add query: ${(err as Error).message}`);
    }
  },

  async verifyDocument(applicationId: string, documentId: string): Promise<ApplicationItem> {
    try {
      const items = load();
      const appIndex = items.findIndex((a) => a.id === applicationId);
      if (appIndex === -1) throw new Error(`Application ${applicationId} not found.`);

      const app = items[appIndex];
      const updatedDocs = app.documents.map((doc) =>
        doc.id === documentId ? { ...doc, status: 'VERIFIED' as const } : doc
      );

      const updatedApp: ApplicationItem = {
        ...app,
        documents: updatedDocs,
        updatedAt: new Date().toISOString()
      };

      const updated = items.map((item, index) => (index === appIndex ? updatedApp : item));
      persist(updated);
      return updatedApp;
    } catch (err) {
      throw new Error(`Failed to verify document: ${(err as Error).message}`);
    }
  },

  async rejectDocument(
    applicationId: string,
    documentId: string,
    reason: string
  ): Promise<ApplicationItem> {
    try {
      const items = load();
      const appIndex = items.findIndex((a) => a.id === applicationId);
      if (appIndex === -1) throw new Error(`Application ${applicationId} not found.`);

      const app = items[appIndex];
      const updatedDocs = app.documents.map((doc) =>
        doc.id === documentId
          ? { ...doc, status: 'REJECTED' as const, rejectionReason: reason }
          : doc
      );

      const updatedApp: ApplicationItem = {
        ...app,
        status: 'QUERY_RAISED',
        documents: updatedDocs,
        updatedAt: new Date().toISOString()
      };

      const updated = items.map((item, index) => (index === appIndex ? updatedApp : item));
      persist(updated);
      return updatedApp;
    } catch (err) {
      throw new Error(`Failed to reject document: ${(err as Error).message}`);
    }
  },

  computeKpis(items: readonly ApplicationItem[]): ApplicationsKpiSummary {
    try {
      const totalCount = items.length;
      const newCount = items.filter((a) => a.status === 'NEW').length;
      const inProgressCount = items.filter(
        (a) => a.status === 'IN_PROGRESS' || a.status === 'UNDER_REVIEW'
      ).length;
      const queriesRaisedCount = items.filter((a) => a.status === 'QUERY_RAISED').length;
      const readyCount = items.filter(
        (a) => a.status === 'READY_FOR_FILING' || a.status === 'CLIENT_APPROVAL'
      ).length;
      const completedCount = items.filter((a) => a.status === 'COMPLETED').length;
      const slaAtRiskCount = items.filter(
        (a) => a.priority === 'URGENT' || a.status === 'QUERY_RAISED'
      ).length;

      return {
        totalCount,
        newCount,
        inProgressCount,
        queriesRaisedCount,
        readyCount,
        completedCount,
        slaAtRiskCount
      };
    } catch {
      return {
        totalCount: 0,
        newCount: 0,
        inProgressCount: 0,
        queriesRaisedCount: 0,
        readyCount: 0,
        completedCount: 0,
        slaAtRiskCount: 0
      };
    }
  },

  unreadActionCount(): number {
    try {
      const items = load();
      return items.filter((a) => a.status === 'NEW' || a.status === 'QUERY_RAISED').length;
    } catch {
      return 0;
    }
  }
});
