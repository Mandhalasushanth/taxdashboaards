import { Icon } from '@/shared';
import './CaOverviewGreeting.css';

interface CaOverviewGreetingProps {
  readonly userName?: string;
}

export function CaOverviewGreeting({ userName = 'Anusha' }: CaOverviewGreetingProps) {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="tx-ca-greeting-row">
      <div>
        <h1 className="tx-ca-greeting-title">Good Morning, {userName}</h1>
        <p className="tx-ca-greeting-subtitle">
          Here&apos;s what&apos;s happening with your CA operations today.
        </p>
      </div>

      <div className="tx-ca-today-chip">
        <Icon name="calendar" size="sm" />
        <span>Today {todayFormatted}</span>
      </div>
    </div>
  );
}
