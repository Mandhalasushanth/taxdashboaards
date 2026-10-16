import { Button, Icon } from '@/shared';
import {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  APPLICATION_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationPriority,
  type ApplicationStatus,
  type ServiceDefinition
} from '../../shared/caManager.types';
import './CaApplicationsToolbar.css';

interface CaApplicationsToolbarProps {
  readonly statusFilter: 'ALL' | ApplicationStatus;
  readonly onStatusFilterChange: (status: 'ALL' | ApplicationStatus) => void;
  readonly priorityFilter: 'ALL' | ApplicationPriority;
  readonly onPriorityFilterChange: (priority: 'ALL' | ApplicationPriority) => void;
  readonly serviceFilter: 'ALL' | string;
  readonly onServiceFilterChange: (service: 'ALL' | string) => void;
  readonly agentFilter: 'ALL' | string;
  readonly onAgentFilterChange: (agent: 'ALL' | string) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onExportCsv: () => void;
  readonly onResetFilters: () => void;
  readonly hasActiveFilters: boolean;
}

const CA_SERVICES: readonly ServiceDefinition[] = APPLICATION_SERVICES.filter(
  (s: ServiceDefinition) => s.vertical === 'TAX_CA'
);

export function CaApplicationsToolbar({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  serviceFilter,
  onServiceFilterChange,
  agentFilter,
  onAgentFilterChange,
  searchQuery,
  onSearchChange,
  onExportCsv,
  onResetFilters,
  hasActiveFilters
}: CaApplicationsToolbarProps) {
  return (
    <div className="tx-ca-app-toolbar">
      <div className="tx-ca-app-toolbar__search-box">
        <Icon name="search" size="sm" className="tx-ca-app-toolbar__search-icon" />
        <input
          type="text"
          className="tx-ca-app-toolbar__search-input"
          placeholder="Search by ID, Customer, PAN or Service..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search applications"
        />
        {searchQuery && (
          <button
            type="button"
            className="tx-ca-app-toolbar__clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <label className="tx-ca-app-toolbar__select-group">
        <span>Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | ApplicationStatus)}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          {APPLICATION_STATUSES.map((status: ApplicationStatus) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="tx-ca-app-toolbar__select-group">
        <span>Priority:</span>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as 'ALL' | ApplicationPriority)}
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          {APPLICATION_PRIORITIES.map((priority: ApplicationPriority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </label>

      <label className="tx-ca-app-toolbar__select-group">
        <span>Service:</span>
        <select
          value={serviceFilter}
          onChange={(e) => onServiceFilterChange(e.target.value)}
          aria-label="Filter by CA service"
        >
          <option value="ALL">All CA Services</option>
          {CA_SERVICES.map((s: ServiceDefinition) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="tx-ca-app-toolbar__select-group">
        <span>Agent:</span>
        <select
          value={agentFilter}
          onChange={(e) => onAgentFilterChange(e.target.value)}
          aria-label="Filter by assigned agent"
        >
          <option value="ALL">All Agents</option>
          <option value="UNASSIGNED">Unassigned Only</option>
          <option value="AGT-301">Suresh Kumar (AGT-301)</option>
          <option value="AGT-302">Pooja Nair (AGT-302)</option>
          <option value="AGT-303">Vikram Patel (AGT-303)</option>
        </select>
      </label>

      <div className="tx-ca-app-toolbar__actions">
        {hasActiveFilters && (
          <Button variant="ghost" iconName="rotate-ccw" onClick={onResetFilters}>
            Reset Filters
          </Button>
        )}
        <Button variant="secondary" iconName="download" onClick={onExportCsv}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}
