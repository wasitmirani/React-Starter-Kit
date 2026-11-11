import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { PLANS } from '@/constants/billing.constants'
import { ROUTES } from '@/constants/routes.constants'
import { queryKeys, useMyWorkspaces } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import type { WorkspaceAllowance } from '@/types/workspace.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'

export const planName = (id: string) => PLANS.find((p) => p.id === id)?.name ?? id

const PLAN_TONE: Record<string, string> = { free: 'secondary', starter: 'info', business: 'primary', enterprise: 'success' }
export const planBadge = (id: string) => `badge bg-${PLAN_TONE[id] ?? 'secondary'}-subtle text-${PLAN_TONE[id] ?? 'secondary'}`

function Meter({ label, used, max, hint }: { label: string; used: number; max: number; hint: string }) {
  const pct = Math.min(100, Math.round((used / Math.max(max, 1)) * 100))
  const full = used >= max
  return (
    <div className="ws-meter">
      <div className="d-flex justify-content-between align-items-baseline mb-1">
        <span className="fw-medium fs-sm">{label}</span>
        <span className={`tabular-nums fs-sm ${full ? 'text-danger fw-semibold' : 'text-muted'}`}>{used} / {max}</span>
      </div>
      <div className="progress" style={{ height: 6 }} role="progressbar" aria-label={label} aria-valuenow={used} aria-valuemin={0} aria-valuemax={max}>
        <div className={`progress-bar ${full ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="form-text mt-1">{hint}</div>
    </div>
  )
}

/** How many workspaces this person may own, and why creating another is blocked. */
export function WorkspaceAllowanceCard({ allowance, onCreate }: { allowance: WorkspaceAllowance; onCreate?: () => void }) {
  if (allowance.exempt) {
    return <div className="alert alert-info mb-0 fs-sm"><i className="ri-shield-star-line me-1" />As a platform admin you can create workspaces without limits.</div>
  }
  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-4 ws-meters">
        <div className="col-12">
          <Meter label="Free workspaces you own" used={allowance.ownedFree} max={allowance.maxFree} hint="Each new workspace starts on the Free plan." />
        </div>
        <div className="col-12">
          <Meter label="Workspaces you own in total" used={allowance.ownedTotal} max={allowance.maxTotal} hint="Paid workspaces count here too." />
        </div>
      </div>
      {allowance.canCreate ? (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span className="text-muted fs-sm"><i className="ri-checkbox-circle-line text-success me-1" />You can create another workspace.</span>
          {onCreate && <button type="button" className="btn btn-sm btn-primary" onClick={onCreate}><i className="ri-add-line" />New workspace</button>}
        </div>
      ) : (
        <div className="ws-limit-note">
          <i className="ri-lock-line" />
          <div className="flex-1">
            <div className="fw-medium">You can’t create another workspace yet</div>
            <div className="fs-sm text-muted">{allowance.reason}</div>
          </div>
          <Link to={ROUTES.SETTINGS_BILLING} className="btn btn-sm btn-primary text-nowrap">Upgrade plan</Link>
        </div>
      )}
      <p className="form-text mb-0">Workspaces you join by invitation never count toward your limit.</p>
    </div>
  )
}

/** Every workspace I belong to: role, plan, members, and a quick switch. */
export function MyWorkspacesList() {
  const query = useMyWorkspaces()
  const { currentMembership, switchTenant } = useAuth()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)

  if (query.isLoading) return <Loader size="sm" />
  if (query.isError) return <div className="alert alert-danger mb-0">{errorMessage(query.error)}</div>
  const { workspaces, allowance } = query.data!
  const currentId = currentMembership?.tenant.id

  return (
    <>
      <ul className="ws-list">
        {workspaces.map((w) => {
          const current = w.id === currentId
          const usable = w.status === 'active' && w.memberStatus === 'active'
          return (
            <li key={w.id} className={current ? 'is-current' : undefined}>
              <span className="ws-mark" aria-hidden="true">{w.name.slice(0, 1).toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="fw-semibold text-truncate">{w.name}</span>
                  <span className={planBadge(w.plan)}>{planName(w.plan)}</span>
                  {w.isOwner && <span className="badge bg-warning-subtle text-warning-emphasis"><i className="ri-vip-crown-2-line me-1" />Owner</span>}
                  {!usable && <span className="badge bg-danger-subtle text-danger">{w.status === 'suspended' ? 'Suspended' : 'Access paused'}</span>}
                </div>
                <div className="text-muted fs-xs mt-1">
                  {w.role.name} · {w.members} member{w.members === 1 ? '' : 's'}
                  {!w.isOwner && w.ownerName && <> · owned by {w.ownerName}</>} · joined {formatRelativeTime(w.joinedAt)}
                </div>
              </div>
              {current ? (
                <span className="badge bg-success-subtle text-success text-nowrap"><i className="ri-checkbox-circle-line me-1" />Current</span>
              ) : (
                <button type="button" className="btn btn-sm btn-light text-nowrap" disabled={!usable} onClick={() => switchTenant(w.id)}>Switch</button>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-5">
        <WorkspaceAllowanceCard allowance={allowance} onCreate={() => setCreating(true)} />
      </div>
      <CreateWorkspaceModal
        open={creating}
        onClose={() => {
          setCreating(false)
          void queryClient.invalidateQueries({ queryKey: queryKeys.myWorkspaces })
        }}
      />
    </>
  )
}
