import { useState } from 'react';
import { Icon } from '@/shared';
import './CaCalendarSection.css';

interface CalendarDayEvent {
  readonly day: number;
  readonly code: string;
  readonly title: string;
  readonly category: 'GST' | 'ITR' | 'TDS' | 'ROC';
  readonly count: number;
  readonly tone: 'amber' | 'red' | 'blue' | 'green';
}

const STATUTORY_EVENTS: readonly CalendarDayEvent[] = Object.freeze([
  { day: 7, code: 'TDS-7', title: 'TDS/TCS Tax Payment Deposit for Sep', category: 'TDS', count: 6, tone: 'green' },
  { day: 10, code: 'GSTR-7/8', title: 'GST TDS & TCS Return Filing', category: 'GST', count: 3, tone: 'blue' },
  { day: 11, code: 'GSTR-1', title: 'Monthly Statement of Outward Supplies', category: 'GST', count: 18, tone: 'blue' },
  { day: 13, code: 'GSTR-6', title: 'Input Service Distributor (ISD) Return', category: 'GST', count: 4, tone: 'blue' },
  { day: 20, code: 'GSTR-3B', title: 'Monthly Summary Return & Tax Payment', category: 'GST', count: 14, tone: 'amber' },
  { day: 31, code: 'TAX-AUDIT', title: 'ITR-3 & Tax Audit Report Filing (Sec 44AB)', category: 'ITR', count: 8, tone: 'red' }
]);

export function CaCalendarSection() {
  const [filter, setFilter] = useState<'ALL' | 'GST' | 'ITR' | 'TDS' | 'ROC'>('ALL');
  const [selectedDay, setSelectedDay] = useState<number>(20);

  const filteredEvents = filter === 'ALL' ? STATUTORY_EVENTS : STATUTORY_EVENTS.filter((e) => e.category === filter);
  const activeEvent = filteredEvents.find((e) => e.day === selectedDay);

  // Generate 31 calendar days
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="tx-ca-calendar-section">
      {/* Top Header */}
      <div className="tx-ca-calendar-page-header">
        <div>
          <h2 className="tx-ca-calendar-page-title">Statutory Compliance Calendar</h2>
          <p className="tx-ca-calendar-page-subtitle">
            Government tax deadlines, GSTN/ITD statutory filing dates, and case allocation schedules.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="tx-ca-calendar-filters">
          {(['ALL', 'GST', 'ITR', 'TDS', 'ROC'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tx-ca-cal-filter-btn ${filter === cat ? 'tx-ca-cal-filter-btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'ALL' ? 'All Deadlines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Calendar Layout */}
      <div className="tx-ca-calendar-layout">
        {/* Left: Monthly Grid */}
        <div className="tx-ca-month-grid-card">
          <div className="tx-ca-month-nav">
            <span className="tx-ca-month-title">October 2026</span>
            <div className="tx-ca-month-nav-btns">
              <button type="button" className="tx-ca-month-btn" title="Previous Month">
                <Icon name="chevron-left" size="sm" />
              </button>
              <button type="button" className="tx-ca-month-btn" title="Next Month">
                <Icon name="chevron-right" size="sm" />
              </button>
            </div>
          </div>

          <div className="tx-ca-weekdays-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="tx-ca-weekday-header">
                {d}
              </span>
            ))}
          </div>

          <div className="tx-ca-days-grid">
            {/* Blank leading days for Oct 2026 starting on Thursday (4 blanks) */}
            <span className="tx-ca-day-cell tx-ca-day-cell--empty" />
            <span className="tx-ca-day-cell tx-ca-day-cell--empty" />
            <span className="tx-ca-day-cell tx-ca-day-cell--empty" />
            <span className="tx-ca-day-cell tx-ca-day-cell--empty" />

            {days.map((day) => {
              const evt = filteredEvents.find((e) => e.day === day);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  className={`tx-ca-day-cell ${evt ? 'tx-ca-day-cell--has-event' : ''} ${isSelected ? 'tx-ca-day-cell--selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="tx-ca-day-number">{day}</span>
                  {evt && (
                    <span className={`tx-ca-day-event-tag tx-ca-day-event-tag--${evt.tone}`}>
                      {evt.code}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Workload Detail */}
        <div className="tx-ca-day-detail-card">
          <div className="tx-ca-day-detail-header">
            <div>
              <span className="tx-ca-detail-date">October {selectedDay}, 2026</span>
              <h3 className="tx-ca-detail-title">
                {activeEvent ? activeEvent.title : 'No Major Statutory Deadline'}
              </h3>
            </div>
            {activeEvent && (
              <span className={`tx-ca-detail-badge tx-ca-detail-badge--${activeEvent.tone}`}>
                {activeEvent.category} • {activeEvent.count} Cases
              </span>
            )}
          </div>

          <div className="tx-ca-detail-content">
            {activeEvent ? (
              <div className="tx-ca-event-cases-list">
                <div className="tx-ca-event-summary-box">
                  <Icon name="alert-triangle" size="sm" />
                  <div>
                    <strong>Action Required:</strong> {activeEvent.count} customer filings must be reviewed,
                    signed off, and submitted to the government portal before 11:59 PM.
                  </div>
                </div>

                <h4 className="tx-ca-due-cases-heading">Target Cases Due Today:</h4>
                <div className="tx-ca-due-case-row">
                  <div>
                    <div className="tx-ca-due-case-name">Karthik Somayajji</div>
                    <div className="tx-ca-due-case-sub">GSTIN: 36AABCS9988K1Z5 • Assigned: Suresh Kumar</div>
                  </div>
                  <span className="tx-ca-due-case-status">Draft Prepared</span>
                </div>

                <div className="tx-ca-due-case-row">
                  <div>
                    <div className="tx-ca-due-case-name">Acme Tech Solutions LLP</div>
                    <div className="tx-ca-due-case-sub">GSTIN: 29AAACA2345L1Z1 • Assigned: Priya Sharma</div>
                  </div>
                  <span className="tx-ca-due-case-status">Awaiting Sign-off</span>
                </div>

                <div className="tx-ca-due-case-row">
                  <div>
                    <div className="tx-ca-due-case-name">Siddharth Rao</div>
                    <div className="tx-ca-due-case-sub">GSTIN: 37BTYPR9876Q1Z9 • Assigned: Rahul Verma</div>
                  </div>
                  <span className="tx-ca-due-case-status">In Review</span>
                </div>
              </div>
            ) : (
              <div className="tx-ca-empty-day">
                <Icon name="check-check" size="md" />
                <p>No statutory portal submissions due on this date.</p>
                <span className="tx-ca-empty-hint">Click on highlighted dates (e.g. 20th or 31st) to view filing deliverables.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
