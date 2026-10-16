import { Button, DeferredContent, Icon, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminReports } from '../../hooks/useAdminReports';
import {
  FINANCIAL_YEARS,
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS,
  type FinancialYear,
  type ReportCategoryFilter
} from '../../shared/reports.types';
import { ReportTable } from './ReportTable';
import { formatCell } from './reportFormat';
import './ReportsSection.css';

const CATEGORY_FILTERS: readonly ReportCategoryFilter[] = ['ALL', ...REPORT_CATEGORIES];

/** Admin "Reports": year-wise KPIs plus compliance, financial, operations and loan reports. */
export default function ReportsSection() {
  useDocumentTitle('Reports');
  const reports = useAdminReports();

  return (
    <div className="tx-reports">
      <div className="tx-reports__toolbar">
        <div className="tx-reports__tabs" role="tablist" aria-label="Report category">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={reports.category === category}
              className={`tx-reports__tab ${reports.category === category ? 'tx-reports__tab--active' : ''}`}
              onClick={() => reports.setCategory(category)}
            >
              {REPORT_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
        <label className="tx-reports__year">
          <Icon name="calendar" size="sm" />
          <span className="tx-reports__year-label">Financial year</span>
          <select
            value={reports.financialYear}
            onChange={(event) => reports.setFinancialYear(event.target.value as FinancialYear)}
          >
            {FINANCIAL_YEARS.map((year) => (
              <option key={year} value={year}>
                FY {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {reports.status === 'loading' ? (
        <DeferredContent>
          <div className="tx-reports__state">
            <LoadingSpinner size="lg" label="Loading reports" />
          </div>
        </DeferredContent>
      ) : reports.status === 'error' || !reports.data ? (
        <div className="tx-reports__state" role="alert">
          <p>{reports.error}</p>
          <Button variant="secondary" iconName="rotate-ccw" onClick={reports.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <section className="tx-reports__kpis" aria-label="Key figures">
            {reports.data.kpis.map((kpi) => (
              <div key={kpi.label} className="tx-reports__kpi">
                <p className="tx-reports__kpi-label">{kpi.label}</p>
                <p className="tx-reports__kpi-value">{formatCell(kpi.value, kpi.format, true)}</p>
                <p className="tx-reports__kpi-hint">{kpi.hint}</p>
              </div>
            ))}
          </section>

          <div className="tx-reports__grid">
            {reports.visible.map((report) => (
              <ReportTable key={report.id} report={report} financialYear={reports.financialYear} />
            ))}
          </div>

          <p className="tx-reports__generated">
            Generated {new Date(reports.data.generatedAt).toLocaleString('en-IN')}
          </p>
        </>
      )}
    </div>
  );
}
