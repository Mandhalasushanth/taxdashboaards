/** Backend endpoint paths, relative to environment.apiBaseUrl. */
export const API_ENDPOINTS = Object.freeze({
  identity: Object.freeze({
    csrf: '/identity/csrf',
    login: '/auth/login',
    session: '/identity/session',
    logout: '/identity/logout'
  }),
  admin: Object.freeze({
    profile: '/admin/profile',
    /** AdminLoginController PUT /{id}: the admin's own email and password. */
    updateAdmin: '/admin',
    navigationCounters: '/admin/navigation/counters',
    settings: '/admin/settings',
    notifications: '/admin/notifications',
    notificationsReadAll: '/admin/notifications/read-all',
    reports: '/admin/reports',
    staff: '/admin/staff',
    managers: '/admin/managers',
    agents: '/admin/agents',
    communicationContacts: '/admin/communication/contacts',
    /** Push notifications the admin sends to every customer's mobile app. */
    pushNotifications: '/admin/push-notifications',
    revenue: '/admin/revenue',
    applications: '/admin/applications',
    customers: '/admin/customers',
    serviceCatalog: '/admin/service-catalog'
  }),
  /** Staff workspaces (managers and agents); the server scopes every list to the session's role and team. */
  staff: Object.freeze({
    communicationContacts: '/staff/communication/contacts',
    /** Push notifications a manager sends to chosen customers on their team's applications. */
    pushNotifications: '/staff/push-notifications'
  }),
  /** Application workflow shared by every role; the server scopes each response to the session's role. */
  workflow: Object.freeze({
    cases: '/workflow/cases',
    summary: '/workflow/cases/summary',
    agents: '/workflow/agents',
    workload: '/workflow/agents/workload',
    audit: '/workflow/audit-events',
    notifications: '/workflow/notifications',
    notificationsReadAll: '/workflow/notifications/read-all'
  })
});