import { Icon } from '@/shared';
import { formatCompactInr } from '../reports/reportFormat';
import type { RevenueKpis } from '../../shared/revenue.types';
import './RevenueKpis.css';

export interface RevenueKpisBarProps {
  readonly kpis: RevenueKpis;
}

interface KpiCardItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly iconName: 'credit-card' | 'circle-check' | 'clock' | 'landmark' | 'receipt' | 'trending-up';
  readonly iconVariant: 'navy' | 'green' | 'orange' | 'blue' | 'purple';
  readonly pillText: string;
  readonly pillVariant: 'success' | 'warning' | 'neutral';
  readonly cardVariant?: 'primary' | 'success' | 'warning';
}

function buildKpiItems(kpis: RevenueKpis): readonly KpiCardItem[] {
  return [
    {
      id: 'gross-billed',
      label: 'Gross Billed Revenue',
      value: formatCompactInr(kpis.grossBilled),
      hint: 'Total invoice billing across all services',
      iconName: 'credit-card',
      iconVariant: 'navy',
      pillText: '+18.4% YoY',
      pillVariant: 'success',
      cardVariant: 'primary'
    },
    {
      id: 'net-collected',
      label: 'Net Collections',
      value: formatCompactInr(kpis.netCollected),
      hint: 'Settled payments in primary firm account',
      iconName: 'circle-check',
      iconVariant: 'green',
      pillText: `${kpis.collectionRate}% realized`,
      pillVariant: 'neutral',
      cardVariant: 'success'
    },
    {
      id: 'outstanding',
      label: 'Outstanding Receivables',
      value: formatCompactInr(kpis.outstanding),
      hint: 'Invoiced clients awaiting payment',
      iconName: 'clock',
      iconVariant: 'orange',
      pillText: 'Within SLA',
      pillVariant: 'warning',
      cardVariant: 'warning'
    },
    {
      id: 'loan-commission',
      label: 'Loan Partner Payouts',
      value: formatCompactInr(kpis.loanCommission),
      hint: 'Bank syndication commissions earned',
      iconName: 'landmark',
      iconVariant: 'blue',
      pillText: '6 Lending Partners',
      pillVariant: 'neutral'
    },
    {
      id: 'gst-invoiced',
      label: 'GST Output Invoiced',
      value: formatCompactInr(kpis.gstCollected),
      hint: 'Statutory GST liability invoiced',
      iconName: 'receipt',
      iconVariant: 'navy',
      pillText: '18% GST Output',
      pillVariant: 'neutral'
    },
    {
      id: 'arpu',
      label: 'Avg Revenue / Case (ARPU)',
      value: formatCompactInr(kpis.averageOrderValue),
      hint: 'Blended average across tax and loan files',
      iconName: 'trending-up',
      iconVariant: 'purple',
      pillText: `${kpis.totalCases} closed cases`,
      pillVariant: 'neutral'
    }
  ];
}

function renderKpiCard(item: KpiCardItem) {
  return (
    <div key={item.id} className={`tx-rev-kpi ${item.cardVariant ? `tx-rev-kpi--${item.cardVariant}` : ''}`}>
      <div className="tx-rev-kpi__header">
        <span className={`tx-rev-kpi__icon tx-rev-kpi__icon--${item.iconVariant}`}>
          <Icon name={item.iconName} size="sm" />
        </span>
        <span className={`tx-rev-kpi__pill tx-rev-kpi__pill--${item.pillVariant}`}>{item.pillText}</span>
      </div>
      <p className="tx-rev-kpi__label">{item.label}</p>
      <p className="tx-rev-kpi__value">{item.value}</p>
      <p className="tx-rev-kpi__hint">{item.hint}</p>
    </div>
  );
}

export function RevenueKpisBar({ kpis }: RevenueKpisBarProps) {
  const items = buildKpiItems(kpis);

  return (
    <section className="tx-rev-kpis" aria-label="Revenue summary figures">
      {items.map((item) => renderKpiCard(item))}
    </section>
  );
}
