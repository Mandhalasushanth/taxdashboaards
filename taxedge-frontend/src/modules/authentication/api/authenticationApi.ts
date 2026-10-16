import { API_ENDPOINTS, apiClient, hasCsrfToken } from '@/core/api';
import { environment } from '@/core/config/environment';
import { logger } from '@/core/logging/logger';
import type { AuthenticationGateway, LoginCredentials } from '../shared/types/authentication.types';
import { parseSessionUser } from './sessionUserParser';

/** Identity calls answer 401/403 as part of normal flow, so they never trigger the global session-loss handler. */
const IDENTITY_REQUEST = Object.freeze({ notifySessionLoss: false });

async function ensureCsrfToken(): Promise<void> {
  if (!hasCsrfToken()) {
    await apiClient.get<void>(API_ENDPOINTS.identity.csrf, IDENTITY_REQUEST);
  }
}

export const httpAuthenticationGateway: AuthenticationGateway = Object.freeze({
  async login(credentials: LoginCredentials) {
    await ensureCsrfToken();
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.identity.login, credentials, IDENTITY_REQUEST);
    return parseSessionUser(payload);
  },

  async fetchSession() {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.identity.session, IDENTITY_REQUEST);
    return payload ? parseSessionUser(payload) : null;
  },

  async logout() {
    await ensureCsrfToken();
    await apiClient.post<void>(API_ENDPOINTS.identity.logout, {}, IDENTITY_REQUEST);
  }
});

async function loadGateway(): Promise<AuthenticationGateway> {
  // `import.meta.env.DEV` is statically false in production builds, so the demo module is never bundled.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoAuthenticationGateway } = await import('../dev/demoAuthenticationGateway');
    logger.warn('Demo authentication is enabled. Requests are not sent to the backend.');
    return demoAuthenticationGateway;
  }
  return httpAuthenticationGateway;
}

let gatewayPromise: Promise<AuthenticationGateway> | null = null;

export function getAuthenticationGateway(): Promise<AuthenticationGateway> {
  gatewayPromise ??= loadGateway();
  return gatewayPromise;
}
