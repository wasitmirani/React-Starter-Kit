import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type {
  BuyPhoneNumberPayload,
  PhoneNumber,
  PhoneNumberSearchResult,
  WhatsAppCallingConfig,
} from '@/types/phone-number.types'

export const phoneNumbersApi = {
  list: (params?: PaginationParams) =>
    httpClient.get<ApiResponse<PhoneNumber[]>>(API_ENDPOINTS.PHONE_NUMBERS.BASE, {
      params,
    }),

  get: (id: string) =>
    httpClient.get<ApiResponse<PhoneNumber>>(API_ENDPOINTS.PHONE_NUMBERS.BY_ID(id)),

  search: (params?: {
    country?: string
    areaCode?: string
    provider?: string
    channel?: string
  }) =>
    httpClient.get<ApiResponse<PhoneNumberSearchResult[]>>(
      API_ENDPOINTS.PHONE_NUMBERS.SEARCH,
      { params },
    ),

  buy: (payload: BuyPhoneNumberPayload) =>
    httpClient.post<ApiResponse<PhoneNumber>>(API_ENDPOINTS.PHONE_NUMBERS.BUY, payload),

  release: (id: string) =>
    httpClient.post<ApiResponse<PhoneNumber>>(API_ENDPOINTS.PHONE_NUMBERS.RELEASE(id)),

  assign: (id: string, agentId: string | null) =>
    httpClient.patch<ApiResponse<PhoneNumber>>(API_ENDPOINTS.PHONE_NUMBERS.BY_ID(id), {
      agentId,
    }),

  getWhatsApp: () =>
    httpClient.get<ApiResponse<WhatsAppCallingConfig>>(
      API_ENDPOINTS.PHONE_NUMBERS.WHATSAPP,
    ),

  saveWhatsApp: (payload: Partial<WhatsAppCallingConfig>) =>
    httpClient.patch<ApiResponse<WhatsAppCallingConfig>>(
      API_ENDPOINTS.PHONE_NUMBERS.WHATSAPP,
      payload,
    ),
}
