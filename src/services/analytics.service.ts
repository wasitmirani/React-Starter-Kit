import { shouldMockModule } from '@/config/env.config'
import { analyticsApi } from '@/api/endpoints/analytics.api'
import type { ApiResponse } from '@/types/api.types'
import type {
  AnalyticsKpis,
  AnalyticsSeriesPoint,
  AgentPerformanceRow,
  CampaignAnalyticsRow,
} from '@/types/analytics.types'
import { delay, ok } from '@/lib/mock'
import {
  mockAnalyticsKpis,
  mockAnalyticsCallsSeries,
  mockAgentPerformance,
  mockCampaignAnalytics,
} from '@/services/mock/mock-data'

export const analyticsService = {
  async kpis(): Promise<ApiResponse<AnalyticsKpis>> {
    if (shouldMockModule('analytics')) {
      await delay()
      return ok(mockAnalyticsKpis)
    }
    const res = await analyticsApi.overview()
    return res.data
  },

  async callsSeries(): Promise<ApiResponse<AnalyticsSeriesPoint[]>> {
    if (shouldMockModule('analytics')) {
      await delay()
      return ok(mockAnalyticsCallsSeries)
    }
    const res = await analyticsApi.calls()
    return res.data
  },

  async agentPerformance(): Promise<ApiResponse<AgentPerformanceRow[]>> {
    if (shouldMockModule('analytics')) {
      await delay()
      return ok(mockAgentPerformance)
    }
    const res = await analyticsApi.agents()
    return res.data
  },

  async campaignAnalytics(): Promise<ApiResponse<CampaignAnalyticsRow[]>> {
    if (shouldMockModule('analytics')) {
      await delay()
      return ok(mockCampaignAnalytics)
    }
    const res = await analyticsApi.campaigns()
    return res.data
  },

  async usage(): Promise<
    ApiResponse<{ aiMinutes: number; estimatedCost: number; costPerCall: number }>
  > {
    if (shouldMockModule('analytics')) {
      await delay()
      return ok({
        aiMinutes: mockAnalyticsKpis.aiMinutes,
        estimatedCost: mockAnalyticsKpis.estimatedCost,
        costPerCall: mockAnalyticsKpis.costPerCall,
      })
    }
    const res = await analyticsApi.usage()
    return res.data
  },
}
