import { useEffect, useState } from 'react';
import { Button, EmptyState, LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import type { ApplicationItem } from '../../shared/caManager.types';
import { CaAssignAgentModal } from '../applications/CaAssignAgentModal';
import { CaApplicationDetailDrawer } from '../applications/CaApplicationDetailDrawer';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import './CaEscalationsSection.css';

export function CaEscalationsSection() {
  const [cases, setCases] = useState<readonly ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<ApplicationItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await caManagerApi.listApplications();
      setCases(
        res.filter(
          (a) =>
            a.priority === 'URGENT' ||
            a.status === 'QUERY_RAISED' ||
            (!a.agentId && a.status !== 'COMPLETED')
        )
      );
    } catch (err) {
      console.error('Failed to load escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (input: { applicationId: string; managerId: string | null; agentId: string | null; auditNote: string }) => {
    try {
      await demoApplicationsStore.assignStaff(input);
      setAssignTarget(null);
      await load();
    } catch (err) {
      console.error('Failed to assign:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Scanning SLA deadlines..." />
      </div>
    );
  }

  return (
    <div className="tx-ca-escalations-section">
      <div>
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
          Deadlines & SLA Escalations
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
          Active cases nearing SLA breach, blocked customer queries, and urgent priority filings.
        </p>
      </div>

      {cases.length === 0 ? (
        <div style={{ background: 'var(--tx-surface)', padding: '36px', borderRadius: 'var(--tx-radius-md)', border: '1px solid var(--tx-border)', textAlign: 'center' }}>
          <EmptyState
            iconName="circle-check"
            title="All SLAs on track"
            message="No filings currently overdue or at risk of breaching compliance turnaround thresholds."
          />
        </div>
      ) : (
        <div className="tx-ca-escalations-grid">
          {cases.map((c) => {
            const isUnassigned = !c.agentId;
            const isBlocked = c.status === 'QUERY_RAISED';
            const reasonTag = isUnassigned
              ? 'Unassigned Risk'
              : isBlocked
                ? 'Client Blocked'
                : 'Urgent Filing';
            const isCritical = c.priority === 'URGENT' || isUnassigned;

            return (
              <div
                key={c.id}
                className={`tx-ca-escalation-card ${isCritical ? '' : 'tx-ca-escalation-card--warning'}`}
              >
                <div className="tx-ca-escalation-left">
                  <div className="tx-ca-escalation-title-row">
                    <span className="tx-ca-escalation-id">{c.id}</span>
                    <span className="tx-ca-escalation-customer">{c.customer.name}</span>
                    <span
                      className={`tx-ca-escalation-reason ${isCritical ? 'tx-ca-escalation-reason--overdue' : 'tx-ca-escalation-reason--warning'}`}
                    >
                      {reasonTag}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--tx-secondary-text)' }}>
                    {c.serviceName} • PAN: {c.customer.pan} • Assigned: {c.agentName || 'None'} • SLA Target: {c.slaHours}h
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="secondary"
                    iconName="eye"
                    onClick={() => setSelectedApp(c)}
                  >
                    Examine Case
                  </Button>
                  <Button
                    variant="primary"
                    iconName="user-check"
                    onClick={() => setAssignTarget(c)}
                  >
                    Rebalance / Assign
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignTarget && (
        <CaAssignAgentModal
          app={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssign={handleAssign}
        />
      )}

      {selectedApp && (
        <CaApplicationDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onVerifyDoc={async () => {}}
          onRejectDoc={async () => {}}
          onAddQuery={async () => {}}
          onAssignApp={(app) => setAssignTarget(app)}
        />
      )}
    </div>
  );
}
