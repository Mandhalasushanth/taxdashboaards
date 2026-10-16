import { useState } from 'react';
import { Button, Icon } from '@/shared';
import type { ApplicationItem, AssignStaffInput, CaAgentWorkload } from '../../shared/caManager.types';
import { createInitialCaAgents } from '../../dev/demoCaManagerSeeds';
import './CaAssignAgentModal.css';

interface CaAssignAgentModalProps {
  readonly app: ApplicationItem;
  readonly onClose: () => void;
  readonly onAssign: (input: AssignStaffInput) => Promise<void>;
}

export function CaAssignAgentModal({ app, onClose, onAssign }: CaAssignAgentModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(app.agentId);
  const [auditNote, setAuditNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // Strictly CA Agents only
  const eligibleAgents: readonly CaAgentWorkload[] = createInitialCaAgents();

  const selectedAgent = eligibleAgents.find((a) => a.id === selectedAgentId);
  const isOverCapacity = selectedAgent
    ? selectedAgent.activeCases >= selectedAgent.capacityMax
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Please select an eligible CA agent.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const payload: AssignStaffInput = {
        applicationId: app.id,
        managerId: 'MGR-101',
        agentId: selectedAgentId,
        auditNote: auditNote.trim() || 'Assigned to CA agent by CA Manager.'
      };

      await onAssign(payload);
    } catch (err) {
      console.error('Assignment error:', err);
      setError((err as Error).message || 'Failed to complete assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <h3 className="tx-modal-title">Assign CA Agent • {app.id}</h3>
          <button
            type="button"
            className="tx-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-body tx-ca-assign-modal">
          {error && <div className="tx-form-error-msg">{error}</div>}

          <div className="tx-ca-assign-case-docket">
            <div className="tx-ca-assign-field">
              <span className="tx-ca-assign-field__label">Client / Service</span>
              <span className="tx-ca-assign-field__val">
                {app.customer.name} • {app.serviceName}
              </span>
            </div>
            <div className="tx-ca-assign-field">
              <span className="tx-ca-assign-field__label">Priority / SLA</span>
              <span className="tx-ca-assign-field__val">
                {app.priority} ({app.slaHours}h target)
              </span>
            </div>
            <div className="tx-ca-assign-field">
              <span className="tx-ca-assign-field__label">PAN Card</span>
              <span className="tx-ca-assign-field__val">{app.customer.pan}</span>
            </div>
            <div className="tx-ca-assign-field">
              <span className="tx-ca-assign-field__label">Document Health</span>
              <span className="tx-ca-assign-field__val">
                {app.documents.filter((d) => d.status === 'VERIFIED').length} /{' '}
                {app.documents.length} Verified
              </span>
            </div>
          </div>

          <div className="tx-form-group">
            <label className="tx-form-label">Select Eligible CA Agent</label>
            <div className="tx-ca-agent-cards-grid">
              {eligibleAgents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                const availClass = `tx-ca-agent-card__avail--${agent.availability.toLowerCase()}`;

                return (
                  <button
                    key={agent.id}
                    type="button"
                    className={`tx-ca-agent-card ${isSelected ? 'tx-ca-agent-card--selected' : ''}`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="tx-ca-agent-card__top">
                      <span className="tx-ca-agent-card__name">{agent.name}</span>
                      <span className={`tx-ca-agent-card__avail ${availClass}`}>
                        {agent.availability}
                      </span>
                    </div>

                    <div className="tx-ca-agent-card__skills">
                      {agent.skills.map((skill) => (
                        <span key={skill} className="tx-ca-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="tx-ca-agent-card__capacity">
                      <span>
                        Workload: <strong>{agent.activeCases}</strong> / {agent.capacityMax} cases
                      </span>
                      <span>SLA: {agent.slaPercent}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {isOverCapacity && (
            <div className="tx-ca-capacity-warning" role="alert">
              <Icon name="alert-triangle" size="sm" />
              <span>
                <strong>Warning:</strong> {selectedAgent?.name} is currently at maximum capacity (
                {selectedAgent?.activeCases}/{selectedAgent?.capacityMax} cases). Override allowed
                only with documented justification.
              </span>
            </div>
          )}

          <div className="tx-form-group">
            <label className="tx-form-label">Assignment Instructions / Audit Note</label>
            <textarea
              className="tx-form-textarea"
              rows={2}
              placeholder="e.g. Prioritize AIS tax credit discrepancy reconciliation before draft submission..."
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
            />
          </div>

          <div className="tx-modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Confirm Agent Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
