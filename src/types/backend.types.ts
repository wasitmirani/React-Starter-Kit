/** DTOs matching FastAPI AI Voice SaaS OpenAPI (`/api/v1`). */

export interface BackendTokenPair {
  access_token: string
  refresh_token: string
  token_type?: string
}

export interface BackendAuthUser {
  id: number
  email: string
  full_name: string | null
}

export interface BackendRegisterData extends BackendTokenPair {
  user: BackendAuthUser
}

export interface BackendMeOrganization {
  id: number
  name: string
  slug: string
  role: string
}

export interface BackendMe {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  organization: BackendMeOrganization
}

export interface BackendAgentVersion {
  id: number
  agent_id: number
  version: number
  system_prompt: string
  greeting: string | null
  model: string
  voice: string
  language: string
  personality: string | null
  call_settings: Record<string, unknown> | null
  tools: unknown
  is_draft: boolean
  created_at: string
}

export interface BackendAgent {
  id: number
  organization_id: number
  name: string
  status: string
  published_version_id: number | null
  draft: BackendAgentVersion | null
  created_at: string
  updated_at: string | null
}

export interface BackendAgentWrite {
  name: string
  system_prompt?: string
  greeting?: string | null
  model?: string
  voice?: string
  language?: string
  personality?: string | null
  call_settings?: Record<string, unknown> | null
  tools?: unknown
}

export interface BackendBrowserSession {
  call_id: number
  livekit_url: string
  token: string
  room_name: string
  status?: string
  greeting?: string | null
}

export interface BackendCallTurn {
  call_id: number
  reply: string
  user_text: string
}

export interface BackendDialSession {
  call_id: number
  room_name: string
  status: string
  channel: string
  from_number?: string | null
  to_number?: string | null
  external_call_id?: string | null
  livekit_url?: string | null
  detail?: string | null
}

export interface BackendCall {
  id: number
  organization_id: number
  agent_id: number
  agent_version_id: number
  direction: string
  status: string
  livekit_room: string | null
  summary: string | null
  started_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  recording_url?: string | null
  created_at: string
}

export interface BackendTranscript {
  call_id: number
  segments: Array<Record<string, unknown>> | null
  full_text: string | null
}

export interface BackendCallEvent {
  id: number
  call_id: number
  event_type: string
  payload: Record<string, unknown> | null
  created_at: string
}

export interface BackendOrganization {
  id: number
  name: string
  slug: string
  role?: string
  settings: Record<string, unknown> | null
}
