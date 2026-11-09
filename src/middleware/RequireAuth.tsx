import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { NoAccess } from '@/components/common/NoAccess'
import { useCan } from '@/hooks/useCan'
import { Loader } from '@/components/common/Loader'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes.constants'

/** Route middleware: requires a valid auth session to render child routes. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Loader fullScreen label="Loading your workspace…" />
  if (status === 'anonymous') {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Renders child routes only when the user holds `permission` in the current workspace. */
export function RequirePermission({ permission }: { permission: string }) {
  const can = useCan()
  return can(permission) ? <Outlet /> : <NoAccess permission={permission} />
}

/** Read permission per product area, by path prefix. */
const AREA_PERMISSIONS: [string, string][] = [
  [ROUTES.INBOX, 'inbox.read'],
  [ROUTES.CONTACT_IMPORT, 'contacts.import'],
  [ROUTES.CONTACTS, 'contacts.read'],
  [ROUTES.LISTS, 'contacts.read'],
  [ROUTES.SEGMENTS, 'contacts.read'],
  [ROUTES.DEALS, 'deals.read'],
  [ROUTES.COMPANIES, 'deals.read'],
  [ROUTES.TASKS, 'deals.read'],
  [ROUTES.CAMPAIGNS, 'campaigns.read'],
  [ROUTES.AUTOMATIONS, 'automations.read'],
  [ROUTES.MESSAGES, 'messages.read'],
  [ROUTES.DEVELOPERS_WEBHOOKS, 'webhooks.manage'],
  [ROUTES.SETTINGS_BILLING, 'billing.read'],
]

/** Wraps the app outlet: product areas a role cannot read show the no-access screen. */
export function RequireAreaAccess({ children }: { children: ReactNode }) {
  const can = useCan()
  const { pathname } = useLocation()
  const hit = AREA_PERMISSIONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  return hit && !can(hit[1]) ? <NoAccess permission={hit[1]} /> : <>{children}</>
}
