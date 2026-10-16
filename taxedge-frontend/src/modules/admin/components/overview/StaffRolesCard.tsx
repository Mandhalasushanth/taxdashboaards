import { ROLE_PROFILES, STAFF_ROLES, type RoleProfile } from '@/modules/authentication';
import { SummaryCard } from '@/shared';
import './StaffRolesCard.css';

function renderStaffRole(profile: RoleProfile) {
  return (
    <li key={profile.role} className="tx-staff-roles__item">
      <span className="tx-staff-roles__name">{profile.label}</span>
      <span className="tx-staff-roles__summary">{profile.dashboardSummary}</span>
    </li>
  );
}

/** Overview card listing the four staff roles an administrator provisions. */
export function StaffRolesCard() {
  return (
    <SummaryCard iconName="layout-dashboard" title="Staff roles you administer">
      <ul className="tx-staff-roles">{STAFF_ROLES.map((role) => renderStaffRole(ROLE_PROFILES[role]))}</ul>
    </SummaryCard>
  );
}
