import type {
  AdminRevenueData,
  FinancialYear,
  MonthlyRevenueTrend,
  PartnerBankCommission,
  RevenueKpis,
  RevenueTransaction,
  ServiceRevenueBreakdown
} from '../shared/revenue.types';

const YEAR_SCALE: Readonly<Record<FinancialYear, number>> = {
  '2025-26': 1,
  '2024-25': 0.84
};

const scale = (val: number, factor: number) => Math.round(val * factor);

function buildKpis(factor: number): RevenueKpis {
  return {
    grossBilled: scale(4_86_50_000, factor),
    netCollected: scale(4_18_20_000, factor),
    outstanding: scale(68_30_000, factor),
    loanCommission: scale(1_13_60_000, factor),
    gstCollected: scale(64_20_000, factor),
    averageOrderValue: scale(12_450, factor),
    collectionRate: 85.9,
    totalCases: scale(3_908, factor)
  };
}

function buildMonthlyTrends(factor: number): MonthlyRevenueTrend[] {
  const rawMonths: Array<{ month: string; monthIndex: number; quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; taxBilled: number; taxCollected: number; loanBilled: number; loanCollected: number }> = [
    { month: 'Apr', monthIndex: 0, quarter: 'Q1', taxBilled: 24_50_000, taxCollected: 21_20_000, loanBilled: 7_80_000, loanCollected: 7_10_000 },
    { month: 'May', monthIndex: 1, quarter: 'Q1', taxBilled: 28_00_000, taxCollected: 24_60_000, loanBilled: 8_50_000, loanCollected: 8_20_000 },
    { month: 'Jun', monthIndex: 2, quarter: 'Q1', taxBilled: 36_40_000, taxCollected: 31_90_000, loanBilled: 9_20_000, loanCollected: 8_90_000 },
    { month: 'Jul', monthIndex: 3, quarter: 'Q2', taxBilled: 58_90_000, taxCollected: 52_40_000, loanBilled: 9_80_000, loanCollected: 9_10_000 },
    { month: 'Aug', monthIndex: 4, quarter: 'Q2', taxBilled: 34_20_000, taxCollected: 30_10_000, loanBilled: 8_90_000, loanCollected: 8_40_000 },
    { month: 'Sep', monthIndex: 5, quarter: 'Q2', taxBilled: 42_10_000, taxCollected: 37_50_000, loanBilled: 10_40_000, loanCollected: 9_80_000 },
    { month: 'Oct', monthIndex: 6, quarter: 'Q3', taxBilled: 32_80_000, taxCollected: 28_40_000, loanBilled: 11_80_000, loanCollected: 11_10_000 },
    { month: 'Nov', monthIndex: 7, quarter: 'Q3', taxBilled: 29_50_000, taxCollected: 25_80_000, loanBilled: 10_20_000, loanCollected: 9_50_000 },
    { month: 'Dec', monthIndex: 8, quarter: 'Q3', taxBilled: 35_20_000, taxCollected: 30_90_000, loanBilled: 11_50_000, loanCollected: 10_90_000 },
    { month: 'Jan', monthIndex: 9, quarter: 'Q4', taxBilled: 28_90_000, taxCollected: 24_50_000, loanBilled: 10_10_000, loanCollected: 9_40_000 },
    { month: 'Feb', monthIndex: 10, quarter: 'Q4', taxBilled: 26_40_000, taxCollected: 23_10_000, loanBilled: 9_60_000, loanCollected: 9_00_000 },
    { month: 'Mar', monthIndex: 11, quarter: 'Q4', taxBilled: 40_20_000, taxCollected: 34_80_000, loanBilled: 12_80_000, loanCollected: 11_80_000 }
  ];

  return rawMonths.map((m) => {
    const tBilled = scale(m.taxBilled, factor);
    const tCollected = scale(m.taxCollected, factor);
    const lBilled = scale(m.loanBilled, factor);
    const lCollected = scale(m.loanCollected, factor);
    return {
      month: m.month,
      monthIndex: m.monthIndex,
      quarter: m.quarter,
      taxBilled: tBilled,
      taxCollected: tCollected,
      loanBilled: lBilled,
      loanCollected: lCollected,
      totalBilled: tBilled + lBilled,
      totalCollected: tCollected + lCollected
    };
  });
}

