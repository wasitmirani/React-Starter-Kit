import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  DashboardStats,
  DashboardActivityItem,
  CallsOverTimePoint,
} from '@/types/dashboard.types'

export const dashboardApi = {
  stats: () =>
    httpClient.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.DASHBOARD.STATS),

  activity: () =>
    httpClient.get<ApiResponse<DashboardActivityItem[]>>(
      API_ENDPOINTS.DASHBOARD.ACTIVITY,
    ),

  callsOverTime: () =>
    httpClient.get<ApiResponse<CallsOverTimePoint[]>>(
      `${API_ENDPOINTS.DASHBOARD.BASE}/calls-over-time`,
    ),
}
