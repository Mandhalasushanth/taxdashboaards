import { AuditLogView, SERVICE_KINDS } from '@/modules/workflow';
import { getAdminNavItem } from '../../shared/adminNavigation';

const ITEM = getAdminNavItem('audit');

/** Admin "Audit Logs": every verification, payment, assignment, delivery and intervention, read-only. */
export default function AuditLogSection() {
  return <AuditLogView title={ITEM.label} services={SERVICE_KINDS} />;
}
