import type { ChangeEvent } from 'react';
import { Button, Icon } from '@/shared';
import { serviceTypesFor } from '../../shared/serviceTypes';
import { getServiceDefinition } from '../../shared/workflowServices';
import { ALL_STATUSES, PRIORITIES, PRIORITY_META, STATUS_META } from '../../shared/workflowStatuses';
import type { QueuePreset } from '../../shared/workflowViews';
import type { CasePriority, CaseStatus, ServiceKind } from '../../shared/workflow.types';
import type { QueueFilters } from '../../hooks/useCaseQueue';
import './CaseToolbar.css';

export interface CaseToolbarProps {
  readonly preset: QueuePreset;
  readonly filters: QueueFilters;
  readonly hasActiveFilters: boolean;
  readonly onFilterChange: <K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => void;
  readonly onReset: () => void;
  readonly onOpenIntake?: () => void;
}

const SEARCH_MAX_LENGTH = 60;

export function CaseToolbar({ preset, filters, hasActiveFilters, onFilterChange, onReset, onOpenIntake }: CaseToolbarProps) {
  const statusOptions = preset.statuses ?? ALL_STATUSES;
  const typeOptions = (filters.service === 'ALL' ? preset.services : [filters.service]).flatMap((kind) => serviceTypesFor(kind));
  const idPrefix = `tx-queue-${preset.id}`;

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) =>
    // Reference numbers, names, PAN and mobile only: strip characters none of them can contain.
    onFilterChange('search', event.target.value.replace(/[^A-Za-z0-9 .@_-]/g, '').slice(0, SEARCH_MAX_LENGTH));

  return (
    <div className="tx-case-toolbar" role="search">
      <div className="tx-case-toolbar__search">
        <Icon name="search" size="sm" className="tx-case-toolbar__search-icon" />
        <label htmlFor={`${idPrefix}-search`} className="tx-sr-only">
          Search applications
        </label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          className="tx-case-toolbar__input"
          placeholder="Search reference, client, PAN or mobile"
          value={filters.search}
          maxLength={SEARCH_MAX_LENGTH}
          onChange={handleSearch}
        />
      </div>

      <div className="tx-case-toolbar__filters">
        {preset.services.length > 1 ? (
          <select
            aria-label="Filter by service"
            className="tx-case-toolbar__select"
            value={filters.service}
            onChange={(event) => onFilterChange('service', event.target.value as ServiceKind | 'ALL')}
          >
            <option value="ALL">All services</option>
            {preset.services.map((kind) => (
              <option key={kind} value={kind}>
                {getServiceDefinition(kind).label}
              </option>
            ))}
          </select>
        ) : null}

        {typeOptions.length > 1 ? (
          <select
            aria-label="Filter by service type"
            className="tx-case-toolbar__select"
            value={filters.serviceType}
            onChange={(event) => onFilterChange('serviceType', event.target.value)}
          >
            <option value="ALL">All service types</option>
            {typeOptions.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        ) : null}

        {statusOptions.length > 1 ? (
          <select
            aria-label="Filter by status"
            className="tx-case-toolbar__select"
            value={filters.status}
            onChange={(event) => onFilterChange('status', event.target.value as CaseStatus | 'ALL')}
          >
            <option value="ALL">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        ) : null}

        <select
          aria-label="Filter by priority"
          className="tx-case-toolbar__select"
          value={filters.priority}
          onChange={(event) => onFilterChange('priority', event.target.value as CasePriority | 'ALL')}
        >
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>

        <label className="tx-case-toolbar__toggle">
          <input type="checkbox" checked={filters.overdueOnly} onChange={(event) => onFilterChange('overdueOnly', event.target.checked)} />
          Overdue only
        </label>

        {hasActiveFilters ? (
          <Button variant="secondary" iconName="rotate-ccw" onClick={onReset}>
            Reset
          </Button>
        ) : null}
        {onOpenIntake ? (
          <Button iconName="plus" onClick={onOpenIntake}>
            Record Application
          </Button>
        ) : null}
      </div>
    </div>
  );
}
