import type { LiveCall } from '@/types/call.types'
import type { CallWsEnvelope } from '@/services/websocket.service'

const LIVE_EVENTS = new Set([
  'call.created',
  'call.started',
  'call.ringing',
  'call.answered',
  'call.status_changed',
  'call.transcript',
  'call.ai_response',
  'call.recording_started',
])

const END_EVENTS = new Set(['call.completed', 'call.failed', 'call.cancelled'])

function asLiveStatus(event: string, payload?: Record<string, unknown> | null): LiveCall['status'] {
  const fromPayload = payload?.status
  if (fromPayload === 'ringing' || fromPayload === 'in_progress') return fromPayload
  if (event === 'call.ringing') return 'ringing'
  return 'in_progress'
}

function transcriptSnippet(
  event: string,
  payload?: Record<string, unknown> | null,
): string | undefined {
  if (!payload) return undefined
  const text = payload.text ?? payload.transcript ?? payload.content
  if (typeof text !== 'string' || !text.trim()) return undefined
  const speaker =
    typeof payload.speaker === 'string'
      ? payload.speaker
      : event === 'call.ai_response'
        ? 'agent'
        : 'caller'
  return `${speaker}: ${text}`
}

/** Map backend WS envelope into a LiveCall patch (or null if not applicable). */
export function liveCallFromWsEvent(
  event: string,
  raw: unknown,
  existing?: LiveCall | null,
): { kind: 'upsert'; call: LiveCall } | { kind: 'end'; id: string } | null {
  const envelope = raw as CallWsEnvelope
  const callId = String(
    envelope.call_id ??
      (envelope.payload as { call_id?: string | number } | null | undefined)?.call_id ??
      (raw as { id?: string })?.id ??
      '',
  )
  if (!callId) return null

  if (END_EVENTS.has(event)) {
    return { kind: 'end', id: callId }
  }

  if (!LIVE_EVENTS.has(event) && event !== 'message') return null

  const payload = (envelope.payload ?? {}) as Record<string, unknown>
  const snippet = transcriptSnippet(event, payload)
  const prev = existing?.id === callId ? existing : null

  const call: LiveCall = {
    id: callId,
    caller:
      (typeof payload.caller === 'string' && payload.caller) ||
      (typeof payload.from_number === 'string' && payload.from_number) ||
      prev?.caller ||
      `Call #${callId}`,
    agentName:
      (typeof payload.agent_name === 'string' && payload.agent_name) ||
      prev?.agentName ||
      'Agent',
    durationSec:
      typeof payload.duration_seconds === 'number'
        ? Math.round(payload.duration_seconds)
        : (prev?.durationSec ?? 0),
    status: asLiveStatus(event, payload),
    currentTranscript: snippet
      ? prev?.currentTranscript
        ? `${prev.currentTranscript}\n${snippet}`
        : snippet
      : (prev?.currentTranscript ?? ''),
  }

  return { kind: 'upsert', call }
}
