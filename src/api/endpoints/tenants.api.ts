import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { Member, Tenant, TenantSettings } from '@/types/workspace.types'

const base = (tenantId: string) => `${API_ENDPOINTS.TENANTS}/${tenantId}`

/** Workspace endpoints. The tenant is addressed in the path. */
export const tenantsApi = {
  /** Create a workspace owned by the current user. */
  create: (name: string) => apiClient.post<ApiResponse<Tenant>>(API_ENDPOINTS.TENANTS, { name }),

  get: (tenantId: string) => apiClient.get<ApiResponse<Tenant>>(base(tenantId)),

  update: (tenantId: string, data: { name: string }) =>
    apiClient.patch<ApiResponse<Tenant>>(base(tenantId), data),

  getSettings: (tenantId: string) =>
    apiClient.get<ApiResponse<TenantSettings>>(`${base(tenantId)}/settings`),

  updateSettings: (tenantId: string, data: { timezone?: string; locale?: string }) =>
    apiClient.patch<ApiResponse<TenantSettings>>(`${base(tenantId)}/settings`, data),

  members: (tenantId: string) => apiClient.get<ApiResponse<Member[]>>(`${base(tenantId)}/members`),

  updateMember: (tenantId: string, memberId: string, data: { roleId?: string; status?: Member['status'] }) =>
    apiClient.patch<ApiResponse<Member>>(`${base(tenantId)}/members/${memberId}`, data),

  removeMember: (tenantId: string, memberId: string) =>
    apiClient.delete(`${base(tenantId)}/members/${memberId}`),

  /** Leave the workspace (not allowed for the last owner). */
  leave: (tenantId: string) => apiClient.post(`${base(tenantId)}/leave`),
}
