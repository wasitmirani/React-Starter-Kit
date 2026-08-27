import { describe, expect, it } from 'vitest'
import { liveCallFromWsEvent } from '@/lib/live-call-events'

describe('liveCallFromWsEvent', () => {
  it('maps transcript events onto a live call', () => {
    const result = liveCallFromWsEvent('call.transcript', {
      event: 'call.transcript',
      call_id: 42,
      payload: { speaker: 'customer', text: 'Hello there' },
    })
    expect(result?.kind).toBe('upsert')
    if (result?.kind === 'upsert') {
      expect(result.call.id).toBe('42')
      expect(result.call.currentTranscript).toContain('Hello there')
      expect(result.call.status).toBe('in_progress')
    }
  })

  it('ends calls on completed', () => {
    const result = liveCallFromWsEvent('call.completed', {
      event: 'call.completed',
      call_id: 7,
      payload: {},
    })
    expect(result).toEqual({ kind: 'end', id: '7' })
  })
})
