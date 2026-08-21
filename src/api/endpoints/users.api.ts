import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import type { User, UserProfile } from '@/types/user.types'

export const usersApi = {
  getMe: () => httpClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.ME),

  getAll: (params?: PaginationParams) =>
    httpClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<User>>(`${API_ENDPOINTS.USERS.BASE}/${id}`),

  update: (id: string, data: Partial<UserProfile>) =>
    httpClient.patch<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USERS.BASE}/${id}`, data),
}
