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
          <span className="auth-showcase-eyebrow">Omnichannel engagement</span>
          <h2>Every conversation, campaign and customer in one place.</h2>
          <p>Email, SMS, WhatsApp and Telegram in one workspace, with a shared inbox and automations that follow up for you.</p>
        </div>

        {/* Product preview (illustrative, not live data). */}
        <div className="auth-preview" aria-hidden="true">
          <div className="auth-preview-card auth-preview-campaign">
            <div className="auth-preview-head">
              <span className="auth-preview-icon"><i className="ri-send-plane-fill" /></span>
              <div>
                <strong>Spring sale</strong>
                <small>Email · sent to 12,480 contacts</small>
              </div>
              <span className="auth-preview-pill">Completed</span>
            </div>
            <div className="auth-preview-stats">
              <div><span>98.4%</span><small>Delivered</small></div>
              <div><span>46.2%</span><small>Opened</small></div>
              <div><span>12.8%</span><small>Clicked</small></div>
            </div>
            <div className="auth-preview-bars">
              {[38, 52, 46, 70, 64, 82, 76, 94, 88, 72, 60, 84].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="auth-preview-card auth-preview-chat">
            <div className="auth-preview-head">
              <span className="auth-preview-avatar">MK</span>
              <div>
                <strong>Maya Khan</strong>
                <small><i className="ri-whatsapp-fill" /> WhatsApp · just now</small>
              </div>
            </div>
            <div className="auth-bubble in">Hi! Has my order shipped yet?</div>
            <div className="auth-bubble out">Yes, it arrives tomorrow before noon. 📦</div>
            <div className="auth-preview-auto"><i className="ri-flashlight-fill" /> Replied by automation “Order updates”</div>
          </div>
        </div>

        <ul className="auth-aside-points">
          <li><i className="ri-inbox-2-line" /> Shared inbox</li>
          <li><i className="ri-send-plane-line" /> Campaigns</li>
          <li><i className="ri-git-branch-line" /> Automations</li>
          <li><i className="ri-pie-chart-2-line" /> Analytics</li>
        </ul>
      </aside>
    </div>
  )
}
