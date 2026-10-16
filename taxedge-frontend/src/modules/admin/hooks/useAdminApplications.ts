import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApplicationsApi } from '../api/adminApplicationsApi';
import type {
  ApplicationItem,
  ApplicationPriority,
  ApplicationService,
  ApplicationStatus,
  ApplicationVertical,
  ApplicationsKpiSummary,
  AssignStaffInput,
  NewApplicationInput,
  UpdateStatusInput
} from '../shared/applications.types';

export interface AdminApplicationsController {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly applications: readonly ApplicationItem[];
  readonly filteredApplications: readonly ApplicationItem[];
  readonly kpis: ApplicationsKpiSummary;
  readonly vertical: ApplicationVertical;
  readonly setVertical: (vertical: ApplicationVertical) => void;
  readonly statusFilter: 'ALL' | ApplicationStatus;
  readonly setStatusFilter: (status: 'ALL' | ApplicationStatus) => void;
  readonly priorityFilter: 'ALL' | ApplicationPriority;
  readonly setPriorityFilter: (priority: 'ALL' | ApplicationPriority) => void;
  readonly serviceFilter: 'ALL' | ApplicationService;
  readonly setServiceFilter: (service: 'ALL' | ApplicationService) => void;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly selectedApp: ApplicationItem | null;
  readonly setSelectedApp: (app: ApplicationItem | null) => void;
  readonly isCreateModalOpen: boolean;
  readonly setCreateModalOpen: (open: boolean) => void;
  readonly statusModalTarget: ApplicationItem | null;
  readonly setStatusModalTarget: (app: ApplicationItem | null) => void;
  readonly assignModalTarget: ApplicationItem | null;
  readonly setAssignModalTarget: (app: ApplicationItem | null) => void;
  readonly reload: () => Promise<void>;
  readonly createApplication: (input: NewApplicationInput) => Promise<ApplicationItem>;
  readonly updateApplicationStatus: (input: UpdateStatusInput) => Promise<void>;
  readonly assignStaff: (input: AssignStaffInput) => Promise<void>;
  readonly verifyDocument: (applicationId: string, documentId: string) => Promise<void>;
  readonly rejectDocument: (applicationId: string, documentId: string, reason: string) => Promise<void>;
  readonly addQuery: (applicationId: string, message: string) => Promise<void>;
  readonly exportCsv: () => void;
  readonly resetFilters: () => void;
}

