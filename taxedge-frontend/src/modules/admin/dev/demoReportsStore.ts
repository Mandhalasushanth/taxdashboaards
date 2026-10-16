import type { AdminReport, AdminReportsData, FinancialYear, ReportKpi } from '../shared/reports.types';

/**
 * DEVELOPMENT ONLY. Sample report figures used while the backend reports endpoint is unavailable.
 * Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production bundles.
 * Statutory due dates follow the standard Indian calendar (GSTR-1 11th, GSTR-3B 20th, TDS quarterly).
 */

/** The earlier year is scaled down so the year selector shows visibly different data. */
const YEAR_SCALE: Readonly<Record<FinancialYear, number>> = { '2025-26': 1, '2024-25': 0.82 };

const scale = (value: number, factor: number) => Math.round(value * factor);

function kpis(f: number): ReportKpi[] {
  return [
    { label: 'Total billed', value: scale(4_86_50_000, f), format: 'currency', hint: 'Invoices raised this year' },
    { label: 'Collected', value: scale(4_12_30_000, f), format: 'currency', hint: '84.7% of billed' },
    { label: 'Outstanding', value: scale(74_20_000, f), format: 'currency', hint: '₹18.6 L over 90 days' },
    { label: 'Filings completed', value: scale(3_842, f), format: 'number', hint: 'GST, ITR, TDS and audit' },
    { label: 'SLA compliance', value: 92.4, format: 'percent', hint: 'Cases closed within turnaround' }
  ];
}

function reports(f: number): AdminReport[] {
  return [
    {
      id: 'compliance-filings',
      category: 'COMPLIANCE',
      title: 'Statutory filing status',
      description: 'Returns filed, pending and overdue against their due dates.',
      columns: [
        { label: 'Return', format: 'text' },
        { label: 'Due date', format: 'text' },
        { label: 'Filed', format: 'number' },
        { label: 'Pending', format: 'number' },
        { label: 'Overdue', format: 'number' }
      ],
      rows: [
        ['GSTR-1 (monthly)', '11th of next month', scale(1_284, f), 46, 9],
        ['GSTR-3B (monthly)', '20th of next month', scale(1_262, f), 58, 14],
        ['ITR (non-audit)', '31 July', scale(812, f), 37, 6],
        ['Tax audit (Form 3CD)', '30 September', scale(96, f), 11, 2],
        ['TDS return (24Q / 26Q)', '31st after quarter end', scale(388, f), 22, 4]
      ]
    },
    {
      id: 'revenue-by-service',
      category: 'FINANCIAL',
      title: 'Revenue by service',
      description: 'Billing and collections for each service line.',
      columns: [
        { label: 'Service', format: 'text' },
        { label: 'Cases', format: 'number' },
        { label: 'Billed', format: 'currency' },
        { label: 'Collected', format: 'currency' },
        { label: 'Outstanding', format: 'currency' }
      ],
      rows: [
        ['GST returns', scale(1_420, f), scale(1_42_00_000, f), scale(1_26_40_000, f), scale(15_60_000, f)],
        ['Income tax returns', scale(849, f), scale(84_90_000, f), scale(79_80_000, f), scale(5_10_000, f)],
        ['Tax audit', scale(107, f), scale(96_30_000, f), scale(72_10_000, f), scale(24_20_000, f)],
        ['TDS compliance', scale(414, f), scale(49_70_000, f), scale(43_20_000, f), scale(6_50_000, f)],
        ['Loan advisory', scale(236, f), scale(1_13_60_000, f), scale(90_80_000, f), scale(22_80_000, f)]
      ]
    },
    {
      id: 'receivables-ageing',
      category: 'FINANCIAL',
      title: 'Receivables ageing',
      description: 'Unpaid invoices grouped by days past the invoice date.',
      columns: [
        { label: 'Age bucket', format: 'text' },
        { label: 'Invoices', format: 'number' },
        { label: 'Amount', format: 'currency' },
        { label: 'Share', format: 'percent' }
      ],
      rows: [
        ['0–30 days', scale(142, f), scale(31_40_000, f), 42.3],
        ['31–60 days', scale(58, f), scale(15_20_000, f), 20.5],
        ['61–90 days', scale(31, f), scale(9_00_000, f), 12.1],
        ['Over 90 days', scale(44, f), scale(18_60_000, f), 25.1]
      ]
    },
    {
      id: 'team-productivity',
      category: 'OPERATIONS',
      title: 'Team productivity',
      description: 'Workload, average turnaround and SLA performance by team member.',
      columns: [
        { label: 'Team member', format: 'text' },
        { label: 'Role', format: 'text' },
        { label: 'Assigned', format: 'number' },
        { label: 'Completed', format: 'number' },
        { label: 'Avg. turnaround', format: 'days' },
        { label: 'SLA met', format: 'percent' }
      ],
      rows: [
        ['Sanjay Verma', 'CA Manager', scale(412, f), scale(398, f), 2.8, 96.2],
        ['Suresh Kumar', 'CA Agent', scale(684, f), scale(641, f), 3.4, 93.1],
        ['Priya Sharma', 'CA Agent', scale(702, f), scale(668, f), 3.1, 94.8],
        ['Ananya Deshmukh', 'Loan Manager', scale(198, f), scale(176, f), 5.2, 89.4],
        ['Rajesh Patel', 'Loan Agent', scale(254, f), scale(221, f), 6.1, 86.7]
      ]
    },
    {
      id: 'loan-pipeline',
      category: 'LOANS',
      title: 'Loan pipeline',
      description: 'Applications and value at each stage, with conversion from the previous stage.',
      columns: [
        { label: 'Stage', format: 'text' },
        { label: 'Applications', format: 'number' },
        { label: 'Loan value', format: 'currency' },
        { label: 'Conversion', format: 'percent' }
      ],
      rows: [
        ['Leads received', scale(1_240, f), scale(186_00_00_000, f), 100],
        ['Documents verified', scale(812, f), scale(121_80_00_000, f), 65.5],
        ['Credit assessed', scale(538, f), scale(80_70_00_000, f), 66.3],
        ['Sanctioned', scale(361, f), scale(54_15_00_000, f), 67.1],
        ['Disbursed', scale(318, f), scale(47_70_00_000, f), 88.1]
      ]
    }
  ];
}

export const demoReportsStore = Object.freeze({
  async fetch(financialYear: FinancialYear): Promise<AdminReportsData> {
    const factor = YEAR_SCALE[financialYear];
    return { financialYear, generatedAt: new Date().toISOString(), kpis: kpis(factor), reports: reports(factor) };
  }
});
