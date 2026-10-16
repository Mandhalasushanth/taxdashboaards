import { useCallback, useEffect, useMemo, useState } from 'react';
import { caManagerApi } from '../api/caManagerApi';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import type {
  ApplicationItem,
  ApplicationPriority,
  ApplicationStatus,
  AssignStaffInput
} from '../shared/caManager.types';

export interface CaApplicationsController {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly applications: readonly ApplicationItem[];
  readonly filteredApplications: readonly ApplicationItem[];
  readonly statusFilter: 'ALL' | ApplicationStatus;
  readonly setStatusFilter: (status: 'ALL' | ApplicationStatus) => void;
  readonly priorityFilter: 'ALL' | ApplicationPriority;
  readonly setPriorityFilter: (priority: 'ALL' | ApplicationPriority) => void;
  readonly serviceFilter: 'ALL' | string;
  readonly setServiceFilter: (service: 'ALL' | string) => void;
  readonly agentFilter: 'ALL' | string;
  readonly setAgentFilter: (agent: 'ALL' | string) => void;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly unassignedOnly: boolean;
  readonly setUnassignedOnly: (unassigned: boolean) => void;
  readonly selectedApp: ApplicationItem | null;
  readonly setSelectedApp: (app: ApplicationItem | null) => void;
  readonly assignModalTarget: ApplicationItem | null;
  readonly setAssignModalTarget: (app: ApplicationItem | null) => void;
  readonly reload: () => Promise<void>;
  readonly assignAgent: (input: AssignStaffInput) => Promise<void>;
  readonly verifyDocument: (applicationId: string, documentId: string) => Promise<void>;
  readonly rejectDocument: (applicationId: string, documentId: string, reason: string) => Promise<void>;
  readonly addQuery: (applicationId: string, message: string) => Promise<void>;
  readonly exportCsv: () => void;
  readonly resetFilters: () => void;
}

export function useCaApplications(
  initialUnassignedOnly = false,
  initialStatus: 'ALL' | ApplicationStatus = 'ALL'
): CaApplicationsController {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<readonly ApplicationItem[]>([]);

  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ApplicationPriority>('ALL');
  const [serviceFilter, setServiceFilter] = useState<'ALL' | string>('ALL');
  const [agentFilter, setAgentFilter] = useState<'ALL' | string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(initialUnassignedOnly);

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [assignModalTargetId, setAssignModalTargetId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);
      const list = await caManagerApi.listApplications();
      setApplications(list);
      setStatus('success');
    } catch (err) {
      console.error('Failed to load CA applications:', err);
      setError((err as Error).message || 'Unable to fetch applications.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const selectedApp = useMemo(() => {
    if (!selectedAppId) return null;
    return applications.find((app) => app.id === selectedAppId) ?? null;
  }, [applications, selectedAppId]);

  const assignModalTarget = useMemo(() => {
    if (!assignModalTargetId) return null;
    return applications.find((app) => app.id === assignModalTargetId) ?? null;
  }, [applications, assignModalTargetId]);

  const setSelectedApp = useCallback((app: ApplicationItem | null) => {
    setSelectedAppId(app ? app.id : null);
  }, []);

  const setAssignModalTarget = useCallback((app: ApplicationItem | null) => {
    setAssignModalTargetId(app ? app.id : null);
  }, []);

  const filteredApplications = useMemo(() => {
    try {
      const query = searchQuery.trim().toLowerCase();

      return applications.filter((app) => {
        if (unassignedOnly && app.agentId) return false;
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
        if (priorityFilter !== 'ALL' && app.priority !== priorityFilter) return false;
        if (serviceFilter !== 'ALL' && app.service !== serviceFilter) return false;
        if (agentFilter !== 'ALL') {
          if (agentFilter === 'UNASSIGNED') {
            if (app.agentId) return false;
          } else if (app.agentId !== agentFilter) {
            return false;
          }
        }

        if (query) {
          const matchId = app.id.toLowerCase().includes(query);
          const matchName = app.customer.name.toLowerCase().includes(query);
          const matchPan = app.customer.pan.toLowerCase().includes(query);
          const matchPhone = app.customer.phone.includes(query);
          const matchService = app.serviceName.toLowerCase().includes(query);
          return matchId || matchName || matchPan || matchPhone || matchService;
        }

        return true;
      });
    } catch (err) {
      console.error('Filtering CA applications error:', err);
      return applications;
    }
  }, [applications, unassignedOnly, statusFilter, priorityFilter, serviceFilter, agentFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setServiceFilter('ALL');
    setAgentFilter('ALL');
    setSearchQuery('');
    setUnassignedOnly(false);
  }, []);

  const assignAgent = useCallback(
    async (input: AssignStaffInput): Promise<void> => {
      try {
        const updated = await caManagerApi.assignAgent(input);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setAssignModalTargetId(null);
      } catch (err) {
        console.error('Error assigning agent:', err);
        throw err;
      }
    },
    []
  );

  const verifyDocument = useCallback(
    async (applicationId: string, documentId: string): Promise<void> => {
      try {
        const updated = await demoApplicationsStore.verifyDocument(applicationId, documentId);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (err) {
        console.error('Error verifying document:', err);
        throw err;
      }
    },
    []
  );

  const rejectDocument = useCallback(
    async (applicationId: string, documentId: string, reason: string): Promise<void> => {
      try {
        const updated = await demoApplicationsStore.rejectDocument(applicationId, documentId, reason);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (err) {
        console.error('Error rejecting document:', err);
        throw err;
      }
    },
    []
  );

  const addQuery = useCallback(
    async (applicationId: string, message: string): Promise<void> => {
      try {
        const updated = await demoApplicationsStore.addQuery(
          applicationId,
          'Sanjay Verma (CA Manager)',
          'CA_MANAGER',
          message
        );
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (err) {
        console.error('Error adding query:', err);
        throw err;
      }
    },
    []
  );

  const exportCsv = useCallback(() => {
    try {
      const headers = [
        'Application ID',
        'Service Name',
        'Customer Name',
        'PAN',
        'Phone',
        'Status',
        'Priority',
        'Assigned Agent',
        'Created At'
      ];

      const rows = filteredApplications.map((app) => [
        app.id,
        `"${app.serviceName.replace(/"/g, '""')}"`,
        `"${app.customer.name.replace(/"/g, '""')}"`,
        app.customer.pan,
        app.customer.phone,
        app.status,
        app.priority,
        app.agentName || 'Unassigned',
        app.createdAt
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ca-applications-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV failed:', err);
    }
  }, [filteredApplications]);

  return {
    status,
    error,
    applications,
    filteredApplications,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    serviceFilter,
    setServiceFilter,
    agentFilter,
    setAgentFilter,
    searchQuery,
    setSearchQuery,
    unassignedOnly,
    setUnassignedOnly,
    selectedApp,
    setSelectedApp,
    assignModalTarget,
    setAssignModalTarget,
    reload,
    assignAgent,
    verifyDocument,
    rejectDocument,
    addQuery,
    exportCsv,
    resetFilters
  };
}
