import { TeamWorkloadView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';

/** CA Manager "CA Agents": active, portal, completed and overdue work per agent, for balanced assignment. */
export default function AgentsSection() {
  const { item } = useCaManagerSection('agents');
  return <TeamWorkloadView title={item.label} />;
}
