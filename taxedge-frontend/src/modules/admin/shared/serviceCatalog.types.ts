import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** GST slabs; professional and financial-facilitation services normally attract 18%. */
export const GST_RATES = Object.freeze([0, 5, 12, 18, 28] as const);
export type GstRate = (typeof GST_RATES)[number];

/** How the professional fee is charged: a fixed fee, or a percentage of the sanctioned amount / premium. */
export type FeeModel = 'FIXED' | 'PERCENTAGE';

export const FEE_MODEL_LABELS: Readonly<Record<FeeModel, string>> = Object.freeze({
  FIXED: 'Fixed fee (₹)',
  PERCENTAGE: 'Percentage of amount (%)'
});

export interface CatalogService {
  readonly kind: ServiceKind;
  readonly name: string;
  readonly description: string;
  readonly team: WorkflowTeam;
  readonly feeModel: FeeModel;
  /** Rupees for a fixed fee; percent (up to two decimals) for a percentage fee. */
  readonly feeValue: number;
  readonly gstRate: GstRate;
  /** Target turnaround the due date is set from when an application arrives. */
  readonly slaDays: number;
  readonly requiredDocuments: readonly string[];
  /** Inactive services stop accepting new applications; existing ones continue. */
  readonly active: boolean;
  readonly updatedAt: string | null;
}

export type CatalogServiceUpdate = Pick<CatalogService, 'name' | 'description' | 'feeModel' | 'feeValue' | 'gstRate' | 'slaDays' | 'active'>;
