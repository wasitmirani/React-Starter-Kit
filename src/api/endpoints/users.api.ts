import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import type { User, UserProfile } from '@/types/user.types'

/** User endpoints: current profile, listing, updates, and password change. */
export const usersApi = {
  /** Fetch the authenticated user's profile. */
  getMe: () => apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.ME),

  /** List users with optional pagination. */
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params }),

  /** Fetch a single user by id. */
  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`${API_ENDPOINTS.USERS.BASE}/${id}`),

  /** Partially update a user's profile. */
  update: (id: string, data: Partial<UserProfile>) =>
    apiClient.patch<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USERS.BASE}/${id}`, data),

  /** Change the authenticated user's password. */
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.patch<ApiResponse<void>>(`${API_ENDPOINTS.USERS.BASE}/change-password`, data),
}
