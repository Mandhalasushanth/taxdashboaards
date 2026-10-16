import { Button, DeferredContent, Icon, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import { NotificationList } from './NotificationList';
import { NotificationsToolbar } from './NotificationsToolbar';
import './NotificationsSection.css';

interface EmptyCopy {
  readonly title: string;
  readonly text: string;
}

function emptyCopy(totalCount: number, unreadOnly: boolean): EmptyCopy {
  if (totalCount === 0) {
    return { title: 'No notifications yet', text: 'Alerts about applications, documents, payments and SLAs will appear here.' };
  }
  return unreadOnly
    ? { title: "You're all caught up", text: 'There are no unread notifications. Switch to "All" to see earlier ones.' }
    : { title: 'Nothing in this category', text: 'Try another category to see more notifications.' };
}

/** Admin "Notifications": filterable, date-grouped list with read, open and dismiss actions. */
export default function NotificationsSection() {
  useDocumentTitle('Notifications');
  const notifications = useAdminNotifications();

  if (notifications.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-notifications__state">
          <LoadingSpinner size="lg" label="Loading notifications" />
        </div>
      </DeferredContent>
    );
  }

  if (notifications.status === 'error') {
    return (
      <div className="tx-notifications__state" role="alert">
        <p>{notifications.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={notifications.reload}>
          Try again
        </Button>
      </div>
    );
  }

  const empty = emptyCopy(notifications.totalCount, notifications.readFilter === 'unread');

  return (
    <div className="tx-notifications">
      <NotificationsToolbar
        totalCount={notifications.totalCount}
        unreadCount={notifications.unreadCount}
        readFilter={notifications.readFilter}
        categoryFilter={notifications.categoryFilter}
        markingAll={notifications.markingAll}
        onReadFilterChange={notifications.setReadFilter}
        onCategoryFilterChange={notifications.setCategoryFilter}
        onMarkAllRead={() => void notifications.markAllRead()}
      />

      {notifications.error ? (
        <p className="tx-notifications__error" role="alert">
          <Icon name="alert-circle" size="sm" />
          <span>{notifications.error}</span>
        </p>
      ) : null}

      {notifications.visible.length > 0 ? (
        <NotificationList
          notifications={notifications.visible}
          pendingIds={notifications.pendingIds}
          onToggleRead={(item) => void notifications.toggleRead(item)}
          onDismiss={(id) => void notifications.dismiss(id)}
        />
      ) : (
        <div className="tx-notifications__empty">
          <span className="tx-notifications__empty-icon">
            <Icon name="inbox" size="lg" />
          </span>
          <h2 className="tx-notifications__empty-title">{empty.title}</h2>
          <p className="tx-notifications__empty-text">{empty.text}</p>
        </div>
      )}
    </div>
  );
}
