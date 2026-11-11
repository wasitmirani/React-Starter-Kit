import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { AuthUser } from '@/types/auth.types'
import type { MyWorkspaces } from '@/types/workspace.types'

/** Account endpoints for the signed-in user. */
export const usersApi = {
  /** Update the signed-in user's profile. */
  updateMe: (data: { name?: string; preferences?: { brandTheme?: string | null; colorMode?: 'light' | 'dark' | null } }) =>
    apiClient.patch<ApiResponse<AuthUser>>(API_ENDPOINTS.USERS.ME, data),

  /** Workspaces I belong to, my role and plan in each, and how many more I may create. */
  myWorkspaces: () => apiClient.get<ApiResponse<MyWorkspaces>>(`${API_ENDPOINTS.USERS.ME}/workspaces`),
}
