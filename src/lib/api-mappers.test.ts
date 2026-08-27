import { describe, expect, it } from 'vitest'
import { mapBackendCall, resolveRecordingUrl } from '@/lib/api-mappers'
import type { BackendCall } from '@/types/backend.types'

const baseCall: BackendCall = {
  id: 42,
  organization_id: 1,
  agent_id: 3,
  agent_version_id: 1,
  direction: 'browser',
  status: 'completed',
  livekit_room: 'room-42',
  summary: 'Test call',
  started_at: '2026-01-01T12:00:00Z',
  ended_at: '2026-01-01T12:05:00Z',
  duration_seconds: 300,
  created_at: '2026-01-01T12:00:00Z',
}

describe('resolveRecordingUrl', () => {
  it('returns absolute https URLs unchanged', () => {
    expect(
      resolveRecordingUrl(1, 'https://cdn.example.com/rec.mp3', 'completed'),
    ).toBe('https://cdn.example.com/rec.mp3')
  })

  it('prefixes relative paths with API origin', () => {
    const url = resolveRecordingUrl(1, '/media/rec.mp3', 'completed')
    expect(url).toContain('/media/rec.mp3')
  })

  it('falls back to recording endpoint for completed calls without url', () => {
    const url = resolveRecordingUrl(99, null, 'completed')
    expect(url).toContain('/calls/99/recording')
  })

  it('returns undefined for in-progress calls without url', () => {
    expect(resolveRecordingUrl(1, null, 'in_progress')).toBeUndefined()
  })
})

describe('mapBackendCall', () => {
  it('maps recording_url onto CallRecord', () => {
    const mapped = mapBackendCall({
      ...baseCall,
      recording_url: 'https://cdn.example.com/call-42.mp3',
    })
    expect(mapped.recordingUrl).toBe('https://cdn.example.com/call-42.mp3')
    expect(mapped.id).toBe('42')
    expect(mapped.durationSec).toBe(300)
  })

  it('uses recording endpoint when completed and no recording_url', () => {
    const mapped = mapBackendCall(baseCall)
    expect(mapped.recordingUrl).toContain('/calls/42/recording')
  })
})
