import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { describePermission } from '@/hooks/useCan'
import { useRolePreview } from '@/store/rolePreview.store'

/** Friendly "you can't open this" screen with the missing permission and a way out. */
export function NoAccess({ permission }: { permission: string }) {
  const preview = useRolePreview()
  return (
    <div className="no-access">
      <span className="no-access-icon"><i className="ri-lock-2-line" /></span>
      <h5 className="mb-1">You don’t have access to this page</h5>
      <p className="text-muted mb-3">
        It needs <strong>{describePermission(permission)}</strong> <code className="fs-xs">{permission}</code>.
        {preview.role ? <> You are previewing as {preview.role.name}.</> : <> Ask a workspace owner or admin to add it to your role.</>}
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        <Link to={ROUTES.DASHBOARD} className="btn btn-light"><i className="ri-home-5-line" /> Go to dashboard</Link>
        {preview.role ? (
          <button type="button" className="btn btn-primary" onClick={preview.stop}><i className="ri-close-line" /> Exit preview</button>
        ) : (
          <Link to={ROUTES.SETTINGS_TEAM} className="btn btn-primary"><i className="ri-team-line" /> See who can help</Link>
        )}
      </div>
    </div>
  )
}
