import { useMemo } from 'react';
import { useCurrentUser } from '@/modules/authentication';
import { useDocumentTitle } from '@/shared';
import { CaAgentsWorkloadSection } from '../components/agents/CaAgentsWorkloadSection';
import { CaApplicationsSection } from '../components/applications/CaApplicationsSection';
import { CaCommunicationSection } from '../components/communication/CaCommunicationSection';
import { CaDocumentsSection } from '../components/documents/CaDocumentsSection';
import { CaEscalationsSection } from '../components/escalations/CaEscalationsSection';
import { CaNotificationsSection } from '../components/notifications/CaNotificationsSection';
import { CaManagerOverview } from '../components/overview/CaManagerOverview';
import { CaReportsSection } from '../components/reports/CaReportsSection';
import { CaReviewQueueSection } from '../components/review/CaReviewQueueSection';
import { CaTasksSection } from '../components/tasks/CaTasksSection';
import { useCaManagerSection } from '../shared/CaManagerContext';
import { getCaNavItem, type CaSectionId } from '../shared/caManagerNavigation';
import './CaManagerDashboardPage.css';

function renderSection(activeSection: CaSectionId) {
  try {
    switch (activeSection) {
      case 'overview':
        return <CaManagerOverview />;
      case 'incoming':
        return (
          <CaApplicationsSection
            title="Incoming Applications Queue"
            subtitle="New and untriaged GST, ITR, and company incorporation submissions awaiting intake review."
            initialStatus="NEW"
          />
        );
      case 'applications':
        return (
          <CaApplicationsSection
            title="All CA Applications"
            subtitle="Searchable master ledger of GST, ITR, and incorporation customer filings."
          />
        );
      case 'unassigned':
        return (
          <CaApplicationsSection
            title="Unassigned Case Queue"
            subtitle="Applications with no CA agent assigned; triage, inspect eligibility, and assign."
            unassignedOnly={true}
          />
        );
      case 'reviews':
        return <CaReviewQueueSection />;
      case 'agents':
        return <CaAgentsWorkloadSection />;
      case 'tasks':
        return <CaTasksSection />;
      case 'documents':
        return <CaDocumentsSection />;
      case 'communication':
        return <CaCommunicationSection />;
      case 'escalations':
        return <CaEscalationsSection />;
      case 'reports':
        return <CaReportsSection />;
      case 'notifications':
        return <CaNotificationsSection />;
      default:
        return <CaManagerOverview />;
    }
  } catch (err) {
    console.error('Error rendering CA Manager section:', err);
    return <CaManagerOverview />;
  }
}

export default function CaManagerDashboardPage() {
  const user = useCurrentUser();
  const { activeSection } = useCaManagerSection();

  const currentNav = useMemo(() => {
    try {
      return getCaNavItem(activeSection);
    } catch {
      return getCaNavItem('overview');
    }
  }, [activeSection]);

  useDocumentTitle(`${currentNav.title} | TaxEdge CA Operations`);

  if (!user) {
    return null;
  }

  const content = renderSection(activeSection);

  return (
    <div className="tx-ca-manager-dashboard" data-section={activeSection}>
      {content}
    </div>
  );
}
