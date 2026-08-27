import { describe, expect, it } from 'vitest'
import {
  hasAnyPermission,
  hasPermission,
  PERMISSIONS,
} from '@/config/permissions'

describe('hasPermission', () => {
  it('grants owner all permissions', () => {
    expect(hasPermission('owner', PERMISSIONS.BILLING_MANAGE)).toBe(true)
    expect(hasPermission('owner', PERMISSIONS.TEAM_MANAGE)).toBe(true)
  })

  it('grants manager campaign start but not billing manage', () => {
    expect(hasPermission('manager', PERMISSIONS.CAMPAIGNS_START)).toBe(true)
    expect(hasPermission('manager', PERMISSIONS.BILLING_MANAGE)).toBe(false)
  })

  it('denies null role', () => {
    expect(hasPermission(null, PERMISSIONS.AGENTS_VIEW)).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true when any permission matches', () => {
    expect(
      hasAnyPermission('viewer', [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.CALLS_VIEW,
      ]),
    ).toBe(true)
  })

  it('returns false when none match', () => {
    expect(
      hasAnyPermission('viewer', [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.TEAM_MANAGE,
      ]),
    ).toBe(false)
  })
})
