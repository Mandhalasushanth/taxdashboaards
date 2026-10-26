import { Icon } from '@/shared';
import './CaRecentActivityFeed.css';

interface AuditFeedItem {
  readonly id: string;
  readonly iconName: 'file-up' | 'circle-check' | 'clock' | 'file-text' | 'check';
  readonly iconTone: 'green' | 'blue' | 'amber' | 'purple';
  readonly title: string;
  readonly timeAgo: string;
}

const DEFAULT_AUDIT_ITEMS: readonly AuditFeedItem[] = Object.freeze([
  {
    id: 'act-1',
    iconName: 'file-up',
    iconTone: 'green',
    title: 'Priya Sharma uploaded ITR draft for Arjun Nambiar (TE-2026-00123)',
    timeAgo: '2 mins ago'
  },
  {
    id: 'act-2',
    iconName: 'circle-check',
    iconTone: 'blue',
    title: 'Suresh Kumar approved case TE-2026-00456 (Karthik Somayajji)',
    timeAgo: '12 mins ago'
  },
  {
    id: 'act-3',
    iconName: 'clock',
    iconTone: 'amber',
    title: 'New case assigned to Rahul Verma (Meera Iyer - TE-2026-00789)',
    timeAgo: '18 mins ago'
  },
  {
    id: 'act-4',
    iconName: 'file-text',
    iconTone: 'purple',
    title: 'Neha Gupta uploaded document (Form 16) for Rohan Desai',
    timeAgo: '34 mins ago'
  },
  {
    id: 'act-5',
    iconName: 'check',
    iconTone: 'green',
    title: 'Case TE-2026-00567 marked as Completed',
    timeAgo: '1 hour ago'
  }
]);

interface CaRecentActivityFeedProps {
  readonly onViewAll?: () => void;
}

export function CaRecentActivityFeed({ onViewAll }: CaRecentActivityFeedProps) {
  const items = DEFAULT_AUDIT_ITEMS;

  return (
    <div className="tx-ca-activity-card" role="region" aria-label="Recent Operational Activity">
      <div className="tx-ca-activity-card__header">
        <div className="tx-ca-activity-title-wrap">
          <Icon name="trending-up" size="sm" />
          <h3 className="tx-ca-activity-card__title">Live Case Activity Audit Feed</h3>
        </div>
        <button type="button" className="tx-ca-activity-viewall" onClick={onViewAll}>
          View All →
        </button>
      </div>

      <div className="tx-ca-activity-list">
        {items.map((item) => (
          <div key={item.id} className="tx-ca-activity-item">
            <span className={`tx-ca-activity-icon tx-ca-activity-icon--${item.iconTone}`}>
              <Icon name={item.iconName} size="sm" />
            </span>
            <div className="tx-ca-activity-text-wrap">
              <span className="tx-ca-activity-msg">{item.title}</span>
              <span className="tx-ca-activity-time">{item.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
