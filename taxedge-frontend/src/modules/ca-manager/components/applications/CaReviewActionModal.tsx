import { useState } from 'react';
import { Button, Icon } from '@/shared';
import type { CaReviewQueueItem, ReviewDecisionInput } from '../../shared/caManager.types';
import { validateReviewForm } from '../../validation/caManagerValidation';
import './CaReviewActionModal.css';

interface CaReviewActionModalProps {
  readonly reviewItem: CaReviewQueueItem;
  readonly onClose: () => void;
  readonly onSubmitDecision: (input: ReviewDecisionInput) => Promise<void>;
}

export function CaReviewActionModal({
  reviewItem,
  onClose,
  onSubmitDecision
}: CaReviewActionModalProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'RETURNED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: ReviewDecisionInput = {
        reviewId: reviewItem.id,
        applicationId: reviewItem.applicationId,
        decision,
        comments: comments.trim()
      };

      const errors = validateReviewForm(payload);
      if (decision === 'RETURNED' && errors.comments) {
        setError(errors.comments);
        return;
      }

      setError(null);
      setSubmitting(true);
      await onSubmitDecision(payload);
    } catch (err) {
      console.error('Review submit failed:', err);
      setError((err as Error).message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <h3 className="tx-modal-title">Manager Quality Review • {reviewItem.applicationId}</h3>
          <button
            type="button"
            className="tx-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-body tx-ca-review-modal">
          {error && <div className="tx-form-error-msg">{error}</div>}

          <div>
            <span style={{ fontSize: '0.84rem', color: 'var(--tx-secondary-text)' }}>
              Prepared by: <strong>{reviewItem.agentName}</strong> for{' '}
              <strong>{reviewItem.customerName}</strong> ({reviewItem.serviceName})
            </span>
          </div>

          <div className="tx-ca-review-checklist">
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--tx-secondary-text)' }}>
              AGENT VERIFICATION CHECKLIST
            </span>
            {reviewItem.checklist.map((item, idx) => (
              <div key={idx} className="tx-ca-checklist-item">
                <Icon name="check-check" size="sm" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="tx-form-group">
            <label className="tx-form-label">Review Determination</label>
            <div className="tx-ca-review-decisions">
              <button
                type="button"
                className={`tx-ca-decision-btn ${decision === 'APPROVED' ? 'tx-ca-decision-btn--approve-active' : ''}`}
                onClick={() => setDecision('APPROVED')}
              >
                <Icon name="check" size="md" />
                <strong>Approve Filing Draft</strong>
                <span style={{ fontSize: '0.72rem' }}>Ready for portal submission</span>
              </button>

              <button
                type="button"
                className={`tx-ca-decision-btn ${decision === 'RETURNED' ? 'tx-ca-decision-btn--return-active' : ''}`}
                onClick={() => setDecision('RETURNED')}
              >
                <Icon name="rotate-ccw" size="md" />
                <strong>Return for Corrections</strong>
                <span style={{ fontSize: '0.72rem' }}>Re-opens case for agent</span>
              </button>
            </div>
          </div>

          <div className="tx-form-group">
            <label className="tx-form-label">
              Manager Review Notes / Findings {decision === 'RETURNED' ? '*' : '(Optional)'}
            </label>
            <textarea
              className="tx-form-textarea"
              rows={3}
              placeholder={
                decision === 'RETURNED'
                  ? 'Specify required corrections (e.g. Schedule HP requires deduction recalibration)...'
                  : 'Optional approval notes or sign-off remarks...'
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className="tx-modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording Decision...' : 'Submit Decision'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