function buildServiceBreakdowns(factor: number): ServiceRevenueBreakdown[] {
  return [
    {
      id: 'srv-nri-crossborder',
      name: 'NRI & US-India Dual Tax Filing',
      division: 'TAX_CA',
      casesCount: scale(524, factor),
      billedAmount: scale(78_60_000, factor),
      collectedAmount: scale(73_40_000, factor),
      sharePercent: 16.2,
      sacOrPartner: 'SAC 998231',
      marketBenchmark: 'AOTax Expat benchmark (FBAR, FATCA, DTAA Form 67)'
    },
    {
      id: 'srv-salaried-capital-gains',
      name: 'Salaried ITR (RSU, ESOP & Cap Gains)',
      division: 'TAX_CA',
      casesCount: scale(1_140, factor),
      billedAmount: scale(68_40_000, factor),
      collectedAmount: scale(64_80_000, factor),
      sharePercent: 14.1,
      sacOrPartner: 'SAC 998231',
      marketBenchmark: 'ClearTax / AOTax Tech-Professional Tier'
    },
    {
      id: 'srv-gst-compliance',
      name: 'GST Retainer (GSTR-1, 3B & Annual)',
      division: 'TAX_CA',
      casesCount: scale(960, factor),
      billedAmount: scale(1_24_80_000, factor),
      collectedAmount: scale(1_08_50_000, factor),
      sharePercent: 25.6,
      sacOrPartner: 'SAC 998221',
      marketBenchmark: 'Masters India / IndiaFilings SME Standard'
    },
    {
      id: 'srv-tax-audit',
      name: 'Tax Audit & Certification (Form 3CD)',
      division: 'TAX_CA',
      casesCount: scale(118, factor),
      billedAmount: scale(1_01_10_000, factor),
      collectedAmount: scale(80_70_000, factor),
      sharePercent: 20.8,
      sacOrPartner: 'SAC 998221',
      marketBenchmark: 'ICAI Statutory Rate Schedule'
    },
    {
      id: 'srv-home-loan',
      name: 'Home Loan & LAP Syndication',
      division: 'LOANS',
      casesCount: scale(186, factor),
      billedAmount: scale(62_40_000, factor),
      collectedAmount: scale(54_60_000, factor),
      sharePercent: 12.8,
      sacOrPartner: 'HDFC, SBI, ICICI Bank',
      marketBenchmark: '0.45% – 0.65% Disbursed Volume Payout'
    },
    {
      id: 'srv-business-loan',
      name: 'MSME & Working Capital Facilitation',
      division: 'LOANS',
      casesCount: scale(92, factor),
      billedAmount: scale(51_20_000, factor),
      collectedAmount: scale(36_20_000, factor),
      sharePercent: 10.5,
      sacOrPartner: 'Bajaj Finserv, Tata Capital',
      marketBenchmark: '1.50% – 2.25% Disbursed Volume Payout'
    }
  ];
}

