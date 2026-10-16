import { DeferredContent, LoadingSpinner } from '@/shared';
import { useCaApplications } from '../../hooks/useCaApplications';
import type { ApplicationStatus } from '../../shared/caManager.types';
import { CaApplicationDetailDrawer } from './CaApplicationDetailDrawer';
import { CaApplicationsTable } from './CaApplicationsTable';
import { CaApplicationsToolbar } from './CaApplicationsToolbar';
import { CaAssignAgentModal } from './CaAssignAgentModal';
import './CaApplicationsSection.css';

interface CaApplicationsSectionProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly unassignedOnly?: boolean;
  readonly initialStatus?: 'ALL' | ApplicationStatus;
}

export function CaApplicationsSection({
  title = 'Chartered Accountancy Applications',
  subtitle = 'Master case register for GST, ITR, and company incorporation customer filings.',
  unassignedOnly = false,
  initialStatus = 'ALL'
}: CaApplicationsSectionProps) {
  const ctrl = useCaApplications(unassignedOnly, initialStatus);

  const hasActiveFilters =
    ctrl.statusFilter !== 'ALL' ||
    ctrl.priorityFilter !== 'ALL' ||
    ctrl.serviceFilter !== 'ALL' ||
    ctrl.agentFilter !== 'ALL' ||
    Boolean(ctrl.searchQuery.trim());

  if (ctrl.status === 'loading') {
    return (
      <DeferredContent>
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <LoadingSpinner size="lg" label="Loading CA applications..." />
        </div>
      </DeferredContent>
    );
  }

  return (
    <div className="tx-ca-apps-section">
      <div className="tx-ca-apps-section__header">
        <h2 className="tx-ca-apps-section__title">{title}</h2>
        <p className="tx-ca-apps-section__subtitle">{subtitle}</p>
      </div>

      <CaApplicationsToolbar
        statusFilter={ctrl.statusFilter}
        onStatusFilterChange={ctrl.setStatusFilter}
        priorityFilter={ctrl.priorityFilter}
        onPriorityFilterChange={ctrl.setPriorityFilter}
        serviceFilter={ctrl.serviceFilter}
        onServiceFilterChange={ctrl.setServiceFilter}
        agentFilter={ctrl.agentFilter}
        onAgentFilterChange={ctrl.setAgentFilter}
        searchQuery={ctrl.searchQuery}
        onSearchChange={ctrl.setSearchQuery}
        onExportCsv={ctrl.exportCsv}
        onResetFilters={ctrl.resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <CaApplicationsTable
        applications={ctrl.filteredApplications}
        onSelectApp={ctrl.setSelectedApp}
        onAssignApp={ctrl.setAssignModalTarget}
        onResetFilters={ctrl.resetFilters}
      />

      {ctrl.selectedApp && (
        <CaApplicationDetailDrawer
          app={ctrl.selectedApp}
          onClose={() => ctrl.setSelectedApp(null)}
          onVerifyDoc={ctrl.verifyDocument}
          onRejectDoc={ctrl.rejectDocument}
          onAddQuery={ctrl.addQuery}
          onAssignApp={ctrl.setAssignModalTarget}
        />
      )}

      {ctrl.assignModalTarget && (
        <CaAssignAgentModal
          app={ctrl.assignModalTarget}
          onClose={() => ctrl.setAssignModalTarget(null)}
          onAssign={ctrl.assignAgent}
        />
      )}
    </div>
  );
}
