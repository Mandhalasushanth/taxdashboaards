import { Icon } from '@/shared';
import type { ApplicationItem } from '../../shared/caManager.types';
import './CaUrgentWorkPanel.css';

interface UrgentBlockerItem {
  readonly id: string;
  readonly customerName: string;
  readonly serviceName: string;
  readonly pan: string;
  readonly caseId: string;
  readonly priority: 'High Priority' | 'SLA Risk';
  readonly blocker: string;
  readonly agentName: string;
  readonly dueIn: string;
}

const DEFAULT_BLOCKERS: readonly UrgentBlockerItem[] = Object.freeze([
  {
    id: 'APP-2025-0101',
    customerName: 'Arjun Nambiar',
    serviceName: 'ITR-2 (Capital Gains)',
    pan: 'ABCPA1234F',
    caseId: 'TE-2026-00123',
    priority: 'High Priority',
    blocker: 'Blocked: Missing Form 16',
    agentName: 'Priya Sharma',
    dueIn: 'Due in 1 day'
  },
  {
    id: 'APP-2025-0107',
    customerName: 'Karthik Somayajji',
    serviceName: 'GST Monthly',
    pan: 'AABCS9988K',
    caseId: 'TE-2026-00456',
    priority: 'SLA Risk',
    blocker: 'Pending Documents',
    agentName: 'Suresh Kumar',
    dueIn: 'Due in 2 days'
  },
  {
    id: 'APP-2025-0102',
    customerName: 'Meera Iyer',
    serviceName: 'ITR-1 (Salaried)',
    pan: 'AAGPI5678L',
    caseId: 'TE-2026-00789',
    priority: 'SLA Risk',
    blocker: 'Tax Computation Pending',
    agentName: 'Rahul Verma',
    dueIn: 'Due in 3 days'
  }
]);

interface CaUrgentWorkPanelProps {
  readonly urgentCases?: readonly ApplicationItem[];
  readonly onOpenApp: (app: ApplicationItem | { id: string; customer: { name: string } }) => void;
  readonly onAssignApp: (app: ApplicationItem | { id: string; customer: { name: string } }) => void;
  readonly onViewAll?: () => void;
}

export function CaUrgentWorkPanel({
  urgentCases,
  onOpenApp,
  onAssignApp,
  onViewAll
}: CaUrgentWorkPanelProps) {
  const items = DEFAULT_BLOCKERS;

  const handleWhatsApp = (name: string) => {
    alert(`Sending automated WhatsApp reminder ping to ${name} for pending compliance verification.`);
  };

  return (
    <div className="tx-ca-urgent-panel" role="region" aria-label="Urgent Work Priorities">
      {/* Header */}
      <div className="tx-ca-urgent-panel__header">
        <div className="tx-ca-urgent-panel__title-wrap">
          <Icon name="alert-triangle" size="sm" />
          <h3 className="tx-ca-urgent-panel__title">Immediate Attention & Urgent Blockers</h3>
          <span className="tx-ca-urgent-count-badge">3 Critical</span>
        </div>
        <button type="button" className="tx-ca-panel-link-btn" onClick={onViewAll}>
          View All →
        </button>
      </div>

      {/* Case List */}
      <div className="tx-ca-urgent-list">
        {items.map((item) => {
          const isHighPriority = item.priority === 'High Priority';
          const proxyApp = (urgentCases && urgentCases.find((c) => c.id === item.id)) || {
            id: item.id,
            customer: { name: item.customerName, pan: item.pan }
          };

          return (
            <div key={item.id} className="tx-ca-urgent-card">
              {/* Left Column: Client Details */}
              <div className="tx-ca-urgent-col tx-ca-urgent-col--client">
                <div className="tx-ca-urgent-priority-tag">
                  <span className={isHighPriority ? 'tx-ca-priority-chip--high' : 'tx-ca-priority-chip--risk'}>
                    <Icon name="alert-circle" size="sm" /> {item.priority}
                  </span>
                </div>
                <h4 className="tx-ca-urgent-client-name">{item.customerName}</h4>
                <p className="tx-ca-urgent-service-tag">{item.serviceName}</p>
                <div className="tx-ca-urgent-meta-line">
                  <span>PAN: {item.pan}</span>
                  <span className="tx-ca-meta-sep">•</span>
                  <span>Case ID: {item.caseId}</span>
                </div>
              </div>

              {/* Middle Column: Blocker Info & Assigned Agent */}
              <div className="tx-ca-urgent-col tx-ca-urgent-col--blocker">
                <span className="tx-ca-blocker-chip">{item.blocker}</span>
                <div className="tx-ca-assigned-pill">
                  <div className="tx-ca-assigned-avatar">
                    {item.agentName.charAt(0)}
                  </div>
                  <div>
                    <div className="tx-ca-assigned-label">Assigned to</div>
                    <div className="tx-ca-assigned-name">{item.agentName}</div>
                    <div className="tx-ca-assigned-role">CA Agent</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Timer & Action Buttons */}
              <div className="tx-ca-urgent-col tx-ca-urgent-col--actions">
                <div className="tx-ca-timer-badge">
                  <Icon name="clock" size="sm" />
                  <span>{item.dueIn}</span>
                </div>

                <div className="tx-ca-action-buttons-row">
                  <button
                    type="button"
                    className="tx-ca-btn tx-ca-btn--primary"
                    onClick={() => onOpenApp(proxyApp as ApplicationItem)}
                  >
                    Review Draft
                  </button>

                  <button
                    type="button"
                    className="tx-ca-btn tx-ca-btn--outline"
                    onClick={() => handleWhatsApp(item.customerName)}
                    title="Send automated ping to client WhatsApp"
                  >
                    <Icon name="message-square" size="sm" />
                    <span>Send WhatsApp Ping</span>
                  </button>

                  <button
                    type="button"
                    className="tx-ca-btn tx-ca-btn--outline"
                    onClick={() => onAssignApp(proxyApp as ApplicationItem)}
                    title="Reassign to another available agent"
                  >
                    <Icon name="user-check" size="sm" />
                    <span>Reassign</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
