import type {
  CaAgentWorkload,
  CaRecentActivity,
  CaReviewQueueItem,
  CaServiceMetric,
  CaTask
} from '../shared/caManager.types';

const HOUR = 3_600_000;

export function createInitialCaAgents(): CaAgentWorkload[] {
  return [
    {
      id: 'AGT-301',
      name: 'Suresh Kumar',
      email: 'caagent@gmail.com',
      role: 'CA_AGENT',
      active: true,
      activeCases: 14,
      overdueCases: 1,
      capacityMax: 18,
      slaPercent: 93,
      skills: ['ITR-1', 'ITR-2', 'Direct Tax Audit', 'Notice Rectification'],
      availability: 'AVAILABLE'
    },
    {
      id: 'AGT-302',
      name: 'Priya Sharma',
      email: 'priya.sharma@taxedge.in',
      role: 'CA_AGENT',
      active: true,
      activeCases: 12,
      overdueCases: 0,
      capacityMax: 16,
      slaPercent: 96,
      skills: ['ITR-1', 'ITR-4 Sugam', 'HRA & 80C Exemption', 'Salaried Filing'],
      availability: 'AVAILABLE'
    },
    {
      id: 'AGT-303',
      name: 'Imran Qureshi',
      email: 'imran.qureshi@taxedge.in',
      role: 'CA_AGENT',
      active: true,
      activeCases: 16,
      overdueCases: 2,
      capacityMax: 16,
      slaPercent: 88,
      skills: ['NRI Global Tax', 'FEMA 15CA/CB', 'DTAA Relief', 'GSTR-1 & 3B'],
      availability: 'BUSY'
    }
  ];
}

export function createInitialCaReviews(): CaReviewQueueItem[] {
  const now = Date.now();
  return [
    {
      id: 'REV-101',
      applicationId: 'APP-2025-0102',
      customerName: 'Meera Krishnan',
      serviceName: 'ITR-1 (Salaried / Form 16)',
      agentName: 'Priya Sharma',
      submittedAt: new Date(now - 2 * HOUR).toISOString(),
      checklist: [
        { label: 'Form 16 Part A TDS reconciled with 26AS', completed: true },
        { label: 'AIS & TIS other income checked (Savings interest ₹8,420)', completed: true },
        { label: 'New vs Old Regime comparison generated (Old regime chosen)', completed: true },
        { label: 'Net refund ₹14,280 verified', completed: true }
      ],
      status: 'PENDING'
    },
    {
      id: 'REV-102',
      applicationId: 'APP-2025-0106',
      customerName: 'Dr. Shalini Gupta',
      serviceName: 'Income Tax Notice Response (139(9)/143(1))',
      agentName: 'Suresh Kumar',
      submittedAt: new Date(now - 8 * HOUR).toISOString(),
      checklist: [
        { label: 'Rectification Section 154 draft prepared', completed: true },
        { label: 'Hospital revised 24Q certificate attached', completed: true },
        { label: 'Client consent recorded', completed: true }
      ],
      status: 'APPROVED',
      managerComments: 'All hospital TDS certificates matched. Online rectification approved for final submission.',
      decidedAt: new Date(now - 3 * HOUR).toISOString()
    }
  ];
}

export function createInitialCaTasks(): CaTask[] {
  const now = Date.now();
  return [
    {
      id: 'TSK-201',
      applicationId: 'APP-2025-0101',
      customerName: 'Arjun Nambiar',
      title: 'Obtain unencrypted Zerodha capital gains statement from client',
      ownerName: 'Suresh Kumar',
      ownerRole: 'CA Executive',
      dueAt: new Date(now + 12 * HOUR).toISOString(),
      status: 'IN_PROGRESS',
      priority: 'URGENT'
    },
    {
      id: 'TSK-202',
      applicationId: 'APP-2025-0103',
      customerName: 'Vikramaditya Rao',
      title: 'Verify Singapore Inland Revenue tax paid certificate for Form 67',
      ownerName: 'Imran Qureshi',
      ownerRole: 'CA Executive',
      dueAt: new Date(now + 24 * HOUR).toISOString(),
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: 'TSK-203',
      applicationId: 'APP-2025-0107',
      customerName: 'Karthik Somayaji',
      title: 'Initial intake triage: Verify DIN and Certificate of Incorporation',
      ownerName: 'Sanjay Verma',
      ownerRole: 'CA Manager',
      dueAt: new Date(now + 6 * HOUR).toISOString(),
      status: 'PENDING',
      priority: 'NORMAL'
    }
  ];
}

export function createInitialCaMetrics(): CaServiceMetric[] {
  return [
    { category: 'ITR', label: 'Income Tax Returns (ITR-1 to 4)', activeCount: 18, completedCount: 84, turnaroundAvgHours: 19 },
    { category: 'GST', label: 'GST Monthly, Annual & LUT Filings', activeCount: 9, completedCount: 42, turnaroundAvgHours: 34 },
    { category: 'INCORPORATION', label: 'Company & LLP Registrations', activeCount: 5, completedCount: 16, turnaroundAvgHours: 52 }
  ];
}

export function createInitialCaActivities(): CaRecentActivity[] {
  const now = Date.now();
  return [
    {
      id: 'ACT-1',
      applicationId: 'APP-2025-0102',
      action: 'Submitted for Review',
      description: 'Priya Sharma submitted ITR-1 tax draft for client Meera Krishnan.',
      actorName: 'Priya Sharma',
      actorRole: 'CA_AGENT',
      timestamp: new Date(now - 2 * HOUR).toISOString(),
      type: 'REVIEW'
    },
    {
      id: 'ACT-2',
      applicationId: 'APP-2025-0101',
      action: 'Document Deficiency Flagged',
      description: 'Zerodha Capital Gains PDF rejected due to password encryption.',
      actorName: 'Suresh Kumar',
      actorRole: 'CA_AGENT',
      timestamp: new Date(now - 4 * HOUR).toISOString(),
      type: 'DOCUMENT'
    },
    {
      id: 'ACT-3',
      applicationId: 'APP-2025-0107',
      action: 'New Application Intake',
      description: 'Karthik Somayaji submitted SaaS export GST/LUT registration application.',
      actorName: 'Customer Intake',
      actorRole: 'CUSTOMER',
      timestamp: new Date(now - 5 * HOUR).toISOString(),
      type: 'STATUS'
    },
    {
      id: 'ACT-4',
      applicationId: 'APP-2025-0106',
      action: 'Manager Review Approved',
      description: 'Sanjay Verma approved Section 154 rectification response.',
      actorName: 'Sanjay Verma',
      actorRole: 'CA_MANAGER',
      timestamp: new Date(now - 8 * HOUR).toISOString(),
      type: 'REVIEW'
    }
  ];
}
