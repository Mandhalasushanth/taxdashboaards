import { AuditLogView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_SERVICES } from '../../shared/caManager.config';

/** CA Manager "Audit Log": read-only audit trail for the team's applications. */
export default function AuditLogSection() {
  const { item } = useCaManagerSection('audit');
  return <AuditLogView title={item.label} services={CA_MANAGER_SERVICES} />;
}
