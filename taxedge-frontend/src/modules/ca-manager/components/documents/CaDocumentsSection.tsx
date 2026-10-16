import { useEffect, useState } from 'react';
import { Button, EmptyState, Icon, LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import type { ApplicationItem, DocumentItem } from '../../shared/caManager.types';
import './CaDocumentsSection.css';

interface EnrichedDoc extends DocumentItem {
  readonly applicationId: string;
  readonly customerName: string;
}

export function CaDocumentsSection() {
  const [docs, setDocs] = useState<readonly EnrichedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const apps = await caManagerApi.listApplications();
      const extracted: EnrichedDoc[] = apps.flatMap((app: ApplicationItem) =>
        app.documents.map((d) => ({
          ...d,
          applicationId: app.id,
          customerName: app.customer.name
        }))
      );
      setDocs(extracted);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (appId: string, docId: string) => {
    try {
      await demoApplicationsStore.verifyDocument(appId, docId);
      await load();
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleReject = async (appId: string, docId: string) => {
    try {
      if (!rejectReason.trim()) return;
      await demoApplicationsStore.rejectDocument(appId, docId, rejectReason.trim());
      setRejectingDocId(null);
      setRejectReason('');
      await load();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Loading document vault..." />
      </div>
    );
  }

  const filteredDocs = docs.filter((d) =>
    statusFilter === 'ALL' ? true : d.status === statusFilter
  );

  return (
    <div className="tx-ca-docs-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
            Document Verification Vault
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
            Client tax proofs, TRACES certificates, broking P&L files, and incorporation KYC.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={`tx-app-action-btn ${statusFilter === filter ? 'tx-revenue__v-tab--active' : ''}`}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div style={{ background: 'var(--tx-surface)', padding: '36px', borderRadius: 'var(--tx-radius-md)', border: '1px solid var(--tx-border)', textAlign: 'center' }}>
          <EmptyState
            iconName="layers"
            title="No documents in this queue"
            message="No uploaded customer documents match the selected filter."
          />
        </div>
      ) : (
        <div className="tx-ca-docs-grid">
          {filteredDocs.map((doc) => (
            <div key={`${doc.applicationId}-${doc.id}`} className="tx-ca-doc-row">
              <div className="tx-ca-doc-left">
                <div className="tx-ca-doc-icon-box">
                  <Icon name="file-text" size="sm" />
                </div>
                <div className="tx-ca-doc-details">
                  <span className="tx-ca-doc-title">{doc.name}</span>
                  <span className="tx-ca-doc-subtitle">
                    Case: <strong>{doc.applicationId}</strong> ({doc.customerName}) • {doc.category} • {doc.fileSize}
                  </span>
                  {doc.rejectionReason && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--tx-error)', marginTop: 2 }}>
                      Deficiency: {doc.rejectionReason}
                    </span>
                  )}
                </div>
              </div>

              <div className="tx-ca-doc-actions">
                {doc.status === 'VERIFIED' ? (
                  <span style={{ color: 'var(--tx-success)', fontSize: '0.82rem', fontWeight: 600 }}>
                    Verified
                  </span>
                ) : doc.status === 'REJECTED' ? (
                  <span style={{ color: 'var(--tx-error)', fontSize: '0.82rem', fontWeight: 600 }}>
                    Rejected
                  </span>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      iconName="check"
                      onClick={() => handleVerify(doc.applicationId, doc.id)}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="secondary"
                      iconName="x"
                      onClick={() => setRejectingDocId(doc.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>

              {rejectingDocId === doc.id && (
                <div style={{ width: '100%', marginTop: 8, display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Provide specific reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ flex: 1, padding: 6, fontSize: '0.82rem' }}
                  />
                  <Button variant="primary" onClick={() => handleReject(doc.applicationId, doc.id)}>
                    Confirm Rejection
                  </Button>
                  <Button variant="secondary" onClick={() => setRejectingDocId(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
