import { API_ENDPOINTS, apiClient } from '@/core/api';
import type { NewStaffInput, StaffTier, UpdateStaffInput } from '../shared/staff.types';

/**
 * Manager and agent accounts on the backend's ManagerLoginController (/api/v1/admin/managers) and
 * AgentLoginController (/api/v1/admin/agents). The server's DTOs use "email" where the staff screens
 * use "username" and have no status or work figures yet, so records are translated into the shape
 * parseStaffMember reads.
 */
type AccountRecord = Readonly<Record<string, unknown>>;

const BASE_PATHS: Readonly<Record<StaffTier, string>> = Object.freeze({
  MANAGER: API_ENDPOINTS.admin.managers,
  AGENT: API_ENDPOINTS.admin.agents
});

const accountPath = (tier: StaffTier, id: string) => `${BASE_PATHS[tier]}/${encodeURIComponent(id)}`;

/** Agents send their "Reports to" manager; a blank password is left out, so an edit keeps the current one. */
const toAccountBody = (tier: StaffTier, input: NewStaffInput | UpdateStaffInput) => ({
  fullName: input.fullName.trim(),
  email: input.username.trim().toLowerCase(),
  role: input.role,
  ...(tier === 'AGENT' && input.managerId ? { managerId: Number(input.managerId) } : {}),
  ...(input.password ? { password: input.password, confirmPassword: input.password } : {})
});

const toStaffRecord = (raw: unknown): unknown => {
  if (typeof raw !== 'object' || raw === null) return raw;
  const record = raw as AccountRecord;
  return {
    ...record,
    username: record.email,
    managerId: record.managerId === null || record.managerId === undefined ? null : String(record.managerId),
    // Every stored account can sign in; the backend has no deactivated state.
    active: true,
    joinedAt: record.createdAt
  };
};

export const accountGateway = Object.freeze({
  list: async (tier: StaffTier) => {
    const body = await apiClient.get<unknown>(BASE_PATHS[tier]);
    return Array.isArray(body) ? body.map(toStaffRecord) : [];
  },
  create: async (tier: StaffTier, input: NewStaffInput) =>
    toStaffRecord(await apiClient.post<unknown>(BASE_PATHS[tier], toAccountBody(tier, input))),
  update: async (tier: StaffTier, id: string, input: UpdateStaffInput) =>
    toStaffRecord(await apiClient.put<unknown>(accountPath(tier, id), toAccountBody(tier, input))),
  remove: async (tier: StaffTier, id: string) => {
    await apiClient.delete<void>(accountPath(tier, id));
  }
});
