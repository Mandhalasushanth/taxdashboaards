import { Icon } from '@/shared';
import './CaStatutoryCalendar.css';

export interface ComplianceEventItem {
  readonly id: string;
  readonly day: string;
  readonly month: string;
  readonly year: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: 'GST' | 'ITR' | 'TDS' | 'ROC';
  readonly dueLabel: string;
  readonly isUrgent?: boolean;
}

const DEFAULT_CALENDAR_EVENTS: readonly ComplianceEventItem[] = Object.freeze([
  {
    id: 'cal-1',
    day: '20',
    month: 'Oct',
    year: '2026',
    title: 'GSTR-3B Filing',
    subtitle: 'Monthly GST Return',
    category: 'GST',
    dueLabel: 'Due in 3 days',
    isUrgent: true
  },
  {
    id: 'cal-2',
    day: '31',
    month: 'Oct',
    year: '2026',
    title: 'Tax Audit (ITR)',
    subtitle: 'For AY 2026-27',
    category: 'ITR',
    dueLabel: 'Due in 14 days',
    isUrgent: false
  }
]);

interface CaStatutoryCalendarProps {
  readonly onViewFullCalendar?: () => void;
}

export function CaStatutoryCalendar({ onViewFullCalendar }: CaStatutoryCalendarProps) {
  const events = DEFAULT_CALENDAR_EVENTS;

  return (
    <div className="tx-ca-calendar-card" role="region" aria-label="Statutory Tax Compliance Deadlines">
      <div className="tx-ca-calendar-header">
        <div className="tx-ca-calendar-title-wrap">
          <Icon name="calendar" size="sm" />
          <h3 className="tx-ca-calendar-title">Statutory Compliance Calendar</h3>
        </div>
        <button
          type="button"
          className="tx-ca-calendar-link"
          onClick={onViewFullCalendar}
        >
          View Full Calendar →
        </button>
      </div>

      <div className="tx-ca-calendar-grid">
        {events.map((evt) => (
          <div key={evt.id} className="tx-ca-calendar-event">
            {/* Date Box */}
            <div className="tx-ca-date-block">
              <span className="tx-ca-date-num">{evt.day}</span>
              <span className="tx-ca-date-my">{evt.month}</span>
              <span className="tx-ca-date-yr">{evt.year}</span>
            </div>

            {/* Event Details */}
            <div className="tx-ca-event-details">
              <div className="tx-ca-event-top-line">
                <span className="tx-ca-event-title">{evt.title}</span>
                <span className="tx-ca-event-tag">{evt.category}</span>
              </div>
              <p className="tx-ca-event-sub">{evt.subtitle}</p>

              <span className={evt.isUrgent ? 'tx-ca-due-chip--urgent' : 'tx-ca-due-chip'}>
                {evt.dueLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
