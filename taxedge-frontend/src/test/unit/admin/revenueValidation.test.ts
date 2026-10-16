import { describe, expect, it } from 'vitest';
import { demoRevenueStore } from '@/modules/admin/dev/demoRevenueStore';
import { PAYMENT_STATUSES, REVENUE_DIVISIONS } from '@/modules/admin/shared/revenue.types';

describe('admin revenue store & metrics', () => {
  it('returns valid revenue dataset for FY 2025-26', async () => {
    const data = await demoRevenueStore.fetch('2025-26');
    expect(data.financialYear).toBe('2025-26');
    expect(data.kpis.grossBilled).toBeGreaterThan(0);
    expect(data.kpis.netCollected).toBeGreaterThan(0);
    expect(data.kpis.collectionRate).toBeGreaterThan(0);
    expect(data.monthlyTrends.length).toBe(12);
    expect(data.serviceBreakdowns.length).toBeGreaterThan(0);
    expect(data.partnerBankCommissions.length).toBeGreaterThan(0);
    expect(data.transactions.length).toBeGreaterThan(0);
  });

  it('scales values for earlier financial years', async () => {
    const curr = await demoRevenueStore.fetch('2025-26');
    const prev = await demoRevenueStore.fetch('2024-25');
    expect(prev.kpis.grossBilled).toBeLessThan(curr.kpis.grossBilled);
    expect(prev.kpis.netCollected).toBeLessThan(curr.kpis.netCollected);
  });

  it('verifies all transactions adhere to payment statuses and division boundaries', async () => {
    const data = await demoRevenueStore.fetch('2025-26');
    data.transactions.forEach((tx) => {
      try {
        expect(PAYMENT_STATUSES).toContain(tx.status);
        expect(REVENUE_DIVISIONS).toContain(tx.division);
        expect(tx.totalAmount).toBe(tx.baseAmount + tx.gstAmount);
        expect(tx.invoiceNumber).toMatch(/^TE\//);
        expect(tx.sacCode).toMatch(/^\d{6}$/);
      } catch (err) {
        throw new Error(`Validation failed for transaction ${tx.id}: ${(err as Error).message}`);
      }
    });
  });

  it('verifies partner bank commission calculation logic', async () => {
    const data = await demoRevenueStore.fetch('2025-26');
    data.partnerBankCommissions.forEach((bank) => {
      try {
        expect(bank.disbursedVolume).toBeGreaterThan(0);
        expect(bank.commissionEarned).toBeGreaterThan(0);
        expect(bank.avgCommissionRate).toBeGreaterThan(0);
        const expectedCommission = Math.round((bank.disbursedVolume * bank.avgCommissionRate) / 100);
        expect(Math.abs(bank.commissionEarned - expectedCommission)).toBeLessThan(bank.disbursedVolume * 0.01);
      } catch (err) {
        throw new Error(`Commission verification failed for ${bank.bankName}: ${(err as Error).message}`);
      }
    });
  });
});
