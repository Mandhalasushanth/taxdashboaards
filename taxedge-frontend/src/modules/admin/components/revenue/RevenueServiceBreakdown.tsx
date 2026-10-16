import { useState } from 'react';
import { formatCompactInr } from '../reports/reportFormat';
import type { PartnerBankCommission, ServiceRevenueBreakdown } from '../../shared/revenue.types';
import './RevenueServiceBreakdown.css';

export interface RevenueServiceBreakdownProps {
  readonly services: readonly ServiceRevenueBreakdown[];
  readonly bankCommissions: readonly PartnerBankCommission[];
}

function renderServiceRow(srv: ServiceRevenueBreakdown, totalBilled: number) {
  const calculatedPercent = totalBilled > 0 ? (srv.billedAmount / totalBilled) * 100 : 0;
  const realizationRate = srv.billedAmount > 0 ? ((srv.collectedAmount / srv.billedAmount) * 100).toFixed(1) : '0';

  return (
    <div key={srv.id} className="tx-rev-service-row">
      <div className="tx-rev-service-row__info">
        <div className="tx-rev-service-row__title-group">
          <span className="tx-rev-service-row__name">{srv.name}</span>
          <span className={`tx-rev-tag tx-rev-tag--${srv.division === 'TAX_CA' ? 'tax' : 'loan'}`}>
            {srv.division === 'TAX_CA' ? 'CA Service' : 'Loan Syndicate'}
          </span>
          <span className="tx-rev-service-row__sac">{srv.sacOrPartner}</span>
        </div>
        <p className="tx-rev-service-row__benchmark">{srv.marketBenchmark}</p>
      </div>

      <div className="tx-rev-service-row__stats">
        <div className="tx-rev-service-row__stat-item">
          <span className="tx-rev-service-row__stat-label">Cases</span>
          <span className="tx-rev-service-row__stat-val">{srv.casesCount.toLocaleString('en-IN')}</span>
        </div>
        <div className="tx-rev-service-row__stat-item">
          <span className="tx-rev-service-row__stat-label">Billed</span>
          <span className="tx-rev-service-row__stat-val">{formatCompactInr(srv.billedAmount)}</span>
        </div>
        <div className="tx-rev-service-row__stat-item">
          <span className="tx-rev-service-row__stat-label">Realized</span>
          <span className="tx-rev-service-row__stat-val tx-rev-service-row__stat-val--success">
            {formatCompactInr(srv.collectedAmount)} ({realizationRate}%)
          </span>
        </div>
      </div>

      <div className="tx-rev-service-row__progress-bar">
        <div
          className="tx-rev-service-row__progress-fill"
          style={{ width: `${Math.min(calculatedPercent, 100)}%` }}
          title={`${calculatedPercent.toFixed(1)}% of total practice billing`}
        />
      </div>
    </div>
  );
}

function renderPartnerCard(bank: PartnerBankCommission) {
  return (
    <div key={bank.bankName} className="tx-rev-partner-card">
      <div className="tx-rev-partner-card__header">
        <div>
          <h4 className="tx-rev-partner-card__name">{bank.bankName}</h4>
          <span className="tx-rev-partner-card__rate">{bank.avgCommissionRate}% Avg Syndicate Fee</span>
        </div>
        <span
          className={`tx-rev-partner-card__badge tx-rev-partner-card__badge--${bank.payoutStatus.toLowerCase()}`}
        >
          {bank.payoutStatus === 'SETTLED' ? 'Settled' : 'In Escrow / Pending'}
        </span>
      </div>
      <div className="tx-rev-partner-card__metrics">
        <div>
          <span className="tx-rev-partner-card__label">Disbursed Volume</span>
          <p className="tx-rev-partner-card__metric-val">{formatCompactInr(bank.disbursedVolume)}</p>
        </div>
        <div>
          <span className="tx-rev-partner-card__label">Cases</span>
          <p className="tx-rev-partner-card__metric-val">{bank.casesDisbursed}</p>
        </div>
        <div>
          <span className="tx-rev-partner-card__label">Commission Earned</span>
          <p className="tx-rev-partner-card__metric-val tx-rev-partner-card__metric-val--green">
            {formatCompactInr(bank.commissionEarned)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RevenueServiceBreakdown({ services, bankCommissions }: RevenueServiceBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PARTNERS'>('SERVICES');

  const totalBilled = services.reduce((sum, s) => sum + s.billedAmount, 0);

  const handleTabChangeSafe = (tab: 'SERVICES' | 'PARTNERS') => {
    try {
      setActiveTab(tab);
    } catch (err) {
      console.error('Tab change error in service breakdown:', err);
    }
  };

  return (
    <div className="tx-rev-breakdown-card">
      <div className="tx-rev-breakdown-card__header">
        <div>
          <h3 className="tx-rev-breakdown-card__title">Vertical Distribution & Partner Yield</h3>
          <p className="tx-rev-breakdown-card__subtitle">
            Revenue breakdown by professional practice lines and banking syndication desks
          </p>
        </div>
        <div className="tx-rev-breakdown-card__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'SERVICES'}
            className={`tx-rev-breakdown-card__tab ${activeTab === 'SERVICES' ? 'tx-rev-breakdown-card__tab--active' : ''}`}
            onClick={() => handleTabChangeSafe('SERVICES')}
          >
            Practice Service Lines ({services.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'PARTNERS'}
            className={`tx-rev-breakdown-card__tab ${activeTab === 'PARTNERS' ? 'tx-rev-breakdown-card__tab--active' : ''}`}
            onClick={() => handleTabChangeSafe('PARTNERS')}
          >
            Lending Partner Syndication ({bankCommissions.length})
          </button>
        </div>
      </div>

      {activeTab === 'SERVICES' ? (
        <div className="tx-rev-services-list">
          {services.map((srv) => renderServiceRow(srv, totalBilled))}
        </div>
      ) : (
        <div className="tx-rev-partners-grid">
          {bankCommissions.map((bank) => renderPartnerCard(bank))}
        </div>
      )}
    </div>
  );
}
