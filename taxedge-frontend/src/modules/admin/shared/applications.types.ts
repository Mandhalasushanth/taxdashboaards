export type ApplicationVertical = 'ALL' | 'TAX_CA' | 'LOANS';

export const APPLICATION_VERTICALS: readonly ApplicationVertical[] = Object.freeze([
  'ALL',
  'TAX_CA',
  'LOANS'
]);

export type ApplicationStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'QUERY_RAISED'
  | 'CLIENT_APPROVAL'
  | 'READY_FOR_FILING'
  | 'COMPLETED'
  | 'REJECTED';

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = Object.freeze([
  'NEW',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'QUERY_RAISED',
  'CLIENT_APPROVAL',
  'READY_FOR_FILING',
  'COMPLETED',
  'REJECTED'
]);

export const STATUS_LABELS: Readonly<Record<ApplicationStatus, string>> = Object.freeze({
  NEW: 'New / Unassigned',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  QUERY_RAISED: 'Action Required',
  CLIENT_APPROVAL: 'Client Approval',
  READY_FOR_FILING: 'Ready to File / Sanction',
  COMPLETED: 'Completed & Filed',
  REJECTED: 'Rejected / Cancelled'
});

export type ApplicationPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export const APPLICATION_PRIORITIES: readonly ApplicationPriority[] = Object.freeze([
  'NORMAL',
  'HIGH',
  'URGENT'
]);

export const PRIORITY_LABELS: Readonly<Record<ApplicationPriority, string>> = Object.freeze({
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent'
});

export type ApplicationService =
  | 'ITR_1_SALARY'
  | 'ITR_2_CAP_GAINS'
  | 'ITR_3_BUSINESS'
  | 'ITR_4_SUGAM'
  | 'NRI_TAX_COMPLIANCE'
  | 'GST_REG_FILING'
  | 'TDS_RETURNS'
  | 'NOTICE_RESOLUTION'
  | 'TAX_AUDIT_ROC'
  | 'HOME_LOAN'
  | 'LOAN_AGAINST_PROP'
  | 'BUSINESS_MSME_LOAN'
  | 'PERSONAL_PROF_LOAN';

export interface ServiceDefinition {
  readonly id: ApplicationService;
  readonly name: string;
  readonly vertical: 'TAX_CA' | 'LOANS';
  readonly code: string;
  readonly defaultSlaHours: number;
}

export const APPLICATION_SERVICES: readonly ServiceDefinition[] = Object.freeze([
  { id: 'ITR_1_SALARY', name: 'ITR-1 (Salaried / Form 16)', vertical: 'TAX_CA', code: 'ITR-1', defaultSlaHours: 24 },
  { id: 'ITR_2_CAP_GAINS', name: 'ITR-2 (Capital Gains & Multiple Properties)', vertical: 'TAX_CA', code: 'ITR-2', defaultSlaHours: 48 },
  { id: 'ITR_3_BUSINESS', name: 'ITR-3 (Business & Professional Practice)', vertical: 'TAX_CA', code: 'ITR-3', defaultSlaHours: 72 },
  { id: 'ITR_4_SUGAM', name: 'ITR-4 Sugam (Presumptive Taxation 44AD/ADA)', vertical: 'TAX_CA', code: 'ITR-4', defaultSlaHours: 36 },
  { id: 'NRI_TAX_COMPLIANCE', name: 'NRI Global Income & DTAA Exemption', vertical: 'TAX_CA', code: 'NRI-TAX', defaultSlaHours: 48 },
  { id: 'GST_REG_FILING', name: 'GST Monthly / Quarterly & LUT Filing', vertical: 'TAX_CA', code: 'GST-COMP', defaultSlaHours: 48 },
  { id: 'TDS_RETURNS', name: 'TDS Quarterly Return & 16A Generation', vertical: 'TAX_CA', code: 'TDS-RET', defaultSlaHours: 48 },
  { id: 'NOTICE_RESOLUTION', name: 'Income Tax Notice Response (139(9)/143(1))', vertical: 'TAX_CA', code: 'IT-NOTICE', defaultSlaHours: 24 },
  { id: 'TAX_AUDIT_ROC', name: 'Tax Audit 44AB & ROC Annual Compliances', vertical: 'TAX_CA', code: 'TAX-AUDIT', defaultSlaHours: 96 },
  { id: 'HOME_LOAN', name: 'Home Loan Facilitation (Purchase/Transfer)', vertical: 'LOANS', code: 'HL-FACIL', defaultSlaHours: 72 },
  { id: 'LOAN_AGAINST_PROP', name: 'Loan Against Property (LAP Mortgage)', vertical: 'LOANS', code: 'LAP-MORT', defaultSlaHours: 96 },
  { id: 'BUSINESS_MSME_LOAN', name: 'Unsecured MSME Business Loan & CC/OD', vertical: 'LOANS', code: 'BIZ-LOAN', defaultSlaHours: 48 },
  { id: 'PERSONAL_PROF_LOAN', name: 'Professional Practice Credit Line (CA/Dr)', vertical: 'LOANS', code: 'PROF-LINE', defaultSlaHours: 24 }
]);

