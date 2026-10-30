import { useState } from 'react';
import { Button, DeferredContent, InlineAlert, KpiCard, KpiGrid, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useServiceCatalog, type CatalogTeamFilter } from '../../hooks/useServiceCatalog';
import { getAdminNavItem } from '../../shared/adminNavigation';
import type { CatalogService } from '../../shared/serviceCatalog.types';
import { ServiceCard } from './ServiceCard';
import { ServiceEditModal } from './ServiceEditModal';
import './ServiceCatalogSection.css';

const ITEM = getAdminNavItem('services');

const TEAM_TABS: readonly { readonly value: CatalogTeamFilter; readonly label: string }[] = [
  { value: 'ALL', label: 'All services' },
  { value: 'CA', label: 'CA services' },
  { value: 'LOAN', label: 'Loans & Insurance' }
];

/** Admin "Service Catalog": what TaxEdge offers, at what fee and turnaround, and which documents each needs. */
export default function ServiceCatalogSection() {
  useDocumentTitle(ITEM.label);
  const catalog = useServiceCatalog();
  const [editing, setEditing] = useState<CatalogService | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (catalog.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-catalog__state">
          <LoadingSpinner size="lg" label="Loading service catalog" />
        </div>
      </DeferredContent>
    );
  }

  if (catalog.status === 'error') {
    return (
      <div className="tx-catalog__state" role="alert">
        <p>{catalog.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={() => void catalog.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const { summary } = catalog;

  return (
    <div className="tx-catalog">
      <KpiGrid>
        <KpiCard label="Services offered" value={String(summary.total)} iconName="layers" />
        <KpiCard label="Accepting applications" value={`${summary.active} / ${summary.total}`} iconName="circle-check" tone="success" />
        <KpiCard label="Average turnaround" value={`${summary.averageSla} days`} iconName="clock" tone="orange" />
        <KpiCard label="Required documents" value={String(summary.documents)} iconName="file-text" />
      </KpiGrid>

      <div className="tx-catalog__tabs" role="group" aria-label="Filter by team">
        {TEAM_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={catalog.teamFilter === tab.value}
            className={`tx-catalog__tab ${catalog.teamFilter === tab.value ? 'tx-catalog__tab--active' : ''}`}
            onClick={() => catalog.setTeamFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice ? <InlineAlert tone="info">{notice}</InlineAlert> : null}

      <ul className="tx-catalog__grid">
        {catalog.visible.map((service) => (
          <li key={service.kind}>
            <ServiceCard
              service={service}
              onEdit={() => {
                setNotice(null);
                setEditing(service);
              }}
            />
          </li>
        ))}
      </ul>

      {editing ? (
        <ServiceEditModal
          service={editing}
          onSave={(update) => catalog.save(editing.kind, update)}
          onClose={() => setEditing(null)}
          onSaved={(name) => {
            setEditing(null);
            setNotice(`${name} was updated. New applications use the new fee and turnaround.`);
          }}
        />
      ) : null}
    </div>
  );
}
