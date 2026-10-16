import { describe, expect, it } from 'vitest';
import { resolveLandingRoute, resolvePostLoginRoute } from '@/modules/authentication/services/landingRouteService';
import type { SessionUser } from '@/modules/authentication/shared/types/session.types';
import type { Role } from '@/modules/authentication';

function userWith(role: Role, permissions: string[]): SessionUser {
  return { id: '1', username: 'user', displayName: 'User', role, permissions, lastLoginAt: null };
}

const admin = userWith('ADMIN', ['ADMIN_DASHBOARD_VIEW']);
const staffRoles: Role[] = ['CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT'];

describe('landingRouteService', () => {
  it('sends admins to the admin dashboard', () => {
    expect(resolveLandingRoute(admin)).toBe('/admin/dashboard');
  });

  it.each(staffRoles)('sends %s to the staff dashboard', (role) => {
    expect(resolveLandingRoute(userWith(role, ['STAFF_DASHBOARD_VIEW']))).toBe('/staff/dashboard');
  });

  it('returns to the requested page only inside the user’s own area', () => {
    const agent = userWith('CA_AGENT', ['STAFF_DASHBOARD_VIEW']);
    expect(resolvePostLoginRoute(agent, '/staff/dashboard?tab=open')).toBe('/staff/dashboard?tab=open');
    expect(resolvePostLoginRoute(agent, '/admin/dashboard')).toBe('/staff/dashboard');
    expect(resolvePostLoginRoute(admin, '/staff/dashboard')).toBe('/admin/dashboard');
  });

  it('ignores off-site redirect targets', () => {
    expect(resolvePostLoginRoute(admin, '//evil.example/admin')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(admin, 'https://evil.example')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(admin, '/\\evil.example')).toBe('/admin/dashboard');
  });

  it('does not reopen an area the server did not grant', () => {
    const noPermission = userWith('ADMIN', []);
    expect(resolvePostLoginRoute(noPermission, '/admin/dashboard')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(noPermission, '/admin/users')).toBe('/admin/dashboard');
  });
});
