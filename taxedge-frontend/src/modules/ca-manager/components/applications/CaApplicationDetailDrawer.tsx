import { useEffect, useState } from 'react';
import { Button, Icon } from '@/shared';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationItem
} from '../../shared/caManager.types';
import './CaApplicationDetailDrawer.css';

interface CaApplicationDetailDrawerProps {
  readonly app: ApplicationItem;
  readonly onClose: () => void;
  readonly onVerifyDoc: (applicationId: string, docId: string) => Promise<void>;
  readonly onRejectDoc: (applicationId: string, docId: string, reason: string) => Promise<void>;
  readonly onAddQuery: (applicationId: string, message: string) => Promise<void>;
  readonly onAssignApp: (app: ApplicationItem) => void;
}

type TabKey = 'OVERVIEW' | 'CUSTOMER' | 'DOCS' | 'TIMELINE' | 'QUERIES';

export function CaApplicationDetailDrawer({
  app,
  onClose,
  onVerifyDoc,
  onRejectDoc,
  onAddQuery,
  onAssignApp
}: CaApplicationDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [queryText, setQueryText] = useState('');
  const [isSubmittingQuery, setSubmittingQuery] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePostQuery = async () => {
    try {
      if (!queryText.trim()) return;
      setSubmittingQuery(true);
      await onAddQuery(app.id, queryText.trim());
      setQueryText('');
    } catch (err) {
      console.error('Failed to post query:', err);
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleConfirmDocReject = async (docId: string) => {
    try {
      if (!rejectReason.trim()) return;
      await onRejectDoc(app.id, docId, rejectReason.trim());
      setRejectingDocId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject document:', err);
    }
  };

  const renderOverviewTab = () => (
    <div className="tx-drawer-tab-content">
      <div className="tx-drawer-section">
        <h4 className="tx-drawer-section__title">Case Summary & Ownership</h4>
        <div className="tx-drawer-grid">
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Service</span>
            <span className="tx-drawer-field__value">{app.serviceName}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Current Stage</span>
            <span className="tx-drawer-field__value">{STATUS_LABELS[app.status]}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Assigned CA Agent</span>
            <span className="tx-drawer-field__value">{app.agentName || 'Unassigned'}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Supervising CA Manager</span>
            <span className="tx-drawer-field__value">{app.managerName || 'Sanjay Verma'}</span>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button variant="primary" iconName="user-check" onClick={() => onAssignApp(app)}>
            {app.agentId ? 'Reassign CA Agent' : 'Assign to Agent'}
          </Button>
        </div>
      </div>

      {app.internalNotes && (
        <div className="tx-drawer-section">
          <h4 className="tx-drawer-section__title">Staff-Only Internal Notes</h4>
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '12px 14px', borderRadius: 'var(--tx-radius-sm)', fontSize: '0.84rem', color: '#92400E' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{app.internalNotes}</p>
            <span style={{ fontSize: '0.72rem', color: '#B45309', display: 'block', marginTop: 4 }}>
              Confidential: Never visible to customer.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerDataTab = () => (
    <div className="tx-drawer-tab-content">
      <div className="tx-drawer-section">
        <h4 className="tx-drawer-section__title">Applicant Identification</h4>
        <div className="tx-drawer-grid">
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Name</span>
            <span className="tx-drawer-field__value">{app.customer.name}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">PAN</span>
            <span className="tx-drawer-field__value">{app.customer.pan}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Email</span>
            <span className="tx-drawer-field__value">{app.customer.email}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Phone</span>
            <span className="tx-drawer-field__value">{app.customer.phone}</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Tax Jurisdiction</span>
            <span className="tx-drawer-field__value">{app.customer.state} ({app.customer.city})</span>
          </div>
          <div className="tx-drawer-field">
            <span className="tx-drawer-field__label">Status</span>
            <span className="tx-drawer-field__value">{app.customer.residentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocsTab = () => (
    <div className="tx-drawer-tab-content">
      <div className="tx-drawer-docs-list">
        {app.documents.length === 0 ? (
          <p style={{ color: 'var(--tx-muted-text)', fontSize: '0.86rem' }}>
            No documents uploaded yet for this filing.
          </p>
        ) : (
          app.documents.map((doc) => (
            <div key={doc.id} className="tx-drawer-doc-card">
              <div className="tx-drawer-doc-info">
                <span className="tx-drawer-doc-name">{doc.name}</span>
                <span className="tx-drawer-doc-meta">
                  {doc.category} • {doc.fileSize} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
                {doc.rejectionReason && (
                  <span className="tx-drawer-doc-rejection">Deficiency: {doc.rejectionReason}</span>
                )}
              </div>
              <div className="tx-drawer-doc-actions">
                {doc.status === 'VERIFIED' ? (
                  <span style={{ color: 'var(--tx-success)', fontSize: '0.78rem', fontWeight: 600 }}>
                    Verified
                  </span>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      iconName="check"
                      onClick={() => onVerifyDoc(app.id, doc.id)}
                    >
                      Accept
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
                <div style={{ marginTop: 8, display: 'flex', gap: 6, width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Specify deficiency reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ flex: 1, padding: 6, fontSize: '0.82rem' }}
                  />
                  <Button variant="primary" onClick={() => handleConfirmDocReject(doc.id)}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={() => setRejectingDocId(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="tx-drawer-tab-content">
      <div className="tx-drawer-timeline">
        {app.timeline.map((step) => (
          <div key={step.id} className="tx-drawer-timeline-step">
            <span className="tx-drawer-timeline-bullet" />
            <div className="tx-drawer-timeline-header">
              <span className="tx-drawer-timeline-title">{step.title}</span>
              <span className="tx-drawer-timeline-time">
                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="tx-drawer-timeline-desc">{step.description}</p>
            <span style={{ fontSize: '0.72rem', color: 'var(--tx-muted-text)' }}>
              By {step.actorName} ({step.actorRole})
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQueriesTab = () => (
    <div className="tx-drawer-tab-content">
      <div className="tx-drawer-queries-list">
        {app.queries.length === 0 ? (
          <p style={{ color: 'var(--tx-muted-text)', fontSize: '0.86rem' }}>
            No queries raised. Case is currently clear.
          </p>
        ) : (
          app.queries.map((q) => (
            <div key={q.id} className="tx-drawer-query-card">
              <div className="tx-drawer-query-header">
                <span className="tx-drawer-query-sender">{q.senderName}</span>
                <span>{new Date(q.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="tx-drawer-query-msg">{q.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="tx-drawer-new-query">
        <h4 className="tx-drawer-section__title">Post New Query / Request</h4>
        <textarea
          placeholder="Specify missing document or information required from client..."
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
        <Button
          variant="primary"
          iconName="send"
          disabled={!queryText.trim() || isSubmittingQuery}
          onClick={handlePostQuery}
        >
          Send Query to Client
        </Button>
      </div>
    </div>
  );

  return (
    <div className="tx-ca-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-ca-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="tx-ca-drawer__header">
          <div className="tx-ca-drawer__header-left">
            <h3 className="tx-ca-drawer__title">{app.id}</h3>
            <span className={`tx-ca-priority-tag tx-ca-priority-tag--${app.priority.toLowerCase()}`}>
              {PRIORITY_LABELS[app.priority]}
            </span>
            <span className={`tx-ca-status-pill tx-ca-status-pill--${app.status.toLowerCase()}`}>
              {STATUS_LABELS[app.status]}
            </span>
          </div>
          <button
            type="button"
            className="tx-ca-drawer__close-btn"
            onClick={onClose}
            aria-label="Close dossier"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <div className="tx-ca-drawer__tabs">
          <button
            type="button"
            className={`tx-ca-drawer__tab ${activeTab === 'OVERVIEW' ? 'tx-ca-drawer__tab--active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <Icon name="layout-dashboard" size="sm" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`tx-ca-drawer__tab ${activeTab === 'CUSTOMER' ? 'tx-ca-drawer__tab--active' : ''}`}
            onClick={() => setActiveTab('CUSTOMER')}
          >
            <Icon name="user" size="sm" />
            <span>Client Data</span>
          </button>
          <button
            type="button"
            className={`tx-ca-drawer__tab ${activeTab === 'DOCS' ? 'tx-ca-drawer__tab--active' : ''}`}
            onClick={() => setActiveTab('DOCS')}
          >
            <Icon name="layers" size="sm" />
            <span>Documents ({app.documents.length})</span>
          </button>
          <button
            type="button"
            className={`tx-ca-drawer__tab ${activeTab === 'TIMELINE' ? 'tx-ca-drawer__tab--active' : ''}`}
            onClick={() => setActiveTab('TIMELINE')}
          >
            <Icon name="clock" size="sm" />
            <span>Timeline</span>
          </button>
          <button
            type="button"
            className={`tx-ca-drawer__tab ${activeTab === 'QUERIES' ? 'tx-ca-drawer__tab--active' : ''}`}
            onClick={() => setActiveTab('QUERIES')}
          >
            <Icon name="message-square" size="sm" />
            <span>Queries ({app.queries.length})</span>
          </button>
        </div>

        <div className="tx-ca-drawer__body">
          {activeTab === 'OVERVIEW' && renderOverviewTab()}
          {activeTab === 'CUSTOMER' && renderCustomerDataTab()}
          {activeTab === 'DOCS' && renderDocsTab()}
          {activeTab === 'TIMELINE' && renderTimelineTab()}
          {activeTab === 'QUERIES' && renderQueriesTab()}
        </div>
      </div>
    </div>
  );
}
