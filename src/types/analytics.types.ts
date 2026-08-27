export interface AnalyticsKpis {
  totalCalls: number
  answeredCalls: number
  successRate: number
  averageDurationSec: number
  aiMinutes: number
  estimatedCost: number
  costPerCall: number
  conversionRate: number
}

export interface AnalyticsSeriesPoint {
  label: string
  value: number
  secondary?: number
}

export interface AgentPerformanceRow {
  id: string
  name: string
  calls: number
  successRate: number
  avgDurationSec: number
  aiMinutes: number
}

export interface CampaignAnalyticsRow {
  id: string
  name: string
  contacted: number
  answered: number
  converted: number
  cost: number
}
