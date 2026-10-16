import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { fetchAdminRevenue } from '../api/adminRevenueApi';
import { downloadReportCsv } from '../components/reports/reportFormat';
import type {
  AdminRevenueData,
  FinancialYear,
  MonthlyRevenueTrend,
  PartnerBankCommission,
  PaymentStatusFilter,
  RevenueDivision,
  RevenueKpis,
  RevenuePeriod,
  RevenueTransaction,
  ServiceRevenueBreakdown
} from '../shared/revenue.types';

export type RevenueStatus = 'loading' | 'ready' | 'error';

export interface AdminRevenueController {
  readonly status: RevenueStatus;
  readonly error: string | null;
  readonly data: AdminRevenueData | null;
  readonly financialYear: FinancialYear;
  readonly division: RevenueDivision;
  readonly period: RevenuePeriod;
  readonly statusFilter: PaymentStatusFilter;
  readonly searchQuery: string;
  readonly selectedInvoice: RevenueTransaction | null;
  readonly filteredTransactions: readonly RevenueTransaction[];
  readonly filteredTrends: readonly MonthlyRevenueTrend[];
  readonly filteredServices: readonly ServiceRevenueBreakdown[];
  readonly partnerBankCommissions: readonly PartnerBankCommission[];
  readonly kpis: RevenueKpis;
  readonly setFinancialYear: (year: FinancialYear) => void;
  readonly setDivision: (division: RevenueDivision) => void;
  readonly setPeriod: (period: RevenuePeriod) => void;
  readonly setStatusFilter: (status: PaymentStatusFilter) => void;
  readonly setSearchQuery: (query: string) => void;
  readonly setSelectedInvoice: (invoice: RevenueTransaction | null) => void;
  readonly reload: () => void;
  readonly exportTransactionsCsv: () => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  logger.error('Unexpected revenue data failure.', error);
  return defaultMessageFor('UNKNOWN');
}

export function useAdminRevenue(): AdminRevenueController {
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2025-26');
  const [division, setDivision] = useState<RevenueDivision>('ALL');
  const [period, setPeriod] = useState<RevenuePeriod>('ALL');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<RevenueTransaction | null>(null);

  const [data, setData] = useState<AdminRevenueData | null>(null);
  const [status, setStatus] = useState<RevenueStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetchAdminRevenue(financialYear)
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(toMessage(err));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [financialYear, loadCount]);

  const reload = useCallback(() => setLoadCount((c) => c + 1), []);

  const filteredTrends = useMemo(() => {
    if (!data) return [];
    if (period === 'ALL') return data.monthlyTrends;
    return data.monthlyTrends.filter((item) => item.quarter === period);
  }, [data, period]);

  const filteredServices = useMemo(() => {
    if (!data) return [];
    if (division === 'ALL') return data.serviceBreakdowns;
    return data.serviceBreakdowns.filter((srv) => srv.division === division);
  }, [data, division]);

  const partnerBankCommissions = useMemo(() => data?.partnerBankCommissions ?? [], [data]);

  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();

    return data.transactions.filter((tx) => {
      if (division !== 'ALL' && tx.division !== division) return false;
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
      if (!q) return true;
      return (
        tx.invoiceNumber.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerPan.toLowerCase().includes(q) ||
        tx.serviceName.toLowerCase().includes(q) ||
        tx.clientCity.toLowerCase().includes(q) ||
        tx.paymentReference.toLowerCase().includes(q)
      );
    });
  }, [data, division, statusFilter, searchQuery]);

  const kpis = useMemo<RevenueKpis>(() => {
    if (!data) {
      return {
        grossBilled: 0,
        netCollected: 0,
        outstanding: 0,
        loanCommission: 0,
        gstCollected: 0,
        averageOrderValue: 0,
        collectionRate: 0,
        totalCases: 0
      };
    }
    if (division === 'ALL') return data.kpis;

    const base = filteredServices.reduce(
      (acc, srv) => {
        acc.billed += srv.billedAmount;
        acc.collected += srv.collectedAmount;
        acc.cases += srv.casesCount;
        return acc;
      },
      { billed: 0, collected: 0, cases: 0 }
    );

    const outst = Math.max(0, base.billed - base.collected);
    const rate = base.billed > 0 ? (base.collected / base.billed) * 100 : 0;
    const aov = base.cases > 0 ? Math.round(base.billed / base.cases) : 0;

    return {
      grossBilled: base.billed,
      netCollected: base.collected,
      outstanding: outst,
      loanCommission: division === 'LOANS' ? base.collected : 0,
      gstCollected: Math.round(base.billed * 0.18),
      averageOrderValue: aov,
      collectionRate: Number(rate.toFixed(1)),
      totalCases: base.cases
    };
  }, [data, division, filteredServices]);

  const exportTransactionsCsv = useCallback(() => {
    if (!filteredTransactions.length) return;
    const headers = [
      'Invoice Number',
      'Date',
      'Due Date',
      'Customer Name',
      'PAN',
      'GSTIN',
      'Division',
      'Service',
      'SAC Code',
      'City',
      'Base Taxable (₹)',
      'GST 18% (₹)',
      'Total Billed (₹)',
      'Payment Method',
      'Payment Ref / UTR',
      'Status'
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.invoiceNumber,
      tx.date,
      tx.dueDate,
      tx.customerName,
      tx.customerPan,
      tx.customerGstin ?? 'N/A',
      tx.division === 'TAX_CA' ? 'CA & Tax' : 'Loan Facilitation',
      tx.serviceName,
      tx.sacCode,
      tx.clientCity,
      tx.baseAmount,
      tx.gstAmount,
      tx.totalAmount,
      tx.paymentMethod,
      tx.paymentReference,
      tx.status
    ]);
    downloadReportCsv(`TaxEdge_Revenue_Ledger_FY${financialYear}.csv`, headers, rows);
  }, [filteredTransactions, financialYear]);

  return {
    status,
    error,
    data,
    financialYear,
    division,
    period,
    statusFilter,
    searchQuery,
    selectedInvoice,
    filteredTransactions,
    filteredTrends,
    filteredServices,
    partnerBankCommissions,
    kpis,
    setFinancialYear,
    setDivision,
    setPeriod,
    setStatusFilter,
    setSearchQuery,
    setSelectedInvoice,
    reload,
    exportTransactionsCsv
  };
}
