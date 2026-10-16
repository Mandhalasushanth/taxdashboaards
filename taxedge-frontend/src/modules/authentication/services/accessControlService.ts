import { AREA_ACCESS, ROLE_PROFILES } from '../shared/config/roleRoutes';
import type { Permission } from '../shared/types/permission.types';
import type { Role, RoleProfile } from '../shared/types/role.types';

/** Minimal shape needed for access checks, so this module stays independent of identity types. */
export interface AccessSubject {
  readonly role: Role;
  readonly permissions: readonly Permission[];
}

export function getRoleProfile(role: Role): RoleProfile {
  return ROLE_PROFILES[role];
}

export function hasRole(subject: AccessSubject | null, allowedRoles: readonly Role[]): boolean {
  return subject !== null && allowedRoles.includes(subject.role);
}

export function hasPermission(subject: AccessSubject | null, permission: Permission): boolean {
  return subject !== null && subject.permissions.includes(permission);
}

/** Whether an in-app path belongs to the workspace area this subject is allowed to enter. */
export function canAccessPath(subject: AccessSubject, path: string): boolean {
  const { area } = getRoleProfile(subject.role);
  const { rootPath, permission } = AREA_ACCESS[area];
  const insideArea = path === rootPath || path.startsWith(`${rootPath}/`);
  return insideArea && hasPermission(subject, permission);
}
