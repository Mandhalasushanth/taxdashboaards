import { formatDateTime } from '@/core/utils/dateUtils';
import { ROLE_PROFILES } from '@/modules/authentication';
import { EmptyState, InlineAlert, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAuditLog } from '../../hooks/useWorkflowData';
import { getServiceDefinition } from '../../shared/workflowServices';
import { STATUS_META } from '../../shared/workflowStatuses';
import type { CaseEvent, ServiceKind } from '../../shared/workflow.types';
import { CasePagination } from '../queue/CasePagination';
import './AuditLogView.css';

export interface AuditLogViewProps {
  readonly title: string;
  readonly services: readonly ServiceKind[];
}

const roleLabel = (role: CaseEvent['actorRole']) => (role === 'CLIENT' ? 'Client' : role === 'SYSTEM' ? 'System' : ROLE_PROFILES[role].label);
const humanize = (action: string) => action.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (first) => first.toUpperCase());

/** Read-only, append-only audit trail of every workflow action within the viewer's scope. */
export function AuditLogView({ title, services }: AuditLogViewProps) {
  useDocumentTitle(title);
  const { resource, query, setQuery } = useAuditLog();
  const page = resource.data;

  const renderRow = (event: CaseEvent) => (
    <tr key={event.id}>
      <td data-label="When">{formatDateTime(event.createdAt)}</td>
      <td data-label="Actor">
        <span className="tx-audit__actor">{event.actorName}</span>
        <span className="tx-audit__role">{roleLabel(event.actorRole)}</span>
      </td>
      <td data-label="Action">{humanize(event.action)}</td>
      <td data-label="Case" className="tx-audit__mono">{event.referenceNumber ?? event.caseId}</td>
      <td data-label="Change">
        {event.fromStatus && event.toStatus && event.fromStatus !== event.toStatus
          ? `${STATUS_META[event.fromStatus].label} → ${STATUS_META[event.toStatus].label}`
          : event.toStatus
            ? STATUS_META[event.toStatus].label
            : '—'}
      </td>
      <td data-label="Reason / Note" className="tx-audit__note">
        {event.note ?? '—'}
        {event.reference ? <span className="tx-audit__ref">Ref: {event.reference}</span> : null}
      </td>
    </tr>
  );

  const renderBody = () => {
    if (resource.status === 'loading' && !page) return <LoadingSpinner size="lg" label="Loading audit log" />;
    if (!page) return <InlineAlert tone="error">{resource.error ?? 'Unable to load the audit log.'}</InlineAlert>;
    if (page.total === 0) return <EmptyState title="No audit events" message="Every verification, payment, assignment and delivery is recorded here." iconName="shield-check" />;
    return (
      <>
        <div className="tx-audit__card">
          <table className="tx-audit__table">
            <caption className="tx-sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Actor</th>
                <th scope="col">Action</th>
                <th scope="col">Case</th>
                <th scope="col">Change</th>
                <th scope="col">Reason / Note</th>
              </tr>
            </thead>
            <tbody>{page.items.map(renderRow)}</tbody>
          </table>
        </div>
        <CasePagination page={page.page} pageSize={page.pageSize} total={page.total} itemLabel="events" onPageChange={(next) => setQuery({ page: next })} />
      </>
    );
  };

  return (
    <div className="tx-audit">
      <div className="tx-audit__toolbar" role="search">
        <label htmlFor="tx-audit-search" className="tx-sr-only">
          Search audit log
        </label>
        <input
          id="tx-audit-search"
          type="search"
          className="tx-audit__input"
          placeholder="Search actor, action, case or note"
          maxLength={60}
          value={query.search ?? ''}
          onChange={(event) => setQuery({ search: event.target.value.replace(/[^A-Za-z0-9 .@_-]/g, '').slice(0, 60) })}
        />
        {services.length > 1 ? (
          <select aria-label="Filter by service" className="tx-audit__select" value={query.service ?? 'ALL'} onChange={(event) => setQuery({ service: event.target.value as ServiceKind | 'ALL' })}>
            <option value="ALL">All services</option>
            {services.map((kind) => (
              <option key={kind} value={kind}>
                {getServiceDefinition(kind).label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {renderBody()}
    </div>
  );
}
