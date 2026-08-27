import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  TeamMember,
  TeamInvitation,
  TeamActivityLog,
  RoleDefinition,
} from '@/types/team.types'
import type { Role } from '@/config/permissions'

export const teamApi = {
  members: () =>
    httpClient.get<ApiResponse<TeamMember[]>>(API_ENDPOINTS.TEAM.MEMBERS),
  roles: () => httpClient.get<ApiResponse<RoleDefinition[]>>(API_ENDPOINTS.TEAM.ROLES),
  invitations: () =>
    httpClient.get<ApiResponse<TeamInvitation[]>>(API_ENDPOINTS.TEAM.INVITATIONS),
  activity: () =>
    httpClient.get<ApiResponse<TeamActivityLog[]>>(API_ENDPOINTS.TEAM.ACTIVITY),
  invite: (email: string, role: Role) =>
    httpClient.post<ApiResponse<TeamInvitation>>(API_ENDPOINTS.TEAM.INVITATIONS, {
      email,
      role,
    }),
}
