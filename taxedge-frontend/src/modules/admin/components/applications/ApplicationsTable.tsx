import { EmptyState, Icon } from '@/shared';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationItem
} from '../../shared/applications.types';
import './ApplicationsTable.css';

interface ApplicationsTableProps {
  readonly applications: readonly ApplicationItem[];
  readonly onSelectApp: (app: ApplicationItem) => void;
  readonly onOpenStatusModal: (app: ApplicationItem) => void;
  readonly onOpenAssignModal: (app: ApplicationItem) => void;
  readonly onResetFilters: () => void;
}

function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

function renderCustomerCell(app: ApplicationItem) {
  return (
    <div className="tx-app-customer-cell">
      <span className="tx-app-customer-name">{app.customer.name}</span>
      <div className="tx-app-customer-meta">
        <span className="tx-app-pan-badge">{app.customer.pan}</span>
        <span>{app.customer.phone}</span>
      </div>
    </div>
  );
}

function renderServiceCell(app: ApplicationItem) {
  const extra =
    app.vertical === 'TAX_CA'
      ? app.assessmentYear
        ? `AY ${app.assessmentYear}`
        : 'Current FY'
      : app.requestedAmount
        ? `${formatCurrency(app.requestedAmount)} • ${app.targetLender || 'Lender TBD'}`
        : 'Facility TBD';

  return (
    <div className="tx-app-service-cell">
      <span className="tx-app-service-name">{app.serviceName}</span>
      <span className="tx-app-service-extra">{extra}</span>
    </div>
  );
}

function renderStatusBadge(status: ApplicationItem['status']) {
  const badgeClass = `tx-app-status-badge tx-app-status-badge--${status.toLowerCase()}`;
  return (
    <span className={badgeClass}>
      <span className="tx-app-status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function renderStaffCell(app: ApplicationItem) {
  if (!app.agentName && !app.managerName) {
    return <span className="tx-app-staff-unassigned">Unassigned</span>;
  }
  return (
    <div className="tx-app-staff-cell">
      <span className="tx-app-staff-agent">{app.agentName || 'Agent unassigned'}</span>
      {app.managerName && <span className="tx-app-staff-manager">Mgr: {app.managerName}</span>}
    </div>
  );
}

function renderDocsCell(app: ApplicationItem) {
  const verified = app.documents.filter((d) => d.status === 'VERIFIED').length;
  const total = app.documents.length;
  return (
    <span className="tx-app-docs-pill">
      <Icon name="file-text" size="sm" />
      {total > 0 ? `${verified}/${total} Verified` : 'No Docs'}
    </span>
  );
}

export function ApplicationsTable({
  applications,
  onSelectApp,
  onOpenStatusModal,
  onOpenAssignModal,
  onResetFilters
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="tx-app-table-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
        <EmptyState
          iconName="file-spreadsheet"
          title="No applications match your criteria"
          message="Try modifying search keywords or clearing active status and vertical filters."
        />
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="tx-app-action-btn"
            style={{ width: 'auto', padding: '8px 16px', gap: 6 }}
            onClick={onResetFilters}
          >
            <Icon name="rotate-ccw" size="sm" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-app-table-card">
      <div className="tx-app-table-wrapper">
        <table className="tx-app-table" aria-label="Customer applications ledger">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Customer</th>
              <th>Service & Details</th>
              <th>Status</th>
              <th>Assigned Staff</th>
              <th>Docs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="tx-app-id-cell">
                    <button
                      type="button"
                      className="tx-app-id-link"
                      onClick={() => onSelectApp(app)}
                      aria-label={`View application ${app.id}`}
                    >
                      {app.id}
                    </button>
                    <span
                      className={`tx-app-priority-pill tx-app-priority-pill--${app.priority.toLowerCase()}`}
                    >
                      {PRIORITY_LABELS[app.priority]}
                    </span>
                  </div>
                </td>
                <td>{renderCustomerCell(app)}</td>
                <td>{renderServiceCell(app)}</td>
                <td>{renderStatusBadge(app.status)}</td>
                <td>{renderStaffCell(app)}</td>
                <td>{renderDocsCell(app)}</td>
                <td>
                  <div className="tx-app-actions">
                    <button
                      type="button"
                      className="tx-app-action-btn"
                      onClick={() => onSelectApp(app)}
                      title="View Full Case Dossier"
                      aria-label={`View dossier for ${app.id}`}
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    <button
                      type="button"
                      className="tx-app-action-btn"
                      onClick={() => onOpenStatusModal(app)}
                      title="Update Application Stage"
                      aria-label={`Update status for ${app.id}`}
                    >
                      <Icon name="list-checks" size="sm" />
                    </button>
                    <button
                      type="button"
                      className="tx-app-action-btn"
                      onClick={() => onOpenAssignModal(app)}
                      title="Assign Manager / Agent"
                      aria-label={`Assign staff for ${app.id}`}
                    >
                      <Icon name="user-check" size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tx-app-table-footer">
        <span>Showing {applications.length} applications</span>
        <span>TaxEdge Operational Registry</span>
      </div>
    </div>
  );
}
