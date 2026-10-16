import type { CaServiceMetric, CaServiceType } from '../../shared/caManager.types';
import './CaServiceDistribution.css';

interface CaServiceDistributionProps {
  readonly metrics: readonly CaServiceMetric[];
  readonly onSelectServiceCategory: (category: CaServiceType) => void;
}

export function CaServiceDistribution({
  metrics,
  onSelectServiceCategory
}: CaServiceDistributionProps) {
  return (
    <div className="tx-ca-service-dist" role="region" aria-label="Service Category Distribution">
      <div className="tx-ca-service-dist__header">
        <h3 className="tx-ca-service-dist__title">Service Practice Workloads</h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--tx-muted-text)' }}>
          GST • ITR Compliance • Incorporation
        </span>
      </div>

      <div className="tx-ca-service-grid">
        {metrics.map((m) => (
          <button
            key={m.category}
            type="button"
            className="tx-ca-service-card"
            onClick={() => onSelectServiceCategory(m.category)}
            aria-label={`${m.label}: ${m.activeCount} active cases`}
          >
            <span className="tx-ca-service-card__badge">{m.category} Practice</span>
            <span className="tx-ca-service-card__name">{m.label}</span>
            <div className="tx-ca-service-card__stats">
              <div>
                <span>Active: </span>
                <span className="tx-ca-service-card__active-val">{m.activeCount}</span>
              </div>
              <div>
                <span>Avg TAT: </span>
                <strong>{m.turnaroundAvgHours}h</strong>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
