/** Backend endpoint paths, relative to environment.apiBaseUrl. */
export const API_ENDPOINTS = Object.freeze({
  identity: Object.freeze({
    csrf: '/identity/csrf',
    login: '/identity/login',
    session: '/identity/session',
    logout: '/identity/logout'
  }),
  admin: Object.freeze({
    navigationCounters: '/admin/navigation/counters',
    settings: '/admin/settings',
    notifications: '/admin/notifications',
    notificationsReadAll: '/admin/notifications/read-all',
    reports: '/admin/reports',
    staff: '/admin/staff',
    communicationContacts: '/admin/communication/contacts',
    revenue: '/admin/revenue',
    applications: '/admin/applications'
  })
});
