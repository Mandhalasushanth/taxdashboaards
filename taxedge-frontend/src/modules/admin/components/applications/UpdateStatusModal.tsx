import { useState } from 'react';
import { Button, Icon } from '@/shared';
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationItem,
  type ApplicationStatus,
  type UpdateStatusInput
} from '../../shared/applications.types';
import { validateAuditNote } from '../../validation/applicationValidation';
import './UpdateStatusModal.css';

interface UpdateStatusModalProps {
  readonly app: ApplicationItem;
  readonly onClose: () => void;
  readonly onSubmit: (input: UpdateStatusInput) => Promise<void>;
}

export function UpdateStatusModal({ app, onClose, onSubmit }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(app.status);
  const [note, setNote] = useState('');
  const [refNumber, setRefNumber] = useState(
    app.filingAckNumber || app.sanctionLetterNumber || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteValidation = validateAuditNote(note, 3);
      if (!noteValidation.isValid) {
        setError(noteValidation.message || 'Audit note is required.');
        return;
      }

      setError(null);
      setSubmitting(true);

      const payload: UpdateStatusInput = {
        applicationId: app.id,
        nextStatus: selectedStatus,
        note: note.trim(),
        referenceNumber: refNumber.trim() || undefined
      };

      await onSubmit(payload);
    } catch (err) {
      console.error('Update status failed:', err);
      setError((err as Error).message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCompletedStage = selectedStatus === 'COMPLETED';

  return (
    <div className="tx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <h3 className="tx-modal-title">Advance Application Stage • {app.id}</h3>
          <button
            type="button"
            className="tx-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-body tx-status-modal">
          {error && <div className="tx-form-error-msg">{error}</div>}

          <div className="tx-status-current-box">
            <span>Current Stage:</span>
            <strong>{STATUS_LABELS[app.status]}</strong>
          </div>

          <div className="tx-form-group">
            <label className="tx-form-label">Select Target Stage</label>
            <div className="tx-status-stage-grid">
              {APPLICATION_STATUSES.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    className={`tx-status-option ${isSelected ? 'tx-status-option--selected' : ''}`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    <Icon name={isSelected ? 'check' : 'circle-check'} size="sm" />
                    <span>{STATUS_LABELS[status]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isCompletedStage && (
            <div className="tx-form-group">
              <label className="tx-form-label">
                {app.vertical === 'TAX_CA'
                  ? 'ITR-V Filing Acknowledgment Number'
                  : 'Lender Sanction Letter Reference Number'}
              </label>
              <input
                type="text"
                className="tx-form-input"
                placeholder={
                  app.vertical === 'TAX_CA'
                    ? 'e.g. ITD-ACK-2025-998822'
                    : 'e.g. HDFC-SANCT-2025-0104'
                }
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>
          )}

          <div className="tx-form-group">
            <label className="tx-form-label">Audit Note / Reason for Transition *</label>
            <textarea
              className="tx-form-textarea"
              rows={3}
              placeholder="Record operational reason or summary of action taken (min 3 chars)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="tx-modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Application Stage'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
