import { Button } from '@/shared';
import type { AdminReport } from '../../shared/reports.types';
import { downloadReportCsv, formatCell } from './reportFormat';
import './ReportTable.css';

export interface ReportTableProps {
  readonly report: AdminReport;
  readonly financialYear: string;
}

/** One report card: title, scrollable table with right-aligned figures, and a CSV download. */
export function ReportTable({ report, financialYear }: ReportTableProps) {
  const handleDownload = () =>
    downloadReportCsv(
      `taxedge-${report.id}-FY${financialYear}.csv`,
      report.columns.map((column) => column.label),
      report.rows
    );

  return (
    <article className="tx-report">
      <header className="tx-report__header">
        <div>
          <h2 className="tx-report__title">{report.title}</h2>
          <p className="tx-report__description">{report.description}</p>
        </div>
        <Button variant="secondary" iconName="download" onClick={handleDownload} disabled={report.rows.length === 0}>
          CSV
        </Button>
      </header>

      {report.rows.length === 0 ? (
        <p className="tx-report__empty">No data for this period.</p>
      ) : (
        <div className="tx-report__scroll">
          <table className="tx-report__table">
            <thead>
              <tr>
                {report.columns.map((column) => (
                  <th key={column.label} scope="col" className={column.format === 'text' ? '' : 'tx-report__num'}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => {
                    const column = report.columns[cellIndex];
                    return (
                      <td key={column.label} className={column.format === 'text' ? '' : 'tx-report__num'}>
                        {formatCell(cell, column.format)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
