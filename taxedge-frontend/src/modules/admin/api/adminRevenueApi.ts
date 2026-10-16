import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { AdminRevenueData, FinancialYear } from '../shared/revenue.types';

function parseRevenueData(raw: unknown, financialYear: FinancialYear): AdminRevenueData {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    financialYear,
    generatedAt: typeof record.generatedAt === 'string' ? record.generatedAt : new Date().toISOString(),
    kpis: (record.kpis as AdminRevenueData['kpis']) ?? {
      grossBilled: 0,
      netCollected: 0,
      outstanding: 0,
      loanCommission: 0,
      gstCollected: 0,
      averageOrderValue: 0,
      collectionRate: 0,
      totalCases: 0
    },
    monthlyTrends: Array.isArray(record.monthlyTrends) ? record.monthlyTrends : [],
    serviceBreakdowns: Array.isArray(record.serviceBreakdowns) ? record.serviceBreakdowns : [],
    partnerBankCommissions: Array.isArray(record.partnerBankCommissions) ? record.partnerBankCommissions : [],
    transactions: Array.isArray(record.transactions) ? record.transactions : []
  };
}

export async function fetchAdminRevenue(financialYear: FinancialYear): Promise<AdminRevenueData> {
  try {
    if (import.meta.env.DEV && environment.demoAuthEnabled) {
      const { demoRevenueStore } = await import('../dev/demoRevenueStore');
      const data = await demoRevenueStore.fetch(financialYear);
      return parseRevenueData(data, financialYear);
    }
    const query = `?financialYear=${encodeURIComponent(financialYear)}`;
    const response = await apiClient.get<unknown>(`${API_ENDPOINTS.admin.revenue}${query}`);
    return parseRevenueData(response, financialYear);
  } catch (err) {
    throw err;
  }
}
