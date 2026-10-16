import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { NewStaffInput, StaffMember, StaffTier, UpdateStaffInput } from '../shared/staff.types';
import { parseStaffList, parseStaffMember } from '../validation/staffSchema';

interface StaffGateway {
  list(tier: StaffTier): Promise<unknown>;
  create(input: NewStaffInput): Promise<unknown>;
  update(id: string, input: UpdateStaffInput): Promise<unknown>;
  setActive(id: string, active: boolean): Promise<void>;
}

const httpGateway: StaffGateway = Object.freeze({
  list: (tier: StaffTier) => apiClient.get<unknown>(`${API_ENDPOINTS.admin.staff}?tier=${tier}`),
  create: (input: NewStaffInput) => apiClient.post<unknown>(API_ENDPOINTS.admin.staff, input),
  update: (id: string, input: UpdateStaffInput) =>
    apiClient.patch<unknown>(`${API_ENDPOINTS.admin.staff}/${encodeURIComponent(id)}`, input),
  setActive: async (id: string, active: boolean) => {
    await apiClient.patch<unknown>(`${API_ENDPOINTS.admin.staff}/${encodeURIComponent(id)}/status`, { active });
  }
});

async function getGateway(): Promise<StaffGateway> {
  // Statically removed from production builds, like the other admin demo stores.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoStaffStore } = await import('../dev/demoStaffStore');
    return demoStaffStore;
  }
  return httpGateway;
}

export async function fetchStaff(tier: StaffTier): Promise<StaffMember[]> {
  return parseStaffList(await (await getGateway()).list(tier));
}

/** The server stores only a hash of the password the administrator sets. */
export async function createStaffMember(input: NewStaffInput): Promise<StaffMember | null> {
  return parseStaffMember(await (await getGateway()).create(input));
}

/** A non-empty password replaces the current one; the server should end that user's other sessions. */
export async function updateStaffMember(id: string, input: UpdateStaffInput): Promise<StaffMember | null> {
  return parseStaffMember(await (await getGateway()).update(id, input));
}

export async function setStaffActive(id: string, active: boolean): Promise<void> {
  await (await getGateway()).setActive(id, active);
}
