import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, CursorPage, CursorParams } from '@/types/api.types'
import type {
  ApiKey,
  ApiKeySecret,
  AuditLogEntry,
  Invitation,
  InvitationPreview,
  Permission,
  Role,
  RolePayload,
} from '@/types/workspace.types'

/** Roles, invitations, API keys and audit log for the current workspace (X-Tenant-Id). */
export const accessApi = {
  permissions: () => apiClient.get<ApiResponse<Permission[]>>(API_ENDPOINTS.PERMISSIONS),

  roles: () => apiClient.get<ApiResponse<Role[]>>(API_ENDPOINTS.ROLES),
  createRole: (data: RolePayload) => apiClient.post<ApiResponse<Role>>(API_ENDPOINTS.ROLES, data),
  updateRole: (id: string, data: Partial<RolePayload>) =>
    apiClient.patch<ApiResponse<Role>>(`${API_ENDPOINTS.ROLES}/${id}`, data),
  deleteRole: (id: string) => apiClient.delete(`${API_ENDPOINTS.ROLES}/${id}`),

  invitations: () => apiClient.get<ApiResponse<Invitation[]>>(API_ENDPOINTS.INVITATIONS),
  invite: (data: { email: string; roleId: string }) =>
    apiClient.post<ApiResponse<{ id: string }>>(API_ENDPOINTS.INVITATIONS, data),
  resendInvitation: (id: string) => apiClient.post(`${API_ENDPOINTS.INVITATIONS}/${id}/resend`),
  revokeInvitation: (id: string) => apiClient.delete(`${API_ENDPOINTS.INVITATIONS}/${id}`),
  /** Public: shows what an invitation link grants. */
  previewInvitation: (token: string) =>
    apiClient.get<ApiResponse<InvitationPreview>>(`${API_ENDPOINTS.INVITATIONS}/preview`, {
      params: { token },
    }),
  acceptInvitation: (token: string) =>
    apiClient.post<ApiResponse<{ tenant: { id: string; name: string }; memberId: string }>>(
      `${API_ENDPOINTS.INVITATIONS}/accept`,
      { token },
    ),

  apiKeys: () => apiClient.get<ApiResponse<ApiKey[]>>(API_ENDPOINTS.API_KEYS),
  createApiKey: (data: { name: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.post<ApiResponse<ApiKeySecret>>(API_ENDPOINTS.API_KEYS, data),
  rotateApiKey: (id: string) =>
    apiClient.post<ApiResponse<ApiKeySecret>>(`${API_ENDPOINTS.API_KEYS}/${id}/rotate`),
  revokeApiKey: (id: string) => apiClient.delete(`${API_ENDPOINTS.API_KEYS}/${id}`),

  auditLogs: (params: CursorParams & { action?: string }) =>
    apiClient.get<ApiResponse<CursorPage<AuditLogEntry>>>(API_ENDPOINTS.AUDIT_LOGS, { params }),
}
