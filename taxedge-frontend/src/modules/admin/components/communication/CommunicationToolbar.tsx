import { Icon } from '@/shared';
import type { ContactRoleFilter } from '../../shared/communication.types';
import { ROLE_FILTER_ORDER, STAFF_ROLE_THEME } from './config/staffRoleTheme';
import './CommunicationToolbar.css';

export interface CommunicationToolbarProps {
  readonly roleFilter: ContactRoleFilter;
  readonly roleCounts: Readonly<Record<ContactRoleFilter, number>>;
  readonly unreadCount: number;
  readonly onRoleFilterChange: (filter: ContactRoleFilter) => void;
}

function filterLabel(filter: ContactRoleFilter): string {
  return filter === 'ALL' ? 'All staff' : STAFF_ROLE_THEME[filter].pluralLabel;
}

/**
 * Top bar for the Communication section.
 * Renders role filter pills matching the exact TaxEdge design specifications:
 * Active: Deep navy background with an orange circular count badge.
 * Inactive: Clean navy/slate text with a soft circular count badge.
 */
export function CommunicationToolbar({
  roleFilter,
  roleCounts,
  unreadCount,
  onRoleFilterChange
}: CommunicationToolbarProps) {
  return (
    <nav className="tx-comm-toolbar" aria-label="Staff role filters">
      <div className="tx-comm-toolbar__pills" role="radiogroup" aria-label="Filter staff by role">
        {ROLE_FILTER_ORDER.map((filter) => {
          const isActive = roleFilter === filter;
          const count = roleCounts[filter] ?? 0;
          const label = filterLabel(filter);

          return (
            <button
              key={filter}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`tx-comm-pill ${isActive ? 'tx-comm-pill--active' : ''}`}
              onClick={() => onRoleFilterChange(filter)}
            >
              <span className="tx-comm-pill__label">{label}</span>
              <span className="tx-comm-pill__badge" aria-label={`${count} staff`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="tx-comm-toolbar__meta">
        {unreadCount > 0 ? (
          <span className="tx-comm-toolbar__unread" aria-label={`${unreadCount} unread messages from staff`}>
            <span className="tx-comm-toolbar__pulse-dot" aria-hidden="true" />
            <span>
              {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
            </span>
          </span>
        ) : (
          <span className="tx-comm-toolbar__status">
            <Icon name="check-check" size="sm" />
            <span>All messages read</span>
          </span>
        )}
      </div>
    </nav>
  );
}
