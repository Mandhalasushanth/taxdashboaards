import { Button, Icon } from '@/shared';
import './CaReportsSection.css';

export function CaReportsSection() {
  const metrics = [
    { label: 'Completed Filings', value: '142', hint: '+18% vs last month', icon: 'circle-check' as const },
    { label: 'Average Turnaround', value: '28.4 hrs', hint: '-4.2 hrs velocity gain', icon: 'clock' as const },
    { label: 'First-Time Review Pass', value: '92.4%', hint: 'Exceeds 90% benchmark', icon: 'check-check' as const },
    { label: 'Department SLA Rate', value: '94.8%', hint: 'On track across practices', icon: 'shield-check' as const }
  ];

  const breakdown = [
    { practice: 'ITR-1 & Salaried Filing', volume: 68, avgTat: '18 hrs', reviewPass: '96%', agentLead: 'Priya Sharma' },
    { practice: 'ITR-2 & Capital Gains', volume: 38, avgTat: '36 hrs', reviewPass: '91%', agentLead: 'Suresh Kumar' },
    { practice: 'NRI Global Tax & DTAA', volume: 18, avgTat: '44 hrs', reviewPass: '88%', agentLead: 'Imran Qureshi' },
    { practice: 'GST Monthly & Annual', volume: 18, avgTat: '26 hrs', reviewPass: '94%', agentLead: 'Imran Qureshi' }
  ];

  return (
    <div className="tx-ca-reports-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
            CA Operational Reports & Throughput
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
            Turnaround velocity, review first-pass yield, and agent operational productivity.
          </p>
        </div>
        <Button variant="secondary" iconName="download" onClick={() => alert('Exporting CA Report...')}>
          Export Performance Summary
        </Button>
      </div>

      <div className="tx-ca-reports-cards">
        {metrics.map((m) => (
          <div key={m.label} className="tx-ca-report-metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tx-ca-report-metric-label">{m.label}</span>
              <Icon name={m.icon} size="sm" />
            </div>
            <span className="tx-ca-report-metric-val">{m.value}</span>
            <span className="tx-ca-report-metric-hint">{m.hint}</span>
          </div>
        ))}
      </div>

      <div className="tx-ca-table-card">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--tx-border)', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
          Practice Vertical Performance Breakdown
        </div>
        <div className="tx-ca-table-wrapper">
          <table className="tx-ca-table">
            <thead>
              <tr>
                <th>Practice Category</th>
                <th>Monthly Volume</th>
                <th>Avg Turnaround</th>
                <th>Review First-Pass Yield</th>
                <th>Lead Executive</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => (
                <tr key={row.practice}>
                  <td style={{ fontWeight: 600 }}>{row.practice}</td>
                  <td>{row.volume} cases</td>
                  <td>{row.avgTat}</td>
                  <td style={{ color: 'var(--tx-success)', fontWeight: 600 }}>{row.reviewPass}</td>
                  <td>{row.agentLead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
