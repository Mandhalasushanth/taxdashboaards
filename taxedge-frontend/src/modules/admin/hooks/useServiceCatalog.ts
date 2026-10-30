import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/core/logging/logger';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';
import { fetchServiceCatalog, updateCatalogService } from '../api/adminServiceCatalogApi';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';

export type CatalogTeamFilter = 'ALL' | WorkflowTeam;

export interface ServiceCatalogController {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly services: readonly CatalogService[];
  readonly visible: readonly CatalogService[];
  readonly teamFilter: CatalogTeamFilter;
  readonly setTeamFilter: (team: CatalogTeamFilter) => void;
  readonly summary: { readonly total: number; readonly active: number; readonly averageSla: number; readonly documents: number };
  readonly reload: () => Promise<void>;
  /** Resolves to null on success, otherwise the error message to show in the form. */
  readonly save: (kind: ServiceKind, update: CatalogServiceUpdate) => Promise<string | null>;
}

export function useServiceCatalog(): ServiceCatalogController {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<readonly CatalogService[]>([]);
  const [teamFilter, setTeamFilter] = useState<CatalogTeamFilter>('ALL');

  const reload = useCallback(async () => {
    try {
      setError(null);
      setServices(await fetchServiceCatalog());
      setStatus('success');
    } catch (cause) {
      logger.warn('Service catalog could not be loaded.', { cause });
      setError(cause instanceof Error ? cause.message : 'Unable to load the service catalog.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (kind: ServiceKind, update: CatalogServiceUpdate) => {
    try {
      const saved = await updateCatalogService(kind, update);
      setServices((current) => current.map((item) => (item.kind === kind ? saved : item)));
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'The service could not be saved.';
    }
  }, []);

  const visible = useMemo(() => services.filter((item) => teamFilter === 'ALL' || item.team === teamFilter), [services, teamFilter]);

  const summary = useMemo(
    () => ({
      total: services.length,
      active: services.filter((item) => item.active).length,
      averageSla: services.length ? Math.round(services.reduce((sum, item) => sum + item.slaDays, 0) / services.length) : 0,
      documents: services.reduce((sum, item) => sum + item.requiredDocuments.length, 0)
    }),
    [services]
  );

  return { status, error, services, visible, teamFilter, setTeamFilter, summary, reload, save };
}
