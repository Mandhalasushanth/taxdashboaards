import { useEffect, useState } from 'react';
import { Button, EmptyState, LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import type { ApplicationItem, ApplicationQuery } from '../../shared/caManager.types';
import './CaCommunicationSection.css';

interface EnrichedQuery extends ApplicationQuery {
  readonly applicationId: string;
  readonly customerName: string;
}

export function CaCommunicationSection() {
  const [queries, setQueries] = useState<readonly EnrichedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingAppId, setReplyingAppId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const apps = await caManagerApi.listApplications();
      const extracted: EnrichedQuery[] = apps.flatMap((app: ApplicationItem) =>
        app.queries.map((q) => ({
          ...q,
          applicationId: app.id,
          customerName: app.customer.name
        }))
      );
      setQueries(extracted);
    } catch (err) {
      console.error('Failed to load queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePostReply = async (appId: string) => {
    try {
      if (!replyText.trim()) return;
      await demoApplicationsStore.addQuery(
        appId,
        'Sanjay Verma (CA Manager)',
        'CA_MANAGER',
        replyText.trim()
      );
      setReplyingAppId(null);
      setReplyText('');
      await load();
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Loading customer messages..." />
      </div>
    );
  }

  return (
    <div className="tx-ca-comm-section">
      <div>
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
          Customer Communication & Queries
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
          Active customer queries, document clarifications, and client message threads across CA dockets.
        </p>
      </div>

      {queries.length === 0 ? (
        <div style={{ background: 'var(--tx-surface)', padding: '36px', borderRadius: 'var(--tx-radius-md)', border: '1px solid var(--tx-border)', textAlign: 'center' }}>
          <EmptyState
            iconName="message-square"
            title="No active customer queries"
            message="All customer cases currently have complete communication and no open questions."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queries.map((q) => (
            <div key={`${q.applicationId}-${q.id}`} className="tx-ca-comm-card">
              <div className="tx-ca-comm-header">
                <div>
                  <span className="tx-ca-comm-sender">{q.senderName}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tx-muted-text)', marginLeft: 8 }}>
                    ({q.senderRole})
                  </span>
                </div>
                <span className="tx-ca-comm-time">
                  {new Date(q.timestamp).toLocaleDateString()} at{' '}
                  {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="tx-ca-comm-msg">{q.message}</p>

              <div className="tx-ca-comm-footer">
                <span>
                  Case Docket: <strong>{q.applicationId}</strong> • Client: <strong>{q.customerName}</strong>
                </span>
                <Button
                  variant="secondary"
                  iconName="send"
                  onClick={() => setReplyingAppId(q.applicationId)}
                >
                  Send Follow-up
                </Button>
              </div>

              {replyingAppId === q.applicationId && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    rows={2}
                    className="tx-form-textarea"
                    placeholder="Type follow-up clarification message to customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="secondary" onClick={() => setReplyingAppId(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => handlePostReply(q.applicationId)}>
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
