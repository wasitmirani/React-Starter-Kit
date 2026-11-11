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
  [ROUTES.REPORTS, 'reports.read'],
  [ROUTES.ORDERS, 'orders.read'],
  [ROUTES.CUSTOMERS, 'orders.read'],
  [ROUTES.PRODUCTS, 'products.read'],
  [ROUTES.IMPORTS, 'products.manage'],
  [ROUTES.CHANNELS, 'products.read'],
  [ROUTES.LISTINGS, 'products.read'],
  [ROUTES.SETTINGS_DOCUMENTS, 'orders.read'],
  [ROUTES.STOREFRONTS, 'products.read'],
  [ROUTES.APP_MARKETPLACE, 'integrations.manage'],
  [ROUTES.COURIERS, 'shipping.read'],
  [ROUTES.DASH_GLOBAL_SALES, 'reports.read'],
  [ROUTES.DASH_SHIPPING, 'shipping.read'],
  [ROUTES.INVENTORY, 'inventory.read'],
  [ROUTES.LEDGER, 'inventory.read'],
  [ROUTES.RESERVATIONS, 'inventory.read'],
  [ROUTES.ADJUSTMENTS, 'inventory.read'],
  [ROUTES.TRANSFERS, 'inventory.read'],
  [ROUTES.STOCK_COUNTS, 'inventory.read'],
  [ROUTES.LOTS, 'inventory.read'],
  [ROUTES.REPLENISHMENT, 'inventory.read'],
  [ROUTES.WAREHOUSES, 'warehouse.read'],
  [ROUTES.LOCATIONS, 'warehouse.read'],
  [ROUTES.RECEIPTS, 'warehouse.read'],
  [ROUTES.PUTAWAY, 'warehouse.read'],
  [ROUTES.WAVES, 'warehouse.read'],
  [ROUTES.TASKS, 'warehouse.read'],
  [ROUTES.PACKING, 'warehouse.read'],
  [ROUTES.DISPATCH, 'warehouse.read'],
  [ROUTES.STAFF, 'warehouse.read'],
  [ROUTES.SCAN, 'warehouse.read'],
  [ROUTES.SUPPLIERS, 'procurement.read'],
  [ROUTES.PURCHASE_ORDERS, 'procurement.read'],
  [ROUTES.REQUISITIONS, 'procurement.read'],
  [ROUTES.SUPPLIER_RETURNS, 'procurement.read'],
  [ROUTES.SHIPMENTS, 'shipping.read'],
  [ROUTES.CARRIERS, 'shipping.read'],
  [ROUTES.TRACKING_EXCEPTIONS, 'shipping.read'],
  [ROUTES.COD, 'shipping.read'],
  [ROUTES.RETURNS, 'returns.read'],
  [ROUTES.CLIENTS, 'clients.read'],
  [ROUTES.RATE_CARDS, 'clients.read'],
  [ROUTES.USAGE, 'clients.read'],
  [ROUTES.STATEMENTS, 'clients.read'],
  [ROUTES.SLA, 'clients.read'],
  [ROUTES.CONNECTORS, 'integrations.manage'],
  [ROUTES.AUTOMATION_RULES, 'automation.manage'],
  [ROUTES.AUTOMATION_RUNS, 'automation.manage'],
  [ROUTES.SETTINGS_BILLING, 'billing.read'],
]

/** Wraps the app outlet: product areas a role cannot read show the no-access screen. */
export function RequireAreaAccess({ children }: { children: ReactNode }) {
  const can = useCan()
  const { pathname } = useLocation()
  const hit = AREA_PERMISSIONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  return hit && !can(hit[1]) ? <NoAccess permission={hit[1]} /> : <>{children}</>
}

/** `/`: prospects see the product page, signed-in users go to their dashboard. */
export function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return null
  return <Navigate to={status === 'anonymous' ? ROUTES.LANDING : ROUTES.DASHBOARD} replace />
}
