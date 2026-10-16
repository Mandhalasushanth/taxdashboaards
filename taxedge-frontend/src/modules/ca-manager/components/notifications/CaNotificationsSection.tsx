import { Button, Icon } from '@/shared';
import './CaNotificationsSection.css';

export function CaNotificationsSection() {
  const alerts = [
    {
      id: 'NOT-1',
      title: 'New ITR-2 Submission Waiting Assignment',
      text: 'Client Arjun Nambiar uploaded Form 16 and bank statement. Awaiting agent assignment.',
      time: '12 mins ago',
      icon: 'inbox' as const,
      priority: 'URGENT'
    },
    {
      id: 'NOT-2',
      title: 'Filing Draft Submitted for Review',
      text: 'Priya Sharma completed computation comparison for Meera Krishnan (APP-2025-0102).',
      time: '2 hours ago',
      icon: 'list-checks' as const,
      priority: 'NORMAL'
    },
    {
      id: 'NOT-3',
      title: 'Document Deficiency Alert',
      text: 'Zerodha capital gains sheet for APP-2025-0101 was marked rejected due to PDF password.',
      time: '4 hours ago',
      icon: 'alert-circle' as const,
      priority: 'HIGH'
    }
  ];

  return (
    <div className="tx-ca-notifs-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
            CA Alerts & Notifications
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
            Real-time workflow alerts, review notices, and filing status updates.
          </p>
        </div>
        <Button variant="secondary" iconName="check-check" onClick={() => {}}>
          Mark All Read
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map((a) => (
          <div key={a.id} className="tx-ca-notif-item">
            <div className="tx-ca-notif-icon">
              <Icon name={a.icon} size="sm" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--tx-primary-text)' }}>
                  {a.title}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--tx-muted-text)' }}>{a.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--tx-secondary-text)' }}>{a.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
