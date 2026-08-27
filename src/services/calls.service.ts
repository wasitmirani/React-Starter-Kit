import { shouldMockModule } from '@/config/env.config'
import { callsApi } from '@/api/endpoints/calls.api'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type { CallRecord, DialLeadPayload, DialSession, LiveCall } from '@/types/call.types'
import type { BackendBrowserSession } from '@/types/backend.types'
import {
  mapBackendCall,
  mapBackendCallToLive,
  paginationToSkipLimit,
} from '@/lib/api-mappers'
import { delay, ok, okPage, paginate, fail } from '@/lib/mock'
import { mockAgents, mockCalls, mockLiveCalls, mockPhoneNumbers } from '@/services/mock/mock-data'

let calls = [...mockCalls]
let liveCalls = [...mockLiveCalls]

export const callsService = {
  async list(params?: PaginationParams): Promise<ApiResponse<CallRecord[]>> {
    if (shouldMockModule('calls')) {
      await delay()
      let items = [...calls]
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter(
          (c) =>
            c.contactName.toLowerCase().includes(q) ||
            c.agentName.toLowerCase().includes(q) ||
            c.phoneNumber.includes(q),
        )
      }
      const { data, meta } = paginate(items, params)
      return okPage(data, meta)
    }
    const { skip, limit } = paginationToSkipLimit(params)
    const res = await callsApi.list({ skip, limit })
    const mapped = (res.data.data ?? []).map((c) => mapBackendCall(c))
    return {
      ...res.data,
      data: mapped,
      meta: {
        page: params?.page ?? 1,
        per_page: limit,
        total: mapped.length,
        total_pages: Math.max(1, Math.ceil(mapped.length / limit)),
      },
    }
  },

  async get(id: string): Promise<ApiResponse<CallRecord>> {
    if (shouldMockModule('calls')) {
      await delay()
      const call = calls.find((c) => c.id === id)
      if (!call) return fail('Call not found')
      return ok(call)
    }
    const [callRes, transcriptRes] = await Promise.all([
      callsApi.get(id),
      callsApi.transcript(id).catch(() => null),
    ])
    if (!callRes.data.success || !callRes.data.data) {
      return fail(callRes.data.message ?? 'Call not found')
    }
    let mapped = mapBackendCall(callRes.data.data, {
      transcript: transcriptRes?.data.data ?? null,
    })
    if (!mapped.recordingUrl && mapped.status === 'completed') {
      try {
        const recRes = await callsApi.recording(id)
        const url = recRes.data.data?.url
        if (url) mapped = { ...mapped, recordingUrl: url }
      } catch {
        // recording endpoint optional until backend ships it
      }
    }
    return ok(mapped)
  },

  async createBrowserSession(agentId: string, useDraft = false): Promise<
    ApiResponse<BackendBrowserSession>
  > {
    if (shouldMockModule('calls')) {
      await delay()
      return ok({
        call_id: Date.now(),
        livekit_url: 'wss://mock.livekit.local',
        token: 'mock-livekit-token',
        room_name: `mock-room-${agentId}`,
        status: 'initiating',
      })
    }
    const res = await callsApi.create({
      agent_id: Number(agentId),
      use_draft: useDraft,
    })
    return res.data
  },

  async live(): Promise<ApiResponse<LiveCall[]>> {
    if (shouldMockModule('calls')) {
      await delay(150)
      liveCalls = liveCalls.map((c) =>
        c.status === 'in_progress'
          ? { ...c, durationSec: c.durationSec + 1 }
          : c,
      )
      return ok(liveCalls)
    }
    const res = await callsApi.list({ skip: 0, limit: 100 })
    const live = (res.data.data ?? [])
      .map((c) => mapBackendCallToLive(c))
      .filter((c): c is LiveCall => c !== null)
    return ok(live)
  },

  async end(id: string): Promise<ApiResponse<CallRecord | LiveCall>> {
    if (shouldMockModule('calls')) {
      await delay()
      liveCalls = liveCalls.filter((c) => c.id !== id)
      const call = calls.find((c) => c.id === id)
      if (call) {
        call.status = 'completed'
        return ok(call)
      }
      return ok({
        id,
        caller: 'Unknown',
        agentName: 'Agent',
        durationSec: 0,
        status: 'in_progress',
        currentTranscript: '',
      })
    }
    const res = await callsApi.end(id)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to end call')
    }
    return ok(mapBackendCall(res.data.data))
  },

  async turn(
    id: string,
    text: string,
  ): Promise<ApiResponse<{ reply: string; userText: string }>> {
    if (shouldMockModule('calls')) {
      await delay(400)
      return ok({
        reply: `Thanks for saying "${text}". This is a mock voice reply.`,
        userText: text,
      })
    }
    const res = await callsApi.turn(id, text)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Voice turn failed')
    }
    return ok({
      reply: res.data.data.reply,
      userText: res.data.data.user_text,
    })
  },

  async dialLead(payload: DialLeadPayload): Promise<ApiResponse<DialSession>> {
    if (shouldMockModule('calls')) {
      await delay(800)
      const agent = mockAgents.find((a) => a.id === payload.agentId) ?? mockAgents[0]
      const phone =
        mockPhoneNumbers.find((p) => p.id === payload.phoneNumberId) ?? mockPhoneNumbers[0]
      if (!agent || !phone) return fail('Select an agent and phone number')

      const callId = String(Date.now())
      const now = new Date().toISOString()
      const record: CallRecord = {
        id: callId,
        contactName: payload.contactName ?? payload.toNumber,
        contactPhone: payload.toNumber,
        agentId: agent.id,
        agentName: agent.name,
        phoneNumber: phone.number,
        direction: 'outbound',
        status: 'ringing',
        durationSec: 0,
        outcome: 'pending',
        sentiment: 'neutral',
        summary: `Outbound call to ${payload.contactName ?? payload.toNumber}`,
        startedAt: now,
        transcript: [
          {
            id: '1',
            speaker: 'system',
            text: 'Dialing lead… AI agent will join when they answer.',
            at: now,
          },
        ],
      }
      calls = [record, ...calls]
      liveCalls = [
        {
          id: callId,
          caller: payload.contactName ?? payload.toNumber,
          agentName: agent.name,
          durationSec: 0,
          status: 'ringing',
          currentTranscript: 'Dialing…',
        },
        ...liveCalls,
      ]
      return ok(
        {
          callId,
          roomName: `sip-mock-${callId}`,
          status: 'ringing',
          channel: 'sip',
          fromNumber: phone.number,
          toNumber: payload.toNumber,
          detail: 'simulated_dial',
        },
        'Calling lead…',
      )
    }

    const res = await callsApi.dial({
      phone_number_id: Number(payload.phoneNumberId),
      to_number: payload.toNumber,
      agent_id: payload.agentId ? Number(payload.agentId) : undefined,
      use_draft: payload.useDraft,
    })
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to dial lead')
    }
    const d = res.data.data
    return ok({
      callId: String(d.call_id),
      roomName: d.room_name,
      status: d.status,
      channel: d.channel,
      fromNumber: d.from_number ?? undefined,
      toNumber: d.to_number ?? payload.toNumber,
      detail: d.detail ?? undefined,
      livekitUrl: d.livekit_url ?? undefined,
    })
  },
}
