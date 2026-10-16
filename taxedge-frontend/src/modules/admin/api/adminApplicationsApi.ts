import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type {
  ApplicationItem,
  ApplicationsKpiSummary,
  AssignStaffInput,
  NewApplicationInput,
  UpdateStatusInput
} from '../shared/applications.types';

export const adminApplicationsApi = Object.freeze({
  async list(): Promise<ApplicationItem[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.list();
      }
      const response = await apiClient.get<unknown>(API_ENDPOINTS.admin.applications);
      return Array.isArray(response) ? (response as ApplicationItem[]) : [];
    } catch (err) {
      console.error('Failed to list applications:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<ApplicationItem | undefined> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.getById(id);
      }
      const response = await apiClient.get<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(id)}`
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to get application ${id}:`, err);
      throw err;
    }
  },

  async create(input: NewApplicationInput): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.create(input);
      }
      const response = await apiClient.post<unknown>(API_ENDPOINTS.admin.applications, input);
      return response as ApplicationItem;
    } catch (err) {
      console.error('Failed to create application:', err);
      throw err;
    }
  },

  async updateStatus(input: UpdateStatusInput): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.updateStatus(input);
      }
      const response = await apiClient.patch<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(input.applicationId)}/status`,
        input
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to update status for ${input.applicationId}:`, err);
      throw err;
    }
  },

  async assignStaff(input: AssignStaffInput): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.assignStaff(input);
      }
      const response = await apiClient.patch<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(input.applicationId)}/assignment`,
        input
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to assign staff for ${input.applicationId}:`, err);
      throw err;
    }
  },

  async addQuery(
    applicationId: string,
    senderName: string,
    senderRole: string,
    message: string
  ): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.addQuery(applicationId, senderName, senderRole, message);
      }
      const response = await apiClient.post<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(applicationId)}/queries`,
        { senderName, senderRole, message }
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to add query to ${applicationId}:`, err);
      throw err;
    }
  },

  async verifyDocument(applicationId: string, documentId: string): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.verifyDocument(applicationId, documentId);
      }
      const response = await apiClient.patch<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(documentId)}/verify`,
        {}
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to verify document ${documentId}:`, err);
      throw err;
    }
  },

  async rejectDocument(
    applicationId: string,
    documentId: string,
    reason: string
  ): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('../dev/demoApplicationsStore');
        return demoApplicationsStore.rejectDocument(applicationId, documentId, reason);
      }
      const response = await apiClient.patch<unknown>(
        `${API_ENDPOINTS.admin.applications}/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(documentId)}/reject`,
        { reason }
      );
      return response as ApplicationItem;
    } catch (err) {
      console.error(`Failed to reject document ${documentId}:`, err);
      throw err;
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
  }
});
