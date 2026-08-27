import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  BackendBrowserSession,
  BackendCall,
  BackendCallEvent,
  BackendCallTurn,
  BackendDialSession,
  BackendTranscript,
} from '@/types/backend.types'

export const callsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<ApiResponse<BackendCall[]>>(API_ENDPOINTS.CALLS.BASE, { params }),

  get: (id: string) =>
    httpClient.get<ApiResponse<BackendCall>>(API_ENDPOINTS.CALLS.BY_ID(id)),

  create: (payload: { agent_id: number; use_draft?: boolean }) =>
    httpClient.post<ApiResponse<BackendBrowserSession>>(API_ENDPOINTS.CALLS.BASE, payload),

  transcript: (id: string) =>
    httpClient.get<ApiResponse<BackendTranscript>>(API_ENDPOINTS.CALLS.TRANSCRIPT(id)),

  events: (id: string) =>
    httpClient.get<ApiResponse<BackendCallEvent[]>>(API_ENDPOINTS.CALLS.EVENTS(id)),

  end: (id: string) =>
    httpClient.post<ApiResponse<BackendCall>>(API_ENDPOINTS.CALLS.END(id)),

  turn: (id: string, text: string) =>
    httpClient.post<ApiResponse<BackendCallTurn>>(API_ENDPOINTS.CALLS.TURN(id), {
      text,
    }),

  dial: (payload: {
    phone_number_id: number
    to_number: string
    agent_id?: number
    use_draft?: boolean
  }) =>
    httpClient.post<ApiResponse<BackendDialSession>>(API_ENDPOINTS.CALLS.DIAL, payload),

  recording: (id: string) =>
    httpClient.get<ApiResponse<{ url: string }>>(API_ENDPOINTS.CALLS.RECORDING(id)),
}
