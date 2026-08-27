import { describe, expect, it } from 'vitest'
import { hasPermission, PERMISSIONS } from '@/config/permissions'
import { paginate, ok, toDataTableRows } from '@/lib/mock'
import { agentFormSchema } from '@/utils/validators/agent.schema'

describe('permissions', () => {
  it('grants owner billing manage', () => {
    expect(hasPermission('owner', PERMISSIONS.BILLING_MANAGE)).toBe(true)
  })

  it('denies viewer campaign start', () => {
    expect(hasPermission('viewer', PERMISSIONS.CAMPAIGNS_START)).toBe(false)
  })
})

describe('mock helpers', () => {
  it('paginates items', () => {
    const { data, meta } = paginate([1, 2, 3, 4, 5], { page: 2, per_page: 2 })
    expect(data).toEqual([3, 4])
    expect(meta.total).toBe(5)
    expect(meta.total_pages).toBe(3)
  })

  it('builds data table rows', () => {
    const rows = toDataTableRows([{ id: '1' }], {
      page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
    })
    expect(rows.from).toBe(1)
    expect(rows.to).toBe(1)
  })

  it('wraps ok responses', () => {
    expect(ok({ a: 1 }).success).toBe(true)
  })
})

describe('agentFormSchema', () => {
  it('requires name', () => {
    const result = agentFormSchema.safeParse({
      name: '',
      description: 'desc',
      status: 'draft',
      voiceProvider: 'x',
      voice: 'y',
      language: 'en',
      speed: 1,
      pitch: 1,
      modelProvider: 'x',
      model: 'y',
      temperature: 0.4,
      maxTokens: 100,
      systemInstructions: 's',
      greeting: 'g',
      personality: 'p',
      rules: 'r',
      goals: 'g',
      fallback: 'f',
      callTimeout: 45,
      retryCount: 1,
    })
    expect(result.success).toBe(false)
  })
})
