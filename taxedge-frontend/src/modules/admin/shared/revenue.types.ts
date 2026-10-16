import { FINANCIAL_YEARS, type FinancialYear } from './reports.types';

export { FINANCIAL_YEARS, type FinancialYear };

export const REVENUE_DIVISIONS = ['ALL', 'TAX_CA', 'LOANS'] as const;
export type RevenueDivision = (typeof REVENUE_DIVISIONS)[number];

export const REVENUE_PERIODS = ['ALL', 'Q1', 'Q2', 'Q3', 'Q4'] as const;
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number];

export const PAYMENT_STATUSES = ['PAID', 'PENDING', 'OVERDUE', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentStatusFilter = PaymentStatus | 'ALL';

export const PAYMENT_METHODS = ['UPI', 'NET_BANKING', 'CARD', 'BANK_TRANSFER', 'DIRECT_PAYOUT'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const REVENUE_DIVISION_LABELS: Readonly<Record<RevenueDivision, string>> = Object.freeze({
  ALL: 'All verticals',
  TAX_CA: 'CA & Tax compliance',
  LOANS: 'Loan facilitation'
});

export const REVENUE_PERIOD_LABELS: Readonly<Record<RevenuePeriod, string>> = Object.freeze({
  ALL: 'Full financial year',
  Q1: 'Q1 (Apr – Jun)',
  Q2: 'Q2 (Jul – Sep)',
  Q3: 'Q3 (Oct – Dec)',
  Q4: 'Q4 (Jan – Mar)'
});

export const PAYMENT_STATUS_LABELS: Readonly<Record<PaymentStatusFilter, string>> = Object.freeze({
  ALL: 'All statuses',
  PAID: 'Paid / Settled',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  REFUNDED: 'Refunded'
});

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = Object.freeze({
  UPI: 'UPI (GPay / PhonePe / Paytm)',
  NET_BANKING: 'Net Banking (IMPS)',
  CARD: 'Credit / Debit Card (Razorpay)',
  BANK_TRANSFER: 'NEFT / RTGS Transfer',
  DIRECT_PAYOUT: 'Bank Partner Direct Payout'
});

export interface RevenueKpis {
  readonly grossBilled: number;
  readonly netCollected: number;
  readonly outstanding: number;
  readonly loanCommission: number;
  readonly gstCollected: number;
  readonly averageOrderValue: number;
  readonly collectionRate: number;
  readonly totalCases: number;
}

export interface MonthlyRevenueTrend {
  readonly month: string;
  readonly monthIndex: number;
  readonly quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  readonly taxBilled: number;
  readonly taxCollected: number;
  readonly loanBilled: number;
  readonly loanCollected: number;
  readonly totalBilled: number;
  readonly totalCollected: number;
}

export interface ServiceRevenueBreakdown {
  readonly id: string;
  readonly name: string;
  readonly division: 'TAX_CA' | 'LOANS';
  readonly casesCount: number;
  readonly billedAmount: number;
  readonly collectedAmount: number;
  readonly sharePercent: number;
  readonly sacOrPartner: string;
  readonly marketBenchmark: string;
}

export interface PartnerBankCommission {
  readonly bankName: string;
  readonly bankLogoCode: string;
  readonly disbursedVolume: number;
  readonly casesDisbursed: number;
  readonly avgCommissionRate: number;
  readonly commissionEarned: number;
  readonly payoutStatus: 'SETTLED' | 'PENDING';
}

export interface RevenueTransaction {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly date: string;
  readonly dueDate: string;
  readonly customerName: string;
  readonly customerPan: string;
  readonly customerGstin?: string;
  readonly serviceName: string;
  readonly division: 'TAX_CA' | 'LOANS';
  readonly serviceCategory: string;
  readonly baseAmount: number;
  readonly gstAmount: number;
  readonly totalAmount: number;
  readonly paymentMethod: PaymentMethod;
  readonly paymentReference: string;
  readonly status: PaymentStatus;
  readonly sacCode: string;
  readonly clientCity: string;
  readonly clientState: string;
}

export interface AdminRevenueData {
  readonly financialYear: FinancialYear;
  readonly generatedAt: string;
  readonly kpis: RevenueKpis;
  readonly monthlyTrends: readonly MonthlyRevenueTrend[];
  readonly serviceBreakdowns: readonly ServiceRevenueBreakdown[];
  readonly partnerBankCommissions: readonly PartnerBankCommission[];
  readonly transactions: readonly RevenueTransaction[];
}
