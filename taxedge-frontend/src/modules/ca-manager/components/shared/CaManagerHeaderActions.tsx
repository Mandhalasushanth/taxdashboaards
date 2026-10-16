import { Icon } from '@/shared';
import { useCaNavCounters } from '../../hooks/useCaNavCounters';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import { useCaManagerSection } from '../../shared/CaManagerContext';
import './CaManagerHeaderActions.css';

interface CaManagerHeaderActionsProps {
  readonly onSelectSection?: (section: CaSectionId) => void;
}

export function CaManagerHeaderActions({ onSelectSection: propOnSelectSection }: CaManagerHeaderActionsProps) {
  const counters = useCaNavCounters();
  const contextSection = useCaManagerSection();
  const onSelectSection = propOnSelectSection ?? contextSection.setActiveSection;

  return (
    <div className="tx-ca-header-actions" role="toolbar" aria-label="CA Quick Actions">
      <button
        type="button"
        className="tx-ca-header-btn"
        onClick={() => onSelectSection?.('reviews')}
        title="My Review Queue"
        aria-label="My Review Queue"
      >
        <Icon name="list-checks" size="sm" />
        {counters.reviews ? <span className="tx-ca-header-badge">{counters.reviews}</span> : null}
      </button>

      <button
        type="button"
        className="tx-ca-header-btn"
        onClick={() => onSelectSection?.('communication')}
        title="Customer Messages"
        aria-label="Customer Messages"
      >
        <Icon name="message-square" size="sm" />
      </button>

      <button
        type="button"
        className="tx-ca-header-btn"
        onClick={() => onSelectSection?.('notifications')}
        title="Notifications"
        aria-label="Notifications"
      >
        <Icon name="bell" size="sm" />
        {counters.notifications ? (
          <span className="tx-ca-header-badge">{counters.notifications}</span>
        ) : null}
      </button>
    </div>
  );
}
