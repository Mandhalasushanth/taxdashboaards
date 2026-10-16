import { Button, Icon } from '@/shared';
import type { ApplicationItem } from '../../shared/caManager.types';
import './CaUrgentWorkPanel.css';

interface CaUrgentWorkPanelProps {
  readonly urgentCases: readonly ApplicationItem[];
  readonly onOpenApp: (app: ApplicationItem) => void;
  readonly onAssignApp: (app: ApplicationItem) => void;
}

export function CaUrgentWorkPanel({
  urgentCases,
  onOpenApp,
  onAssignApp
}: CaUrgentWorkPanelProps) {
  if (urgentCases.length === 0) {
    return (
      <div className="tx-ca-urgent-panel">
        <div className="tx-ca-urgent-panel__header">
          <div className="tx-ca-urgent-panel__title-wrap">
            <Icon name="check-check" size="sm" />
            <h3 className="tx-ca-urgent-panel__title">Work-Priority Queue</h3>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--tx-secondary-text)' }}>
          No urgent blockers, overdue deadlines, or untriaged cases right now. All queues are healthy.
        </p>
      </div>
    );
  }

  return (
    <div className="tx-ca-urgent-panel" role="region" aria-label="Urgent Work Priorities">
      <div className="tx-ca-urgent-panel__header">
        <div className="tx-ca-urgent-panel__title-wrap">
          <Icon name="alert-triangle" size="sm" />
          <h3 className="tx-ca-urgent-panel__title">Immediate Attention Required</h3>
          <span className="tx-ca-urgent-badge">{urgentCases.length} Cases</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--tx-muted-text)' }}>
          Overdue • Client Blocked • Unassigned
        </span>
      </div>

      <div className="tx-ca-urgent-list">
        {urgentCases.slice(0, 4).map((app) => {
          const isUnassigned = !app.agentId;
          const isQuery = app.status === 'QUERY_RAISED';
          const reasonText = isUnassigned
            ? 'Needs Agent Assignment'
            : isQuery
              ? 'Blocked: Client Document Query'
              : 'Urgent Filing SLA';

          return (
            <div key={app.id} className="tx-ca-urgent-item">
              <div className="tx-ca-urgent-info">
                <div className="tx-ca-urgent-title-row">
                  <span className="tx-ca-urgent-id">{app.id}</span>
                  <span className="tx-ca-urgent-customer">{app.customer.name}</span>
                  <span className="tx-ca-urgent-reason">{reasonText}</span>
                </div>
                <span className="tx-ca-urgent-meta">
                  {app.serviceName} • PAN: {app.customer.pan} • Agent:{' '}
                  {app.agentName || 'Unassigned'}
                </span>
              </div>

              <div className="tx-ca-urgent-actions">
                {isUnassigned ? (
                  <Button
                    variant="primary"
                    iconName="user-check"
                    onClick={() => onAssignApp(app)}
                  >
                    Assign Agent
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    iconName="eye"
                    onClick={() => onOpenApp(app)}
                  >
                    Open Case
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
