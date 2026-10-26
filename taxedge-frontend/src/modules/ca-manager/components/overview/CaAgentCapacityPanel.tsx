import { Icon } from '@/shared';
import './CaAgentCapacityPanel.css';

export interface AgentCapacityItem {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly activeCases: number;
  readonly maxCapacity: number;
  readonly skills: readonly string[];
}

const DEFAULT_AGENTS: readonly AgentCapacityItem[] = Object.freeze([
  {
    id: 'agent-1',
    name: 'Suresh Kumar',
    title: 'Senior Executive',
    activeCases: 8,
    maxCapacity: 10,
    skills: ['GST Expert', 'ITR']
  },
  {
    id: 'agent-2',
    name: 'Priya Sharma',
    title: 'Executive',
    activeCases: 5,
    maxCapacity: 12,
    skills: ['ITR', 'GST']
  },
  {
    id: 'agent-3',
    name: 'Rahul Verma',
    title: 'Executive',
    activeCases: 7,
    maxCapacity: 10,
    skills: ['ITR', 'TDS']
  },
  {
    id: 'agent-4',
    name: 'Neha Gupta',
    title: 'Executive',
    activeCases: 3,
    maxCapacity: 10,
    skills: ['GST', 'ITR']
  }
]);

interface CaAgentCapacityPanelProps {
  readonly onViewAll?: () => void;
  readonly onSelectAgent?: (agentId: string) => void;
}

export function CaAgentCapacityPanel({ onViewAll, onSelectAgent }: CaAgentCapacityPanelProps) {
  const agents = DEFAULT_AGENTS;

  return (
    <div className="tx-ca-capacity-panel" role="region" aria-label="CA Executive Capacity and Workload">
      <div className="tx-ca-capacity-header">
        <div className="tx-ca-capacity-title-wrap">
          <Icon name="user-check" size="sm" />
          <h3 className="tx-ca-capacity-title">CA Executive Capacity & Workload</h3>
        </div>
        <button type="button" className="tx-ca-capacity-viewall" onClick={onViewAll}>
          View All →
        </button>
      </div>

      <div className="tx-ca-capacity-table-wrap">
        <table className="tx-ca-capacity-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Assigned Cases</th>
              <th>Capacity</th>
              <th>Specialization</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const pct = Math.round((agent.activeCases / agent.maxCapacity) * 100);
              const barColor = pct >= 80 ? '#2563EB' : pct >= 60 ? '#3B82F6' : '#60A5FA';

              return (
                <tr
                  key={agent.id}
                  className="tx-ca-capacity-row"
                  onClick={() => onSelectAgent?.(agent.id)}
                >
                  {/* Agent Info */}
                  <td>
                    <div className="tx-ca-agent-cell">
                      <div className="tx-ca-agent-avatar">{agent.name.charAt(0)}</div>
                      <div>
                        <div className="tx-ca-agent-name">{agent.name}</div>
                        <div className="tx-ca-agent-title">{agent.title}</div>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Cases */}
                  <td>
                    <span className="tx-ca-case-ratio">
                      <strong>{agent.activeCases}</strong> / {agent.maxCapacity}
                    </span>
                  </td>

                  {/* Capacity Bar */}
                  <td>
                    <div className="tx-ca-capacity-bar-cell">
                      <div className="tx-ca-capacity-track">
                        <div
                          className="tx-ca-capacity-fill"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <span className="tx-ca-capacity-pct">{pct}%</span>
                    </div>
                  </td>

                  {/* Skills / Specializations */}
                  <td>
                    <div className="tx-ca-skills-row">
                      {agent.skills.map((skill) => (
                        <span key={skill} className="tx-ca-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Chevron Link */}
                  <td>
                    <span className="tx-ca-row-arrow">
                      <Icon name="chevron-right" size="sm" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
