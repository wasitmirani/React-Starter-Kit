export interface DashboardStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageDurationSec: number
  aiMinutesUsed: number
  currentBalance: number
  activeCampaigns: number
  activeAgents: number
}

export interface DashboardActivityItem {
  id: string
  type: 'call' | 'campaign' | 'agent' | 'billing'
  title: string
  description: string
  at: string
}

export interface CallsOverTimePoint {
  date: string
  total: number
  successful: number
  failed: number
}
