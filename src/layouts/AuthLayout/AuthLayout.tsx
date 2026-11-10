import { Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { safeRedirect } from '@/utils/helpers/redirect'

interface AuthLayoutProps {
  /** Signed-in users are sent on to the app (login/register pages). */
  redirectIfAuthenticated?: boolean
}

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
    <div className="auth-wrapper auth-modern">
      <div className="row justify-content-between align-items-center h-100 p-xl-5 g-0">
        <div className="col-xl-7 h-100 position-relative">
          <div className="row g-0 auth-modern-row justify-content-center align-items-center">
            <Outlet />
          </div>
        </div>
        <aside className="col-xl-5 h-100 d-none d-xl-block">
          <div className="auth-showcase">
            <div className="auth-showcase-body">
              <span className="auth-showcase-eyebrow">Omnichannel engagement</span>
              <h2>Every conversation, campaign and customer in one place.</h2>
              <p>Send email, SMS and WhatsApp, answer customers from a shared inbox, and let automations follow up for you.</p>
              <ul className="auth-showcase-points">
                {SHOWCASE_POINTS.map((point) => (
                  <li key={point.title}>
                    <span className="auth-showcase-icon"><i className={point.icon} /></span>
                    <span>
                      <strong>{point.title}</strong>
                      {point.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="auth-showcase-channels" aria-label="Supported channels">
              {CHANNEL_ICONS.map((icon) => (
                <span key={icon}><i className={icon} /></span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const SHOWCASE_POINTS = [
  { icon: 'ri-inbox-2-line', title: 'Shared inbox', text: 'Assign, snooze and resolve conversations from every channel.' },
  { icon: 'ri-send-plane-line', title: 'Campaigns', text: 'Reach a list or segment and see opens, clicks and revenue.' },
  { icon: 'ri-git-branch-line', title: 'Automations', text: 'Journeys that react to what contacts do, step by step.' },
]

const CHANNEL_ICONS = ['ri-mail-line', 'ri-message-2-line', 'ri-whatsapp-line', 'ri-phone-line', 'ri-chat-smile-2-line', 'ri-instagram-line']