export function useAdminApplications(): AdminApplicationsController {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<readonly ApplicationItem[]>([]);

  const [vertical, setVertical] = useState<ApplicationVertical>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ApplicationPriority>('ALL');
  const [serviceFilter, setServiceFilter] = useState<'ALL' | ApplicationService>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalTarget, setStatusModalTarget] = useState<ApplicationItem | null>(null);
  const [assignModalTarget, setAssignModalTarget] = useState<ApplicationItem | null>(null);

  const reload = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);
      const list = await adminApplicationsApi.list();
      setApplications(list);
      setStatus('success');

      if (selectedApp) {
        const refreshed = list.find((item) => item.id === selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError((err as Error).message || 'Unable to fetch applications.');
      setStatus('error');
    }
  }, [selectedApp]);

  useEffect(() => {
    reload();
  }, []);

  const kpis = useMemo(() => adminApplicationsApi.computeKpis(applications), [applications]);

  const filteredApplications = useMemo(() => {
    try {
      const query = searchQuery.trim().toLowerCase();

      return applications.filter((app) => {
        if (vertical !== 'ALL' && app.vertical !== vertical) return false;
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
        if (priorityFilter !== 'ALL' && app.priority !== priorityFilter) return false;
        if (serviceFilter !== 'ALL' && app.service !== serviceFilter) return false;

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
      console.error('Filtering error:', err);
      return applications;
    }
  }, [applications, vertical, statusFilter, priorityFilter, serviceFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setVertical('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setServiceFilter('ALL');
    setSearchQuery('');
  }, []);

  const createApplication = useCallback(
    async (input: NewApplicationInput): Promise<ApplicationItem> => {
      try {
        const created = await adminApplicationsApi.create(input);
        setApplications((prev) => [created, ...prev]);
        setCreateModalOpen(false);
        return created;
      } catch (err) {
        console.error('Error in createApplication:', err);
        throw err;
      }
    },
    []
  );

  const updateApplicationStatus = useCallback(
    async (input: UpdateStatusInput): Promise<void> => {
      try {
        const updated = await adminApplicationsApi.updateStatus(input);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedApp && selectedApp.id === updated.id) {
          setSelectedApp(updated);
        }
        setStatusModalTarget(null);
      } catch (err) {
        console.error('Error in updateApplicationStatus:', err);
        throw err;
      }
    },
    [selectedApp]
  );

  const assignStaff = useCallback(
    async (input: AssignStaffInput): Promise<void> => {
      try {
        const updated = await adminApplicationsApi.assignStaff(input);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedApp && selectedApp.id === updated.id) {
          setSelectedApp(updated);
        }
        setAssignModalTarget(null);
      } catch (err) {
        console.error('Error in assignStaff:', err);
        throw err;
      }
    },
    [selectedApp]
  );

  const verifyDocument = useCallback(
    async (applicationId: string, documentId: string): Promise<void> => {
      try {
        const updated = await adminApplicationsApi.verifyDocument(applicationId, documentId);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedApp && selectedApp.id === updated.id) {
          setSelectedApp(updated);
        }
      } catch (err) {
        console.error('Error in verifyDocument:', err);
        throw err;
      }
    },
    [selectedApp]
  );

  const rejectDocument = useCallback(
    async (applicationId: string, documentId: string, reason: string): Promise<void> => {
      try {
        const updated = await adminApplicationsApi.rejectDocument(applicationId, documentId, reason);
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedApp && selectedApp.id === updated.id) {
          setSelectedApp(updated);
        }
      } catch (err) {
        console.error('Error in rejectDocument:', err);
        throw err;
      }
    },
    [selectedApp]
  );

  const addQuery = useCallback(
    async (applicationId: string, message: string): Promise<void> => {
      try {
        const updated = await adminApplicationsApi.addQuery(
          applicationId,
          'Operations Administrator',
          'ADMINISTRATOR',
          message
        );
        setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedApp && selectedApp.id === updated.id) {
          setSelectedApp(updated);
        }
      } catch (err) {
        console.error('Error in addQuery:', err);
        throw err;
      }
    },
    [selectedApp]
  );

  const exportCsv = useCallback(() => {
    try {
      const headers = [
        'Application ID',
        'Vertical',
        'Service Name',
        'Customer Name',
        'PAN',
        'Phone',
        'Status',
        'Priority',
        'Manager',
        'Executive',
        'Created At'
      ];

      const rows = filteredApplications.map((app) => [
        app.id,
        app.vertical,
        `"${app.serviceName.replace(/"/g, '""')}"`,
        `"${app.customer.name.replace(/"/g, '""')}"`,
        app.customer.pan,
        app.customer.phone,
        app.status,
        app.priority,
        app.managerName || 'Unassigned',
        app.agentName || 'Unassigned',
        app.createdAt
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `taxedge-applications-${new Date().toISOString().slice(0, 10)}.csv`);
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
    kpis,
    vertical,
    setVertical,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    serviceFilter,
    setServiceFilter,
    searchQuery,
    setSearchQuery,
    selectedApp,
    setSelectedApp,
    isCreateModalOpen,
    setCreateModalOpen,
    statusModalTarget,
    setStatusModalTarget,
    assignModalTarget,
    setAssignModalTarget,
    reload,
    createApplication,
    updateApplicationStatus,
    assignStaff,
    verifyDocument,
    rejectDocument,
    addQuery,
    exportCsv,
    resetFilters
  };
}
