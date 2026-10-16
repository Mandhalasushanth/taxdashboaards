import type {
  ApplicationItem,
  ApplicationPriority,
  ApplicationService,
  ApplicationStatus,
  AssignStaffInput,
  ApplicationQuery,
  DocumentItem,
  DocumentStatus,
  TimelineStep,
  ServiceDefinition,
  CustomerProfile
} from '@/modules/admin/shared/applications.types';
import {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  APPLICATION_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '@/modules/admin/shared/applications.types';
import type { CaNavCounters, CaSectionId } from './caManagerNavigation';

export type {
  ApplicationItem,
  ApplicationPriority,
  ApplicationService,
  ApplicationStatus,
  AssignStaffInput,
  ApplicationQuery,
  DocumentItem,
  DocumentStatus,
  TimelineStep,
  ServiceDefinition,
  CustomerProfile,
  CaNavCounters,
  CaSectionId
};

export {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  APPLICATION_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS
};

export type CaServiceType = 'ITR' | 'GST' | 'INCORPORATION';

export interface CaManagerKpis {
  readonly newCount: number;
  readonly unassignedCount: number;
  readonly inProgressCount: number;
  readonly awaitingCustomerCount: number;
  readonly awaitingReviewCount: number;
  readonly dueSoonCount: number;
  readonly overdueCount: number;
  readonly completedInPeriodCount: number;
}

export type CaAgentAvailability = 'AVAILABLE' | 'BUSY' | 'OVERLOADED' | 'ON_LEAVE';

export interface CaAgentWorkload {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'CA_AGENT';
  readonly active: boolean;
  readonly activeCases: number;
  readonly overdueCases: number;
  readonly capacityMax: number;
  readonly slaPercent: number;
  readonly skills: readonly string[];
  readonly availability: CaAgentAvailability;
}

export interface CaTask {
  readonly id: string;
  readonly applicationId: string;
  readonly customerName: string;
  readonly title: string;
  readonly ownerName: string;
  readonly ownerRole: string;
  readonly dueAt: string;
  readonly status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  readonly priority: ApplicationPriority;
  readonly evidenceReference?: string;
  readonly completedAt?: string;
}

export interface CaReviewChecklistItem {
  readonly label: string;
  readonly completed: boolean;
}

export interface CaReviewQueueItem {
  readonly id: string;
  readonly applicationId: string;
  readonly customerName: string;
  readonly serviceName: string;
  readonly agentName: string;
  readonly submittedAt: string;
  readonly checklist: readonly CaReviewChecklistItem[];
  readonly status: 'PENDING' | 'APPROVED' | 'RETURNED';
  readonly managerComments?: string;
  readonly decidedAt?: string;
}

export interface CaServiceMetric {
  readonly category: CaServiceType;
  readonly label: string;
  readonly activeCount: number;
  readonly completedCount: number;
  readonly turnaroundAvgHours: number;
}

export interface CaRecentActivity {
  readonly id: string;
  readonly applicationId: string;
  readonly action: string;
  readonly description: string;
  readonly actorName: string;
  readonly actorRole: string;
  readonly timestamp: string;
  readonly type: 'ASSIGNMENT' | 'DOCUMENT' | 'STATUS' | 'REVIEW' | 'CUSTOMER_REPLY';
}

export interface ReviewDecisionInput {
  readonly reviewId: string;
  readonly applicationId: string;
  readonly decision: 'APPROVED' | 'RETURNED';
  readonly comments: string;
}

export interface CreateTaskInput {
  readonly applicationId: string;
  readonly title: string;
  readonly ownerName: string;
  readonly dueAt: string;
  readonly priority: ApplicationPriority;
}
