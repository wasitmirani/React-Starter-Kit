import { shouldMockModule } from '@/config/env.config'
import { phoneNumbersApi } from '@/api/endpoints/phone-numbers.api'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type {
  BuyPhoneNumberPayload,
  PhoneNumber,
  PhoneNumberSearchResult,
  PhoneProviderOption,
  WhatsAppCallingConfig,
} from '@/types/phone-number.types'
import { delay, ok, okPage, paginate, fail } from '@/lib/mock'
import {
  mockPhoneNumbers,
  mockPhoneSearch,
  mockPhoneProviders,
  mockAgents,
} from '@/services/mock/mock-data'

let phones = [...mockPhoneNumbers]

let whatsappConfig: WhatsAppCallingConfig = {
  enabled: false,
  provider: 'meta_cloud',
  businessAccountId: '',
  phoneNumberId: '',
  displayName: '',
  webhookUrl: 'https://api.example.com/api/v1/whatsapp/voice',
  status: 'disconnected',
  notes:
    'WhatsApp Calling is possible via Meta Cloud API. Bridge accepted calls into LiveKit so your AI agent can join.',
}

export const phoneNumbersService = {
  async list(params?: PaginationParams): Promise<ApiResponse<PhoneNumber[]>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      const { data, meta } = paginate(phones, params)
      return okPage(data, meta)
    }
    const res = await phoneNumbersApi.list(params)
    return res.data
  },

  async search(params?: {
    country?: string
    areaCode?: string
    provider?: string
    channel?: string
  }): Promise<ApiResponse<PhoneNumberSearchResult[]>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      let items = [...mockPhoneSearch]
      if (params?.areaCode) {
        items = items.filter((i) => i.areaCode === params.areaCode)
      }
      if (params?.country) {
        items = items.filter((i) => i.country === params.country)
      }
      if (params?.provider) {
        const q = params.provider.toLowerCase()
        items = items.filter((i) => (i.provider ?? '').toLowerCase().includes(q))
      }
      if (params?.channel) {
        items = items.filter((i) => i.channel === params.channel)
      }
      return ok(items)
    }
    const res = await phoneNumbersApi.search(params)
    return res.data
  },

  async providers(): Promise<ApiResponse<PhoneProviderOption[]>> {
    if (shouldMockModule('phone-numbers')) {
      await delay(120)
      return ok(mockPhoneProviders)
    }
    // Fallback catalog until backend ships providers endpoint
    return ok(mockPhoneProviders)
  },

  async buy(payload: BuyPhoneNumberPayload): Promise<ApiResponse<PhoneNumber>> {
    if (shouldMockModule('phone-numbers')) {
      await delay(400)
      if (phones.some((p) => p.number === payload.number)) {
        return fail('Number already in your inventory')
      }
      const created: PhoneNumber = {
        id: `pn_${Date.now()}`,
        number: payload.number,
        friendlyName:
          payload.friendlyName ||
          `${payload.provider} ${payload.areaCode || payload.country}`,
        country: payload.country,
        areaCode: payload.areaCode,
        provider: payload.provider,
        providerKind: payload.providerKind,
        channel: payload.channel ?? 'pstn',
        status: 'available',
        inboundEnabled: true,
        outboundEnabled: true,
        capabilities: payload.capabilities,
        monthlyCost: payload.monthlyCost,
        createdAt: new Date().toISOString(),
      }
      phones = [created, ...phones]
      return ok(created, 'Number added')
    }
    const res = await phoneNumbersApi.buy(payload)
    return res.data
  },

  async release(id: string): Promise<ApiResponse<PhoneNumber>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      const idx = phones.findIndex((p) => p.id === id)
      if (idx < 0) return fail('Phone number not found')
      phones[idx] = {
        ...phones[idx],
        status: 'released',
        agentId: undefined,
        agentName: undefined,
      }
      return ok(phones[idx], 'Number released')
    }
    const res = await phoneNumbersApi.release(id)
    return res.data
  },

  async assign(id: string, agentId: string | null): Promise<ApiResponse<PhoneNumber>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      const idx = phones.findIndex((p) => p.id === id)
      if (idx < 0) return fail('Phone number not found')
      const agent = agentId ? mockAgents.find((a) => a.id === agentId) : undefined
      phones[idx] = {
        ...phones[idx],
        agentId: agentId ?? undefined,
        agentName: agent?.name,
        status: agentId ? 'assigned' : 'available',
      }
      return ok(phones[idx], 'Assignment updated')
    }
    const res = await phoneNumbersApi.assign(id, agentId)
    return res.data
  },

  async getWhatsApp(): Promise<ApiResponse<WhatsAppCallingConfig>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      return ok(whatsappConfig)
    }
    const res = await phoneNumbersApi.getWhatsApp()
    return res.data
  },

  async saveWhatsApp(
    payload: Partial<WhatsAppCallingConfig>,
  ): Promise<ApiResponse<WhatsAppCallingConfig>> {
    if (shouldMockModule('phone-numbers')) {
      await delay()
      whatsappConfig = { ...whatsappConfig, ...payload }
      if (payload.enabled && whatsappConfig.businessAccountId && whatsappConfig.phoneNumberId) {
        whatsappConfig.status = 'connected'
      } else if (payload.enabled) {
        whatsappConfig.status = 'pending'
      } else {
        whatsappConfig.status = 'disconnected'
      }
      return ok(whatsappConfig, 'WhatsApp calling settings saved')
    }
    const res = await phoneNumbersApi.saveWhatsApp(payload)
    return res.data
  },
}
