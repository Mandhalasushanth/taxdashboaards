import { TeamWorkloadView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';

/** Loan Manager "Loan Agents": active, portal, completed and overdue work per agent, for balanced assignment. */
export default function AgentsSection() {
  const { item } = useLoanManagerSection('agents');
  return <TeamWorkloadView title={item.label} />;
}
