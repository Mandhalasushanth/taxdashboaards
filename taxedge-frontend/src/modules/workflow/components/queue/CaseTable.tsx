import { formatDateTime, formatRelativeTime } from '@/core/utils/dateUtils';
import { Icon } from '@/shared';
import { isOverdue } from '../../services/caseQueries';
import { getServiceType } from '../../shared/serviceTypes';
import type { WorkflowCase } from '../../shared/workflow.types';
import { CaseStatusBadge, PriorityPill, ServiceBadge } from '../badges/CaseBadges';
import './CaseTable.css';

export interface CaseTableProps {
  readonly cases: readonly WorkflowCase[];
  readonly onOpen: (id: string) => void;
  readonly caption: string;
  /** Agents only see their own cases, so the assigned-agent column is redundant for them. */
  readonly showAgent?: boolean;
}

const DATE_ONLY = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function formatDue(item: WorkflowCase): string {
  return item.dueDate ? DATE_ONLY.format(Date.parse(item.dueDate)) : '—';
}

/** Responsive work queue: a table on desktop, stacked cards (labels from data-label) on small screens. */
export function CaseTable({ cases, onOpen, caption, showAgent = true }: CaseTableProps) {
  const renderRow = (item: WorkflowCase) => {
    const overdue = isOverdue(item);
    return (
      <tr key={item.id} className={overdue ? 'tx-case-table__row--overdue' : undefined}>
        <td data-label="Reference">
          <div className="tx-case-table__ref">
            <button type="button" className="tx-case-table__ref-link" onClick={() => onOpen(item.id)}>
              {item.referenceNumber}
            </button>
            <PriorityPill priority={item.priority} />
          </div>
        </td>
        <td data-label="Client">
          <div className="tx-case-table__stack">
            <span className="tx-case-table__strong">{item.client.name}</span>
            <span className="tx-case-table__muted">{item.client.pan}</span>
          </div>
        </td>
        <td data-label="Service">
          <div className="tx-case-table__stack">
            <ServiceBadge service={item.service} />
            <span className="tx-case-table__muted">{getServiceType(item.serviceType, item.service).label}</span>
          </div>
        </td>
        <td data-label="Status">
          <CaseStatusBadge status={item.status} />
        </td>
        {showAgent ? (
          <td data-label="Assigned Agent">
            {item.assignment.agentName ? (
              <div className="tx-case-table__stack">
                <span className="tx-case-table__strong">{item.assignment.agentName}</span>
                {item.assignment.managerName ? <span className="tx-case-table__muted">by {item.assignment.managerName}</span> : null}
              </div>
            ) : (
              <span className="tx-case-table__unassigned">Unassigned</span>
            )}
          </td>
        ) : null}
        <td data-label="Submitted">
          <span title={formatDateTime(item.submittedAt)}>{DATE_ONLY.format(Date.parse(item.submittedAt))}</span>
        </td>
        <td data-label="Due Date">
          <span className={overdue ? 'tx-case-table__overdue' : undefined}>
            {overdue ? <Icon name="alert-triangle" size="sm" /> : null}
            {formatDue(item)}
          </span>
        </td>
        <td data-label="Last Updated">
          <span className="tx-case-table__muted">{formatRelativeTime(item.updatedAt)}</span>
        </td>
        <td data-label="Actions" className="tx-case-table__actions-cell">
          <button type="button" className="tx-case-table__open" onClick={() => onOpen(item.id)} aria-label={`Open ${item.referenceNumber}`}>
            Open
            <Icon name="chevron-right" size="sm" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="tx-case-table-card">
      <div className="tx-case-table-scroll">
        <table className="tx-case-table">
          <caption className="tx-sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Client</th>
              <th scope="col">Service</th>
              <th scope="col">Status</th>
              {showAgent ? <th scope="col">Assigned Agent</th> : null}
              <th scope="col">Submitted</th>
              <th scope="col">Due Date</th>
              <th scope="col">Last Updated</th>
              <th scope="col">
                <span className="tx-sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>{cases.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}
