import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type { Campaign, CreateCampaignPayload } from '@/types/campaign.types'

export const campaignsApi = {
  list: (params?: PaginationParams) =>
    httpClient.get<ApiResponse<Campaign[]>>(API_ENDPOINTS.CAMPAIGNS.BASE, { params }),

  get: (id: string) =>
    httpClient.get<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.BY_ID(id)),

  create: (payload: CreateCampaignPayload) =>
    httpClient.post<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.BASE, payload),

  update: (id: string, payload: Partial<CreateCampaignPayload>) =>
    httpClient.patch<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.BY_ID(id), payload),

  remove: (id: string) =>
    httpClient.delete<ApiResponse<null>>(API_ENDPOINTS.CAMPAIGNS.BY_ID(id)),

  start: (id: string) =>
    httpClient.post<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.START(id)),

  pause: (id: string) =>
    httpClient.post<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.PAUSE(id)),

  stop: (id: string) =>
    httpClient.post<ApiResponse<Campaign>>(API_ENDPOINTS.CAMPAIGNS.STOP(id)),
}
