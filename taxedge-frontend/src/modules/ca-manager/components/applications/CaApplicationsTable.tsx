import { EmptyState, Icon } from '@/shared';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationItem
} from '../../shared/caManager.types';
import './CaApplicationsTable.css';

interface CaApplicationsTableProps {
  readonly applications: readonly ApplicationItem[];
  readonly onSelectApp: (app: ApplicationItem) => void;
  readonly onAssignApp: (app: ApplicationItem) => void;
  readonly onResetFilters: () => void;
}

function renderCustomerCell(app: ApplicationItem) {
  return (
    <div className="tx-ca-cell-customer">
      <span className="tx-ca-customer-name">{app.customer.name}</span>
      <div className="tx-ca-customer-sub">
        <span className="tx-ca-pan">{app.customer.pan}</span>
        <span>{app.customer.phone}</span>
      </div>
    </div>
  );
}

function renderServiceCell(app: ApplicationItem) {
  return (
    <div className="tx-ca-cell-service">
      <span className="tx-ca-service-name">{app.serviceName}</span>
      {app.assessmentYear && (
        <span className="tx-ca-service-ay">AY {app.assessmentYear}</span>
      )}
    </div>
  );
}

function renderStatusPill(status: ApplicationItem['status']) {
  const pillClass = `tx-ca-status-pill tx-ca-status-pill--${status.toLowerCase()}`;
  return (
    <span className={pillClass}>
      <span className="tx-ca-status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function renderDocsIndicator(app: ApplicationItem) {
  const verified = app.documents.filter((d) => d.status === 'VERIFIED').length;
  const total = app.documents.length;
  return (
    <span style={{ fontSize: '0.78rem', color: 'var(--tx-secondary-text)' }}>
      {total > 0 ? `${verified}/${total} Verified` : 'No Docs'}
    </span>
  );
}

export function CaApplicationsTable({
  applications,
  onSelectApp,
  onAssignApp,
  onResetFilters
}: CaApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="tx-ca-table-card" style={{ padding: '36px 16px', textAlign: 'center' }}>
        <EmptyState
          iconName="inbox"
          title="No CA applications found"
          message="No customer filings match the active search or queue criteria."
        />
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            className="tx-ca-action-btn"
            style={{ width: 'auto', padding: '6px 14px', gap: 6 }}
            onClick={onResetFilters}
          >
            <Icon name="rotate-ccw" size="sm" />
            <span>Reset Queue Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-ca-table-card">
      <div className="tx-ca-table-wrapper">
        <table className="tx-ca-table" aria-label="Chartered accountancy customer cases">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Assigned Agent</th>
              <th>Docs</th>
              <th>SLA Target</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="tx-ca-cell-id">
                    <button
                      type="button"
                      className="tx-ca-id-btn"
                      onClick={() => onSelectApp(app)}
                      aria-label={`Open dossier for ${app.id}`}
                    >
                      {app.id}
                    </button>
                    <span
                      className={`tx-ca-priority-tag tx-ca-priority-tag--${app.priority.toLowerCase()}`}
                    >
                      {PRIORITY_LABELS[app.priority]}
                    </span>
                  </div>
                </td>
                <td>{renderCustomerCell(app)}</td>
                <td>{renderServiceCell(app)}</td>
                <td>{renderStatusPill(app.status)}</td>
                <td>
                  {app.agentName ? (
                    <span className="tx-ca-agent-pill">{app.agentName}</span>
                  ) : (
                    <span className="tx-ca-unassigned-tag">Unassigned</span>
                  )}
                </td>
                <td>{renderDocsIndicator(app)}</td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--tx-secondary-text)' }}>
                    {app.slaHours}h target
                  </span>
                </td>
                <td>
                  <div className="tx-ca-actions">
                    <button
                      type="button"
                      className="tx-ca-action-btn"
                      onClick={() => onSelectApp(app)}
                      title="Open Case Dossier"
                      aria-label={`Open ${app.id}`}
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    <button
                      type="button"
                      className="tx-ca-action-btn"
                      onClick={() => onAssignApp(app)}
                      title="Assign or Reassign CA Agent"
                      aria-label={`Assign agent for ${app.id}`}
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

      <div className="tx-ca-table-footer">
        <span>Showing {applications.length} CA cases</span>
        <span>TaxEdge CA Operations Registry</span>
      </div>
    </div>
  );
}
