import { GST_REGISTRATION_FIELDS } from '../shared/gstRegistrationForm';

/**
 * Turns the backend's GST registration record (the same DTO the mobile app saves, see
 * mobile-app/src/modules/gst/gst-registration/utils/gstRegistrationMapper.ts) into the case details the
 * dashboard shows. Field ids already equal the DTO keys; only enum codes become the app's labels.
 */
export type GstRegistrationDto = Readonly<Record<string, string | boolean | null | undefined>>;

const CODE_LABELS: Readonly<Record<string, Readonly<Record<string, string>>>> = Object.freeze({
  constitutionOfBusiness: {
    PROPRIETORSHIP: 'Proprietorship',
    PARTNERSHIP: 'Partnership Firm',
    LLP: 'Limited Liability Partnership (LLP)',
    PRIVATE_LIMITED_COMPANY: 'Private Limited Company',
    PUBLIC_LIMITED_COMPANY: 'Public Limited Company',
    HUF: 'HUF',
    SOCIETY_TRUST_CLUB: 'Society / Trust / Club',
    AOP_BOI: 'AOP / BOI',
    GOVERNMENT_DEPARTMENT: 'Government Department',
    FOREIGN_COMPANY: 'Foreign Company',
    ONE_PERSON_COMPANY: 'One Person Company (OPC)'
  },
  natureOfBusiness: {
    TRADER: 'Trader',
    MANUFACTURER: 'Manufacturer',
    SERVICE_PROVIDER: 'Service Provider',
    RETAILER: 'Retailer',
    E_COMMERCE: 'E-commerce',
    WORK_CONTRACT: 'Contractor / Freelancer',
    IMPORT_EXPORT: 'Exporter / Importer',
    WARE_HOUSE_DEPOT: 'Wholesaler / Distributor'
  },
  reasonForRegistration: {
    CROSSED_TURN_OVER_THRESHOLD: 'Crossed turnover threshold',
    VOLUNTARY_REGISTRATION: 'Voluntary registration',
    INTER_STATE_SUPPLY: 'Inter-state supply',
    ECOMMERCE_OPERATOR_SELLER: 'E-commerce operator / seller',
    CASUAL_TAXABLE_PERSON: 'Casual taxable person',
    INPUT_SERVICE_DISTRIBUTOR: 'Input Service Distributor'
  },
  compositionScheme: { YES_COMPOSITION_SCHEME: 'Yes - composition scheme', NO_REGULAR_SCHEME: 'No - regular scheme' },
  placeOfBusiness: { PRINCIPAL_PLACE_OF_BUSINESS: 'Principal place of business', ADDITIONAL_PLACE_OF_BUSINESS: 'Additional place of business' },
  accountType: { CURRENT: 'Current', SAVINGS: 'Savings', CASH_CREDIT_OD: 'Cash Credit / OD' }
});

/** Dates arrive as YYYY-MM-DD; DD-MM-YYYY (the app's display form) is turned around. */
const toIsoDate = (value: string): string => {
  const match = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
};

const toText = (value: string | boolean | null | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'Given' : 'Not given';
  }
  return (value ?? '').toString().trim();
};

const toDetail = (dto: GstRegistrationDto, id: string, rule: string): string => {
  const raw = toText(dto[id]);
  const label = CODE_LABELS[id]?.[raw.toUpperCase()];
  if (label) {
    return label;
  }
  return rule === 'date' ? toIsoDate(raw) : raw;
};

export function gstRegistrationDetails(dto: GstRegistrationDto): Record<string, string> {
  return Object.fromEntries(GST_REGISTRATION_FIELDS.map((field) => [field.id, toDetail(dto, field.id, field.rule)]));
}
