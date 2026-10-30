import { CA_MANAGER_PROFILE_PATH, CA_MANAGER_ROOT_PATH, CA_MANAGER_WORKSPACE_LABEL } from './caManager.config';
import type { CaManagerNavItem, CaManagerSectionId } from './caManager.types';

/** CA Manager menu, in display order. The first item is the landing page. */
export const CA_MANAGER_NAV_ITEMS: readonly CaManagerNavItem[] = Object.freeze([
  {
    id: 'overview',
    label: 'CA Overview',
    path: `${CA_MANAGER_ROOT_PATH}/dashboard`,
    iconName: 'layout-dashboard',
    group: 'Work Queues',
    title: 'CA Manager Dashboard',
    description: 'CA operations at a glance.'
  },
  {
    id: 'verify',
    label: 'All Applications',
    path: `${CA_MANAGER_ROOT_PATH}/all`,
    iconName: 'inbox',
    group: 'Work Queues',
    description: 'Every application in your team. Open a new one to verify its details and documents, then send the payment request.',
    counterKey: 'submitted'
  },
  {
    id: 'customer',
    label: 'Waiting on Customer',
    path: `${CA_MANAGER_ROOT_PATH}/customer`,
    iconName: 'rotate-ccw',
    group: 'Work Queues',
    description: 'Sent back for corrections. They return to To Verify when the customer resubmits.'
  },
  {
    id: 'payment',
    label: 'Awaiting Payment',
    path: `${CA_MANAGER_ROOT_PATH}/payment`,
    iconName: 'credit-card',
    group: 'Work Queues',
    description: 'Payment requested from the customer. These cannot be assigned until they are paid.'
  },
  {
    id: 'assign',
    label: 'Ready to Assign',
    path: `${CA_MANAGER_ROOT_PATH}/assign`,
    iconName: 'user-check',
    group: 'Work Queues',
    description: 'Paid applications waiting for an agent. Compare workload before assigning.',
    counterKey: 'readyToAssign'
  },
  {
    id: 'missing',
    label: 'Missing Documents',
    path: `${CA_MANAGER_ROOT_PATH}/missing`,
    iconName: 'alert-triangle',
    group: 'Work Queues',
    description: 'Agents reported missing or unclear documents. Get them updated and send the case back.',
    counterKey: 'docsMissing'
  },
  {
    id: 'working',
    label: 'With Agents',
    path: `${CA_MANAGER_ROOT_PATH}/with-agents`,
    iconName: 'briefcase',
    group: 'Work Queues',
    description: 'Agents are checking documents or working on the portal.'
  },
  {
    id: 'completed',
    label: 'Completed',
    path: `${CA_MANAGER_ROOT_PATH}/completed`,
    iconName: 'circle-check',
    group: 'Work Queues',
    description: 'Delivered results. The customer can see them in the mobile app.'
  },
  {
    id: 'agents',
    label: 'CA Agents',
    path: `${CA_MANAGER_ROOT_PATH}/agents`,
    iconName: 'users',
    group: 'Team & Activity',
    description: 'Workload of your agents, to balance assignments.'
  },
  {
    id: 'audit',
    label: 'Audit Log',
    path: `${CA_MANAGER_ROOT_PATH}/audit`,
    iconName: 'shield-check',
    group: 'Team & Activity',
    description: 'Every verification, payment, assignment and delivery for your team.'
  },
  {
    id: 'communication',
    label: 'Communication',
    path: `${CA_MANAGER_ROOT_PATH}/communication`,
    iconName: 'message-square',
    group: 'Team & Activity',
    description: 'Messages with your agents, fellow managers and the administrator.',
    counterKey: 'communication'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: `${CA_MANAGER_ROOT_PATH}/notifications`,
    iconName: 'bell',
    group: 'Team & Activity',
    description: 'New applications, payments, missing documents and delivered results.',
    counterKey: 'notifications'
  }
]);

export function findCaManagerNavItem(pathname: string): CaManagerNavItem | undefined {
  return CA_MANAGER_NAV_ITEMS.find((item) => item.path === pathname);
}

/** Looks up a section's menu entry; every CaManagerSectionId is defined above, so a miss is a programming error. */
export function getCaManagerNavItem(id: CaManagerSectionId): CaManagerNavItem {
  const item = CA_MANAGER_NAV_ITEMS.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`CA Manager navigation item "${id}" is not configured.`);
  }
  return item;
}

/** Title shown in the top header for the current page. */
export function resolveCaManagerPageTitle(pathname: string): string {
  if (pathname === CA_MANAGER_PROFILE_PATH) {
    return 'My Profile';
  }
  const item = findCaManagerNavItem(pathname);
  return item ? item.title ?? item.label : CA_MANAGER_WORKSPACE_LABEL;
}

/** Sidebar entries that also appear as quick-access buttons in the top header, in display order. */
export const CA_MANAGER_HEADER_SHORTCUT_IDS: readonly CaManagerSectionId[] = Object.freeze(['notifications', 'communication']);
