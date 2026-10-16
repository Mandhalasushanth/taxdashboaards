import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import type { CaAgentWorkload } from '../../shared/caManager.types';
import './CaAgentsWorkloadSection.css';

export function CaAgentsWorkloadSection() {
  const [agents, setAgents] = useState<readonly CaAgentWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await caManagerApi.listAgentsWorkload();
        if (mounted) setAgents(res);
      } catch (err) {
        console.error('Failed to load CA agents:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Loading CA agent directory..." />
      </div>
    );
  }

  return (
    <div className="tx-ca-agents-section">
      <div>
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
          CA Agent Directory & Capacity
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
          Workload allocation, skill specializations, SLA metrics, and operational capacity across CA executives.
        </p>
      </div>

      <div className="tx-ca-agents-grid">
        {agents.map((agent) => {
          const loadPct = Math.min(100, Math.round((agent.activeCases / agent.capacityMax) * 100));
          const fillClass =
            loadPct >= 90
              ? 'tx-ca-agent-bar-fill--danger'
              : loadPct >= 75
                ? 'tx-ca-agent-bar-fill--warning'
                : '';

          return (
            <div key={agent.id} className="tx-ca-agent-fullcard">
              <div className="tx-ca-agent-fullcard__header">
                <div className="tx-ca-agent-avatar-lg">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="tx-ca-agent-fullcard__title">
                  <span className="tx-ca-agent-fullcard__name">{agent.name}</span>
                  <span className="tx-ca-agent-fullcard__email">{agent.email}</span>
                </div>
              </div>

              <div className="tx-ca-agent-bar-wrap">
                <div className="tx-ca-agent-meta-row">
                  <span>Capacity Utilization</span>
                  <strong>
                    {agent.activeCases} / {agent.capacityMax} Cases ({loadPct}%)
                  </strong>
                </div>
                <div className="tx-ca-agent-bar-track">
                  <div
                    className={`tx-ca-agent-bar-fill ${fillClass}`}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              <div className="tx-ca-agent-meta-row">
                <span>SLA Adherence Rate</span>
                <strong style={{ color: agent.slaPercent >= 90 ? 'var(--tx-success)' : 'var(--tx-warning)' }}>
                  {agent.slaPercent}%
                </strong>
              </div>

              <div className="tx-ca-agent-meta-row">
                <span>Overdue Cases</span>
                <strong style={{ color: agent.overdueCases > 0 ? 'var(--tx-error)' : 'var(--tx-secondary-text)' }}>
                  {agent.overdueCases}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--tx-muted-text)', display: 'block', marginBottom: 6 }}>
                  SPECIALIZATION & SKILLS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {agent.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: 'var(--tx-light-navy)',
                        color: 'var(--tx-primary-navy)',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: '3px'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
