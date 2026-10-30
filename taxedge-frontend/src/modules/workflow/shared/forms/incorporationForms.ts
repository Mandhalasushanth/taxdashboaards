import type { IntakeField } from '../workflowServices';
import {
  INDIAN_STATES,
  address,
  amount,
  choice,
  count,
  documents,
  email,
  group,
  mobile,
  name,
  note,
  optional,
  pan,
  pinCode
} from './formBuilders';

/**
 * Company Registration exactly as the mobile wizard collects it (mobile-app/src/modules/company-registration):
 * the CompanyDetails record plus the directors list. Directors use indexed ids ("directors.0.name") so the
 * backend's array maps one to one; the first two are shown because a private company needs at least two.
 */

const director = (index: number, required: boolean): IntakeField[] => {
  const prefix = `directors.${index}`;
  const specs = [
    name(`${prefix}.name`, 'Full Name'),
    pan(`${prefix}.pan`, 'PAN'),
    email(`${prefix}.email`, 'Email'),
    optional(mobile(`${prefix}.phone`, 'Mobile')),
    optional(note(`${prefix}.din`, 'DIN (if allotted)')),
    optional(name(`${prefix}.designation`, 'Designation', '', 50))
  ];
  return group(`Director ${index + 1}`, required ? specs : specs.map(optional));
};

export const COMPANY_REGISTRATION_FORM = Object.freeze({
  fields: [
    ...group('Company Type & Classification', [
      choice('companyType', 'Company Type', [
        'Private Limited',
        'One Person Company (OPC)',
        'Section 8 (NGO)',
        'Public Limited',
        'Limited Liability Partnership (LLP)',
        'Sole Proprietorship'
      ]),
      choice('companyClass', 'Class of Company', ['Private', 'Public']),
      choice('companyCategory', 'Category', ['Company limited by Shares', 'Company limited by Guarantee', 'Unlimited Company']),
      choice('companySubCategory', 'Sub-category', ['Indian Non-Government Company', 'State Government Company', 'Central Government Company']),
      optional(name('industryCategory', 'Industry Category')),
      note('primaryActivity', 'Primary Business Activity'),
      { id: 'nicCode', label: 'NIC Code', rule: 'count', kind: 'number', inputMode: 'numeric', min: 1000, max: 99999, maxLength: 5, placeholder: 'e.g. 62011' },
      optional(note('secondaryActivity', 'Secondary Activity')),
      optional(note('businessActivityDescription', 'Business Activity Description'))
    ]),
    ...group('Proposed Names', [
      name('proposedName1', 'Proposed Name 1'),
      name('proposedName2', 'Proposed Name 2'),
      optional(name('proposedName3', 'Proposed Name 3')),
      name('nameSuffix', 'Name Suffix', 'e.g. Private Limited', 40)
    ]),
    ...group('Registered Office', [
      address('registeredAddressLine', 'Registered Address'),
      name('registeredCity', 'City', '', 50),
      optional(name('registeredDistrict', 'District', '', 50)),
      choice('registeredState', 'State / UT', INDIAN_STATES),
      pinCode('registeredPincode'),
      choice('premisesOwnership', 'Premises', ['Rented', 'Owned', 'Leased']),
      email('companyEmail', 'Company Email'),
      mobile('companyMobile', 'Company Mobile')
    ]),
    ...group('Share Capital', [
      amount('authorizedCapital', 'Authorised Capital (₹)', 'e.g. 100000'),
      amount('paidUpCapital', 'Paid-up Capital (₹)', 'e.g. 100000'),
      count('numberOfShares', 'Number of Shares', 1, 100_000_000),
      amount('faceValuePerShare', 'Face Value per Share (₹)', 'e.g. 10')
    ]),
    ...director(0, true),
    ...director(1, false)
  ],
  documents: documents(
    [
      'Promoter PAN Card',
      'Promoter Aadhaar / Passport',
      'Registered Office Ownership / Lease Proof',
      'Registered Office Utility Bill (Electricity/Water)',
      'Property Owner No Objection Certificate (NOC)'
    ],
    ['Promoter Passport Photo', 'Draft e-MoA (Memorandum of Association)', 'Draft e-AoA (Articles of Association)']
  )
});
