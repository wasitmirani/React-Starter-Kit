import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import type { User, UserProfile } from '@/types/user.types'

export const usersApi = {
  getMe: () => apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.ME),

  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`${API_ENDPOINTS.USERS.BASE}/${id}`),

  update: (id: string, data: Partial<UserProfile>) =>
    apiClient.patch<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USERS.BASE}/${id}`, data),
}
