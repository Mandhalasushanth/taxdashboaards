import { ApiError } from '@/core/api';
import { SERVICE_KINDS, getServiceDefinition, requiredDocumentsFor, type ServiceKind } from '@/modules/workflow';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';
import { validateCatalogUpdate } from '../validation/serviceCatalogSchema';

/**
 * DEVELOPMENT ONLY. Service catalog kept in this browser's localStorage while the backend is unavailable.
 * Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production builds.
 * Fees below are sample values for the demo, not published TaxEdge prices.
 */
const STORAGE_KEY = 'taxedge.demo.serviceCatalog';

const SAMPLE_PRICING: Readonly<Record<ServiceKind, Pick<CatalogService, 'feeModel' | 'feeValue' | 'description'>>> = Object.freeze({
  GST: { feeModel: 'FIXED', feeValue: 1499, description: 'Monthly or quarterly GST returns with GSTR-2B reconciliation.' },
  ITR: { feeModel: 'FIXED', feeValue: 999, description: 'Income tax return preparation and e-filing with TDS matching.' },
  INCORPORATION: { feeModel: 'FIXED', feeValue: 6999, description: 'Private limited, LLP or OPC registration through SPICe+.' },
  LOAN: { feeModel: 'PERCENTAGE', feeValue: 0.5, description: 'Home, business and property loan facilitation with lender follow-up.' },
  INSURANCE: { feeModel: 'PERCENTAGE', feeValue: 1, description: 'Term, health and general insurance advisory and proposal support.' }
});

function seed(): CatalogService[] {
  return SERVICE_KINDS.map((kind) => {
    const definition = getServiceDefinition(kind);
    return {
      kind,
      name: definition.label,
      team: definition.team,
      gstRate: 18,
      slaDays: definition.slaDays,
      requiredDocuments: requiredDocumentsFor(kind),
      active: true,
      updatedAt: null,
      ...SAMPLE_PRICING[kind]
    };
  });
}

function load(): CatalogService[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CatalogService[]) : seed();
  } catch {
    return seed();
  }
}

function persist(items: CatalogService[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the change applies for this page view only.
  }
}

export const demoServiceCatalogStore = Object.freeze({
  async list(): Promise<CatalogService[]> {
    return load();
  },

  async update(kind: ServiceKind, update: CatalogServiceUpdate): Promise<CatalogService> {
    const firstError = Object.values(validateCatalogUpdate(update))[0];
    if (firstError) {
      throw new ApiError('VALIDATION_FAILED', firstError, 422);
    }
    const items = load();
    const current = items.find((item) => item.kind === kind);
    if (!current) {
      throw new ApiError('VALIDATION_FAILED', 'This service no longer exists.', 404);
    }
    const updated: CatalogService = { ...current, ...update, name: update.name.trim(), description: update.description.trim(), updatedAt: new Date().toISOString() };
    persist(items.map((item) => (item.kind === kind ? updated : item)));
    return updated;
  }
});
