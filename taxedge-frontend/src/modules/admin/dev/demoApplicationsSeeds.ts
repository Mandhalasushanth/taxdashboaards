import type { ApplicationItem } from '../shared/applications.types';

const HOUR = 3_600_000;
const DAY = 86_400_000;

export function createInitialApplications(): ApplicationItem[] {
  const now = Date.now();

  return [
    {
      id: 'APP-2025-0101',
      vertical: 'TAX_CA',
      service: 'ITR_2_CAP_GAINS',
      serviceName: 'ITR-2 (Capital Gains & Multiple Properties)',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      customer: {
        name: 'Arjun Nambiar',
        email: 'arjun.nambiar@gmail.com',
        phone: '9845012345',
        pan: 'ABCPA1234F',
        residentStatus: 'RESIDENT',
        state: 'Karnataka',
        city: 'Bengaluru'
      },
      status: 'QUERY_RAISED',
      priority: 'URGENT',
      managerId: 'MGR-101',
      managerName: 'Sanjay Verma',
      agentId: 'AGT-301',
      agentName: 'Suresh Kumar',
      slaHours: 48,
      createdAt: new Date(now - 38 * HOUR).toISOString(),
      updatedAt: new Date(now - 4 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-101', name: 'Form 16 Part A & B', category: 'Tax Form', status: 'VERIFIED', uploadedAt: new Date(now - 36 * HOUR).toISOString(), fileSize: '1.8 MB' },
        { id: 'DOC-102', name: 'Zerodha Capital Gains Report FY24-25', category: 'Broking Statement', status: 'REJECTED', uploadedAt: new Date(now - 36 * HOUR).toISOString(), fileSize: '840 KB', rejectionReason: 'Password protected PDF. Please upload an unprotected PDF or provide password.' },
        { id: 'DOC-103', name: 'AIS / TIS Consolidated Statement', category: 'Tax Credit', status: 'VERIFIED', uploadedAt: new Date(now - 35 * HOUR).toISOString(), fileSize: '2.4 MB' },
        { id: 'DOC-104', name: 'HDFC Savings Bank Statement (12M)', category: 'Banking', status: 'VERIFIED', uploadedAt: new Date(now - 36 * HOUR).toISOString(), fileSize: '4.1 MB' }
      ],
      timeline: [
        { id: 'TL-1', stage: 'NEW', title: 'Application Submitted', description: 'Client initiated ITR-2 assisted filing via portal.', timestamp: new Date(now - 38 * HOUR).toISOString(), actorName: 'Arjun Nambiar', actorRole: 'Customer' },
        { id: 'TL-2', stage: 'UNDER_REVIEW', title: 'Assigned to CA Team', description: 'Assigned to Manager Sanjay Verma and Executive Suresh Kumar.', timestamp: new Date(now - 32 * HOUR).toISOString(), actorName: 'System Dispatcher', actorRole: 'System' },
        { id: 'TL-3', stage: 'QUERY_RAISED', title: 'Document Password Query Raised', description: 'Zerodha Capital gains sheet cannot be opened due to encryption password.', timestamp: new Date(now - 4 * HOUR).toISOString(), actorName: 'Suresh Kumar', actorRole: 'CA Executive' }
      ],
      queries: [
        { id: 'QRY-1', senderName: 'Suresh Kumar (CA Agent)', senderRole: 'CA_AGENT', message: 'Hello Arjun, your Zerodha Capital Gains statement is password encrypted. Could you share your registered PAN or provide an unlocked PDF copy?', timestamp: new Date(now - 4 * HOUR).toISOString(), status: 'OPEN' }
      ],
      internalNotes: 'Client traded heavily in equity intraday (F&O section) and long-term equity mutual funds. Needs turnover calculation under Sec 44AB threshold.'
    },
    {
      id: 'APP-2025-0102',
      vertical: 'TAX_CA',
      service: 'ITR_1_SALARY',
      serviceName: 'ITR-1 (Salaried / Form 16)',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      customer: {
        name: 'Meera Krishnan',
        email: 'meera.krishnan@outlook.com',
        phone: '9711234567',
        pan: 'BGHPK9876E',
        residentStatus: 'RESIDENT',
        state: 'Tamil Nadu',
        city: 'Chennai'
      },
      status: 'READY_FOR_FILING',
      priority: 'NORMAL',
      managerId: 'MGR-101',
      managerName: 'Sanjay Verma',
      agentId: 'AGT-302',
      agentName: 'Priya Sharma',
      slaHours: 24,
      createdAt: new Date(now - 14 * HOUR).toISOString(),
      updatedAt: new Date(now - 1 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-201', name: 'Form 16 from Infosys Ltd', category: 'Tax Form', status: 'VERIFIED', uploadedAt: new Date(now - 14 * HOUR).toISOString(), fileSize: '2.1 MB' },
        { id: 'DOC-202', name: 'Form 26AS Tax Credit Statement', category: 'Tax Credit', status: 'VERIFIED', uploadedAt: new Date(now - 14 * HOUR).toISOString(), fileSize: '1.2 MB' },
        { id: 'DOC-203', name: 'Rent Receipts & Landlord PAN', category: 'Exemption Proof', status: 'VERIFIED', uploadedAt: new Date(now - 12 * HOUR).toISOString(), fileSize: '950 KB' }
      ],
      timeline: [
        { id: 'TL-201', stage: 'NEW', title: 'Case Received', description: 'ITR-1 intake form submitted by client.', timestamp: new Date(now - 14 * HOUR).toISOString(), actorName: 'Meera Krishnan', actorRole: 'Customer' },
        { id: 'TL-202', stage: 'IN_PROGRESS', title: 'Tax Computation Drafted', description: 'Old regime vs New regime comparison prepared. Net refund calculated at ₹14,280.', timestamp: new Date(now - 5 * HOUR).toISOString(), actorName: 'Priya Sharma', actorRole: 'CA Executive' },
        { id: 'TL-203', stage: 'READY_FOR_FILING', title: 'Client Approved Draft', description: 'Client approved draft computation via OTP confirmation.', timestamp: new Date(now - 1 * HOUR).toISOString(), actorName: 'Meera Krishnan', actorRole: 'Customer' }
      ],
      queries: [],
      internalNotes: 'HRA claimed ₹1,80,000 against PAN of landlord. All deductions reconciled against AIS.'
    },
    {
      id: 'APP-2025-0103',
      vertical: 'TAX_CA',
      service: 'NRI_TAX_COMPLIANCE',
      serviceName: 'NRI Global Income & DTAA Exemption',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      customer: {
        name: 'Vikramaditya Rao',
        email: 'vikram.rao@singtel.com',
        phone: '9988776655',
        pan: 'CDXPR4567M',
        residentStatus: 'NRI',
        state: 'Telangana',
        city: 'Hyderabad'
      },
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      managerId: 'MGR-102',
      managerName: 'Neha Kulkarni',
      agentId: 'AGT-303',
      agentName: 'Imran Qureshi',
      slaHours: 48,
      createdAt: new Date(now - 28 * HOUR).toISOString(),
      updatedAt: new Date(now - 2 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-301', name: 'NRO & NRE Account Statements', category: 'Banking', status: 'VERIFIED', uploadedAt: new Date(now - 27 * HOUR).toISOString(), fileSize: '5.2 MB' },
        { id: 'DOC-302', name: 'Form 10F (DTAA Exemption Certificate)', category: 'Treaty Document', status: 'VERIFIED', uploadedAt: new Date(now - 26 * HOUR).toISOString(), fileSize: '1.1 MB' },
        { id: 'DOC-303', name: 'Singapore Inland Revenue Tax Return', category: 'Foreign Proof', status: 'PENDING', uploadedAt: new Date(now - 10 * HOUR).toISOString(), fileSize: '3.4 MB' }
      ],
      timeline: [
        { id: 'TL-301', stage: 'NEW', title: 'NRI Portal Booking', description: 'Remittance from India sale of Hyderabad ancestral flat.', timestamp: new Date(now - 28 * HOUR).toISOString(), actorName: 'Vikramaditya Rao', actorRole: 'Customer' },
        { id: 'TL-302', stage: 'IN_PROGRESS', title: 'FEMA & 15CA/CB Verification', description: 'Chartered Accountant Imran verifying Section 195 withholding.', timestamp: new Date(now - 2 * HOUR).toISOString(), actorName: 'Imran Qureshi', actorRole: 'CA Executive' }
      ],
      queries: [],
      internalNotes: 'Sale of residential property for ₹1.45 Cr with TDS u/s 195 deducted at 20% + surcharge. Preparing Lower Deduction Certificate application.'
    },
    {
      id: 'APP-2025-0104',
      vertical: 'LOANS',
      service: 'HOME_LOAN',
      serviceName: 'Home Loan Facilitation (Purchase/Transfer)',
      requestedAmount: 7500000,
      targetLender: 'HDFC Bank',
      customer: {
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@gmail.com',
        phone: '9820011223',
        pan: 'DKRPD5432B',
        residentStatus: 'RESIDENT',
        state: 'Maharashtra',
        city: 'Mumbai'
      },
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      managerId: 'MGR-201',
      managerName: 'Ananya Deshmukh',
      agentId: 'AGT-401',
      agentName: 'Rajesh Patel',
      slaHours: 72,
      createdAt: new Date(now - 44 * HOUR).toISOString(),
      updatedAt: new Date(now - 6 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-401', name: '3 Years ITR with Computation Sheet', category: 'Income Proof', status: 'VERIFIED', uploadedAt: new Date(now - 42 * HOUR).toISOString(), fileSize: '4.8 MB' },
        { id: 'DOC-402', name: 'Salary Slips (Last 6 Months)', category: 'Income Proof', status: 'VERIFIED', uploadedAt: new Date(now - 42 * HOUR).toISOString(), fileSize: '2.9 MB' },
        { id: 'DOC-403', name: 'Builder Allotment Letter & Agreement', category: 'Property Docs', status: 'VERIFIED', uploadedAt: new Date(now - 30 * HOUR).toISOString(), fileSize: '8.5 MB' },
        { id: 'DOC-404', name: 'CIBIL Credit Score Report (784)', category: 'Credit Report', status: 'VERIFIED', uploadedAt: new Date(now - 40 * HOUR).toISOString(), fileSize: '650 KB' }
      ],
      timeline: [
        { id: 'TL-401', stage: 'NEW', title: 'Home Loan Application Logged', description: '₹75 Lakhs requested for apartment in Thane West.', timestamp: new Date(now - 44 * HOUR).toISOString(), actorName: 'Rohan Deshmukh', actorRole: 'Customer' },
        { id: 'TL-402', stage: 'IN_PROGRESS', title: 'Lender Docket Submitted', description: 'Application file submitted to HDFC Bank Retail Lending desk.', timestamp: new Date(now - 6 * HOUR).toISOString(), actorName: 'Rajesh Patel', actorRole: 'Loan Executive' }
      ],
      queries: [],
      internalNotes: 'FOIR is 42%. Customer salary is ₹2.1 L/month in Tata Consultancy Services. Legal search report clear.'
    },
    {
      id: 'APP-2025-0105',
      vertical: 'LOANS',
      service: 'BUSINESS_MSME_LOAN',
      serviceName: 'Unsecured MSME Business Loan & CC/OD',
      requestedAmount: 3500000,
      targetLender: 'ICICI Bank',
      customer: {
        name: 'Sunil Agarwal',
        email: 'sunil@agarwaltextiles.in',
        phone: '9833019876',
        pan: 'AAMFA1122D',
        residentStatus: 'RESIDENT',
        state: 'Gujarat',
        city: 'Surat'
      },
      status: 'UNDER_REVIEW',
      priority: 'NORMAL',
      managerId: 'MGR-201',
      managerName: 'Ananya Deshmukh',
      agentId: 'AGT-402',
      agentName: 'Kavita Iyer',
      slaHours: 48,
      createdAt: new Date(now - 20 * HOUR).toISOString(),
      updatedAt: new Date(now - 12 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-501', name: '12 Months GST Returns (GSTR-3B)', category: 'GST Records', status: 'VERIFIED', uploadedAt: new Date(now - 19 * HOUR).toISOString(), fileSize: '6.2 MB' },
        { id: 'DOC-502', name: 'Audited Financial Statements FY24', category: 'Financials', status: 'PENDING', uploadedAt: new Date(now - 19 * HOUR).toISOString(), fileSize: '5.1 MB' },
        { id: 'DOC-503', name: 'Current Account Bank Statement', category: 'Banking', status: 'VERIFIED', uploadedAt: new Date(now - 18 * HOUR).toISOString(), fileSize: '7.4 MB' }
      ],
      timeline: [
        { id: 'TL-501', stage: 'NEW', title: 'MSME Loan Application Created', description: 'Requested working capital enhancement of ₹35 Lakhs.', timestamp: new Date(now - 20 * HOUR).toISOString(), actorName: 'Sunil Agarwal', actorRole: 'Customer' },
        { id: 'TL-502', stage: 'UNDER_REVIEW', title: 'Financial Underwriting', description: 'Bank statements imported into Perfios banking analytics.', timestamp: new Date(now - 12 * HOUR).toISOString(), actorName: 'Kavita Iyer', actorRole: 'Loan Executive' }
      ],
      queries: [],
      internalNotes: 'Annual GST turnover is ₹3.2 Cr. Steady monthly credits averaging ₹28 Lakhs.'
    },
    {
      id: 'APP-2025-0106',
      vertical: 'TAX_CA',
      service: 'NOTICE_RESOLUTION',
      serviceName: 'Income Tax Notice Response (139(9)/143(1))',
      assessmentYear: '2024-25',
      financialYear: '2023-24',
      customer: {
        name: 'Dr. Shalini Gupta',
        email: 'shalini.gupta@medivault.org',
        phone: '9910088776',
        pan: 'AFGPG3344C',
        residentStatus: 'RESIDENT',
        state: 'Delhi',
        city: 'New Delhi'
      },
      status: 'COMPLETED',
      priority: 'HIGH',
      managerId: 'MGR-101',
      managerName: 'Sanjay Verma',
      agentId: 'AGT-301',
      agentName: 'Suresh Kumar',
      slaHours: 24,
      createdAt: new Date(now - 4 * DAY).toISOString(),
      updatedAt: new Date(now - 1 * DAY).toISOString(),
      filingAckNumber: 'ITD-RECT-2024-8839219',
      documents: [
        { id: 'DOC-601', name: 'Section 143(1)(a) Demand Notice PDF', category: 'IT Notice', status: 'VERIFIED', uploadedAt: new Date(now - 4 * DAY).toISOString(), fileSize: '1.2 MB' },
        { id: 'DOC-602', name: 'Form 16A Hospital TDS Certificates', category: 'Tax Credit', status: 'VERIFIED', uploadedAt: new Date(now - 4 * DAY).toISOString(), fileSize: '2.5 MB' },
        { id: 'DOC-603', name: 'Rectification Filing Acknowledgment', category: 'Filing Receipt', status: 'VERIFIED', uploadedAt: new Date(now - 1 * DAY).toISOString(), fileSize: '480 KB' }
      ],
      timeline: [
        { id: 'TL-601', stage: 'NEW', title: 'Notice Uploaded', description: 'Demand of ₹38,400 received due to TDS mismatch in 26AS.', timestamp: new Date(now - 4 * DAY).toISOString(), actorName: 'Dr. Shalini Gupta', actorRole: 'Customer' },
        { id: 'TL-602', stage: 'IN_PROGRESS', title: 'Rectification Prepared', description: 'Reconciliation u/s 154 prepared with hospital accounts department.', timestamp: new Date(now - 2 * DAY).toISOString(), actorName: 'Suresh Kumar', actorRole: 'CA Executive' },
        { id: 'TL-603', stage: 'COMPLETED', title: 'Rectification Accepted', description: 'Online rectification filed. Demand reduced to Nil.', timestamp: new Date(now - 1 * DAY).toISOString(), actorName: 'Suresh Kumar', actorRole: 'CA Executive' }
      ],
      queries: [],
      internalNotes: 'Hospital had initially uploaded revised 24Q late. Rectification submitted with updated TAN details.'
    },
    {
      id: 'APP-2025-0107',
      vertical: 'TAX_CA',
      service: 'GST_REG_FILING',
      serviceName: 'GST Monthly / Quarterly & LUT Filing',
      customer: {
        name: 'Karthik Somayaji',
        email: 'karthik@cloudscale.tech',
        phone: '9844099881',
        pan: 'AABCS9988K',
        residentStatus: 'RESIDENT',
        state: 'Karnataka',
        city: 'Bengaluru'
      },
      status: 'NEW',
      priority: 'NORMAL',
      managerId: null,
      managerName: null,
      agentId: null,
      agentName: null,
      slaHours: 48,
      createdAt: new Date(now - 3 * HOUR).toISOString(),
      updatedAt: new Date(now - 3 * HOUR).toISOString(),
      documents: [
        { id: 'DOC-701', name: 'Company Certificate of Incorporation', category: 'Entity KYC', status: 'PENDING', uploadedAt: new Date(now - 3 * HOUR).toISOString(), fileSize: '1.4 MB' },
        { id: 'DOC-702', name: 'Director PAN and Aadhaar copies', category: 'KYC', status: 'PENDING', uploadedAt: new Date(now - 3 * HOUR).toISOString(), fileSize: '2.1 MB' }
      ],
      timeline: [
        { id: 'TL-701', stage: 'NEW', title: 'New Application Submitted', description: 'SaaS startup seeking LUT for zero-rated IT software export.', timestamp: new Date(now - 3 * HOUR).toISOString(), actorName: 'Karthik Somayaji', actorRole: 'Customer' }
      ],
      queries: [],
      internalNotes: 'Direct export of software services to US clients without IGST payment under LUT.'
    }
  ];
}
