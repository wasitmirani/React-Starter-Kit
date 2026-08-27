import type {
  BackendAgent,
  BackendAgentWrite,
  BackendCall,
  BackendMe,
  BackendTranscript,
} from '@/types/backend.types'
import type { Agent, AgentStatus, CreateAgentPayload } from '@/types/agent.types'
import type { AuthRole, AuthUser } from '@/types/auth.types'
import type {
  CallDirection,
  CallRecord,
  CallStatus,
  CallTranscriptLine,
  LiveCall,
} from '@/types/call.types'
import type { Organization } from '@/store/organization.store'
import { API_BASE_URL } from '@/config/env.config'
import { API_ENDPOINTS } from '@/constants/api.constants'

export function mapAuthRole(role: string | undefined | null): AuthRole {
  switch (role) {
    case 'owner':
    case 'admin':
    case 'manager':
    case 'agent_manager':
    case 'analyst':
    case 'viewer':
      return role
    case 'member':
      return 'manager'
    default:
      return 'user'
  }
}

export function mapMeToAuthUser(me: BackendMe): AuthUser {
  return {
    id: String(me.id),
    name: me.full_name?.trim() || me.email,
    email: me.email,
    role: mapAuthRole(me.organization?.role),
  }
}

export function mapMeToOrganization(me: BackendMe): Organization {
  return {
    id: String(me.organization.id),
    name: me.organization.name,
    slug: me.organization.slug,
    plan: 'professional',
  }
}

function mapAgentStatus(status: string): AgentStatus {
  switch (status) {
    case 'published':
      return 'active'
    case 'archived':
      return 'archived'
    case 'paused':
      return 'paused'
    default:
      return 'draft'
  }
}

function callSettingsNumber(
  settings: Record<string, unknown> | null | undefined,
  key: string,
  fallback: number,
): number {
  const value = settings?.[key]
  return typeof value === 'number' ? value : fallback
}

function callSettingsString(
  settings: Record<string, unknown> | null | undefined,
  key: string,
  fallback = '',
): string {
  const value = settings?.[key]
  return typeof value === 'string' ? value : fallback
}

function callSettingsFaqs(
  settings: Record<string, unknown> | null | undefined,
): import('@/types/agent.types').AgentTrainingFaq[] {
  const value = settings?.training_faqs
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      question: typeof item.question === 'string' ? item.question : '',
      answer: typeof item.answer === 'string' ? item.answer : '',
    }))
    .filter((item) => item.question.trim() || item.answer.trim())
}

export function mapBackendAgent(agent: BackendAgent): Agent {
  const draft = agent.draft
  const settings = draft?.call_settings ?? null
  const now = new Date().toISOString()

  return {
    id: String(agent.id),
    name: agent.name,
    description: callSettingsString(settings, 'description', ''),
    status: mapAgentStatus(agent.status),
    voiceProvider: callSettingsString(settings, 'voice_provider', 'Piper'),
    voice: draft?.voice ?? 'sarah',
    language: draft?.language ?? 'en',
    speed: callSettingsNumber(settings, 'speed', 1),
    pitch: callSettingsNumber(settings, 'pitch', 1),
    modelProvider: callSettingsString(settings, 'model_provider', 'Ollama'),
    model: draft?.model ?? 'llama3.1',
    temperature: callSettingsNumber(settings, 'temperature', 0.4),
    maxTokens: callSettingsNumber(settings, 'max_tokens', 1024),
    systemInstructions: draft?.system_prompt ?? '',
    greeting: draft?.greeting ?? '',
    personality: draft?.personality ?? '',
    rules: callSettingsString(settings, 'rules', ''),
    goals: callSettingsString(settings, 'goals', ''),
    fallback: callSettingsString(settings, 'fallback', ''),
    knowledgeBaseId: callSettingsString(settings, 'knowledge_base_id') || undefined,
    businessName: callSettingsString(settings, 'business_name') || undefined,
    industry: callSettingsString(settings, 'industry') || undefined,
    businessDescription: callSettingsString(settings, 'business_description') || undefined,
    productsServices: callSettingsString(settings, 'products_services') || undefined,
    trainingContext: callSettingsString(settings, 'training_context') || undefined,
    trainingFaqs: callSettingsFaqs(settings),
    phoneNumberId: callSettingsString(settings, 'phone_number_id') || undefined,
    callerId: callSettingsString(settings, 'caller_id') || undefined,
    callTimeout: callSettingsNumber(settings, 'call_timeout', 45),
    retryCount: callSettingsNumber(settings, 'retry_count', 2),
    createdAt: String(agent.created_at ?? now),
    updatedAt: String(agent.updated_at ?? agent.created_at ?? now),
    callsHandled: 0,
    successRate: 0,
  }
}

