import { useCallback, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthentication, ROLE_PROFILES } from '@/modules/authentication';
import { EmptyState, Icon, InlineAlert, LoadingSpinner, useDocumentTitle, type IconName } from '@/shared';
import { workflowApi } from '../../api/workflowApi';
import { useCaseSummary } from '../../hooks/useWorkflowData';
import { useWorkflowResource } from '../../hooks/useWorkflowResource';
import { getServiceDefinition } from '../../shared/workflowServices';
import type { KpiDefinition } from '../../shared/workflowViews';
import type { CaseQuery, CaseSummary, ServiceKind } from '../../shared/workflow.types';
import { CaseDrawer } from '../case/CaseDrawer';
import { CaseKpiStrip } from '../queue/CaseKpiStrip';
import { CaseTable } from '../queue/CaseTable';
import { TeamWorkloadPanel } from './TeamWorkloadPanel';
import './RoleDashboardView.css';

export interface AttentionItem {
  readonly label: string;
  readonly iconName: IconName;
  readonly to: string;
  readonly count: (summary: CaseSummary) => number;
}

export interface DashboardConfig {
  readonly kpis: readonly KpiDefinition[];
  readonly services: readonly ServiceKind[];
  readonly serviceLink: string;
  readonly attention: readonly AttentionItem[];
  readonly workloadLink?: string;
  readonly recent: { readonly title: string; readonly query: CaseQuery; readonly to: string };
  readonly showAgentColumn: boolean;
}

function ServiceBreakdown({ summary, services, link }: { readonly summary: CaseSummary; readonly services: readonly ServiceKind[]; readonly link: string }) {
  const total = Math.max(1, services.reduce((sum, kind) => sum + summary.byService[kind], 0));
  return (
    <ul className="tx-role-dash__services">
      {services.map((kind) => {
        const definition = getServiceDefinition(kind);
        return (
          <li key={kind}>
            <Link to={`${link}?service=${kind}`} className="tx-role-dash__service">
              <span className="tx-role-dash__service-head">
                <Icon name={definition.iconName} size="sm" />
                <span className="tx-role-dash__service-name">{definition.label}</span>
                <span className="tx-role-dash__service-count">{summary.byService[kind]}</span>
              </span>
              <progress className="tx-role-dash__service-bar" value={summary.byService[kind]} max={total} aria-label={`${definition.label} share`} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Role dashboard built from configuration: every count is a live server value scoped to the user's role. */
export interface RoleDashboardViewProps {
  readonly config: DashboardConfig;
  /** Extra role-specific panels rendered below the workflow overview. */
  readonly children?: ReactNode;
}

export function RoleDashboardView({ config, children }: RoleDashboardViewProps) {
  const { user } = useAuthentication();
  const profile = user ? ROLE_PROFILES[user.role] : null;
  useDocumentTitle(profile?.dashboardTitle ?? 'Dashboard');
  const summary = useCaseSummary();
  const loadRecent = useCallback(() => workflowApi.listCases(config.recent.query), [config.recent.query]);
  const recent = useWorkflowResource(loadRecent, 'Unable to load recent applications.');
  // The open case lives in the URL, so the browser's back button returns to the dashboard.
  const [params, setParams] = useSearchParams();
  const openId = /^[A-Za-z0-9-]{3,40}$/.test(params.get('case') ?? '') ? params.get('case') : null;
  const setOpenId = (id: string | null) => setParams(id ? { case: id } : {});

  if (!user || !profile) {
    return null;
  }

  const renderAttention = (data: CaseSummary) => (
    <ul className="tx-role-dash__attention">
      {config.attention.map((entry) => {
        const count = entry.count(data);
        return (
          <li key={entry.label}>
            <Link to={entry.to} className={`tx-role-dash__attention-item ${count > 0 ? 'tx-role-dash__attention-item--alert' : ''}`}>
              <Icon name={entry.iconName} size="sm" />
              <span className="tx-role-dash__attention-label">{entry.label}</span>
              <span className="tx-role-dash__attention-count">{count}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderPanelBody = (render: (data: CaseSummary) => JSX.Element) => {
    if (summary.data) return render(summary.data);
    if (summary.status === 'error') return <InlineAlert tone="error">{summary.error}</InlineAlert>;
    return <LoadingSpinner label="Loading" />;
  };

  if (openId) {
    return <CaseDrawer caseId={openId} onClose={() => setOpenId(null)} />;
  }

  return (
    <div className="tx-role-dash">
      {summary.status === 'error' && !summary.data ? <InlineAlert tone="error">{summary.error}</InlineAlert> : null}
      <CaseKpiStrip kpis={config.kpis} summary={summary.data} />

      <div className="tx-role-dash__grid">
        <section className="tx-role-dash__card" aria-labelledby="tx-dash-services">
          <h2 id="tx-dash-services" className="tx-role-dash__card-title">Applications by service</h2>
          {renderPanelBody((data) => <ServiceBreakdown summary={data} services={config.services} link={config.serviceLink} />)}
        </section>
        <section className="tx-role-dash__card" aria-labelledby="tx-dash-attention">
          <h2 id="tx-dash-attention" className="tx-role-dash__card-title">Needs attention</h2>
          {renderPanelBody(renderAttention)}
        </section>
        {config.workloadLink ? (
          <section className="tx-role-dash__card" aria-labelledby="tx-dash-workload">
            <div className="tx-role-dash__card-head">
              <h2 id="tx-dash-workload" className="tx-role-dash__card-title">Team workload</h2>
              <Link to={config.workloadLink} className="tx-role-dash__link">View all</Link>
            </div>
            <TeamWorkloadPanel compact />
          </section>
        ) : null}
      </div>

      <section className="tx-role-dash__recent" aria-labelledby="tx-dash-recent">
        <div className="tx-role-dash__card-head">
          <h2 id="tx-dash-recent" className="tx-role-dash__card-title">{config.recent.title}</h2>
          <Link to={config.recent.to} className="tx-role-dash__link">
            Open queue <Icon name="arrow-right" size="sm" />
          </Link>
        </div>
        {recent.data && recent.data.items.length > 0 ? (
          <CaseTable cases={recent.data.items} onOpen={setOpenId} caption={config.recent.title} showAgent={config.showAgentColumn} />
        ) : recent.status === 'loading' ? (
          <LoadingSpinner label="Loading applications" />
        ) : recent.status === 'error' ? (
          <InlineAlert tone="error">{recent.error}</InlineAlert>
        ) : (
          <EmptyState title="Nothing waiting" message="New work will appear here as soon as it arrives." iconName="inbox" />
        )}
      </section>

      {children}
    </div>
  );
}
