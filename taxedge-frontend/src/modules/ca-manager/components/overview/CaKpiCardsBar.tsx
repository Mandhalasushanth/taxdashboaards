import { Icon, type IconName } from '@/shared';
import type { CaManagerKpis } from '../../shared/caManager.types';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import './CaKpiCardsBar.css';

interface CaKpiItem {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly icon: IconName;
  readonly targetSection: CaSectionId;
  readonly tone?: 'warning' | 'danger' | 'success' | 'primary';
  readonly hint: string;
}

interface CaKpiCardsBarProps {
  readonly kpis: CaManagerKpis;
  readonly onSelectSection: (section: CaSectionId) => void;
}

export function CaKpiCardsBar({ kpis, onSelectSection }: CaKpiCardsBarProps) {
  const cards: readonly CaKpiItem[] = [
    {
      id: 'new',
      label: 'New Intake',
      value: kpis.newCount,
      icon: 'inbox',
      targetSection: 'incoming',
      hint: 'Untriaged customer files'
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      value: kpis.unassignedCount,
      icon: 'alert-circle',
      targetSection: 'unassigned',
      tone: 'warning',
      hint: 'Requires agent assignment'
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: kpis.inProgressCount,
      icon: 'clock',
      targetSection: 'applications',
      hint: 'Under computation'
    },
    {
      id: 'awaiting-customer',
      label: 'Awaiting Client',
      value: kpis.awaitingCustomerCount,
      icon: 'message-square',
      targetSection: 'communication',
      tone: 'warning',
      hint: 'Queries / docs pending'
    },
    {
      id: 'awaiting-review',
      label: 'My Review Queue',
      value: kpis.awaitingReviewCount,
      icon: 'list-checks',
      targetSection: 'reviews',
      tone: 'primary',
      hint: 'Sign-off required'
    },
    {
      id: 'overdue',
      label: 'SLA Escalations',
      value: kpis.overdueCount,
      icon: 'alert-triangle',
      targetSection: 'escalations',
      tone: 'danger',
      hint: 'Overdue or urgent cases'
    },
    {
      id: 'completed',
      label: 'Completed & Filed',
      value: kpis.completedInPeriodCount,
      icon: 'circle-check',
      targetSection: 'applications',
      tone: 'success',
      hint: 'ITR-V / GST acknowledgments'
    }
  ];

  return (
    <div className="tx-ca-kpis" role="region" aria-label="CA Operations KPI Overview">
      {cards.map((card) => {
        const toneClass = card.tone ? `tx-ca-kpi-card--${card.tone}` : '';
        return (
          <button
            key={card.id}
            type="button"
            className={`tx-ca-kpi-card ${toneClass}`}
            onClick={() => onSelectSection(card.targetSection)}
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className="tx-ca-kpi-card__header">
              <span className="tx-ca-kpi-card__label">{card.label}</span>
              <div className="tx-ca-kpi-card__icon-wrap">
                <Icon name={card.icon} size="sm" />
              </div>
            </div>
            <div className="tx-ca-kpi-card__value">{card.value}</div>
            <div className="tx-ca-kpi-card__hint">{card.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
