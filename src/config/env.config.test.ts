import { afterEach, describe, expect, it, vi } from 'vitest'

describe('shouldMockModule', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns true for all modules when global mock is on', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'true')
    const { shouldMockModule } = await import('@/config/env.config')
    expect(shouldMockModule('auth')).toBe(true)
    expect(shouldMockModule('contacts')).toBe(true)
    expect(shouldMockModule('billing')).toBe(true)
  })

  it('returns false for live API modules when global mock is off', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'false')
    const { shouldMockModule } = await import('@/config/env.config')
    expect(shouldMockModule('auth')).toBe(false)
    expect(shouldMockModule('calls')).toBe(false)
    expect(shouldMockModule('contacts')).toBe(false)
    expect(shouldMockModule('settings')).toBe(false)
  })
})
