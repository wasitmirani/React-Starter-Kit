import { describe, expect, it, vi } from 'vitest'
import {
  apiErrorMessageForStatus,
  emitApiErrorToast,
  registerApiErrorToast,
} from '@/lib/api-toast'

describe('apiErrorMessageForStatus', () => {
  it('maps 422 to validation message', () => {
    expect(apiErrorMessageForStatus(422, 'Name required')).toBe('Name required')
  })

  it('maps 429 to rate limit message', () => {
    expect(apiErrorMessageForStatus(429, '')).toContain('Too many requests')
  })

  it('maps 503 to unavailable message', () => {
    expect(apiErrorMessageForStatus(503, '')).toContain('unavailable')
  })

  it('returns null for unhandled statuses', () => {
    expect(apiErrorMessageForStatus(404, 'Not found')).toBeNull()
  })
})

describe('emitApiErrorToast', () => {
  it('invokes registered handler', () => {
    const fn = vi.fn()
    const unregister = registerApiErrorToast(fn)
    emitApiErrorToast('Server error')
    expect(fn).toHaveBeenCalledWith('Server error')
    unregister()
    emitApiErrorToast('ignored')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
