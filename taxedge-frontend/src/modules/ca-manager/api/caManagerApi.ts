import { apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type {
  ApplicationItem,
  AssignStaffInput,
  CaAgentWorkload,
  CaManagerKpis,
  CaRecentActivity,
  CaReviewQueueItem,
  CaServiceMetric,
  CaTask,
  CreateTaskInput,
  ReviewDecisionInput
} from '../shared/caManager.types';

export const caManagerApi = Object.freeze({
  async getKpis(): Promise<CaManagerKpis> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.getKpis();
      }
      return (await apiClient.get<CaManagerKpis>('/api/ca-manager/summary')) ?? {
        newCount: 0,
        unassignedCount: 0,
        inProgressCount: 0,
        awaitingCustomerCount: 0,
        awaitingReviewCount: 0,
        dueSoonCount: 0,
        overdueCount: 0,
        completedInPeriodCount: 0
      };
    } catch (err) {
      console.error('Failed to get CA KPIs:', err);
      throw err;
    }
  },

  async listApplications(): Promise<ApplicationItem[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listCaApplications();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/applications');
      return Array.isArray(response) ? (response as ApplicationItem[]) : [];
    } catch (err) {
      console.error('Failed to list CA applications:', err);
      throw err;
    }
  },

  async getApplicationById(id: string): Promise<ApplicationItem | null> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('@/modules/admin/dev/demoApplicationsStore');
        const app = await demoApplicationsStore.getById(id);
        return app ?? null;
      }
      return await apiClient.get<ApplicationItem>(`/api/applications/${encodeURIComponent(id)}`);
    } catch (err) {
      console.error(`Failed to get application ${id}:`, err);
      return null;
    }
  },

  async assignAgent(input: AssignStaffInput): Promise<ApplicationItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoApplicationsStore } = await import('@/modules/admin/dev/demoApplicationsStore');
        return demoApplicationsStore.assignStaff(input);
      }
      return await apiClient.post<ApplicationItem>(
        `/api/applications/${encodeURIComponent(input.applicationId)}/assign`,
        input
      );
    } catch (err) {
      console.error('Failed to assign agent:', err);
      throw err;
    }
  },

  async listReviews(): Promise<CaReviewQueueItem[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listReviews();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/reviews');
      return Array.isArray(response) ? (response as CaReviewQueueItem[]) : [];
    } catch (err) {
      console.error('Failed to list reviews:', err);
      throw err;
    }
  },

  async decideReview(input: ReviewDecisionInput): Promise<CaReviewQueueItem> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.decideReview(input);
      }
      return await apiClient.post<CaReviewQueueItem>(
        `/api/applications/${encodeURIComponent(input.applicationId)}/reviews`,
        input
      );
    } catch (err) {
      console.error('Failed to decide review:', err);
      throw err;
    }
  },

  async listTasks(): Promise<CaTask[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listTasks();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/tasks');
      return Array.isArray(response) ? (response as CaTask[]) : [];
    } catch (err) {
      console.error('Failed to list tasks:', err);
      throw err;
    }
  },

  async createTask(input: CreateTaskInput): Promise<CaTask> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.createTask(input);
      }
      return await apiClient.post<CaTask>(
        `/api/applications/${encodeURIComponent(input.applicationId)}/tasks`,
        input
      );
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  },

  async completeTask(taskId: string): Promise<void> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.completeTask(taskId);
      }
      await apiClient.patch<void>(`/api/tasks/${encodeURIComponent(taskId)}/complete`, {});
    } catch (err) {
      console.error('Failed to complete task:', err);
      throw err;
    }
  },

  async listAgentsWorkload(): Promise<CaAgentWorkload[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listAgentsWorkload();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/agents/workload');
      return Array.isArray(response) ? (response as CaAgentWorkload[]) : [];
    } catch (err) {
      console.error('Failed to list agents workload:', err);
      throw err;
    }
  },

  async listServiceMetrics(): Promise<CaServiceMetric[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listServiceMetrics();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/reports/summary');
      return Array.isArray(response) ? (response as CaServiceMetric[]) : [];
    } catch (err) {
      console.error('Failed to list service metrics:', err);
      throw err;
    }
  },

  async listRecentActivity(): Promise<CaRecentActivity[]> {
    try {
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
        return demoCaManagerStore.listRecentActivity();
      }
      const response = await apiClient.get<unknown>('/api/ca-manager/activity');
      return Array.isArray(response) ? (response as CaRecentActivity[]) : [];
    } catch (err) {
      console.error('Failed to list recent activity:', err);
      throw err;
    }
  }
});
