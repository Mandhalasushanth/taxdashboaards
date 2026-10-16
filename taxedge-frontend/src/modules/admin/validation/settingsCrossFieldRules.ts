import { GST_STATE_CODES } from '../shared/indianStates';
import type { SectionErrors, SectionValues, SettingsSectionId } from '../shared/settings.types';

/** Rules that compare fields within one settings section. Each returns errors keyed by the field to highlight. */
type CrossFieldRule = (values: SectionValues) => SectionErrors;

/** GST rules cap an invoice number at 16 characters. */
const MAX_INVOICE_NUMBER_LENGTH = 16;

/** 4th character of a PAN identifies the holder type. */
const PAN_HOLDER_TYPE_BY_ENTITY: Readonly<Record<string, { code: string; label: string }>> = Object.freeze({
  PROPRIETORSHIP: { code: 'P', label: 'an individual (4th character P)' },
  PARTNERSHIP: { code: 'F', label: 'a firm (4th character F)' },
  LLP: { code: 'F', label: 'a firm (4th character F)' },
  PRIVATE_LIMITED: { code: 'C', label: 'a company (4th character C)' },
  PUBLIC_LIMITED: { code: 'C', label: 'a company (4th character C)' }
});

/** Which registration number each constitution should carry. */
const REGISTRATION_RULE_BY_ENTITY: Readonly<Record<string, { pattern: RegExp | null; message: string }>> = Object.freeze({
  PROPRIETORSHIP: { pattern: null, message: 'Leave CIN / LLPIN empty for a proprietorship.' },
  PARTNERSHIP: { pattern: null, message: 'Leave CIN / LLPIN empty for a partnership firm.' },
  LLP: { pattern: /^[A-Z]{3}-\d{4}$/, message: 'An LLP must use its LLPIN, e.g. AAB-1234.' },
  PRIVATE_LIMITED: { pattern: /^U.{11}(PTC|OPC)/, message: 'A private company CIN starts with U and contains PTC (or OPC).' },
  PUBLIC_LIMITED: { pattern: /^[LU].{11}PLC/, message: 'A public company CIN contains PLC.' }
});

function text(values: SectionValues, key: string): string {
  const value = values[key];
  return typeof value === 'string' ? value.trim() : '';
}

/** Merges rule results; earlier rules win when two flag the same field. */
function combine(...results: readonly SectionErrors[]): SectionErrors {
  return results.reduceRight<SectionErrors>((merged, result) => ({ ...merged, ...result }), {});
}

const organizationRules: CrossFieldRule = (values): SectionErrors => {
  const pan = text(values, 'pan');
  const gstin = text(values, 'gstin');
  const entity = text(values, 'entityType');
  const state = text(values, 'state');
  const registration = text(values, 'registrationNumber');
  const holder = PAN_HOLDER_TYPE_BY_ENTITY[entity];
  const registrationRule = REGISTRATION_RULE_BY_ENTITY[entity];
  const stateCode = GST_STATE_CODES[state];

  return combine(
    pan && gstin && gstin.slice(2, 12) !== pan ? { gstin: 'GSTIN characters 3–12 must match the firm PAN.' } : {},
    gstin && stateCode && gstin.slice(0, 2) !== stateCode
      ? { gstin: `This GSTIN is not registered in ${state} (state code ${stateCode}).` }
      : {},
    pan.length === 10 && holder && pan.charAt(3) !== holder.code ? { pan: `PAN must belong to ${holder.label}.` } : {},
    registration && registrationRule && !(registrationRule.pattern?.test(registration) ?? false)
      ? { registrationNumber: registrationRule.message }
      : {},
    !registration && registrationRule?.pattern ? { registrationNumber: 'CIN / LLPIN is required for this constitution.' } : {}
  );
};

const billingRules: CrossFieldRule = (values): SectionErrors => {
  const prefix = text(values, 'invoicePrefix');
  const next = text(values, 'nextInvoiceNumber');
  const bankFields = ['bankAccountName', 'bankAccountNumber', 'ifsc'];
  const filledBankFields = bankFields.filter((key) => text(values, key) !== '');
  const missingBankFields = filledBankFields.length > 0 ? bankFields.filter((key) => text(values, key) === '') : [];

  return combine(
    prefix.length + next.length > MAX_INVOICE_NUMBER_LENGTH
      ? { nextInvoiceNumber: `Prefix plus number must fit in ${MAX_INVOICE_NUMBER_LENGTH} characters (GST rule).` }
      : {},
    Object.fromEntries(missingBankFields.map((key) => [key, 'Complete all bank details, or leave all three empty.']))
  );
};

const securityRules: CrossFieldRule = (values): SectionErrors => {
  const expiry = Number(text(values, 'passwordExpiryDays'));
  return expiry > 0 && expiry < 30 ? { passwordExpiryDays: 'Use 0 (never) or at least 30 days.' } : {};
};

const workflowRules: CrossFieldRule = (values): SectionErrors => {
  const escalationHours = Number(text(values, 'escalationThresholdHours'));
  const shortestSlaHours = Math.min(Number(text(values, 'caFilingSlaDays')), Number(text(values, 'loanProcessingSlaDays'))) * 24;
  return Number.isFinite(shortestSlaHours) && shortestSlaHours > 0 && escalationHours >= shortestSlaHours
    ? { escalationThresholdHours: `Escalate before the shortest turnaround (under ${shortestSlaHours} hours).` }
    : {};
};

const notificationRules: CrossFieldRule = (values): SectionErrors =>
  values.dailyDigestEnabled === true && text(values, 'dailyDigestTime') === ''
    ? { dailyDigestTime: 'Choose when the daily summary is sent.' }
    : {};

export const CROSS_FIELD_RULES: Readonly<Partial<Record<SettingsSectionId, CrossFieldRule>>> = Object.freeze({
  organization: organizationRules,
  billing: billingRules,
  security: securityRules,
  workflow: workflowRules,
  notifications: notificationRules
});
