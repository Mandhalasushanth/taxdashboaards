export const REPORT_CATEGORIES = ['COMPLIANCE', 'FINANCIAL', 'OPERATIONS', 'LOANS'] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportCategoryFilter = ReportCategory | 'ALL';

/** How a column's values are formatted: ₹ amounts use Indian digit grouping. */
export type ReportColumnFormat = 'text' | 'number' | 'currency' | 'percent' | 'days';

export interface ReportColumn {
  readonly label: string;
  readonly format: ReportColumnFormat;
}

export type ReportCell = string | number;

export interface AdminReport {
  readonly id: string;
  readonly category: ReportCategory;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly ReportColumn[];
  readonly rows: readonly (readonly ReportCell[])[];
}

export interface ReportKpi {
  readonly label: string;
  readonly value: number;
  readonly format: ReportColumnFormat;
  readonly hint: string;
}

export interface AdminReportsData {
  readonly financialYear: string;
  readonly generatedAt: string;
  readonly kpis: readonly ReportKpi[];
  readonly reports: readonly AdminReport[];
}

/** Indian financial years run April to March. */
export const FINANCIAL_YEARS = ['2025-26', '2024-25'] as const;
export type FinancialYear = (typeof FINANCIAL_YEARS)[number];

export const REPORT_CATEGORY_LABELS: Readonly<Record<ReportCategoryFilter, string>> = Object.freeze({
  ALL: 'All reports',
  COMPLIANCE: 'Compliance',
  FINANCIAL: 'Financial',
  OPERATIONS: 'Operations',
  LOANS: 'Loans'
});
