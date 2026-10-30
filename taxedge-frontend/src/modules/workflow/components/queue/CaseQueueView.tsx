import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, DeferredContent, EmptyState, InlineAlert, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useCaseQueue, type QueueEntry, type QueueFilters } from '../../hooks/useCaseQueue';
import { useCaseSummary } from '../../hooks/useWorkflowData';
import type { KpiDefinition, QueuePreset } from '../../shared/workflowViews';
import { CaseDrawer } from '../case/CaseDrawer';
import { IntakeModal } from '../modals/IntakeModal';
import { CaseKpiStrip } from './CaseKpiStrip';
import { CasePagination } from './CasePagination';
import { CaseTable } from './CaseTable';
import { CaseToolbar } from './CaseToolbar';
import './CaseQueueView.css';

export interface CaseQueueViewProps {
  readonly preset: QueuePreset;
  /** Agents only see their own cases, so the agent column is hidden for them. */
  readonly showAgent?: boolean;
  /** Deep-link values already validated by the owning module; read from the URL when omitted. */
  readonly entry?: QueueEntry;
}

/** The KPI card whose filter is exactly what the queue is showing, so it can be highlighted. */
function activeKpiKey(kpis: readonly KpiDefinition[], filters: QueueFilters): string | null {
  const match = kpis.find((kpi) => {
    const filter = kpi.filter;
    if (!filter) return false;
    const status = filter.statuses?.length === 1 ? filter.statuses[0] : 'ALL';
    return status === filters.status && Boolean(filter.unassignedOnly) === filters.unassignedOnly && Boolean(filter.overdueOnly) === filters.overdueOnly;
  });
  return match?.key ?? null;
}

const CASE_PARAM = 'case';
/** Server case ids: letters, digits and hyphens only, so a crafted link cannot inject anything. */
const CASE_ID_PATTERN = /^[A-Za-z0-9-]{3,40}$/;

const readCaseParam = (params: URLSearchParams): string | null => {
  const value = params.get(CASE_PARAM);
  return value && CASE_ID_PATTERN.test(value) ? value : null;
};

/** One configured work queue: KPI cards, search and filters, paginated table and the case workspace. */
export function CaseQueueView({ preset, showAgent = true, entry }: CaseQueueViewProps) {
  useDocumentTitle(preset.title);
  const [params, setParams] = useSearchParams();
  const queue = useCaseQueue(preset, entry ?? { service: params.get('service') });
  const summary = useCaseSummary();
  const [intakeOpen, setIntakeOpen] = useState(false);
  const page = queue.resource.data;

  // The open case lives in the URL, so the browser's back button returns to the list.
  const selectedCaseId = readCaseParam(params);

  const openCase = (id: string) =>
    setParams((current) => {
      current.set(CASE_PARAM, id);
      return current;
    });

  const closeCase = () =>
    setParams((current) => {
      current.delete(CASE_PARAM);
      return current;
    });

  const renderList = () => {
    if (queue.resource.status === 'loading' && !page) {
      return (
        <DeferredContent>
          <div className="tx-case-queue__state">
            <LoadingSpinner size="lg" label="Loading applications" />
          </div>
        </DeferredContent>
      );
    }
    if (!page) {
      return (
        <div className="tx-case-queue__state">
          <InlineAlert tone="error">{queue.resource.error ?? 'Unable to load applications.'}</InlineAlert>
          <Button variant="secondary" iconName="rotate-ccw" onClick={() => void queue.resource.reload()}>
            Retry
          </Button>
        </div>
      );
    }
    if (page.total === 0) {
      return queue.hasActiveFilters ? (
        <div className="tx-case-queue__state">
          <EmptyState title="No matching applications" message="Try a different search or clear the filters." iconName="search" />
          <Button variant="secondary" iconName="rotate-ccw" onClick={queue.resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <EmptyState title={preset.emptyTitle} message={preset.emptyMessage} iconName="inbox" />
      );
    }
    return (
      <>
        {queue.resource.error ? <InlineAlert tone="warning">Showing the last loaded list. {queue.resource.error}</InlineAlert> : null}
        <CaseTable cases={page.items} onOpen={openCase} caption={preset.title} showAgent={showAgent} />
        <CasePagination page={page.page} pageSize={page.pageSize} total={page.total} onPageChange={(next) => queue.setFilter('page', next)} />
      </>
    );
  };

  if (selectedCaseId) {
    return (
      <div className="tx-case-queue">
        <CaseDrawer caseId={selectedCaseId} onClose={closeCase} />
      </div>
    );
  }

  return (
    <div className="tx-case-queue">
      {preset.kpis.length > 0 ? (
        <CaseKpiStrip kpis={preset.kpis} summary={summary.data} onSelect={queue.applyKpi} activeKey={activeKpiKey(preset.kpis, queue.filters)} />
      ) : null}
      <CaseToolbar
        preset={preset}
        filters={queue.filters}
        hasActiveFilters={queue.hasActiveFilters}
        onFilterChange={queue.setFilter}
        onReset={queue.resetFilters}
        onOpenIntake={preset.allowIntake ? () => setIntakeOpen(true) : undefined}
      />
      {renderList()}
      {intakeOpen ? <IntakeModal services={preset.services} onClose={() => setIntakeOpen(false)} /> : null}
    </div>
  );
}
