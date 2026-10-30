import { formatRelativeTime } from '@/core/utils/dateUtils';
import { toInitials } from '@/core/utils/stringUtils';
import { ServiceBadge, type ServiceKind } from '@/modules/workflow';
import { Icon } from '@/shared';
import { ENTITY_TYPE_LABELS, type Customer } from '../../shared/customers.types';
import './CustomersTable.css';

export interface CustomersTableProps {
  readonly customers: readonly Customer[];
  readonly onOpen: (customer: Customer) => void;
}

const servicesOf = (customer: Customer): ServiceKind[] => [...new Set(customer.applications.map((application) => application.service))];

/** Customer list: a table on desktop, stacked cards (labels from data-label) on small screens. */
export function CustomersTable({ customers, onOpen }: CustomersTableProps) {
  const renderRow = (customer: Customer) => (
    <tr key={customer.id}>
      <td data-label="Customer">
        <div className="tx-customers-table__who">
          <span className="tx-customers-table__avatar" aria-hidden="true">
            {toInitials(customer.name)}
          </span>
          <span className="tx-customers-table__stack">
            <button type="button" className="tx-customers-table__name" onClick={() => onOpen(customer)}>
              {customer.name}
            </button>
            <span className="tx-customers-table__muted">{customer.city || '—'}</span>
          </span>
        </div>
      </td>
      <td data-label="PAN / Type">
        <span className="tx-customers-table__stack">
          <span className="tx-customers-table__pan">{customer.pan}</span>
          <span className="tx-customers-table__muted">{ENTITY_TYPE_LABELS[customer.entityType]}</span>
        </span>
      </td>
      <td data-label="Contact">
        <span className="tx-customers-table__stack">
          <span>{customer.email || '—'}</span>
          <span className="tx-customers-table__muted">{customer.mobile || '—'}</span>
        </span>
      </td>
      <td data-label="Services">
        <span className="tx-customers-table__services">
          {servicesOf(customer).map((kind) => (
            <ServiceBadge key={kind} service={kind} />
          ))}
        </span>
      </td>
      <td data-label="Applications">
        <span className="tx-customers-table__counts">
          <strong>{customer.applications.length}</strong> total
          {customer.openCount > 0 ? <span className="tx-customers-table__open">{customer.openCount} open</span> : null}
        </span>
      </td>
      <td data-label="Last Activity">
        <span className="tx-customers-table__muted">{formatRelativeTime(customer.lastActivityAt)}</span>
      </td>
      <td data-label="Actions" className="tx-customers-table__actions">
        <button type="button" className="tx-customers-table__view" onClick={() => onOpen(customer)} aria-label={`View ${customer.name}`}>
          View
          <Icon name="chevron-right" size="sm" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="tx-customers-table-card">
      <div className="tx-customers-table-scroll">
        <table className="tx-customers-table">
          <caption className="tx-sr-only">Customers</caption>
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">PAN / Type</th>
              <th scope="col">Contact</th>
              <th scope="col">Services</th>
              <th scope="col">Applications</th>
              <th scope="col">Last Activity</th>
              <th scope="col">
                <span className="tx-sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>{customers.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}
