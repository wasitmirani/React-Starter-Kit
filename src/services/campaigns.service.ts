import { shouldMockModule } from '@/config/env.config'
import { campaignsApi } from '@/api/endpoints/campaigns.api'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type { Campaign, CreateCampaignPayload } from '@/types/campaign.types'
import { delay, ok, okPage, paginate, fail } from '@/lib/mock'
import { mockCampaigns, mockAgents, mockPhoneNumbers } from '@/services/mock/mock-data'

let campaigns = [...mockCampaigns]

export const campaignsService = {
  async list(params?: PaginationParams): Promise<ApiResponse<Campaign[]>> {
    if (shouldMockModule('campaigns')) {
      await delay()
      let items = [...campaigns]
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter((c) => c.name.toLowerCase().includes(q))
      }
      const { data, meta } = paginate(items, params)
      return okPage(data, meta)
    }
    const res = await campaignsApi.list(params)
    return res.data
  },

  async get(id: string): Promise<ApiResponse<Campaign>> {
    if (shouldMockModule('campaigns')) {
      await delay()
      const campaign = campaigns.find((c) => c.id === id)
      if (!campaign) return fail('Campaign not found')
      return ok(campaign)
    }
    const res = await campaignsApi.get(id)
    return res.data
  },

  async create(payload: CreateCampaignPayload): Promise<ApiResponse<Campaign>> {
    if (shouldMockModule('campaigns')) {
      await delay()
      const agent = mockAgents.find((a) => a.id === payload.agentId)
      const phone = mockPhoneNumbers.find((p) => p.id === payload.phoneNumberId)
      const now = new Date().toISOString()
      const campaign: Campaign = {
        id: `cmp_${Date.now()}`,
        name: payload.name,
        description: payload.description,
        status: payload.scheduleStart ? 'scheduled' : 'draft',
        agentId: payload.agentId,
        agentName: agent?.name ?? 'Unknown',
        phoneNumberId: payload.phoneNumberId,
        phoneNumber: phone?.number ?? '',
        contactIds: payload.contactIds,
        scheduleStart: payload.scheduleStart,
        scheduleEnd: payload.scheduleEnd,
        retryPolicy: payload.retryPolicy,
        callLimit: payload.callLimit,
        stats: {
          totalContacts: payload.contactIds.length,
          queued: payload.contactIds.length,
          calling: 0,
          completed: 0,
          answered: 0,
          noAnswer: 0,
          failed: 0,
          successful: 0,
        },
        createdAt: now,
        updatedAt: now,
      }
      campaigns = [campaign, ...campaigns]
      return ok(campaign, 'Campaign created')
    }
    const res = await campaignsApi.create(payload)
    return res.data
  },

  async start(id: string): Promise<ApiResponse<Campaign>> {
    return this.setStatus(id, 'running', () => campaignsApi.start(id))
  },

  async pause(id: string): Promise<ApiResponse<Campaign>> {
    return this.setStatus(id, 'paused', () => campaignsApi.pause(id))
  },

  async stop(id: string): Promise<ApiResponse<Campaign>> {
    return this.setStatus(id, 'stopped', () => campaignsApi.stop(id))
  },

  async setStatus(
    id: string,
    status: Campaign['status'],
    remote: () => Promise<{ data: ApiResponse<Campaign> }>,
  ): Promise<ApiResponse<Campaign>> {
    if (shouldMockModule('campaigns')) {
      await delay()
      const idx = campaigns.findIndex((c) => c.id === id)
      if (idx < 0) return fail('Campaign not found')
      campaigns[idx] = {
        ...campaigns[idx],
        status,
        updatedAt: new Date().toISOString(),
      }
      return ok(campaigns[idx], `Campaign ${status}`)
    }
    const res = await remote()
    return res.data
  },
}
