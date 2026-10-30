import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { ServiceKind } from '@/modules/workflow';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';
import { parseCatalogService, parseServiceCatalog } from '../validation/serviceCatalogSchema';

interface ServiceCatalogGateway {
  list(): Promise<unknown>;
  update(kind: ServiceKind, update: CatalogServiceUpdate): Promise<unknown>;
}

const httpGateway: ServiceCatalogGateway = Object.freeze({
  list: () => apiClient.get<unknown>(API_ENDPOINTS.admin.serviceCatalog),
  update: (kind: ServiceKind, update: CatalogServiceUpdate) =>
    apiClient.put<unknown>(`${API_ENDPOINTS.admin.serviceCatalog}/${encodeURIComponent(kind)}`, update)
});

async function getGateway(): Promise<ServiceCatalogGateway> {
  // Statically removed from production builds, like the other admin demo stores.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoServiceCatalogStore } = await import('../dev/demoServiceCatalogStore');
    return demoServiceCatalogStore;
  }
  return httpGateway;
}

export async function fetchServiceCatalog(): Promise<CatalogService[]> {
  return parseServiceCatalog(await (await getGateway()).list());
}

/** The server re-validates every field and records the change in the audit log. */
export async function updateCatalogService(kind: ServiceKind, update: CatalogServiceUpdate): Promise<CatalogService> {
  return parseCatalogService(await (await getGateway()).update(kind, update));
}
