import { describe, expect, it } from 'vitest';
import { buildDefaultSettings } from '@/modules/admin/components/settings/config/settingsSections';
import { addressFormat } from '@/modules/admin/validation/indianFormats';
import { CROSS_FIELD_RULES } from '@/modules/admin/validation/settingsCrossFieldRules';

const defaults = buildDefaultSettings();

function organizationErrors(overrides: Record<string, string>) {
  const values = {
    ...defaults.organization,
    entityType: 'LLP',
    pan: 'AAAFT1234F',
    gstin: '27AAAFT1234F1Z5',
    registrationNumber: 'AAB-1234',
    state: 'Maharashtra',
    ...overrides
  };
  return CROSS_FIELD_RULES.organization?.(values) ?? {};
}

describe('organization cross-field rules', () => {
  it('accepts a consistent LLP profile', () => {
    expect(organizationErrors({})).toEqual({});
  });

  it('requires the PAN holder type to match the constitution', () => {
    expect(organizationErrors({ pan: 'AAACT1234F', gstin: '27AAACT1234F1Z5' }).pan).toMatch(/a firm/);
    expect(
      organizationErrors({ entityType: 'PRIVATE_LIMITED', registrationNumber: 'U74999MH2021PTC355201', pan: 'AAACT1234F', gstin: '27AAACT1234F1Z5' })
    ).toEqual({});
  });

  it('requires the GSTIN state code to match the address state', () => {
    expect(organizationErrors({ state: 'Karnataka' }).gstin).toMatch(/not registered in Karnataka \(state code 29\)/);
  });

  it('matches the registration number to the constitution', () => {
    expect(organizationErrors({ registrationNumber: 'U74999MH2021PTC355201' }).registrationNumber).toMatch(/LLPIN/);
    expect(organizationErrors({ registrationNumber: '' }).registrationNumber).toMatch(/required/);
    expect(
      organizationErrors({ entityType: 'PARTNERSHIP', registrationNumber: 'AAB-1234' }).registrationNumber
    ).toMatch(/Leave CIN \/ LLPIN empty/);
    expect(
      organizationErrors({ entityType: 'PUBLIC_LIMITED', pan: 'AAACT1234F', gstin: '27AAACT1234F1Z5', registrationNumber: 'U74999MH2021PTC355201' })
        .registrationNumber
    ).toMatch(/PLC/);
  });
});

describe('billing cross-field rules', () => {
  const billing = (overrides: Record<string, string>) => CROSS_FIELD_RULES.billing?.({ ...defaults.billing, ...overrides }) ?? {};

  it('caps prefix plus number at 16 characters', () => {
    expect(billing({ invoicePrefix: 'TE/INV-', nextInvoiceNumber: '123456789' }).nextInvoiceNumber).toBeUndefined();
    expect(billing({ invoicePrefix: 'TAXEDGE/26', nextInvoiceNumber: '1234567' }).nextInvoiceNumber).toMatch(/16 characters/);
  });

  it('requires bank details to be all filled or all empty', () => {
    expect(billing({})).toEqual({});
    const errors = billing({ bankAccountNumber: '123456789012' });
    expect(Object.keys(errors).sort()).toEqual(['bankAccountName', 'ifsc']);
  });
});

describe('workflow and notification rules', () => {
  it('escalates before the shortest turnaround', () => {
    const errors = CROSS_FIELD_RULES.workflow?.({ ...defaults.workflow, caFilingSlaDays: '1', escalationThresholdHours: '24' }) ?? {};
    expect(errors.escalationThresholdHours).toMatch(/under 24 hours/);
  });

  it('needs a summary time only when the daily summary is on', () => {
    expect(CROSS_FIELD_RULES.notifications?.({ ...defaults.notifications, dailyDigestTime: '' }).dailyDigestTime).toBeDefined();
    expect(
      CROSS_FIELD_RULES.notifications?.({ ...defaults.notifications, dailyDigestEnabled: false, dailyDigestTime: '' })
    ).toEqual({});
  });
});

describe('address format', () => {
  it('accepts typical Indian addresses and rejects stray symbols', () => {
    expect(addressFormat('Flat 4B, Tower-2, Peninsula Park (Lower Parel)')).toBeNull();
    expect(addressFormat('Shop #12/3, M.G. Road')).toBeNull();
    expect(addressFormat('<script>')).not.toBeNull();
  });
});