export function toBackendAgentWrite(
  payload: CreateAgentPayload | Partial<CreateAgentPayload>,
): BackendAgentWrite {
  const call_settings: Record<string, unknown> = {
    description: payload.description ?? '',
    voice_provider: payload.voiceProvider ?? 'Piper',
    model_provider: payload.modelProvider ?? 'Ollama',
    speed: payload.speed ?? 1,
    pitch: payload.pitch ?? 1,
    temperature: payload.temperature ?? 0.4,
    max_tokens: payload.maxTokens ?? 1024,
    rules: payload.rules ?? '',
    goals: payload.goals ?? '',
    fallback: payload.fallback ?? '',
    call_timeout: payload.callTimeout ?? 45,
    retry_count: payload.retryCount ?? 2,
  }
  if (payload.knowledgeBaseId) call_settings.knowledge_base_id = payload.knowledgeBaseId
  if (payload.businessName) call_settings.business_name = payload.businessName
  if (payload.industry) call_settings.industry = payload.industry
  if (payload.businessDescription) call_settings.business_description = payload.businessDescription
  if (payload.productsServices) call_settings.products_services = payload.productsServices
  if (payload.trainingContext) call_settings.training_context = payload.trainingContext
  if (payload.trainingFaqs?.length) call_settings.training_faqs = payload.trainingFaqs
  if (payload.phoneNumberId) call_settings.phone_number_id = payload.phoneNumberId
  if (payload.callerId) call_settings.caller_id = payload.callerId

  const body: BackendAgentWrite = {
    name: payload.name ?? 'Untitled agent',
    system_prompt: payload.systemInstructions ?? '',
    greeting: payload.greeting ?? null,
    model: payload.model ?? 'llama3.1',
    voice: payload.voice ?? 'en_US-lessac-medium',
    language: payload.language ?? 'en',
    personality: payload.personality ?? null,
    call_settings,
  }
  return body
}

function mapCallStatus(status: string): CallStatus {
  const allowed: CallStatus[] = [
    'queued',
    'ringing',
    'in_progress',
    'completed',
    'failed',
    'no_answer',
    'busy',
  ]
  if (status === 'answered' || status === 'initiating') return 'in_progress'
  if (allowed.includes(status as CallStatus)) return status as CallStatus
  return 'queued'
}

function mapCallDirection(direction: string): CallDirection {
  if (direction === 'inbound') return 'inbound'
  return 'outbound'
}

export function mapBackendTranscript(
  transcript: BackendTranscript | null | undefined,
): CallTranscriptLine[] {
  if (!transcript) return []
  if (Array.isArray(transcript.segments) && transcript.segments.length > 0) {
    return transcript.segments.map((segment, index) => ({
      id: String(segment.id ?? `seg_${index}`),
      speaker:
        segment.speaker === 'user' || segment.speaker === 'system'
          ? (segment.speaker as CallTranscriptLine['speaker'])
          : 'agent',
      text: String(segment.text ?? segment.content ?? ''),
      at: String(segment.at ?? segment.created_at ?? new Date().toISOString()),
    }))
  }
  if (transcript.full_text) {
    return [
      {
        id: 'full',
        speaker: 'system',
        text: transcript.full_text,
        at: new Date().toISOString(),
      },
    ]
  }
  return []
}

const COMPLETED_CALL_STATUSES = new Set(['completed', 'ended', 'finished'])

/** Resolve a recording URL from backend field or default recording endpoint. */
export function resolveRecordingUrl(
  callId: string | number,
  recordingUrl?: string | null,
  status?: string,
): string | undefined {
  if (recordingUrl) {
    if (recordingUrl.startsWith('http://') || recordingUrl.startsWith('https://')) {
      return recordingUrl
    }
    if (recordingUrl.startsWith('/')) {
      const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
      return `${origin}${recordingUrl}`
    }
    return recordingUrl
  }
  if (status && COMPLETED_CALL_STATUSES.has(status)) {
    return `${API_BASE_URL}${API_ENDPOINTS.CALLS.RECORDING(String(callId))}`
  }
  return undefined
}

export function mapBackendCall(
  call: BackendCall,
  extras?: {
    agentName?: string
    transcript?: BackendTranscript | null
  },
): CallRecord {
  const duration = Math.round(call.duration_seconds ?? 0)
  return {
    id: String(call.id),
    contactName: call.direction === 'browser' ? 'Browser caller' : 'Unknown',
    contactPhone: '—',
    agentId: String(call.agent_id),
    agentName: extras?.agentName ?? `Agent #${call.agent_id}`,
    phoneNumber: call.livekit_room ?? 'browser',
    direction: mapCallDirection(call.direction),
    status: mapCallStatus(call.status),
    durationSec: duration,
    outcome: call.status,
    sentiment: 'neutral',
    summary: call.summary ?? '',
    startedAt: String(call.started_at ?? call.created_at),
    endedAt: call.ended_at ? String(call.ended_at) : undefined,
    recordingUrl: resolveRecordingUrl(call.id, call.recording_url, call.status),
    transcript: mapBackendTranscript(extras?.transcript),
  }
}

const LIVE_STATUSES = new Set([
  'queued',
  'initiating',
  'ringing',
  'answered',
  'in_progress',
])

export function mapBackendCallToLive(
  call: BackendCall,
  agentName?: string,
): LiveCall | null {
  if (!LIVE_STATUSES.has(call.status)) return null
  const status: LiveCall['status'] =
    call.status === 'ringing' ? 'ringing' : 'in_progress'
  return {
    id: String(call.id),
    caller: call.direction === 'browser' ? 'Browser' : `Call #${call.id}`,
    agentName: agentName ?? `Agent #${call.agent_id}`,
    durationSec: Math.round(call.duration_seconds ?? 0),
    status,
    currentTranscript: '',
  }
}

export function paginationToSkipLimit(params?: {
  page?: number
  pageSize?: number
  per_page?: number
}): { skip: number; limit: number } {
  const page = Math.max(1, params?.page ?? 1)
  const limit = Math.max(1, Math.min(200, params?.per_page ?? params?.pageSize ?? 50))
  return { skip: (page - 1) * limit, limit }
}
