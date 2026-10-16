import { useCallback, useEffect, useState } from 'react';
import { caManagerApi } from '../api/caManagerApi';
import type {
  ApplicationItem,
  CaManagerKpis,
  CaRecentActivity,
  CaReviewQueueItem,
  CaServiceMetric,
  CaTask
} from '../shared/caManager.types';

export interface CaManagerSummaryState {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly kpis: CaManagerKpis;
  readonly urgentCases: readonly ApplicationItem[];
  readonly pendingReviews: readonly CaReviewQueueItem[];
  readonly pendingTasks: readonly CaTask[];
  readonly serviceMetrics: readonly CaServiceMetric[];
  readonly recentActivity: readonly CaRecentActivity[];
  readonly reload: () => Promise<void>;
}

const DEFAULT_KPIS: CaManagerKpis = {
  newCount: 0,
  unassignedCount: 0,
  inProgressCount: 0,
  awaitingCustomerCount: 0,
  awaitingReviewCount: 0,
  dueSoonCount: 0,
  overdueCount: 0,
  completedInPeriodCount: 0
};

export function useCaManagerSummary(): CaManagerSummaryState {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<CaManagerKpis>(DEFAULT_KPIS);
  const [urgentCases, setUrgentCases] = useState<readonly ApplicationItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<readonly CaReviewQueueItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<readonly CaTask[]>([]);
  const [serviceMetrics, setServiceMetrics] = useState<readonly CaServiceMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<readonly CaRecentActivity[]>([]);

  const reload = useCallback(async () => {
    try {
      setStatus((prev) => (prev === 'success' ? 'success' : 'loading'));
      setError(null);

      const [kpisRes, appsRes, reviewsRes, tasksRes, metricsRes, actsRes] = await Promise.all([
        caManagerApi.getKpis(),
        caManagerApi.listApplications(),
        caManagerApi.listReviews(),
        caManagerApi.listTasks(),
        caManagerApi.listServiceMetrics(),
        caManagerApi.listRecentActivity()
      ]);

      setKpis(kpisRes);
      setUrgentCases(
        appsRes.filter((a) => a.priority === 'URGENT' || a.status === 'QUERY_RAISED' || !a.agentId)
      );
      setPendingReviews(reviewsRes.filter((r) => r.status === 'PENDING'));
      setPendingTasks(tasksRes.filter((t) => t.status !== 'COMPLETED'));
      setServiceMetrics(metricsRes);
      setRecentActivity(actsRes);
      setStatus('success');
    } catch (err) {
      console.error('Failed to load CA manager summary:', err);
      setError((err as Error).message || 'Unable to load summary metrics.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    status,
    error,
    kpis,
    urgentCases,
    pendingReviews,
    pendingTasks,
    serviceMetrics,
    recentActivity,
    reload
  };
}
