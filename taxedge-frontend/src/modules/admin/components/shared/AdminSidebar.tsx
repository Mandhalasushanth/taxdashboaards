import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { toInitials } from '@/core/utils/stringUtils';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { BrandLockup, Icon, LoadingSpinner, SignOutModal } from '@/shared';
import { ADMIN_NAV_ITEMS, type AdminNavCounters, type AdminNavItem } from '../../shared/adminNavigation';
import { useAdminNavCounters } from '../../hooks/useAdminNavCounters';
import './AdminSidebar.css';

export const ADMIN_SIDEBAR_ID = 'tx-admin-sidebar';

export interface AdminSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'tx-admin-nav__link tx-admin-nav__link--active' : 'tx-admin-nav__link';
}

function badgeFor(item: AdminNavItem, counters: AdminNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Admin navigation drawer: fixed column on desktop (collapsible), off-canvas on tablet and mobile. */
export function AdminSidebar({ collapsed, mobileOpen, onNavigate, onOpenProfile }: AdminSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const counters = useAdminNavCounters();

  const handleSignOutClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSignOut = () => {
    void signOut();
  };

  const roleLabel = user ? getRoleProfile(user.role).label : '';
  const classes = ['tx-admin-sidebar', collapsed ? 'tx-admin-sidebar--collapsed' : '', mobileOpen ? 'tx-admin-sidebar--open' : '']
    .filter(Boolean)
    .join(' ');

  const renderItem = (item: AdminNavItem) => {
    const badge = badgeFor(item, counters);
    return (
      <li key={item.id}>
        <NavLink to={item.path} className={navLinkClass} onClick={onNavigate} title={collapsed ? item.label : undefined}>
          <Icon name={item.iconName} />
          <span className="tx-admin-nav__label">{item.label}</span>
          {badge ? (
            <span className="tx-admin-nav__badge" aria-label={`${badge} pending`}>
              {badge}
            </span>
          ) : null}
        </NavLink>
      </li>
    );
  };

  const userBlockContent = user ? (
    <>
      <span className="tx-admin-sidebar__avatar" aria-hidden="true">
        {toInitials(user.displayName)}
      </span>
      <span className="tx-admin-sidebar__user">
        <span className="tx-admin-sidebar__user-name">{user.displayName}</span>
        <span className="tx-admin-sidebar__user-role">{roleLabel}</span>
      </span>
    </>
  ) : null;

  return (
    <>
      <aside id={ADMIN_SIDEBAR_ID} className={classes} aria-label="Admin navigation">
        <NavLink to={ADMIN_NAV_ITEMS[0].path} className="tx-admin-sidebar__brand" onClick={onNavigate}>
          <BrandLockup appName={environment.appName} tagline={environment.appTagline} logoSrc={BRAND_ASSETS.logo} />
        </NavLink>

        <nav className="tx-admin-nav">
          <p className="tx-admin-nav__section">Main Menu</p>
          <ul className="tx-admin-nav__list">{ADMIN_NAV_ITEMS.map(renderItem)}</ul>
        </nav>

        {user ? (
          <div className="tx-admin-sidebar__footer">
            {onOpenProfile ? (
              <button
                type="button"
                className="tx-admin-sidebar__profile-btn"
                onClick={() => {
                  onNavigate();
                  onOpenProfile();
                }}
                title={`Profile: ${user.displayName}`}
              >
                {userBlockContent}
              </button>
            ) : (
              userBlockContent
            )}
            <button
              type="button"
              className="tx-admin-sidebar__signout"
              onClick={handleSignOutClick}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
            >
              {signingOut ? <LoadingSpinner /> : <Icon name="log-out" />}
            </button>
          </div>
        ) : null}
      </aside>

      <SignOutModal
        open={confirmOpen}
        userName={user?.displayName}
        signingOut={signingOut}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
