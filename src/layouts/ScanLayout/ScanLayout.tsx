import { Link, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { useWarehouses } from '@/hooks/queries/reference.queries'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useOnline } from '@/hooks/useOnline'

interface ScanContext {
  warehouseId: string
  online: boolean
}

/** Warehouse and connection state for scanner screens. */
export const useScanContext = () => useOutletContext<ScanContext>()

/**
 * Full-screen layout for handheld scanners and tablets: large touch targets,
 * the active warehouse always visible, and a connection banner.
 */
export function ScanLayout() {
  const { user } = useAuth()
  const online = useOnline()
  const { pathname } = useLocation()
  const warehouses = useWarehouses()
  const [stored, setWarehouseId] = useLocalStorage('scan.warehouse', '')
  const list = warehouses.data?.data ?? []
  const warehouseId = list.some((w) => w.id === stored) ? stored : list[0]?.id ?? ''

  return (
    <div className="scan-app">
      <header className="scan-header">
        {pathname === ROUTES.SCAN ? (
          <Link to={ROUTES.DASHBOARD} className="scan-icon-btn" aria-label="Back to the app"><i className="ri-apps-2-line" /></Link>
        ) : (
          <Link to={ROUTES.SCAN} className="scan-icon-btn" aria-label="Back to my tasks"><i className="ri-arrow-left-line" /></Link>
        )}
        <div className="flex-1 min-w-0">
          <select className="form-select form-select-sm scan-warehouse" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} aria-label="Warehouse">
            {list.map((w) => <option key={w.id} value={w.id}>{w.code} · {w.name}</option>)}
          </select>
        </div>
        <span className={`scan-connection ${online ? 'online' : 'offline'}`} role="status">
          <span className="dot" /> {online ? 'Online' : 'Offline'}
        </span>
        <span className="scan-user d-none d-md-inline">{user?.name}</span>
      </header>
      {!online && <div className="scan-offline-banner"><i className="ri-wifi-off-line" /> No connection. Scans are paused until you are back online; nothing is saved offline.</div>}
      <main className="scan-main">{warehouseId ? <Outlet context={{ warehouseId, online } satisfies ScanContext} /> : <p className="text-muted p-4">Loading warehouses…</p>}</main>
    </div>
  )
}
