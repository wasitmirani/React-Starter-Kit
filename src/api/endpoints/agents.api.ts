import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  BackendAgent,
  BackendAgentVersion,
  BackendAgentWrite,
  BackendBrowserSession,
} from '@/types/backend.types'

export const agentsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<ApiResponse<BackendAgent[]>>(API_ENDPOINTS.AGENTS.BASE, { params }),

  get: (id: string) =>
    httpClient.get<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.BY_ID(id)),

  create: (payload: BackendAgentWrite) =>
    httpClient.post<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.BASE, payload),

  update: (id: string, payload: Partial<BackendAgentWrite>) =>
    httpClient.patch<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.BY_ID(id), payload),

  remove: (id: string) =>
    httpClient.delete<ApiResponse<null>>(API_ENDPOINTS.AGENTS.BY_ID(id)),

  duplicate: (id: string) =>
    httpClient.post<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.DUPLICATE(id)),

  publish: (id: string) =>
    httpClient.post<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.PUBLISH(id)),

  unpublish: (id: string) =>
    httpClient.post<ApiResponse<BackendAgent>>(API_ENDPOINTS.AGENTS.UNPUBLISH(id)),

  versions: (id: string) =>
    httpClient.get<ApiResponse<BackendAgentVersion[]>>(API_ENDPOINTS.AGENTS.VERSIONS(id)),

  test: (id: string) =>
    httpClient.post<ApiResponse<BackendBrowserSession>>(API_ENDPOINTS.AGENTS.TEST(id)),
}
