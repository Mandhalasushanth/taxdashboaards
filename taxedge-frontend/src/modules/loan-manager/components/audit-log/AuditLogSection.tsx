import { AuditLogView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_SERVICES } from '../../shared/loanManager.config';

/** Loan Manager "Audit Log": read-only audit trail for the team's applications. */
export default function AuditLogSection() {
  const { item } = useLoanManagerSection('audit');
  return <AuditLogView title={item.label} services={LOAN_MANAGER_SERVICES} />;
}
