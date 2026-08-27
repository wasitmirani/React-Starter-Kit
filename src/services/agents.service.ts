import { shouldMockModule } from '@/config/env.config'
import { agentsApi } from '@/api/endpoints/agents.api'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type { Agent, CreateAgentPayload, UpdateAgentPayload } from '@/types/agent.types'
import type { BackendBrowserSession } from '@/types/backend.types'
import {
  mapBackendAgent,
  paginationToSkipLimit,
  toBackendAgentWrite,
} from '@/lib/api-mappers'
import { delay, ok, okPage, paginate, fail } from '@/lib/mock'
import { mockAgents } from '@/services/mock/mock-data'

let agents = [...mockAgents]

function filterAgents(params?: PaginationParams) {
  let items = [...agents]
  if (params?.search) {
    const q = params.search.toLowerCase()
    items = items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    )
  }
  return paginate(items, params)
}

export type AgentTestResult =
  | { reply: string; session?: undefined }
  | { reply: string; session: BackendBrowserSession }

export const agentsService = {
  async list(params?: PaginationParams): Promise<ApiResponse<Agent[]>> {
    if (shouldMockModule('agents')) {
      await delay()
      const { data, meta } = filterAgents(params)
      return okPage(data, meta)
    }
    const { skip, limit } = paginationToSkipLimit(params)
    const res = await agentsApi.list({ skip, limit })
    const mapped = (res.data.data ?? []).map(mapBackendAgent)
    let filtered = mapped
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = mapped.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      )
    }
    return {
      ...res.data,
      data: filtered,
      meta: {
        page: params?.page ?? 1,
        per_page: limit,
        total: filtered.length,
        total_pages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    }
  },

  async get(id: string): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      await delay()
      const agent = agents.find((a) => a.id === id)
      if (!agent) return fail('Agent not found')
      return ok(agent)
    }
    const res = await agentsApi.get(id)
    if (!res.data.success || !res.data.data) return fail(res.data.message ?? 'Agent not found')
    return ok(mapBackendAgent(res.data.data))
  },

  async create(payload: CreateAgentPayload): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      await delay()
      const now = new Date().toISOString()
      const agent: Agent = {
        ...payload,
        id: `agt_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        callsHandled: 0,
        successRate: 0,
      }
      agents = [agent, ...agents]
      return ok(agent, 'Agent created')
    }
    const res = await agentsApi.create(toBackendAgentWrite(payload))
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to create agent')
    }
    return ok(mapBackendAgent(res.data.data), res.data.message)
  },

  async update(id: string, payload: UpdateAgentPayload): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      await delay()
      const idx = agents.findIndex((a) => a.id === id)
      if (idx < 0) return fail('Agent not found')
      agents[idx] = {
        ...agents[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      }
      return ok(agents[idx], 'Agent updated')
    }
    const res = await agentsApi.update(id, toBackendAgentWrite(payload))
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to update agent')
    }
    return ok(mapBackendAgent(res.data.data), res.data.message)
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    if (shouldMockModule('agents')) {
      await delay()
      agents = agents.filter((a) => a.id !== id)
      return ok(null, 'Agent deleted')
    }
    const res = await agentsApi.remove(id)
    return res.data
  },

  async test(id: string, _message?: string): Promise<ApiResponse<AgentTestResult>> {
    if (shouldMockModule('agents')) {
      await delay(400)
      const agent = agents.find((a) => a.id === id)
      if (!agent) return fail('Agent not found')
      const callId = Date.now()
      const session: BackendBrowserSession = {
        call_id: callId,
        livekit_url: 'wss://mock.livekit.local',
        token: 'mock-livekit-token',
        room_name: `mock-test-${id}`,
        status: 'initiating',
        greeting: agent.greeting ?? null,
      }
      return ok({
        reply: `Test session ready · call #${callId}`,
        session,
      })
    }
    const res = await agentsApi.test(id)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to start test session')
    }
    const session = res.data.data
    return ok({
      reply: `LiveKit session ready · room ${session.room_name} · call #${session.call_id}`,
      session,
    })
  },

  async publish(id: string): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      return this.update(id, { status: 'active' })
    }
    const res = await agentsApi.publish(id)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to publish agent')
    }
    return ok(mapBackendAgent(res.data.data), res.data.message)
  },

  async unpublish(id: string): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      return this.update(id, { status: 'draft' })
    }
    const res = await agentsApi.unpublish(id)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to unpublish agent')
    }
    return ok(mapBackendAgent(res.data.data), res.data.message)
  },

  async duplicate(id: string): Promise<ApiResponse<Agent>> {
    if (shouldMockModule('agents')) {
      const source = agents.find((a) => a.id === id)
      if (!source) return fail('Agent not found')
      return this.create({ ...source })
    }
    const res = await agentsApi.duplicate(id)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Failed to duplicate agent')
    }
    return ok(mapBackendAgent(res.data.data), res.data.message)
  },
}
