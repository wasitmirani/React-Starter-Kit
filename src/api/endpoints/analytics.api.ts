import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  AnalyticsKpis,
  AnalyticsSeriesPoint,
  AgentPerformanceRow,
  CampaignAnalyticsRow,
} from '@/types/analytics.types'

export const analyticsApi = {
  overview: () =>
    httpClient.get<ApiResponse<AnalyticsKpis>>(API_ENDPOINTS.ANALYTICS.OVERVIEW),
  calls: () =>
    httpClient.get<ApiResponse<AnalyticsSeriesPoint[]>>(API_ENDPOINTS.ANALYTICS.CALLS),
  agents: () =>
    httpClient.get<ApiResponse<AgentPerformanceRow[]>>(API_ENDPOINTS.ANALYTICS.AGENTS),
  campaigns: () =>
    httpClient.get<ApiResponse<CampaignAnalyticsRow[]>>(
      API_ENDPOINTS.ANALYTICS.CAMPAIGNS,
    ),
  usage: () =>
    httpClient.get<
      ApiResponse<{ aiMinutes: number; estimatedCost: number; costPerCall: number }>
    >(API_ENDPOINTS.ANALYTICS.USAGE),
}
