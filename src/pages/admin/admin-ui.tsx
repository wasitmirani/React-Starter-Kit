import { Link, useLocation } from 'react-router-dom'
import { planBadge, planName } from '@/components/features/workspace/MyWorkspaces'
import { ROUTES } from '@/constants/routes.constants'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

/** Shared bits of the platform (master) console. */


export function PlanBadge({ plan }: { plan: string }) {
  return <span className={planBadge(plan)}>{planName(plan)}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === 'active' ? 'success' : status === 'suspended' || status === 'disabled' ? 'danger' : 'secondary'
  return <span className={`badge bg-${tone}-subtle text-${tone} text-capitalize`}>{status}</span>
}

export function Ago({ at, empty = 'Never' }: { at: string | null | undefined; empty?: string }) {
  if (!at) return <span className="text-muted">{empty}</span>
  return <span title={new Date(at).toLocaleString()}>{formatRelativeTime(at)}</span>
}

/** Tabs across the console's pages. */
export function AdminNav() {
  const items = [
    { to: ROUTES.ADMIN, label: 'Overview', icon: 'ri-dashboard-line' },
    { to: ROUTES.ADMIN_TENANTS, label: 'Workspaces', icon: 'ri-building-line' },
    { to: ROUTES.ADMIN_USERS, label: 'Users', icon: 'ri-group-line' },
    { to: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: 'ri-settings-3-line' },
    { to: ROUTES.ADMIN_AUDIT, label: 'Platform audit', icon: 'ri-file-shield-2-line' },
  ]
  const { pathname: path } = useLocation()
  return (
    <ul className="nav nav-pills gap-1 mb-5" aria-label="Platform admin sections">
      {items.map((i) => {
        const active = i.to === ROUTES.ADMIN ? path === i.to : path.startsWith(i.to)
        return (
          <li className="nav-item" key={i.to}>
            <Link to={i.to} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
              <i className={`${i.icon} me-1`} />
              {i.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
