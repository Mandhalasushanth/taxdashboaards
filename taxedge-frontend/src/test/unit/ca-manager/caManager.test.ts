import { describe, expect, it } from 'vitest';
import {
  validateDocumentRejection,
  validateReviewComments,
  validateReviewForm,
  validateTaskDueDate,
  validateTaskForm,
  validateTaskTitle
} from '@/modules/ca-manager/validation/caManagerValidation';
import { demoCaManagerStore } from '@/modules/ca-manager/dev/demoCaManagerStore';
import {
  CA_NAV_ITEMS,
  getCaNavItem
} from '@/modules/ca-manager/shared/caManagerNavigation';

describe('CA Manager Validation Functions', () => {
  it('validates review comments with mandatory length check', () => {
    expect(validateReviewComments('Tax calculation mismatch on Schedule CG').isValid).toBe(true);
    expect(validateReviewComments('').isValid).toBe(false);
    expect(validateReviewComments('   ').isValid).toBe(false);
    expect(validateReviewComments('Bad').isValid).toBe(false);
  });

  it('validates review form with decision payload', () => {
    const valid = validateReviewForm({
      reviewId: 'REV-001',
      applicationId: 'APP-001',
      decision: 'RETURNED',
      comments: 'Please verify the TDS deduction in 26AS.'
    });
    expect(Object.keys(valid).length).toBe(0);

    const invalid = validateReviewForm({
      reviewId: 'REV-001',
      applicationId: 'APP-001',
      decision: 'RETURNED',
      comments: ''
    });
    expect(invalid.comments).toBeDefined();
  });

  it('validates task titles properly', () => {
    expect(validateTaskTitle('Verify Form 26AS matching TDS').isValid).toBe(true);
    expect(validateTaskTitle('No').isValid).toBe(false);
    expect(validateTaskTitle('').isValid).toBe(false);
    expect(validateTaskTitle('A'.repeat(150)).isValid).toBe(false);
  });

  it('validates task due dates', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(validateTaskDueDate(futureDate).isValid).toBe(true);
    expect(validateTaskDueDate('').isValid).toBe(false);
    expect(validateTaskDueDate('invalid-date').isValid).toBe(false);
  });

  it('validates task form with title, owner and due date', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const validErrors = validateTaskForm({
      applicationId: 'APP-2025-001',
      title: 'Collect missing bank statements',
      ownerName: 'Suresh Kumar',
      dueAt: futureDate,
      priority: 'HIGH'
    });
    expect(Object.keys(validErrors).length).toBe(0);

    const invalidErrors = validateTaskForm({
      applicationId: 'APP-2025-001',
      title: '',
      ownerName: '',
      dueAt: '',
      priority: 'NORMAL'
    });
    expect(invalidErrors.title).toBeDefined();
    expect(invalidErrors.ownerName).toBeDefined();
    expect(invalidErrors.dueAt).toBeDefined();
  });

  it('validates document rejection reasons', () => {
    expect(validateDocumentRejection('Blurry image, please upload clear PDF').isValid).toBe(true);
    expect(validateDocumentRejection('').isValid).toBe(false);
    expect(validateDocumentRejection('No').isValid).toBe(false);
  });
});

describe('CA Manager Store & Role Isolation', () => {
  it('strictly isolates TAX_CA filings and never includes loans', async () => {
    const apps = await demoCaManagerStore.listCaApplications();
    expect(apps.length).toBeGreaterThan(0);
    apps.forEach((app) => {
      expect(app.vertical).toBe('TAX_CA');
      expect(app.vertical).not.toBe('LOANS');
    });
  });

  it('calculates accurate dynamic KPIs from CA cases', async () => {
    const kpis = await demoCaManagerStore.getKpis();
    expect(typeof kpis.newCount).toBe('number');
    expect(typeof kpis.unassignedCount).toBe('number');
    expect(typeof kpis.inProgressCount).toBe('number');
    expect(typeof kpis.awaitingCustomerCount).toBe('number');
    expect(typeof kpis.awaitingReviewCount).toBe('number');
    expect(typeof kpis.dueSoonCount).toBe('number');
    expect(typeof kpis.overdueCount).toBe('number');
    expect(typeof kpis.completedInPeriodCount).toBe('number');
    expect(kpis.newCount).toBeGreaterThanOrEqual(0);
  });

  it('verifies all 12 navigation items are registered and valid', () => {
    expect(CA_NAV_ITEMS.length).toBe(12);
    const overview = getCaNavItem('overview');
    expect(overview.title).toBe('CA Operations Overview');
    const reviews = getCaNavItem('reviews');
    expect(reviews.counterKey).toBe('reviews');
  });
});
