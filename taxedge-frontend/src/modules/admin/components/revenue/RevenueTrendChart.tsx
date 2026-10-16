import { useState } from 'react';
import { formatCompactInr } from '../reports/reportFormat';
import type { MonthlyRevenueTrend } from '../../shared/revenue.types';
import './RevenueTrendChart.css';

export interface RevenueTrendChartProps {
  readonly trends: readonly MonthlyRevenueTrend[];
}

function renderLegend() {
  return (
    <div className="tx-rev-chart-card__legend">
      <span className="tx-rev-legend-item">
        <span className="tx-rev-legend-color tx-rev-legend-color--billed" />
        <span>Billed (Gross)</span>
      </span>
      <span className="tx-rev-legend-item">
        <span className="tx-rev-legend-color tx-rev-legend-color--collected" />
        <span>Collected (Net)</span>
      </span>
    </div>
  );
}

function renderBarCol(
  item: MonthlyRevenueTrend,
  maxVal: number,
  isHovered: boolean,
  onHover: (idx: number | null) => void
) {
  const billedPercent = Math.round((item.totalBilled / maxVal) * 100);
  const collectedPercent = Math.round((item.totalCollected / maxVal) * 100);
  const rate = item.totalBilled > 0 ? ((item.totalCollected / item.totalBilled) * 100).toFixed(0) : '0';

  return (
    <div
      key={item.month}
      className={`tx-rev-chart__col ${isHovered ? 'tx-rev-chart__col--active' : ''}`}
      onMouseEnter={() => onHover(item.monthIndex)}
      onMouseLeave={() => onHover(null)}
      tabIndex={0}
      role="button"
      aria-label={`${item.month}: Billed ${formatCompactInr(item.totalBilled)}, Collected ${formatCompactInr(item.totalCollected)}`}
    >
      <div className="tx-rev-chart__bar-group">
        <div
          className="tx-rev-chart__bar tx-rev-chart__bar--billed"
          style={{ height: `${Math.max(billedPercent, 6)}%` }}
          title={`Billed: ${formatCompactInr(item.totalBilled)}`}
        />
        <div
          className="tx-rev-chart__bar tx-rev-chart__bar--collected"
          style={{ height: `${Math.max(collectedPercent, 6)}%` }}
          title={`Collected: ${formatCompactInr(item.totalCollected)}`}
        />
      </div>
      <div className="tx-rev-chart__col-footer">
        <span className="tx-rev-chart__month">{item.month}</span>
        <span className="tx-rev-chart__rate">{rate}%</span>
      </div>
    </div>
  );
}

function renderTooltip(activeTrend: MonthlyRevenueTrend | null) {
  if (!activeTrend) {
    return <p className="tx-rev-chart__hint">Hover or focus over any month to view detailed tax vs loan breakdown.</p>;
  }

  const realizationRate =
    activeTrend.totalBilled > 0 ? ((activeTrend.totalCollected / activeTrend.totalBilled) * 100).toFixed(1) : '0';

  return (
    <div className="tx-rev-chart__tooltip" aria-live="polite">
      <span className="tx-rev-chart__tooltip-month">{activeTrend.month} Details:</span>
      <span>
        Billed: <strong>{formatCompactInr(activeTrend.totalBilled)}</strong> (Tax: {formatCompactInr(activeTrend.taxBilled)} | Loan: {formatCompactInr(activeTrend.loanBilled)})
      </span>
      <span className="tx-rev-chart__tooltip-separator">•</span>
      <span>
        Collected: <strong>{formatCompactInr(activeTrend.totalCollected)}</strong> ({realizationRate}% Realized)
      </span>
    </div>
  );
}

export function RevenueTrendChart({ trends }: RevenueTrendChartProps) {
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);

  const maxVal = trends.reduce((max, t) => Math.max(max, t.totalBilled, t.totalCollected), 1);

  const activeTrend =
    activeMonthIndex !== null ? trends.find((t) => t.monthIndex === activeMonthIndex) ?? null : null;

  const handleHoverSafe = (idx: number | null) => {
    try {
      setActiveMonthIndex(idx);
    } catch (err) {
      console.error('Hover error in trend chart:', err);
    }
  };

  return (
    <div className="tx-rev-chart-card">
      <div className="tx-rev-chart-card__header">
        <div>
          <h3 className="tx-rev-chart-card__title">Monthly Revenue & Cash Realization Trend</h3>
          <p className="tx-rev-chart-card__subtitle">
            Comparison of total billed invoices versus collected realization by month
          </p>
        </div>
        {renderLegend()}
      </div>

      <div className="tx-rev-chart">
        <div className="tx-rev-chart__bars" role="group" aria-label="Monthly revenue breakdown bars">
          {trends.map((item) =>
            renderBarCol(item, maxVal, activeMonthIndex === item.monthIndex, handleHoverSafe)
          )}
        </div>
      </div>

      {renderTooltip(activeTrend)}
    </div>
  );
}
