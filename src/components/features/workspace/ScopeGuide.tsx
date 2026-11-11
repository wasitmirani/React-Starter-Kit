import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'

/** Explains which settings belong to the person and which to the workspace. */
export function ScopeGuide({ maxFree = 1 }: { maxFree?: number }) {
  return (
    <div className="scope-guide">
      <div>
        <div className="scope-guide-title"><i className="ri-user-3-line" />You, in every workspace</div>
        <ul>
          <li>Name, email and password</li>
          <li>Signed-in devices</li>
          <li>Your colour theme and light/dark mode</li>
          <li>Owning up to {maxFree} Free workspace{maxFree === 1 ? '' : 's'}</li>
        </ul>
        <Link to={ROUTES.SETTINGS_PROFILE} className="fs-sm">My profile <i className="ri-arrow-right-line" /></Link>
      </div>
      <div>
        <div className="scope-guide-title"><i className="ri-building-2-line" />This workspace, shared by the team</div>
        <ul>
          <li>Plan, usage limits and billing</li>
          <li>Members, roles and invitations</li>
          <li>Orders, products, inventory, warehouses and shipping</li>
          <li>Channels, API keys, webhooks and audit log</li>
          <li>Time zone, language and default appearance</li>
        </ul>
        <Link to={ROUTES.SETTINGS_WORKSPACE} className="fs-sm">Workspace settings <i className="ri-arrow-right-line" /></Link>
      </div>
    </div>
  )
}
