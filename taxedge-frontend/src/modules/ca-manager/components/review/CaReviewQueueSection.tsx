import { useEffect, useState } from 'react';
import { Button, EmptyState, Icon, LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import type { CaReviewQueueItem, ReviewDecisionInput } from '../../shared/caManager.types';
import { CaReviewActionModal } from '../applications/CaReviewActionModal';
import './CaReviewQueueSection.css';

export function CaReviewQueueSection() {
  const [reviews, setReviews] = useState<readonly CaReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState<CaReviewQueueItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await caManagerApi.listReviews();
      setReviews(res);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (input: ReviewDecisionInput) => {
    try {
      await caManagerApi.decideReview(input);
      setActiveModalItem(null);
      await load();
    } catch (err) {
      console.error('Error submitting decision:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Loading review queue..." />
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => r.status === 'PENDING');

  return (
    <div className="tx-ca-reviews-section">
      <div className="tx-ca-reviews-header">
        <h2 className="tx-ca-reviews-title">My Review Queue</h2>
        <p className="tx-ca-reviews-subtitle">
          Tax computation drafts and filing deliverables submitted by CA agents for manager quality sign-off.
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <div style={{ background: 'var(--tx-surface)', padding: '36px', borderRadius: 'var(--tx-radius-md)', border: '1px solid var(--tx-border)', textAlign: 'center' }}>
          <EmptyState
            iconName="check-check"
            title="All reviews completed"
            message="There are no agent-prepared tax drafts currently waiting for manager review."
          />
        </div>
      ) : (
        <div className="tx-ca-reviews-grid">
          {pendingReviews.map((rev) => (
            <div key={rev.id} className="tx-ca-review-card">
              <div className="tx-ca-review-card__left">
                <div className="tx-ca-review-card__top">
                  <span className="tx-ca-review-card__id">{rev.applicationId}</span>
                  <span className="tx-ca-review-card__customer">{rev.customerName}</span>
                </div>
                <span className="tx-ca-review-card__meta">
                  {rev.serviceName} • Prepared by <strong>{rev.agentName}</strong> • Submitted{' '}
                  {new Date(rev.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="tx-ca-review-card__checklist-summary">
                  <Icon name="check" size="sm" />
                  <span>
                    {rev.checklist.filter((c) => c.completed).length}/{rev.checklist.length} checklist items verified
                  </span>
                </div>
              </div>

              <div>
                <Button
                  variant="primary"
                  iconName="list-checks"
                  onClick={() => setActiveModalItem(rev)}
                >
                  Review & Decide
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModalItem && (
        <CaReviewActionModal
          reviewItem={activeModalItem}
          onClose={() => setActiveModalItem(null)}
          onSubmitDecision={handleDecision}
        />
      )}
    </div>
  );
}
