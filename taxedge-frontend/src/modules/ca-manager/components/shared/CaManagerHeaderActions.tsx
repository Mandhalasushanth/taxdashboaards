import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/shared';
import { useCaNavCounters } from '../../hooks/useCaNavCounters';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import { useCaManagerSection } from '../../shared/CaManagerContext';
import { CaNewCaseIntakeModal, type NewCaseIntakeData } from '../applications/CaNewCaseIntakeModal';
import './CaManagerHeaderActions.css';

interface QuickSearchMatch {
  readonly id: string;
  readonly name: string;
  readonly pan: string;
  readonly service: string;
  readonly status: string;
  readonly statusTone: 'amber' | 'blue' | 'green';
}

const SEARCH_CORPUS: readonly QuickSearchMatch[] = Object.freeze([
  { id: 'APP-2025-0101', name: 'Arjun Nambiar', pan: 'ABCPA1234F', service: 'ITR-2 Capital Gains', status: 'Blocked (Docs)', statusTone: 'amber' },
  { id: 'APP-2025-0107', name: 'Karthik Somayajji', pan: 'AABCS9988K', service: 'GST Monthly', status: 'Pending Review', statusTone: 'blue' },
  { id: 'APP-2025-0102', name: 'Meera Iyer', pan: 'AAGPI5678L', service: 'ITR-1 Salaried', status: 'Computation Pending', statusTone: 'amber' },
  { id: 'APP-2025-0104', name: 'Rohan Desai', pan: 'AAACR1234M', service: 'Company Incorporation', status: 'Completed', statusTone: 'green' },
  { id: 'APP-2025-0109', name: 'Siddharth Rao', pan: 'BTYPR9876Q', service: 'GST Registration', status: 'In Progress', statusTone: 'blue' }
]);

interface CaManagerHeaderActionsProps {
  readonly onSelectSection?: (section: CaSectionId) => void;
}

export function CaManagerHeaderActions({ onSelectSection: propOnSelectSection }: CaManagerHeaderActionsProps) {
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const counters = useCaNavCounters();
  const contextSection = useCaManagerSection();
  const onSelectSection = propOnSelectSection ?? contextSection.setActiveSection;

  // Keyboard shortcut: Cmd + K or Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const query = searchVal.trim().toLowerCase();
  const matches = query
    ? SEARCH_CORPUS.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.pan.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.service.toLowerCase().includes(query)
      )
    : [];

  const handleSelectSearchResult = (item: QuickSearchMatch) => {
    setSearchVal(item.name);
    setSearchOpen(false);
    onSelectSection?.('applications');
  };

  const handleCreateIntake = (data: NewCaseIntakeData) => {
    alert(
      `✓ Case Created Successfully!\n\nClient: ${data.customerName}\nPAN: ${data.pan}\nService: ${data.service}\nAssigned: ${data.agentName || 'Unassigned'}`
    );
    onSelectSection?.('applications');
  };

  return (
    <>
      <div className="tx-ca-header-bar" role="toolbar" aria-label="CA Operations Navigation and Search">
        {/* Search Input with Popover */}
        <div className="tx-ca-search-box-wrap">
          <div className="tx-ca-search-box">
            <span className="tx-ca-search-icon">
              <Icon name="search" size="sm" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="tx-ca-search-input"
              placeholder="Search by PAN, GSTIN, Client, or Case ID"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Search cases by PAN, GSTIN, or Name"
            />
            <kbd className="tx-ca-search-shortcut">Cmd + K</kbd>
          </div>

          {/* Quick Search Floating Results */}
          {searchOpen && matches.length > 0 && (
            <div className="tx-ca-search-popover">
              <div className="tx-ca-search-popover-header">Matching Cases & Clients</div>
              {matches.map((item) => (
                <div
                  key={item.id}
                  className="tx-ca-search-result-row"
                  onClick={() => handleSelectSearchResult(item)}
                >
                  <div className="tx-ca-search-result-info">
                    <span className="tx-ca-search-result-name">{item.name}</span>
                    <span className="tx-ca-search-result-meta">
                      {item.service} • {item.pan} • {item.id}
                    </span>
                  </div>
                  <span className={`tx-ca-search-status-chip tx-ca-search-status-chip--${item.statusTone}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Ticker */}
        <div className="tx-ca-ticker-badge" title="Upcoming statutory tax deadline">
          <Icon name="alert-triangle" size="sm" />
          <span className="tx-ca-ticker-text">
            <strong>GSTR-3B Due in 3 Days (Oct 20)</strong> • 14 Filings Pending
          </span>
        </div>

        {/* Government Portal Sync Pill */}
        <div className="tx-ca-sync-badge" title="Income Tax Department & GSTN API Status">
          <span className="tx-ca-sync-dot" />
          <span className="tx-ca-sync-text">ITD & GSTN Sync Active</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="tx-ca-header-icon-btn"
          onClick={() => onSelectSection?.('notifications')}
          title="View Operations Alerts"
          aria-label="Operations Alerts"
        >
          <Icon name="bell" size="sm" />
          <span className="tx-ca-header-notif-badge">{counters.notifications ?? 4}</span>
        </button>

        {/* + New Case Intake CTA Button */}
        <button
          type="button"
          className="tx-ca-primary-cta"
          onClick={() => setIntakeModalOpen(true)}
          title="Create or Intake new customer tax case"
        >
          <Icon name="plus" size="sm" />
          <span>New Case Intake</span>
        </button>
      </div>

      {/* New Case Intake Modal */}
      <CaNewCaseIntakeModal
        open={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onSubmit={handleCreateIntake}
      />
    </>
  );
}
