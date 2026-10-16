import { Button, DeferredContent, Icon, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminRevenue, type AdminRevenueController } from '../../hooks/useAdminRevenue';
import {
  FINANCIAL_YEARS,
  REVENUE_PERIOD_LABELS,
  REVENUE_PERIODS,
  type FinancialYear,
  type RevenueDivision,
  type RevenuePeriod
} from '../../shared/revenue.types';
import { RevenueInvoiceModal } from './RevenueInvoiceModal';
import { RevenueKpisBar } from './RevenueKpisBar';
import { RevenueServiceBreakdown } from './RevenueServiceBreakdown';
import { RevenueTransactionsTable } from './RevenueTransactionsTable';
import { RevenueTrendChart } from './RevenueTrendChart';
import './RevenueSection.css';

const DIVISION_TAB_CONFIG: readonly { id: RevenueDivision; label: string; icon: 'layers' | 'receipt' | 'landmark' }[] = [
  { id: 'ALL', label: 'All Verticals', icon: 'layers' },
  { id: 'TAX_CA', label: 'CA & Tax Compliance', icon: 'receipt' },
  { id: 'LOANS', label: 'Loan Facilitation', icon: 'landmark' }
];

function renderToolbar(revenue: AdminRevenueController) {
  const handleDivisionChange = (id: RevenueDivision) => {
    try {
      revenue.setDivision(id);
    } catch (err) {
      console.error('Division change error:', err);
    }
  };

  const handlePeriodChange = (val: string) => {
    try {
      revenue.setPeriod(val as RevenuePeriod);
    } catch (err) {
      console.error('Period change error:', err);
    }
  };

  const handleYearChange = (val: string) => {
    try {
      revenue.setFinancialYear(val as FinancialYear);
    } catch (err) {
      console.error('Financial year change error:', err);
    }
  };

  return (
    <div className="tx-revenue__toolbar">
      <div className="tx-revenue__vertical-tabs" role="tablist" aria-label="Practice vertical filter">
        {DIVISION_TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={revenue.division === tab.id}
            className={`tx-revenue__v-tab ${revenue.division === tab.id ? 'tx-revenue__v-tab--active' : ''}`}
            onClick={() => handleDivisionChange(tab.id)}
          >
            <Icon name={tab.icon} size="sm" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tx-revenue__controls-right">
        <label className="tx-revenue__select-group">
          <Icon name="calendar" size="sm" />
          <span>Period:</span>
          <select
            value={revenue.period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            aria-label="Filter by quarter or period"
          >
            {REVENUE_PERIODS.map((p) => (
              <option key={p} value={p}>
                {REVENUE_PERIOD_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="tx-revenue__select-group">
          <Icon name="calendar" size="sm" />
          <span>Financial Year:</span>
          <select
            value={revenue.financialYear}
            onChange={(e) => handleYearChange(e.target.value)}
            aria-label="Filter by Indian financial year"
          >
            {FINANCIAL_YEARS.map((yr: FinancialYear) => (
              <option key={yr} value={yr}>
                FY {yr}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function renderLoading() {
  return (
    <DeferredContent>
      <div className="tx-reports__state">
        <LoadingSpinner size="lg" label="Loading financial & revenue analytics" />
      </div>
    </DeferredContent>
  );
}

function renderError(revenue: AdminRevenueController) {
  const handleReload = () => {
    try {
      revenue.reload();
    } catch (err) {
      console.error('Reload error:', err);
    }
  };

  return (
    <div className="tx-reports__state" role="alert">
      <p>{revenue.error}</p>
      <Button variant="secondary" iconName="rotate-ccw" onClick={handleReload}>
        Retry loading revenue
      </Button>
    </div>
  );
}

function renderMainContent(revenue: AdminRevenueController) {
  return (
    <>
      <RevenueKpisBar kpis={revenue.kpis} />

      <div className="tx-revenue__analytics-split">
        <RevenueTrendChart trends={revenue.filteredTrends} />
        <RevenueServiceBreakdown
          services={revenue.filteredServices}
          bankCommissions={revenue.partnerBankCommissions}
        />
      </div>

      <RevenueTransactionsTable
        transactions={revenue.filteredTransactions}
        statusFilter={revenue.statusFilter}
        onStatusFilterChange={revenue.setStatusFilter}
        searchQuery={revenue.searchQuery}
        onSearchChange={revenue.setSearchQuery}
        onSelectInvoice={revenue.setSelectedInvoice}
        onExportCsv={revenue.exportTransactionsCsv}
      />

      {revenue.selectedInvoice && (
        <RevenueInvoiceModal
          transaction={revenue.selectedInvoice}
          onClose={() => revenue.setSelectedInvoice(null)}
        />
      )}
    </>
  );
}

/**
 * Admin "Revenue" Section:
 * Advanced Modular Monolith architecture for financial intelligence, practice fee billing,
 * banking partner syndication payouts, collection realization curves, and itemized GST tax invoices.
 */
export default function RevenueSection() {
  useDocumentTitle('Revenue & Billing');
  const revenue = useAdminRevenue();

  const renderBody = () => {
    if (revenue.status === 'loading') return renderLoading();
    if (revenue.status === 'error' || !revenue.data) return renderError(revenue);
    return renderMainContent(revenue);
  };

  return (
    <div className="tx-revenue">
      {renderToolbar(revenue)}
      {renderBody()}
    </div>
  );
}
