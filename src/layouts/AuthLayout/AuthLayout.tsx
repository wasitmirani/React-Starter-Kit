import { Link, Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { appConfig } from '@/config/app.config'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { safeRedirect } from '@/utils/helpers/redirect'

interface AuthLayoutProps {
  /** Signed-in users are sent on to the app (login/register pages). */
  redirectIfAuthenticated?: boolean
}

/** Sign-in screens: the form on the left, a product preview on the right (wide screens). */
export function AuthLayout({ redirectIfAuthenticated = true }: AuthLayoutProps) {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  if (redirectIfAuthenticated && isAuthenticated) {
    const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from
    const target = searchParams.get('redirect') ?? (from ? from.pathname + from.search : null)
    return <Navigate to={safeRedirect(target)} replace />
  }

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <header className="auth-top">
          <Link to={ROUTES.HOME} className="text-reset text-decoration-none" aria-label={appConfig.name}>
            <BrandMark />
          </Link>
        </header>
        <div className="auth-center">
          <Outlet />
        </div>
        <footer className="auth-foot">
          <span>© {new Date().getFullYear()} {appConfig.name}</span>
          <span aria-hidden="true">·</span>
          <a href="#privacy">Privacy</a>
          <span aria-hidden="true">·</span>
          <a href="#terms">Terms</a>
        </footer>
      </main>

      <aside className="auth-showcase auth-aside" aria-label={`About ${appConfig.name}`}>
        <div className="auth-aside-copy">
          <span className="auth-showcase-eyebrow">Order and warehouse operations</span>
          <h2>Every order, SKU and shipment in one place.</h2>
          <p>Channels, inventory, warehouses, couriers and 3PL clients in one workspace, built for Pakistan and the UAE.</p>
        </div>

        {/* Product preview (illustrative, not live data). */}
        <div className="auth-preview" aria-hidden="true">
          <div className="auth-preview-card auth-preview-campaign">
            <div className="auth-preview-head">
              <span className="auth-preview-icon"><i className="ri-truck-fill" /></span>
              <div>
                <strong>Today’s dispatch</strong>
                <small>KHI-01 · 3 carriers · cutoff 15:00</small>
              </div>
              <span className="auth-preview-pill">On track</span>
            </div>
            <div className="auth-preview-stats">
              <div><span>412</span><small>Orders</small></div>
              <div><span>98.6%</span><small>Pick accuracy</small></div>
              <div><span>94%</span><small>On-time</small></div>
            </div>
            <div className="auth-preview-bars">
              {[38, 52, 46, 70, 64, 82, 76, 94, 88, 72, 60, 84].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="auth-preview-card auth-preview-chat">
            <div className="auth-preview-head">
              <span className="auth-preview-avatar">LW</span>
              <div>
                <strong>LW-10482</strong>
                <small><i className="ri-store-2-fill" /> Daraz Mall · COD · just now</small>
              </div>
            </div>
            <div className="auth-bubble in">Imported → validated → allocated to KHI-01</div>
            <div className="auth-bubble out">Picked, packed and booked with TCS 📦</div>
            <div className="auth-preview-auto"><i className="ri-flashlight-fill" /> Routed by rule “Lahore orders from LHE-01”</div>
          </div>
        </div>

        <ul className="auth-aside-points">
          <li><i className="ri-shopping-bag-3-line" /> Orders</li>
          <li><i className="ri-stack-line" /> Inventory</li>
          <li><i className="ri-building-4-line" /> WMS</li>
          <li><i className="ri-truck-line" /> Shipping</li>
        </ul>
      </aside>
    </div>
  )
}