function buildBankCommissions(factor: number): PartnerBankCommission[] {
  return [
    {
      bankName: 'HDFC Bank Ltd',
      bankLogoCode: 'HDFC',
      disbursedVolume: scale(28_40_00_000, factor),
      casesDisbursed: scale(84, factor),
      avgCommissionRate: 0.55,
      commissionEarned: scale(15_62_000, factor),
      payoutStatus: 'SETTLED'
    },
    {
      bankName: 'State Bank of India',
      bankLogoCode: 'SBI',
      disbursedVolume: scale(34_20_00_000, factor),
      casesDisbursed: scale(112, factor),
      avgCommissionRate: 0.45,
      commissionEarned: scale(15_39_000, factor),
      payoutStatus: 'SETTLED'
    },
    {
      bankName: 'ICICI Bank Ltd',
      bankLogoCode: 'ICICI',
      disbursedVolume: scale(21_50_00_000, factor),
      casesDisbursed: scale(62, factor),
      avgCommissionRate: 0.60,
      commissionEarned: scale(12_90_000, factor),
      payoutStatus: 'SETTLED'
    },
    {
      bankName: 'Bajaj Finserv Ltd',
      bankLogoCode: 'BAJAJ',
      disbursedVolume: scale(16_80_00_000, factor),
      casesDisbursed: scale(78, factor),
      avgCommissionRate: 1.80,
      commissionEarned: scale(30_24_000, factor),
      payoutStatus: 'SETTLED'
    },
    {
      bankName: 'Tata Capital Financial',
      bankLogoCode: 'TATA',
      disbursedVolume: scale(12_50_00_000, factor),
      casesDisbursed: scale(45, factor),
      avgCommissionRate: 1.75,
      commissionEarned: scale(21_87_500, factor),
      payoutStatus: 'PENDING'
    },
    {
      bankName: 'Axis Bank Ltd',
      bankLogoCode: 'AXIS',
      disbursedVolume: scale(14_20_00_000, factor),
      casesDisbursed: scale(52, factor),
      avgCommissionRate: 0.65,
      commissionEarned: scale(9_23_000, factor),
      payoutStatus: 'SETTLED'
    }
  ];
}

