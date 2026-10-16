import { Button, Icon } from '@/shared';
import {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  APPLICATION_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationPriority,
  type ApplicationService,
  type ApplicationStatus,
  type ApplicationVertical
} from '../../shared/applications.types';
import './ApplicationsToolbar.css';

interface ApplicationsToolbarProps {
  readonly vertical: ApplicationVertical;
  readonly onVerticalChange: (vertical: ApplicationVertical) => void;
  readonly statusFilter: 'ALL' | ApplicationStatus;
  readonly onStatusFilterChange: (status: 'ALL' | ApplicationStatus) => void;
  readonly priorityFilter: 'ALL' | ApplicationPriority;
  readonly onPriorityFilterChange: (priority: 'ALL' | ApplicationPriority) => void;
  readonly serviceFilter: 'ALL' | ApplicationService;
  readonly onServiceFilterChange: (service: 'ALL' | ApplicationService) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onOpenCreateModal: () => void;
  readonly onExportCsv: () => void;
  readonly onResetFilters: () => void;
  readonly hasActiveFilters: boolean;
}

const VERTICAL_TABS: readonly { id: ApplicationVertical; label: string; icon: 'layers' | 'receipt' | 'landmark' }[] = [
  { id: 'ALL', label: 'All Verticals', icon: 'layers' },
  { id: 'TAX_CA', label: 'CA & Tax Compliance', icon: 'receipt' },
  { id: 'LOANS', label: 'Loan Facilitation', icon: 'landmark' }
];

export function ApplicationsToolbar({
  vertical,
  onVerticalChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  serviceFilter,
  onServiceFilterChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onExportCsv,
  onResetFilters,
  hasActiveFilters
}: ApplicationsToolbarProps) {
  const handleVerticalTabClick = (tabId: ApplicationVertical) => {
    try {
      onVerticalChange(tabId);
    } catch (err) {
      console.error('Error changing vertical tab:', err);
    }
  };

  const handleClearSearch = () => {
    try {
      onSearchChange('');
    } catch (err) {
      console.error('Error clearing search:', err);
    }
  };

  const visibleServices = APPLICATION_SERVICES.filter((svc) =>
    vertical === 'ALL' ? true : svc.vertical === vertical
  );

  return (
    <div className="tx-app-toolbar">
      <div className="tx-app-toolbar__top-row">
        <div className="tx-app-toolbar__vertical-tabs" role="tablist" aria-label="Application vertical practice filter">
          {VERTICAL_TABS.map((tab) => {
            const isActive = vertical === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tx-app-toolbar__v-tab ${isActive ? 'tx-app-toolbar__v-tab--active' : ''}`}
                onClick={() => handleVerticalTabClick(tab.id)}
              >
                <Icon name={tab.icon} size="sm" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="tx-app-toolbar__actions">
          <Button variant="primary" iconName="plus" onClick={onOpenCreateModal}>
            New Application
          </Button>
          <Button variant="secondary" iconName="download" onClick={onExportCsv}>
            Export CSV
          </Button>
          {hasActiveFilters && (
            <Button variant="secondary" iconName="rotate-ccw" onClick={onResetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="tx-app-toolbar__filter-row">
        <div className="tx-app-toolbar__search-box">
          <Icon name="search" size="sm" />
          <input
            type="search"
            className="tx-app-toolbar__search-input"
            placeholder="Search by ID, Customer, PAN, Phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search applications"
          />
          {searchQuery && (
            <button
              type="button"
              className="tx-app-toolbar__search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <Icon name="x" size="sm" />
            </button>
          )}
        </div>

        <label className="tx-app-toolbar__select-group">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | ApplicationStatus)}
            aria-label="Filter by application status"
          >
            <option value="ALL">All Statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="tx-app-toolbar__select-group">
          <span>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as 'ALL' | ApplicationPriority)}
            aria-label="Filter by priority urgency"
          >
            <option value="ALL">All Priorities</option>
            {APPLICATION_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>

        <label className="tx-app-toolbar__select-group">
          <span>Service:</span>
          <select
            value={serviceFilter}
            onChange={(e) => onServiceFilterChange(e.target.value as 'ALL' | ApplicationService)}
            aria-label="Filter by tax or loan service"
          >
            <option value="ALL">All Services</option>
            {visibleServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