export type DocumentStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface DocumentItem {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: DocumentStatus;
  readonly uploadedAt: string;
  readonly fileSize: string;
  readonly rejectionReason?: string;
}

export interface TimelineStep {
  readonly id: string;
  readonly stage: ApplicationStatus;
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly actorName: string;
  readonly actorRole: string;
}

export interface ApplicationQuery {
  readonly id: string;
  readonly senderName: string;
  readonly senderRole: string;
  readonly message: string;
  readonly timestamp: string;
  readonly status: 'OPEN' | 'RESOLVED';
  readonly resolvedAt?: string;
}

export interface CustomerProfile {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly pan: string;
  readonly residentStatus: 'RESIDENT' | 'NRI';
  readonly state: string;
  readonly city: string;
}

export interface ApplicationItem {
  readonly id: string;
  readonly vertical: 'TAX_CA' | 'LOANS';
  readonly service: ApplicationService;
  readonly serviceName: string;
  readonly assessmentYear?: string;
  readonly financialYear?: string;
  readonly requestedAmount?: number;
  readonly targetLender?: string;
  readonly customer: CustomerProfile;
  readonly status: ApplicationStatus;
  readonly priority: ApplicationPriority;
  readonly managerId: string | null;
  readonly managerName: string | null;
  readonly agentId: string | null;
  readonly agentName: string | null;
  readonly slaHours: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly filingAckNumber?: string;
  readonly sanctionLetterNumber?: string;
  readonly documents: readonly DocumentItem[];
  readonly timeline: readonly TimelineStep[];
  readonly queries: readonly ApplicationQuery[];
  readonly internalNotes: string;
}

export interface ApplicationsKpiSummary {
  readonly totalCount: number;
  readonly newCount: number;
  readonly inProgressCount: number;
  readonly queriesRaisedCount: number;
  readonly readyCount: number;
  readonly completedCount: number;
  readonly slaAtRiskCount: number;
}

export interface NewApplicationInput {
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerPhone: string;
  readonly customerPan: string;
  readonly residentStatus: 'RESIDENT' | 'NRI';
  readonly state: string;
  readonly city: string;
  readonly vertical: 'TAX_CA' | 'LOANS';
  readonly service: ApplicationService;
  readonly assessmentYear?: string;
  readonly financialYear?: string;
  readonly requestedAmount?: number;
  readonly targetLender?: string;
  readonly priority: ApplicationPriority;
  readonly managerId?: string | null;
  readonly agentId?: string | null;
  readonly internalNotes?: string;
}

export interface UpdateStatusInput {
  readonly applicationId: string;
  readonly nextStatus: ApplicationStatus;
  readonly note: string;
  readonly referenceNumber?: string;
}

export interface AssignStaffInput {
  readonly applicationId: string;
  readonly managerId: string | null;
  readonly agentId: string | null;
  readonly auditNote: string;
}
