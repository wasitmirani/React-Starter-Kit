import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { BackendOrganization } from '@/types/backend.types'

export const organizationsApi = {
  me: () =>
    httpClient.get<ApiResponse<BackendOrganization>>(API_ENDPOINTS.ORGANIZATIONS.ME),

  updateMe: (payload: { name?: string; settings?: Record<string, unknown> }) =>
    httpClient.patch<ApiResponse<BackendOrganization>>(
      API_ENDPOINTS.ORGANIZATIONS.ME,
      payload,
    ),
}