function buildTransactions(): RevenueTransaction[] {
  return [
    {
      id: 'txn-25-1089',
      invoiceNumber: 'TE/25-26/1089',
      date: '2026-03-28',
      dueDate: '2026-04-12',
      customerName: 'Aditya Narayanan',
      customerPan: 'ABCNA4829K',
      serviceName: 'NRI Dual Tax Filing (India & US 1040)',
      division: 'TAX_CA',
      serviceCategory: 'NRI & Expat Filing',
      baseAmount: 14_999,
      gstAmount: 2_700,
      totalAmount: 17_699,
      paymentMethod: 'UPI',
      paymentReference: 'pay_Nzk8129048',
      status: 'PAID',
      sacCode: '998231',
      clientCity: 'Bengaluru',
      clientState: 'Karnataka'
    },
    {
      id: 'txn-25-1088',
      invoiceNumber: 'TE/25-26/1088',
      date: '2026-03-27',
      dueDate: '2026-04-11',
      customerName: 'Rohan Deshmukh & Associates',
      customerPan: 'AABFR8912P',
      customerGstin: '27AABFR8912P1ZG',
      serviceName: 'Statutory Tax Audit (Form 3CD)',
      division: 'TAX_CA',
      serviceCategory: 'Tax Audit & Certification',
      baseAmount: 65_000,
      gstAmount: 11_700,
      totalAmount: 76_700,
      paymentMethod: 'NET_BANKING',
      paymentReference: 'IMPS_8921839210',
      status: 'PAID',
      sacCode: '998221',
      clientCity: 'Mumbai',
      clientState: 'Maharashtra'
    },
    {
      id: 'txn-25-1087',
      invoiceNumber: 'TE/25-26/1087',
      date: '2026-03-26',
      dueDate: '2026-04-10',
      customerName: 'HDFC Bank Lending Syndicate',
      customerPan: 'AAACH2702H',
      customerGstin: '27AAACH2702H1Z7',
      serviceName: 'Home Loan Facilitation Payout - Case #HL-849',
      division: 'LOANS',
      serviceCategory: 'Home Loan Payout',
      baseAmount: 92_500,
      gstAmount: 16_650,
      totalAmount: 1_09_150,
      paymentMethod: 'DIRECT_PAYOUT',
      paymentReference: 'UTR_HDFC260326019',
      status: 'PAID',
      sacCode: '997129',
      clientCity: 'Mumbai',
      clientState: 'Maharashtra'
    },
    {
      id: 'txn-25-1086',
      invoiceNumber: 'TE/25-26/1086',
      date: '2026-03-25',
      dueDate: '2026-04-09',
      customerName: 'Kavita Sundaram',
      customerPan: 'AWPKS9214L',
      serviceName: 'ITR-2 Salaried with US RSUs & Foreign Asset Schedule',
      division: 'TAX_CA',
      serviceCategory: 'Individual ITR',
      baseAmount: 7_999,
      gstAmount: 1_440,
      totalAmount: 9_439,
      paymentMethod: 'CARD',
      paymentReference: 'pay_Nzk7192381',
      status: 'PAID',
      sacCode: '998231',
      clientCity: 'Hyderabad',
      clientState: 'Telangana'
    },
    {
      id: 'txn-25-1085',
      invoiceNumber: 'TE/25-26/1085',
      date: '2026-03-24',
      dueDate: '2026-04-08',
      customerName: 'Apex Cloud Innovations LLP',
      customerPan: 'AAGFA7192M',
      customerGstin: '29AAGFA7192M1ZN',
      serviceName: 'GSTR-3B & GSTR-1 Monthly Return Filing',
      division: 'TAX_CA',
      serviceCategory: 'GST Compliance',
      baseAmount: 12_500,
      gstAmount: 2_250,
      totalAmount: 14_750,
      paymentMethod: 'UPI',
      paymentReference: 'pay_Nzk6618290',
      status: 'PENDING',
      sacCode: '998221',
      clientCity: 'Bengaluru',
      clientState: 'Karnataka'
    },
    {
      id: 'txn-25-1084',
      invoiceNumber: 'TE/25-26/1084',
      date: '2026-03-22',
      dueDate: '2026-04-06',
      customerName: 'Bajaj Finserv Channel Desk',
      customerPan: 'AABCB4821E',
      customerGstin: '27AABCB4821E1Z3',
      serviceName: 'MSME Business Loan Facilitation Commission (₹1.8 Cr)',
      division: 'LOANS',
      serviceCategory: 'Business Loan Payout',
      baseAmount: 3_24_000,
      gstAmount: 58_320,
      totalAmount: 3_82_320,
      paymentMethod: 'DIRECT_PAYOUT',
      paymentReference: 'UTR_BAJAJ260322194',
      status: 'PAID',
      sacCode: '997129',
      clientCity: 'Pune',
      clientState: 'Maharashtra'
    },
    {
      id: 'txn-25-1083',
      invoiceNumber: 'TE/25-26/1083',
      date: '2026-03-20',
      dueDate: '2026-04-04',
      customerName: 'Siddharth Mehra',
      customerPan: 'AFSPM1849D',
      serviceName: 'NRI Cross-Border Tax Filing (DTAA Exemption & 15CA/CB)',
      division: 'TAX_CA',
      serviceCategory: 'NRI & Expat Filing',
      baseAmount: 18_500,
      gstAmount: 3_330,
      totalAmount: 21_830,
      paymentMethod: 'NET_BANKING',
      paymentReference: 'IMPS_9921471829',
      status: 'PAID',
      sacCode: '998231',
      clientCity: 'Gurugram',
      clientState: 'Haryana'
    },
    {
      id: 'txn-25-1082',
      invoiceNumber: 'TE/25-26/1082',
      date: '2026-03-18',
      dueDate: '2026-04-02',
      customerName: 'Vikas Agarwal',
      customerPan: 'ABUPA8271Q',
      serviceName: 'Presumptive Tax Filing (ITR-4 / Sec 44ADA)',
      division: 'TAX_CA',
      serviceCategory: 'Individual ITR',
      baseAmount: 5_499,
      gstAmount: 990,
      totalAmount: 6_489,
      paymentMethod: 'UPI',
      paymentReference: 'pay_Nzk5281903',
      status: 'PAID',
      sacCode: '998231',
      clientCity: 'Ahmedabad',
      clientState: 'Gujarat'
    },
    {
      id: 'txn-25-1081',
      invoiceNumber: 'TE/25-26/1081',
      date: '2026-03-15',
      dueDate: '2026-03-30',
      customerName: 'Zenith Logistics Pvt Ltd',
      customerPan: 'AAACZ9182R',
      customerGstin: '33AAACZ9182R1Z8',
      serviceName: 'Annual GST Reconciliation (GSTR-9 & 9C Audit)',
      division: 'TAX_CA',
      serviceCategory: 'GST Compliance',
      baseAmount: 48_000,
      gstAmount: 8_640,
      totalAmount: 56_640,
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'NEFT_ZEN260315',
      status: 'OVERDUE',
      sacCode: '998221',
      clientCity: 'Chennai',
      clientState: 'Tamil Nadu'
    },
    {
      id: 'txn-25-1080',
      invoiceNumber: 'TE/25-26/1080',
      date: '2026-03-12',
      dueDate: '2026-03-27',
      customerName: 'Meenakshi Iyer',
      customerPan: 'AZYPI7193H',
      serviceName: 'Personal Loan Facilitation Advisory',
      division: 'LOANS',
      serviceCategory: 'Personal Loan Advisory',
      baseAmount: 3_500,
      gstAmount: 630,
      totalAmount: 4_130,
      paymentMethod: 'UPI',
      paymentReference: 'pay_Nzk4918201',
      status: 'PAID',
      sacCode: '997129',
      clientCity: 'Bengaluru',
      clientState: 'Karnataka'
    },
    {
      id: 'txn-25-1079',
      invoiceNumber: 'TE/25-26/1079',
      date: '2026-03-10',
      dueDate: '2026-03-25',
      customerName: 'Tarun Mathur',
      customerPan: 'BTPPM8190N',
      serviceName: 'Cancelled ITR Filing (Draft stage refund)',
      division: 'TAX_CA',
      serviceCategory: 'Individual ITR',
      baseAmount: 4_999,
      gstAmount: 900,
      totalAmount: 5_899,
      paymentMethod: 'CARD',
      paymentReference: 'rfnd_Nzk382198',
      status: 'REFUNDED',
      sacCode: '998231',
      clientCity: 'Jaipur',
      clientState: 'Rajasthan'
    },
    {
      id: 'txn-25-1078',
      invoiceNumber: 'TE/25-26/1078',
      date: '2026-03-08',
      dueDate: '2026-03-23',
      customerName: 'State Bank of India Loan Hub',
      customerPan: 'AAACS8491K',
      customerGstin: '27AAACS8491K1ZY',
      serviceName: 'Home Loan Priority Payout - Case #SBI-921',
      division: 'LOANS',
      serviceCategory: 'Home Loan Payout',
      baseAmount: 1_18_000,
      gstAmount: 21_240,
      totalAmount: 1_39_240,
      paymentMethod: 'DIRECT_PAYOUT',
      paymentReference: 'UTR_SBI260308001',
      status: 'PAID',
      sacCode: '997129',
      clientCity: 'Mumbai',
      clientState: 'Maharashtra'
    }
  ];
}

export const demoRevenueStore = Object.freeze({
  async fetch(financialYear: FinancialYear): Promise<AdminRevenueData> {
    try {
      const factor = YEAR_SCALE[financialYear] ?? 1;
      return {
        financialYear,
        generatedAt: new Date().toISOString(),
        kpis: buildKpis(factor),
        monthlyTrends: buildMonthlyTrends(factor),
        serviceBreakdowns: buildServiceBreakdowns(factor),
        partnerBankCommissions: buildBankCommissions(factor),
        transactions: buildTransactions()
      };
    } catch (err) {
      throw new Error(`Failed to generate demo revenue data: ${(err as Error).message}`);
    }
  }
});
