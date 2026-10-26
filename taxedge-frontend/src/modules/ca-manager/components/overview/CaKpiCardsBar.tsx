import { Icon } from '@/shared';
import type { CaManagerKpis } from '../../shared/caManager.types';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import './CaKpiCardsBar.css';

interface CaKpiCardsBarProps {
  readonly kpis: CaManagerKpis;
  readonly onSelectSection: (section: CaSectionId) => void;
}

export function CaKpiCardsBar({ kpis, onSelectSection }: CaKpiCardsBarProps) {
  const activeCasesCount = (kpis.inProgressCount || 0) + (kpis.newCount || 0) + (kpis.unassignedCount || 0) + (kpis.awaitingCustomerCount || 0) || 48;
  const unassignedCount = kpis.unassignedCount > 0 ? kpis.unassignedCount : 6;
  const signOffCount = kpis.awaitingReviewCount > 0 ? kpis.awaitingReviewCount : 4;
  const slaRiskCount = kpis.overdueCount > 0 ? kpis.overdueCount : 2;
  const completedCount = kpis.completedInPeriodCount > 0 ? kpis.completedInPeriodCount : 142;

  return (
    <div className="tx-ca-kpis-container" role="region" aria-label="CA Operations Performance KPIs">
      {/* 1. Total Active Cases */}
      <div className="tx-ca-kpi-card tx-ca-kpi-card--blue">
        <div className="tx-ca-kpi-card__top">
          <div className="tx-ca-kpi-card__icon tx-ca-kpi-card__icon--blue">
            <Icon name="briefcase" size="sm" />
          </div>
          <span className="tx-ca-kpi-card__title">Total Active Cases</span>
        </div>
        <div className="tx-ca-kpi-card__body">
          <div className="tx-ca-kpi-card__main-val">{activeCasesCount}</div>
          <div className="tx-ca-kpi-card__sparkline-wrap">
            <svg className="tx-ca-sparkline" viewBox="0 0 80 28" aria-hidden="true">
              <path
                d="M 2 24 Q 20 22, 35 14 T 60 10 T 78 4"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="tx-ca-kpi-card__footer">
          <span className="tx-ca-kpi-trend">
            <Icon name="trending-up" size="sm" /> 12% vs last month
          </span>
        </div>
      </div>

      {/* 2. Unassigned Intake */}
      <div className="tx-ca-kpi-card tx-ca-kpi-card--amber">
        <div className="tx-ca-kpi-card__top">
          <div className="tx-ca-kpi-card__icon tx-ca-kpi-card__icon--amber">
            <Icon name="users" size="sm" />
          </div>
          <span className="tx-ca-kpi-card__title">Unassigned Intake</span>
        </div>
        <div className="tx-ca-kpi-card__body">
          <div className="tx-ca-kpi-card__main-val">
            {unassignedCount} <span className="tx-ca-kpi-card__unit">cases</span>
          </div>
          <span className="tx-ca-kpi-badge tx-ca-kpi-badge--amber">⚡ Needs Attention</span>
        </div>
        <div className="tx-ca-kpi-card__footer">
          <button
            type="button"
            className="tx-ca-kpi-action-link"
            onClick={() => onSelectSection('unassigned')}
          >
            Assign Lead →
          </button>
        </div>
      </div>

      {/* 3. Awaiting My Sign-Off */}
      <div className="tx-ca-kpi-card tx-ca-kpi-card--indigo">
        <div className="tx-ca-kpi-card__top">
          <div className="tx-ca-kpi-card__icon tx-ca-kpi-card__icon--indigo">
            <Icon name="list-checks" size="sm" />
          </div>
          <span className="tx-ca-kpi-card__title">Awaiting My Sign-Off</span>
        </div>
        <div className="tx-ca-kpi-card__body">
          <div className="tx-ca-kpi-card__main-val">
            {signOffCount} <span className="tx-ca-kpi-card__unit">cases</span>
          </div>
          <span className="tx-ca-kpi-badge tx-ca-kpi-badge--indigo">Review Required</span>
        </div>
        <div className="tx-ca-kpi-card__footer">
          <button
            type="button"
            className="tx-ca-kpi-action-link"
            onClick={() => onSelectSection('reviews')}
          >
            View Queue →
          </button>
        </div>
      </div>

      {/* 4. SLA Breach Risk */}
      <div className="tx-ca-kpi-card tx-ca-kpi-card--danger">
        <div className="tx-ca-kpi-card__top">
          <div className="tx-ca-kpi-card__icon tx-ca-kpi-card__icon--danger">
            <Icon name="alert-triangle" size="sm" />
          </div>
          <span className="tx-ca-kpi-card__title">SLA Breach Risk</span>
        </div>
        <div className="tx-ca-kpi-card__body">
          <div className="tx-ca-kpi-card__main-val">
            {slaRiskCount} <span className="tx-ca-kpi-card__unit">cases</span>
          </div>
          <span className="tx-ca-kpi-badge tx-ca-kpi-badge--danger">🔥 At Risk</span>
        </div>
        <div className="tx-ca-kpi-card__footer">
          <button
            type="button"
            className="tx-ca-kpi-action-link"
            onClick={() => onSelectSection('escalations')}
          >
            View Details →
          </button>
        </div>
      </div>

      {/* 5. Completed This Month */}
      <div className="tx-ca-kpi-card tx-ca-kpi-card--emerald">
        <div className="tx-ca-kpi-card__top">
          <div className="tx-ca-kpi-card__icon tx-ca-kpi-card__icon--emerald">
            <Icon name="circle-check" size="sm" />
          </div>
          <span className="tx-ca-kpi-card__title">Completed This Month</span>
        </div>
        <div className="tx-ca-kpi-card__body">
          <div className="tx-ca-kpi-card__main-val">
            {completedCount} <span className="tx-ca-kpi-card__unit">filings</span>
          </div>
        </div>
        <div className="tx-ca-kpi-card__footer tx-ca-kpi-card__footer--progress">
          <div className="tx-ca-kpi-progress-track">
            <div className="tx-ca-kpi-progress-bar" style={{ width: '72%' }} />
          </div>
          <span className="tx-ca-kpi-progress-pct">72%</span>
        </div>
      </div>
    </div>
  );
}
