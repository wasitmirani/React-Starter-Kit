import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/** Topbar profile dropdown for the signed-in user. */
export function UserMenu() {
  const { user, currentMembership, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  if (!user) return null

  const signOut = async () => {
    await logout()
    toast.info('You have been signed out.')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="dropdown profile-dropdown">
      <button
        className="btn topbar-link bg-transparent w-auto gap-2 ms-1"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="d-flex align-items-center gap-2">
          <span className="text-end fs-sm d-none d-xl-block">
            <span className="fw-medium d-block lh-sm">{user.name}</span>
            <span className="d-inline-block text-muted">{currentMembership?.role.name}</span>
          </span>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="object-fit-cover rounded-circle size-9" />
          ) : (
            <span className="avatar size-9 rounded-circle bg-primary-subtle text-primary fw-semibold">
              {initials(user.name)}
            </span>
          )}
        </span>
      </button>
      <div className="dropdown-menu p-0 profile-dropdown-menu dropdown-menu-end">
        <div className="px-5 pt-4 pb-2">
          <div className="fw-medium text-truncate">{user.name}</div>
          <div className="text-muted fs-sm text-truncate">{user.email}</div>
        </div>
        <ul className="list-unstyled mb-0 p-2 border-bottom">
          <li>
            <Link className="dropdown-item align-items-center px-3 d-flex" to={ROUTES.SETTINGS_PROFILE}>
              <i className="mgc_user_1_line d-inline-block me-2" /> My profile
            </Link>
          </li>
          <li>
            <Link className="dropdown-item align-items-center px-3 d-flex" to={ROUTES.SETTINGS_WORKSPACE}>
              <i className="mgc_settings_3_line d-inline-block me-2" /> Workspace settings
            </Link>
          </li>
        </ul>
        <ul className="list-unstyled mb-0 px-2">
          <li>
            <button type="button" className="dropdown-item align-items-center d-flex py-4 text-danger" onClick={signOut}>
              <i className="mgc_key_2_line d-inline-block me-2" /> Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
