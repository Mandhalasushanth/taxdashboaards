import { useState } from 'react';
import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { toInitials } from '@/core/utils/stringUtils';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { BrandLockup, Icon, SignOutModal } from '@/shared';
import { CA_NAV_ITEMS, type CaNavItem, type CaSectionId } from '../../shared/caManagerNavigation';
import { useCaNavCounters } from '../../hooks/useCaNavCounters';
import './CaManagerSidebar.css';

export const CA_MANAGER_SIDEBAR_ID = 'tx-ca-manager-sidebar';

export interface CaManagerSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly activeSection?: CaSectionId;
  readonly onSelectSection?: (section: CaSectionId) => void;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

import { useCaManagerSection } from '../../shared/CaManagerContext';

export function CaManagerSidebar({
  collapsed,
  mobileOpen,
  activeSection: propActiveSection,
  onSelectSection: propOnSelectSection,
  onNavigate,
  onOpenProfile
}: CaManagerSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const counters = useCaNavCounters();
  const contextSection = useCaManagerSection();

  const activeSection = propActiveSection ?? contextSection.activeSection;
  const onSelectSection = propOnSelectSection ?? contextSection.setActiveSection;

  const handleSignOutClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSignOut = () => {
    void signOut();
  };

  const roleLabel = user ? getRoleProfile(user.role).label : 'CA Manager';
  const classes = [
    'tx-ca-sidebar',
    collapsed ? 'tx-ca-sidebar--collapsed' : '',
    mobileOpen ? 'tx-ca-sidebar--open' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const renderItem = (item: CaNavItem) => {
    const badge = item.counterKey ? counters[item.counterKey] : undefined;
    const isActive = activeSection === item.id;

    return (
      <li key={item.id}>
        <button
          type="button"
          className={`tx-ca-nav__btn ${isActive ? 'tx-ca-nav__btn--active' : ''}`}
          onClick={() => {
            onSelectSection(item.id);
            onNavigate();
          }}
          title={collapsed ? item.label : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon name={item.iconName} />
          <span className="tx-ca-nav__label">{item.label}</span>
          {badge ? <span className="tx-ca-nav__badge">{badge}</span> : null}
        </button>
      </li>
    );
  };

  return (
    <>
      <aside id={CA_MANAGER_SIDEBAR_ID} className={classes} aria-label="CA Manager operations navigation">
        <div className="tx-ca-sidebar__brand">
          <BrandLockup
            appName={environment.appName}
            tagline="CA Operations Workspace"
            logoSrc={BRAND_ASSETS.logo}
          />
        </div>

        <nav className="tx-ca-nav">
          <p className="tx-ca-nav__section">Work Queues</p>
          <ul className="tx-ca-nav__list">
            {CA_NAV_ITEMS.slice(0, 5).map(renderItem)}
          </ul>

          <p className="tx-ca-nav__section" style={{ marginTop: 12 }}>Operations & Oversight</p>
          <ul className="tx-ca-nav__list">
            {CA_NAV_ITEMS.slice(5).map(renderItem)}
          </ul>
        </nav>

        {user ? (
          <div className="tx-ca-sidebar__footer">
            {onOpenProfile ? (
              <button
                type="button"
                className="tx-ca-sidebar__profile-btn"
                onClick={() => {
                  onNavigate();
                  onOpenProfile();
                }}
                title={`Profile: ${user.displayName}`}
              >
                <span className="tx-ca-sidebar__avatar" aria-hidden="true">
                  {toInitials(user.displayName)}
                </span>
                <span className="tx-ca-sidebar__user">
                  <span className="tx-ca-sidebar__user-name">{user.displayName}</span>
                  <span className="tx-ca-sidebar__user-role">{roleLabel}</span>
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className="tx-ca-sidebar__signout-btn"
              onClick={handleSignOutClick}
              title="Sign out of TaxEdge"
              aria-label="Sign out"
            >
              <Icon name="log-out" />
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
