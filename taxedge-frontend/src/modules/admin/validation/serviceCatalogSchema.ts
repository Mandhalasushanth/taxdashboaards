import { ApiError } from '@/core/api';
import { SERVICE_KINDS, getServiceDefinition, requiredDocumentsFor, type ServiceKind } from '@/modules/workflow';
import { GST_RATES, type CatalogService, type CatalogServiceUpdate, type FeeModel, type GstRate } from '../shared/serviceCatalog.types';

export const CATALOG_LIMITS = Object.freeze({
  nameMin: 3,
  nameMax: 80,
  descriptionMax: 300,
  maxFixedFee: 10_000_000,
  maxPercentage: 10,
  slaMin: 1,
  slaMax: 90
});

type Raw = Record<string, unknown>;
const isObject = (value: unknown): value is Raw => typeof value === 'object' && value !== null;
const isKind = (value: unknown): value is ServiceKind => SERVICE_KINDS.includes(value as ServiceKind);
const isGstRate = (value: unknown): value is GstRate => GST_RATES.includes(value as GstRate);
const isFeeModel = (value: unknown): value is FeeModel => value === 'FIXED' || value === 'PERCENTAGE';
const numberOr = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/** Unknown services are dropped; team and documents always come from the service configuration. */
function parseService(value: unknown): CatalogService | null {
  if (!isObject(value) || !isKind(value.kind)) {
    return null;
  }
  const definition = getServiceDefinition(value.kind);
  return {
    kind: value.kind,
    name: typeof value.name === 'string' && value.name ? value.name : definition.label,
    description: typeof value.description === 'string' ? value.description : '',
    team: definition.team,
    feeModel: isFeeModel(value.feeModel) ? value.feeModel : 'FIXED',
    feeValue: numberOr(value.feeValue, 0),
    gstRate: isGstRate(value.gstRate) ? value.gstRate : 18,
    slaDays: numberOr(value.slaDays, definition.slaDays),
    requiredDocuments: requiredDocumentsFor(value.kind),
    active: value.active !== false,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null
  };
}

export function parseServiceCatalog(payload: unknown): CatalogService[] {
  const list = Array.isArray(payload) ? payload : isObject(payload) && Array.isArray(payload.items) ? payload.items : null;
  if (!list) {
    throw new ApiError('INVALID_RESPONSE', 'The server returned an invalid service catalog.');
  }
  return list.map(parseService).filter((entry): entry is CatalogService => entry !== null);
}

export function parseCatalogService(payload: unknown): CatalogService {
  const parsed = parseService(payload);
  if (!parsed) {
    throw new ApiError('INVALID_RESPONSE', 'The server returned an invalid service.');
  }
  return parsed;
}

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &()/,.'-]*$/;

/** Field id → message for every invalid field; empty means the update can be saved. */
export function validateCatalogUpdate(update: CatalogServiceUpdate): Record<string, string> {
  const name = update.name.trim();
  const fee = update.feeValue;
  const checks: readonly [string, string | null][] = [
    ['name', name.length < CATALOG_LIMITS.nameMin || name.length > CATALOG_LIMITS.nameMax ? `Use ${CATALOG_LIMITS.nameMin}–${CATALOG_LIMITS.nameMax} characters.` : null],
    ['name', name && !NAME_PATTERN.test(name) ? "Use letters, digits, spaces and & ( ) / , . ' - only." : null],
    ['description', update.description.trim().length > CATALOG_LIMITS.descriptionMax ? `Keep the description under ${CATALOG_LIMITS.descriptionMax} characters.` : null],
    [
      'feeValue',
      update.feeModel === 'FIXED'
        ? !Number.isInteger(fee) || fee < 0 || fee > CATALOG_LIMITS.maxFixedFee
          ? `Enter a whole rupee amount from 0 to ${CATALOG_LIMITS.maxFixedFee.toLocaleString('en-IN')}.`
          : null
        : !Number.isFinite(fee) || fee <= 0 || fee > CATALOG_LIMITS.maxPercentage || Math.round(fee * 100) !== fee * 100
          ? `Enter a percentage above 0 and up to ${CATALOG_LIMITS.maxPercentage}, with at most two decimals.`
          : null
    ],
    ['gstRate', isGstRate(update.gstRate) ? null : 'Choose a valid GST rate.'],
    ['slaDays', !Number.isInteger(update.slaDays) || update.slaDays < CATALOG_LIMITS.slaMin || update.slaDays > CATALOG_LIMITS.slaMax ? `Turnaround must be ${CATALOG_LIMITS.slaMin}–${CATALOG_LIMITS.slaMax} days.` : null]
  ];
  return checks.reduce<Record<string, string>>((errors, [field, message]) => (message && !errors[field] ? { ...errors, [field]: message } : errors), {});
}
