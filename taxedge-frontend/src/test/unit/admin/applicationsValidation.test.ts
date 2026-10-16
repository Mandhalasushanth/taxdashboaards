import { describe, expect, it } from 'vitest';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import {
  validateAssessmentYear,
  validateAuditNote,
  validateCustomerEmail,
  validateCustomerName,
  validateCustomerPan,
  validateCustomerPhone,
  validateLoanAmount,
  validateNewApplicationForm
} from '@/modules/admin/validation/applicationValidation';
import {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  APPLICATION_STATUSES,
  APPLICATION_VERTICALS
} from '@/modules/admin/shared/applications.types';

describe('application validation utilities', () => {
  it('validates customer names according to length and characters', () => {
    expect(validateCustomerName('Ramesh Kumar').isValid).toBe(true);
    expect(validateCustomerName('A').isValid).toBe(false);
    expect(validateCustomerName('').isValid).toBe(false);
    expect(validateCustomerName('User123!').isValid).toBe(false);
  });

  it('validates 10-character Indian PAN cards strictly', () => {
    expect(validateCustomerPan('ABCDE1234F').isValid).toBe(true);
    expect(validateCustomerPan('abcde1234f').isValid).toBe(true);
    expect(validateCustomerPan('12345ABCDE').isValid).toBe(false);
    expect(validateCustomerPan('ABCDE1234').isValid).toBe(false);
    expect(validateCustomerPan('').isValid).toBe(false);
  });

  it('validates Indian 10-digit mobile numbers starting with 6-9', () => {
    expect(validateCustomerPhone('9845012345').isValid).toBe(true);
    expect(validateCustomerPhone('8123456789').isValid).toBe(true);
    expect(validateCustomerPhone('7000123456').isValid).toBe(true);
    expect(validateCustomerPhone('6999888777').isValid).toBe(true);
    expect(validateCustomerPhone('5123456789').isValid).toBe(false);
    expect(validateCustomerPhone('984501234').isValid).toBe(false);
    expect(validateCustomerPhone('98450123456').isValid).toBe(false);
  });

  it('validates email addresses', () => {
    expect(validateCustomerEmail('ramesh@example.com').isValid).toBe(true);
    expect(validateCustomerEmail('invalid-email').isValid).toBe(false);
    expect(validateCustomerEmail('user@domain').isValid).toBe(false);
  });

  it('validates assessment year format YYYY-YY', () => {
    expect(validateAssessmentYear('2025-26').isValid).toBe(true);
    expect(validateAssessmentYear('2024-25').isValid).toBe(true);
    expect(validateAssessmentYear('2025').isValid).toBe(false);
    expect(validateAssessmentYear('25-26').isValid).toBe(false);
  });

  it('validates loan amounts within reasonable bounds', () => {
    expect(validateLoanAmount(500000).isValid).toBe(true);
    expect(validateLoanAmount(10000).isValid).toBe(false);
    expect(validateLoanAmount(-500).isValid).toBe(false);
    expect(validateLoanAmount(undefined).isValid).toBe(false);
  });

  it('validates audit notes', () => {
    expect(validateAuditNote('Case approved').isValid).toBe(true);
    expect(validateAuditNote('ok').isValid).toBe(false);
    expect(validateAuditNote('').isValid).toBe(false);
  });

  it('validates full application form', () => {
    const validTaxForm = {
      customerName: 'Sanjay Dutt',
      customerEmail: 'sanjay@example.com',
      customerPhone: '9845012345',
      customerPan: 'ABCDE1234F',
      residentStatus: 'RESIDENT' as const,
      state: 'Karnataka',
      city: 'Bengaluru',
      vertical: 'TAX_CA' as const,
      service: 'ITR_1_SALARY' as const,
      assessmentYear: '2025-26',
      priority: 'NORMAL' as const
    };
    expect(Object.keys(validateNewApplicationForm(validTaxForm)).length).toBe(0);

    const invalidForm = {
      ...validTaxForm,
      customerPhone: '12345',
      customerPan: 'INVALID'
    };
    const errors = validateNewApplicationForm(invalidForm);
    expect(errors.customerPhone).toBeDefined();
    expect(errors.customerPan).toBeDefined();
  });
});

describe('demo applications store & data integrity', () => {
  it('loads initial applications adhering to domain constraints', async () => {
    const apps = await demoApplicationsStore.list();
    expect(apps.length).toBeGreaterThan(0);

    apps.forEach((app) => {
      try {
        expect(APPLICATION_VERTICALS).toContain(app.vertical);
        expect(APPLICATION_STATUSES).toContain(app.status);
        expect(APPLICATION_PRIORITIES).toContain(app.priority);
        expect(APPLICATION_SERVICES.some((s) => s.id === app.service)).toBe(true);
        expect(app.customer.pan).toMatch(/^[A-Z]{5}[0-9]{4}[A-Z]$/);
        expect(app.customer.phone).toMatch(/^[6-9]\d{9}$/);
      } catch (err) {
        throw new Error(`Integrity check failed for ${app.id}: ${(err as Error).message}`);
      }
    });
  });

  it('computes accurate KPI summaries', async () => {
    const apps = await demoApplicationsStore.list();
    const kpis = demoApplicationsStore.computeKpis(apps);

    expect(kpis.totalCount).toBe(apps.length);
    expect(kpis.newCount).toBe(apps.filter((a) => a.status === 'NEW').length);
    expect(kpis.completedCount).toBe(apps.filter((a) => a.status === 'COMPLETED').length);
  });

  it('supports creating and updating applications', async () => {
    const initialApps = await demoApplicationsStore.list();
    const newApp = await demoApplicationsStore.create({
      customerName: 'Ananya Roy',
      customerEmail: 'ananya.roy@example.com',
      customerPhone: '9988776655',
      customerPan: 'BNMPR5566T',
      residentStatus: 'RESIDENT',
      state: 'West Bengal',
      city: 'Kolkata',
      vertical: 'TAX_CA',
      service: 'ITR_2_CAP_GAINS',
      assessmentYear: '2025-26',
      priority: 'HIGH',
      internalNotes: 'Client has equity mutual fund switch transactions'
    });

    expect(newApp.id).toMatch(/^APP-2025-/);
    expect(newApp.customer.name).toBe('Ananya Roy');

    const updated = await demoApplicationsStore.updateStatus({
      applicationId: newApp.id,
      nextStatus: 'UNDER_REVIEW',
      note: 'Supervisor took up the file'
    });

    expect(updated.status).toBe('UNDER_REVIEW');
    expect(updated.timeline[0].stage).toBe('UNDER_REVIEW');
    expect(updated.timeline[0].title).toContain('UNDER REVIEW');

    const finalApps = await demoApplicationsStore.list();
    expect(finalApps.length).toBe(initialApps.length + 1);
  });
});
