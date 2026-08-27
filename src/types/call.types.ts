export type CallDirection = 'inbound' | 'outbound'
export type CallStatus =
  | 'queued'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'no_answer'
  | 'busy'

export interface CallTranscriptLine {
  id: string
  speaker: 'agent' | 'user' | 'system'
  text: string
  at: string
}

export interface CallRecord {
  id: string
  contactName: string
  contactPhone: string
  agentId: string
  agentName: string
  phoneNumber: string
  direction: CallDirection
  status: CallStatus
  durationSec: number
  outcome: string
  sentiment: 'positive' | 'neutral' | 'negative'
  summary: string
  recordingUrl?: string
  startedAt: string
  endedAt?: string
  transcript: CallTranscriptLine[]
  campaignId?: string
  campaignName?: string
}

export interface LiveCall {
  id: string
  caller: string
  agentName: string
  durationSec: number
  status: Extract<CallStatus, 'ringing' | 'in_progress'>
  currentTranscript: string
}

export interface DialLeadPayload {
  phoneNumberId: string
  toNumber: string
  agentId?: string
  useDraft?: boolean
  /** For mock UI labels */
  contactName?: string
}

export interface DialSession {
  callId: string
  roomName: string
  status: string
  channel: string
  fromNumber?: string
  toNumber: string
  detail?: string
  livekitUrl?: string
}
