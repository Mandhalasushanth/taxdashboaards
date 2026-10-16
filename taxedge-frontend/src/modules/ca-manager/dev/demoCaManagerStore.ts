import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import type {
  ApplicationItem,
  CaAgentWorkload,
  CaManagerKpis,
  CaNavCounters,
  CaRecentActivity,
  CaReviewQueueItem,
  CaServiceMetric,
  CaTask,
  CreateTaskInput,
  ReviewDecisionInput
} from '../shared/caManager.types';
import {
  createInitialCaActivities,
  createInitialCaAgents,
  createInitialCaMetrics,
  createInitialCaReviews,
  createInitialCaTasks
} from './demoCaManagerSeeds';

let cachedAgents: CaAgentWorkload[] | null = null;
let cachedReviews: CaReviewQueueItem[] | null = null;
let cachedTasks: CaTask[] | null = null;
let cachedActivities: CaRecentActivity[] | null = null;

function getAgents(): CaAgentWorkload[] {
  if (!cachedAgents) {
    cachedAgents = createInitialCaAgents();
  }
  return cachedAgents;
}

function getReviews(): CaReviewQueueItem[] {
  if (!cachedReviews) {
    cachedReviews = createInitialCaReviews();
  }
  return cachedReviews;
}

function getTasks(): CaTask[] {
  if (!cachedTasks) {
    cachedTasks = createInitialCaTasks();
  }
  return cachedTasks;
}

function getActivities(): CaRecentActivity[] {
  if (!cachedActivities) {
    cachedActivities = createInitialCaActivities();
  }
  return cachedActivities;
}

export const demoCaManagerStore = Object.freeze({
  async listCaApplications(): Promise<ApplicationItem[]> {
    try {
      const allApps = await demoApplicationsStore.list();
      return allApps.filter((app) => app.vertical === 'TAX_CA');
    } catch (err) {
      console.error('Error fetching CA applications:', err);
      return [];
    }
  },

  async getKpis(): Promise<CaManagerKpis> {
    try {
      const apps = await this.listCaApplications();
      const reviews = getReviews();

      const newCount = apps.filter((a) => a.status === 'NEW').length;
      const unassignedCount = apps.filter((a) => !a.agentId).length;
      const inProgressCount = apps.filter(
        (a) => a.status === 'IN_PROGRESS' || a.status === 'UNDER_REVIEW'
      ).length;
      const awaitingCustomerCount = apps.filter((a) => a.status === 'QUERY_RAISED').length;
      const awaitingReviewCount = reviews.filter((r) => r.status === 'PENDING').length;
      const dueSoonCount = apps.filter((a) => a.slaHours <= 24 && a.status !== 'COMPLETED').length;
      const overdueCount = apps.filter((a) => a.priority === 'URGENT' && a.status !== 'COMPLETED').length;
      const completedInPeriodCount = apps.filter((a) => a.status === 'COMPLETED').length;

      return {
        newCount,
        unassignedCount,
        inProgressCount,
        awaitingCustomerCount,
        awaitingReviewCount,
        dueSoonCount,
        overdueCount,
        completedInPeriodCount
      };
    } catch {
      return {
        newCount: 0,
        unassignedCount: 0,
        inProgressCount: 0,
        awaitingCustomerCount: 0,
        awaitingReviewCount: 0,
        dueSoonCount: 0,
        overdueCount: 0,
        completedInPeriodCount: 0
      };
    }
  },

  async listReviews(): Promise<CaReviewQueueItem[]> {
    try {
      return getReviews();
    } catch {
      return [];
    }
  },

  async decideReview(input: ReviewDecisionInput): Promise<CaReviewQueueItem> {
    try {
      const list = getReviews();
      const index = list.findIndex((r) => r.id === input.reviewId);
      if (index === -1) throw new Error(`Review item ${input.reviewId} not found.`);

      const updatedReview: CaReviewQueueItem = {
        ...list[index],
        status: input.decision,
        managerComments: input.comments,
        decidedAt: new Date().toISOString()
      };

      cachedReviews = list.map((item, i) => (i === index ? updatedReview : item));

      // Also update application status
      const nextStatus = input.decision === 'APPROVED' ? 'READY_FOR_FILING' : 'IN_PROGRESS';
      await demoApplicationsStore.updateStatus({
        applicationId: input.applicationId,
        nextStatus,
        note: `Manager Review ${input.decision}: ${input.comments}`
      });

      // Add to activity feed
      const newAct: CaRecentActivity = {
        id: `ACT-${Date.now()}`,
        applicationId: input.applicationId,
        action: `Review ${input.decision}`,
        description: input.comments,
        actorName: 'Sanjay Verma',
        actorRole: 'CA_MANAGER',
        timestamp: new Date().toISOString(),
        type: 'REVIEW'
      };
      cachedActivities = [newAct, ...getActivities()];

      return updatedReview;
    } catch (err) {
      console.error('Failed to record review decision:', err);
      throw err;
    }
  },

  async listTasks(): Promise<CaTask[]> {
    try {
      return getTasks();
    } catch {
      return [];
    }
  },

  async createTask(input: CreateTaskInput): Promise<CaTask> {
    try {
      const tasks = getTasks();
      const newTask: CaTask = {
        id: `TSK-${Date.now()}`,
        applicationId: input.applicationId,
        customerName: 'Customer',
        title: input.title.trim(),
        ownerName: input.ownerName.trim(),
        ownerRole: 'CA Executive',
        dueAt: input.dueAt,
        status: 'PENDING',
        priority: input.priority
      };
      cachedTasks = [newTask, ...tasks];
      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  },

  async completeTask(taskId: string): Promise<void> {
    try {
      const tasks = getTasks();
      cachedTasks = tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
          : t
      );
    } catch (err) {
      console.error('Failed to complete task:', err);
      throw err;
    }
  },

  async listAgentsWorkload(): Promise<CaAgentWorkload[]> {
    try {
      return getAgents();
    } catch {
      return [];
    }
  },

  async listServiceMetrics(): Promise<CaServiceMetric[]> {
    try {
      return createInitialCaMetrics();
    } catch {
      return [];
    }
  },

  async listRecentActivity(): Promise<CaRecentActivity[]> {
    try {
      return getActivities();
    } catch {
      return [];
    }
  },

  async getNavCounters(): Promise<CaNavCounters> {
    try {
      const apps = await this.listCaApplications();
      const reviews = getReviews();

      const incoming = apps.filter((a) => a.status === 'NEW').length;
      const unassigned = apps.filter((a) => !a.agentId).length;
      const reviewPending = reviews.filter((r) => r.status === 'PENDING').length;

      return {
        incoming,
        unassigned,
        reviews: reviewPending,
        notifications: 2
      };
    } catch {
      return {};
    }
  }
});
