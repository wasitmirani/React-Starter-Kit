import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { useRolePreview } from '@/store/rolePreview.store'

/** Shown across the app while "Preview as role" is on. */
export function RolePreviewBanner() {
  const { role, stop } = useRolePreview()
  if (!role) return null
  return (
    <div className="role-preview-banner" role="status">
      <i className="ri-eye-line" />
      <span>
        Previewing as <strong>{role.name}</strong>. Locked buttons show what this role cannot do; your real access is unchanged.
      </span>
      <Link to={ROUTES.SETTINGS_ROLES} className="btn btn-sm btn-light">Roles</Link>
      <button type="button" className="btn btn-sm btn-primary" onClick={stop}><i className="ri-close-line" /> Exit preview</button>
    </div>
  )
}
