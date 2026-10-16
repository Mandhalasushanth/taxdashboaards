import { Button, DeferredContent, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminApplications, type AdminApplicationsController } from '../../hooks/useAdminApplications';
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer';
import { ApplicationsKpisBar } from './ApplicationsKpisBar';
import { ApplicationsTable } from './ApplicationsTable';
import { ApplicationsToolbar } from './ApplicationsToolbar';
import { AssignStaffModal } from './AssignStaffModal';
import { CreateApplicationModal } from './CreateApplicationModal';
import { UpdateStatusModal } from './UpdateStatusModal';
import './ApplicationsSection.css';

function renderLoading() {
  return (
    <DeferredContent>
      <div className="tx-applications__state">
        <LoadingSpinner size="lg" label="Loading customer applications ledger..." />
      </div>
    </DeferredContent>
  );
}

function renderError(controller: AdminApplicationsController) {
  const handleRetry = () => {
    try {
      controller.reload();
    } catch (err) {
      console.error('Error reloading:', err);
    }
  };

  return (
    <div className="tx-applications__state" role="alert">
      <p style={{ color: 'var(--tx-error)', fontWeight: 600 }}>{controller.error}</p>
      <Button variant="secondary" iconName="rotate-ccw" onClick={handleRetry}>
        Retry Loading Applications
      </Button>
    </div>
  );
}

function renderMainContent(ctrl: AdminApplicationsController) {
  const hasActiveFilters =
    ctrl.vertical !== 'ALL' ||
    ctrl.statusFilter !== 'ALL' ||
    ctrl.priorityFilter !== 'ALL' ||
    ctrl.serviceFilter !== 'ALL' ||
    Boolean(ctrl.searchQuery.trim());

  return (
    <>
      <ApplicationsKpisBar
        kpis={ctrl.kpis}
        activeStatusFilter={ctrl.statusFilter}
        onSelectStatus={ctrl.setStatusFilter}
      />

      <ApplicationsToolbar
        vertical={ctrl.vertical}
        onVerticalChange={ctrl.setVertical}
        statusFilter={ctrl.statusFilter}
        onStatusFilterChange={ctrl.setStatusFilter}
        priorityFilter={ctrl.priorityFilter}
        onPriorityFilterChange={ctrl.setPriorityFilter}
        serviceFilter={ctrl.serviceFilter}
        onServiceFilterChange={ctrl.setServiceFilter}
        searchQuery={ctrl.searchQuery}
        onSearchChange={ctrl.setSearchQuery}
        onOpenCreateModal={() => ctrl.setCreateModalOpen(true)}
        onExportCsv={ctrl.exportCsv}
        onResetFilters={ctrl.resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <ApplicationsTable
        applications={ctrl.filteredApplications}
        onSelectApp={ctrl.setSelectedApp}
        onOpenStatusModal={ctrl.setStatusModalTarget}
        onOpenAssignModal={ctrl.setAssignModalTarget}
        onResetFilters={ctrl.resetFilters}
      />

      {ctrl.selectedApp && (
        <ApplicationDetailDrawer
          app={ctrl.selectedApp}
          onClose={() => ctrl.setSelectedApp(null)}
          onVerifyDoc={ctrl.verifyDocument}
          onRejectDoc={ctrl.rejectDocument}
          onAddQuery={ctrl.addQuery}
          onOpenStatusModal={ctrl.setStatusModalTarget}
          onOpenAssignModal={ctrl.setAssignModalTarget}
        />
      )}

      {ctrl.isCreateModalOpen && (
        <CreateApplicationModal
          onClose={() => ctrl.setCreateModalOpen(false)}
          onSubmit={ctrl.createApplication}
        />
      )}

      {ctrl.statusModalTarget && (
        <UpdateStatusModal
          app={ctrl.statusModalTarget}
          onClose={() => ctrl.setStatusModalTarget(null)}
          onSubmit={ctrl.updateApplicationStatus}
        />
      )}

      {ctrl.assignModalTarget && (
        <AssignStaffModal
          app={ctrl.assignModalTarget}
          onClose={() => ctrl.setAssignModalTarget(null)}
          onSubmit={ctrl.assignStaff}
        />
      )}
    </>
  );
}

/**
 * Admin "Applications" Section:
 * Comprehensive case ledger and operational management for Chartered Accountancy
 * filings (ITR, GST, TDS, NRI, Notices) and Loan syndications.
 */
export default function ApplicationsSection() {
  useDocumentTitle('Applications & Case Management');
  const controller = useAdminApplications();

  const renderBody = () => {
    if (controller.status === 'loading') return renderLoading();
    if (controller.status === 'error') return renderError(controller);
    return renderMainContent(controller);
  };

  return (
    <div className="tx-applications">
      <div className="tx-applications__header">
        <h2 className="tx-applications__title">Applications & Case Management</h2>
        <p className="tx-applications__subtitle">
          Real-time tracking, document verification, stage transitions and SLA monitoring across CA and loan dockets.
        </p>
      </div>
      {renderBody()}
    </div>
  );
}
