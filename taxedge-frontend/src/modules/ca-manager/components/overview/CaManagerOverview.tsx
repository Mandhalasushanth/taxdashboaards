import { useState } from 'react';
import { DeferredContent, LoadingSpinner } from '@/shared';
import { useCaManagerSummary } from '../../hooks/useCaManagerSummary';
import type { ApplicationItem, AssignStaffInput, CaServiceType } from '../../shared/caManager.types';
import { useCaManagerSection } from '../../shared/CaManagerContext';
import type { CaSectionId } from '../../shared/caManagerNavigation';
import { CaApplicationDetailDrawer } from '../applications/CaApplicationDetailDrawer';
import { CaAssignAgentModal } from '../applications/CaAssignAgentModal';
import { demoApplicationsStore } from '@/modules/admin/dev/demoApplicationsStore';
import { caManagerApi } from '../../api/caManagerApi';
import { CaKpiCardsBar } from './CaKpiCardsBar';
import { CaRecentActivityFeed } from './CaRecentActivityFeed';
import { CaServiceDistribution } from './CaServiceDistribution';
import { CaUrgentWorkPanel } from './CaUrgentWorkPanel';
import './CaManagerOverview.css';

export interface CaManagerOverviewProps {
  readonly onSelectSection?: (section: CaSectionId) => void;
  readonly onOpenApp?: (app: ApplicationItem) => void;
  readonly onAssignApp?: (app: ApplicationItem) => void;
  readonly onFilterServiceCategory?: (category: CaServiceType) => void;
}

export function CaManagerOverview({
  onSelectSection: propSelectSection,
  onOpenApp,
  onAssignApp,
  onFilterServiceCategory
}: CaManagerOverviewProps = {}) {
  const { setActiveSection } = useCaManagerSection();
  const summary = useCaManagerSummary();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [assignTarget, setAssignTarget] = useState<ApplicationItem | null>(null);

  const handleSelectSection = propSelectSection || setActiveSection;
  const handleOpenApp = onOpenApp || ((app) => setSelectedApp(app));
  const handleAssignApp = onAssignApp || ((app) => setAssignTarget(app));
  const handleFilterServiceCategory = onFilterServiceCategory || (() => setActiveSection('applications'));

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
      await demoApplicationsStore.addQuery(appId, 'Sanjay Verma (CA Manager)', 'CA_MANAGER', msg);
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
      <CaKpiCardsBar kpis={summary.kpis} onSelectSection={handleSelectSection} />

      <CaUrgentWorkPanel
        urgentCases={summary.urgentCases}
        onOpenApp={handleOpenApp}
        onAssignApp={handleAssignApp}
      />

      <div className="tx-ca-overview__bottom-split">
        <CaServiceDistribution
          metrics={summary.serviceMetrics}
          onSelectServiceCategory={handleFilterServiceCategory}
        />
        <CaRecentActivityFeed activities={summary.recentActivity} />
      </div>

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
