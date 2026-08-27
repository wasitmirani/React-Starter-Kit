export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'

export interface CampaignStats {
  totalContacts: number
  queued: number
  calling: number
  completed: number
  answered: number
  noAnswer: number
  failed: number
  successful: number
}

export interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  agentId: string
  agentName: string
  phoneNumberId: string
  phoneNumber: string
  contactIds: string[]
  scheduleStart?: string
  scheduleEnd?: string
  retryPolicy: number
  callLimit: number
  stats: CampaignStats
  createdAt: string
  updatedAt: string
}

export type CreateCampaignPayload = {
  name: string
  description: string
  agentId: string
  phoneNumberId: string
  contactIds: string[]
  scheduleStart?: string
  scheduleEnd?: string
  retryPolicy: number
  callLimit: number
}
