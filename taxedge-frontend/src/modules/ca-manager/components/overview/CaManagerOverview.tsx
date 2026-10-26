import { useState } from 'react';
import { DeferredContent, LoadingSpinner } from '@/shared';
import { useCurrentUser } from '@/modules/authentication';
import { useCaManagerSummary } from '../../hooks/useCaManagerSummary';
import type { ApplicationItem, AssignStaffInput } from '../../shared/caManager.types';
import { useCaManagerSection } from '../../shared/CaManagerContext';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import { CaApplicationDetailDrawer } from '../applications/CaApplicationDetailDrawer';
import { CaAssignAgentModal } from '../applications/CaAssignAgentModal';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import { caManagerApi } from '../../api/caManagerApi';
import { CaOverviewGreeting } from './CaOverviewGreeting';
import { CaKpiCardsBar } from './CaKpiCardsBar';
import { CaUrgentWorkPanel } from './CaUrgentWorkPanel';
import { CaAgentCapacityPanel } from './CaAgentCapacityPanel';
import { CaStatutoryCalendar } from './CaStatutoryCalendar';
import { CaRecentActivityFeed } from './CaRecentActivityFeed';
import './CaManagerOverview.css';

interface CaManagerOverviewProps {
  readonly onSelectSection?: (section: CaSectionId) => void;
  readonly onOpenApp?: (app: ApplicationItem) => void;
  readonly onAssignApp?: (app: ApplicationItem) => void;
}

export function CaManagerOverview({
  onSelectSection: propSelectSection,
  onOpenApp,
  onAssignApp
}: CaManagerOverviewProps = {}) {
  const user = useCurrentUser();
  const { setActiveSection } = useCaManagerSection();
  const summary = useCaManagerSummary();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [assignTarget, setAssignTarget] = useState<ApplicationItem | null>(null);

  const handleSelectSection = propSelectSection || setActiveSection;
  const handleOpenApp = onOpenApp || ((app) => setSelectedApp(app));
  const handleAssignApp = onAssignApp || ((app) => setAssignTarget(app));

  const handleAssignConfirm = async (input: AssignStaffInput) => {
    try {
      await caManagerApi.assignAgent(input);
      setAssignTarget(null);
      await summary.reload();
    } catch (err) {
      console.error('Failed to assign in overview:', err);
    }
  };

  const handleVerifyDoc = async (appId: string, docId: string) => {
    try {
      await demoApplicationsStore.verifyDocument(appId, docId);
      if (selectedApp) {
        const refreshed = await caManagerApi.getApplicationById(selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
      await summary.reload();
    } catch (err) {
      console.error('Verify doc error:', err);
    }
  };

  const handleRejectDoc = async (appId: string, docId: string, reason: string) => {
    try {
      await demoApplicationsStore.rejectDocument(appId, docId, reason);
      if (selectedApp) {
        const refreshed = await caManagerApi.getApplicationById(selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
      await summary.reload();
    } catch (err) {
      console.error('Reject doc error:', err);
    }
  };

  const handleAddQuery = async (appId: string, msg: string) => {
    try {
      await demoApplicationsStore.addQuery(appId, 'Anusha (CA Manager)', 'CA_MANAGER', msg);
      if (selectedApp) {
        const refreshed = await caManagerApi.getApplicationById(selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
      await summary.reload();
    } catch (err) {
      console.error('Add query error:', err);
    }
  };

  if (summary.status === 'loading') {
    return (
      <DeferredContent>
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <LoadingSpinner size="lg" label="Loading CA operations overview..." />
        </div>
      </DeferredContent>
    );
  }

  return (
    <div className="tx-ca-overview">
      {/* 1. Header Greeting with Today Date */}
      <CaOverviewGreeting userName={user?.displayName || 'Anusha'} />

      {/* 2. Top 5 KPI Cards */}
      <CaKpiCardsBar kpis={summary.kpis} onSelectSection={handleSelectSection} />

      {/* 3. Middle Split: Urgent Blockers & Agent Capacity */}
      <div className="tx-ca-overview__middle-split">
        <CaUrgentWorkPanel
          urgentCases={summary.urgentCases}
          onOpenApp={(app) => handleOpenApp(app as ApplicationItem)}
          onAssignApp={(app) => handleAssignApp(app as ApplicationItem)}
          onViewAll={() => handleSelectSection('escalations')}
        />
        <CaAgentCapacityPanel
          onViewAll={() => handleSelectSection('agents')}
          onSelectAgent={() => handleSelectSection('agents')}
        />
      </div>

      {/* 4. Bottom Split: Statutory Calendar & Live Activity Feed */}
      <div className="tx-ca-overview__bottom-split">
        <CaStatutoryCalendar
          onViewFullCalendar={() => handleSelectSection('calendar')}
        />
        <CaRecentActivityFeed
          onViewAll={() => handleSelectSection('reports')}
        />
      </div>

      {/* Case Detail Drawer */}
      {selectedApp && (
        <CaApplicationDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onVerifyDoc={handleVerifyDoc}
          onRejectDoc={handleRejectDoc}
          onAddQuery={handleAddQuery}
          onAssignApp={(app) => setAssignTarget(app)}
        />
      )}

      {/* Assign Agent Modal */}
      {assignTarget && (
        <CaAssignAgentModal
          app={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssign={handleAssignConfirm}
        />
      )}
    </div>
  );
}
