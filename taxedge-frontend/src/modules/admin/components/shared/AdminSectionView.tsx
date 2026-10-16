import { Icon, PageHeader, useDocumentTitle } from '@/shared';
import type { AdminNavItem } from '../../shared/adminNavigation';
import './AdminSectionView.css';

export interface AdminSectionViewProps {
  readonly item: AdminNavItem;
  readonly showHeader?: boolean;
}

/**
 * Common frame for an admin section: header from the navigation config plus the section body.
 * Sections whose data screens are not built yet show the empty state.
 */
export function AdminSectionView({ item, showHeader = true }: AdminSectionViewProps) {
  useDocumentTitle(item.label);

  return (
    <div className="tx-admin-section">
      {showHeader && (
        <PageHeader eyebrow="Admin Console" title={item.label} description={item.description} />
      )}
      <section className="tx-admin-section__empty" aria-live="polite">
        <span className="tx-admin-section__icon">
          <Icon name={item.iconName} size="lg" />
        </span>
        <h2 className="tx-admin-section__title">No {item.label.toLowerCase()} to show yet</h2>
        <p className="tx-admin-section__text">
          This section will display live data once it is connected to the TaxEdge API.
        </p>
      </section>
    </div>
  );
}
