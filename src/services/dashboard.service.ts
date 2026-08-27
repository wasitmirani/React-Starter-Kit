import { shouldMockModule } from '@/config/env.config'
import { dashboardApi } from '@/api/endpoints/dashboard.api'
import type { ApiResponse } from '@/types/api.types'
import type {
  DashboardStats,
  DashboardActivityItem,
  CallsOverTimePoint,
} from '@/types/dashboard.types'
import { delay, ok } from '@/lib/mock'
import {
  mockDashboardStats,
  mockDashboardActivity,
  mockCallsOverTime,
} from '@/services/mock/mock-data'

export const dashboardService = {
  async stats(): Promise<ApiResponse<DashboardStats>> {
    if (shouldMockModule('dashboard')) {
      await delay()
      return ok(mockDashboardStats)
    }
    const res = await dashboardApi.stats()
    return res.data
  },

  async activity(): Promise<ApiResponse<DashboardActivityItem[]>> {
    if (shouldMockModule('dashboard')) {
      await delay()
      return ok(mockDashboardActivity)
    }
    const res = await dashboardApi.activity()
    return res.data
  },

  async callsOverTime(): Promise<ApiResponse<CallsOverTimePoint[]>> {
    if (shouldMockModule('dashboard')) {
      await delay()
      return ok(mockCallsOverTime)
    }
    const res = await dashboardApi.callsOverTime()
    return res.data
  },
}
