import { useCallback, useMemo } from 'react'
import { ALL_PERMISSIONS, PRODUCT_PERMISSIONS } from '@/constants/permissions.constants'
import { usePermissions } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'

const PRODUCT_KEYS = new Set(PRODUCT_PERMISSIONS.map((p) => p.key))
const DESCRIPTIONS = new Map(ALL_PERMISSIONS.map((p) => [p.key, p.description]))

/**
 * Permission check for UI actions. Product permissions the server's catalogue does
 * not know yet (backend phases not built) are allowed, so gating never locks people
 * out before the backend enforces it. Everything else follows the membership.
 */
export function useCan() {
  const { can, user } = useAuth()
  const catalog = usePermissions()
  const known = useMemo(() => (catalog.data ? new Set(catalog.data.map((p) => p.key)) : null), [catalog.data])
  const platformAdmin = user?.isPlatformAdmin === true
  return useCallback(
    (key: string) => (key === PLATFORM_ADMIN ? platformAdmin : can(key) || (PRODUCT_KEYS.has(key) && !!known && !known.has(key))),
    [can, known, platformAdmin],
  )
}

/** Pseudo-permission held by platform (master) admins across every workspace; the API checks it too. */
export const PLATFORM_ADMIN = 'platform.admin'

/** Human description of a permission key, e.g. "Launch, schedule and stop campaigns". */
export const describePermission = (key: string) => (key === PLATFORM_ADMIN ? 'Platform admin' : DESCRIPTIONS.get(key) ?? key)
