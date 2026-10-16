import { Icon, type IconName } from '@/shared';
import type { ApplicationStatus, ApplicationsKpiSummary } from '../../shared/applications.types';
import './ApplicationsKpisBar.css';

interface KpiCardConfig {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly icon: IconName;
  readonly tone?: 'warning' | 'danger' | 'success' | 'info';
  readonly targetStatus?: 'ALL' | ApplicationStatus;
  readonly hint: string;
}

interface ApplicationsKpisBarProps {
  readonly kpis: ApplicationsKpiSummary;
  readonly activeStatusFilter: 'ALL' | ApplicationStatus;
  readonly onSelectStatus: (status: 'ALL' | ApplicationStatus) => void;
}

export function ApplicationsKpisBar({
  kpis,
  activeStatusFilter,
  onSelectStatus
}: ApplicationsKpisBarProps) {
  const cards: readonly KpiCardConfig[] = [
    {
      id: 'total',
      label: 'Total Cases',
      value: kpis.totalCount,
      icon: 'file-spreadsheet',
      targetStatus: 'ALL',
      hint: 'All customer files'
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: kpis.inProgressCount,
      icon: 'clock',
      targetStatus: 'IN_PROGRESS',
      tone: 'info',
      hint: 'Under computation'
    },
    {
      id: 'queries',
      label: 'Action Required',
      value: kpis.queriesRaisedCount,
      icon: 'alert-circle',
      targetStatus: 'QUERY_RAISED',
      tone: 'warning',
      hint: 'Client docs / query pending'
    },
    {
      id: 'ready',
      label: 'Ready to File',
      value: kpis.readyCount,
      icon: 'check-check',
      targetStatus: 'READY_FOR_FILING',
      tone: 'info',
      hint: 'Approved by client'
    },
    {
      id: 'completed',
      label: 'Completed & Filed',
      value: kpis.completedCount,
      icon: 'circle-check',
      targetStatus: 'COMPLETED',
      tone: 'success',
      hint: 'ITR-V / Sanctioned'
    },
    {
      id: 'sla',
      label: 'Urgent / Priority',
      value: kpis.slaAtRiskCount,
      icon: 'alert-triangle',
      tone: 'danger',
      hint: 'Needs immediate attention'
    }
  ];

  const handleCardClick = (targetStatus?: 'ALL' | ApplicationStatus) => {
    try {
      if (!targetStatus) return;
      onSelectStatus(activeStatusFilter === targetStatus ? 'ALL' : targetStatus);
    } catch (err) {
      console.error('Error selecting KPI status:', err);
    }
  };

  return (
    <div className="tx-app-kpis" role="region" aria-label="Applications Summary KPIs">
      {cards.map((card) => {
        const isActive = card.targetStatus !== undefined && activeStatusFilter === card.targetStatus;
        const toneClass = card.tone ? `tx-app-kpi-card--${card.tone}` : '';
        const activeClass = isActive ? 'tx-app-kpi-card--active' : '';

        return (
          <button
            key={card.id}
            type="button"
            className={`tx-app-kpi-card ${toneClass} ${activeClass}`}
            onClick={() => handleCardClick(card.targetStatus)}
            aria-pressed={isActive}
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className="tx-app-kpi-card__header">
              <span className="tx-app-kpi-card__label">{card.label}</span>
              <div className="tx-app-kpi-card__icon-wrap">
                <Icon name={card.icon} size="sm" />
              </div>
            </div>
            <div className="tx-app-kpi-card__value">{card.value}</div>
            <div className="tx-app-kpi-card__hint">{card.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
