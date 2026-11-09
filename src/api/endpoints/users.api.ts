import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { AuthUser } from '@/types/auth.types'

/** Account endpoints for the signed-in user. */
export const usersApi = {
  /** Update the signed-in user's profile. */
  updateMe: (data: { name: string }) =>
    apiClient.patch<ApiResponse<AuthUser>>(API_ENDPOINTS.USERS.ME, data),
}
