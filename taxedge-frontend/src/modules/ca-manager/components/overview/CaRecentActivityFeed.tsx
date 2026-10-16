import { Icon, type IconName } from '@/shared';
import type { CaRecentActivity } from '../../shared/caManager.types';
import './CaRecentActivityFeed.css';

interface CaRecentActivityFeedProps {
  readonly activities: readonly CaRecentActivity[];
}

function iconForType(type: CaRecentActivity['type']): IconName {
  switch (type) {
    case 'ASSIGNMENT':
      return 'user-check';
    case 'DOCUMENT':
      return 'layers';
    case 'REVIEW':
      return 'list-checks';
    case 'CUSTOMER_REPLY':
      return 'message-square';
    default:
      return 'circle-check';
  }
}

export function CaRecentActivityFeed({ activities }: CaRecentActivityFeedProps) {
  return (
    <div className="tx-ca-activity-card" role="region" aria-label="Recent Operational Activity">
      <div className="tx-ca-activity-card__header">
        <h3 className="tx-ca-activity-card__title">Real-Time Activity Audit</h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--tx-muted-text)' }}>
          Assignments • Reviews • Submissions
        </span>
      </div>

      <div className="tx-ca-activity-list">
        {activities.map((item) => (
          <div key={item.id} className="tx-ca-activity-item">
            <span className="tx-ca-activity-icon">
              <Icon name={iconForType(item.type)} size="sm" />
            </span>
            <div className="tx-ca-activity-content">
              <div className="tx-ca-activity-top">
                <span className="tx-ca-activity-action">{item.action}</span>
                <span className="tx-ca-activity-time">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="tx-ca-activity-desc">{item.description}</p>
              <span className="tx-ca-activity-actor">
                Actor: {item.actorName} ({item.actorRole}) • {item.applicationId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
