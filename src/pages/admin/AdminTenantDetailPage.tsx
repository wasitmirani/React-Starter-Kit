import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, type AdminLimitOverrides, type AdminPlanId, type AdminTenantDetail } from '@/api/endpoints/admin.api'
import { errorMessage, toApiError } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes.constants'
import { useToast } from '@/hooks/useToast'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { formatNumber } from '@/utils/formatters/number.formatter'
import { AdminNav, Ago, PlanBadge, StatusBadge } from './admin-ui'
import { ADMIN_PLANS, describeAction, describeMeta } from './admin-utils'

type Dialog = null | 'suspend' | 'plan' | 'delete' | 'rename' | 'limits' | 'pause'

/** One customer workspace in full, with the platform's controls: suspend, plan, notes, delete. */
export function AdminTenantDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [dialog, setDialog] = useState<Dialog>(null)
  const key = ['admin', 'tenant', id]
  const q = useQuery({ queryKey: key, queryFn: async () => (await adminApi.tenant(id)).data.data })

  /** Puts the updated workspace in the cache and refreshes lists and the overview. */
  const done = (t: AdminTenantDetail, message: string) => {
    queryClient.setQueryData(key, t)
    void queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] })
    toast.success(message)
    setDialog(null)
  }

  const reactivate = useMutation({
    mutationFn: () => adminApi.updateTenant(id, { status: 'active' }),
    onSuccess: ({ data }) => done(data.data, 'Workspace reactivated'),
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (q.isLoading) return <Loader />
  if (q.isError || !q.data)
    return (
      <>
        <PageHeader title="Workspace" back={{ label: 'All workspaces', to: ROUTES.ADMIN_TENANTS }} />
        <div className="alert alert-danger">{errorMessage(q.error)}</div>
      </>
    )
  const t = q.data
  const suspended = t.status === 'suspended'

  return (
    <>
      <PageHeader
        title={t.name}
        back={{ label: 'All workspaces', to: ROUTES.ADMIN_TENANTS }}
        meta={
          <span className="d-inline-flex gap-2">
            <StatusBadge status={t.status} />
            <PlanBadge plan={t.plan} />
          </span>
        }
        description={
          <>
            <code>{t.slug}</code> · ID <code>{t.id}</code> · created {formatDateTime(t.createdAt)}
          </>
        }
        actions={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-light" onClick={() => setDialog('rename')}>
              <i className="ri-edit-line" /> Rename
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setDialog('plan')}>
              <i className="ri-vip-crown-line" /> Change plan
            </button>
            <button type="button" className="btn btn-light" onClick={() => setDialog('limits')}>
              <i className="ri-equalizer-line" /> Custom limits
            </button>
            {suspended ? (
              <button type="button" className="btn btn-success" onClick={() => reactivate.mutate()} disabled={reactivate.isPending}>
                <i className="ri-play-circle-line" /> Reactivate
              </button>
            ) : (
              <button type="button" className="btn btn-outline-danger" onClick={() => setDialog('suspend')}>
                <i className="ri-pause-circle-line" /> Suspend
              </button>
            )}
            <button type="button" className="btn btn-danger" onClick={() => setDialog('delete')}>
              <i className="ri-delete-bin-line" /> Delete
            </button>
          </div>
        }
      />
      <AdminNav />

      {suspended && (
        <div className="alert alert-danger d-flex gap-2" role="status">
          <i className="ri-forbid-line" />
          <div>
            <strong>Suspended</strong>
            {t.suspendedAt && <> on {formatDateTime(t.suspendedAt)}</>}. Members and API keys are blocked, and nothing is sent or run until it is reactivated. Queued messages wait.
            {t.suspendedReason && <div className="mt-1">Reason: {t.suspendedReason}</div>}
          </div>
        </div>
      )}

      {t.sending.paused && !suspended && (
        <div className="alert alert-warning d-flex gap-2" role="status">
          <i className="ri-pause-circle-line" />
          <div>
            <strong>Sending paused</strong>
            {t.sending.pausedAt && <> on {formatDateTime(t.sending.pausedAt)}</>}. The workspace works normally, but no email, SMS, WhatsApp or Telegram message leaves until you resume. Queued messages wait.
            {t.sending.reason && <div className="mt-1">Reason: {t.sending.reason}</div>}
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-xl-8">
          <UsageCard t={t} />
          <MembersCard t={t} />
          <ChannelsCard t={t} />
          <ActivityCard t={t} />
        </div>
        <div className="col-xl-4">
          <SummaryCard t={t} />
          <SendingCard t={t} onPause={() => setDialog('pause')} onResumed={(nt) => done(nt, 'Sending resumed')} />
          <NotesCard key={t.adminNotes} t={t} onSaved={(nt) => done(nt, 'Notes saved')} />
        </div>
      </div>

      {dialog === 'suspend' && <SuspendDialog open t={t} onClose={() => setDialog(null)} onDone={(nt) => done(nt, 'Workspace suspended')} />}
      {dialog === 'plan' && <PlanDialog open t={t} onClose={() => setDialog(null)} onDone={(nt) => done(nt, 'Plan changed')} />}
      {dialog === 'rename' && <RenameDialog open t={t} onClose={() => setDialog(null)} onDone={(nt) => done(nt, 'Workspace renamed')} />}
      {dialog === 'delete' && <DeleteDialog open t={t} onClose={() => setDialog(null)} />}
      {dialog === 'limits' && <LimitsDialog open t={t} onClose={() => setDialog(null)} onDone={(nt) => done(nt, 'Limits updated')} />}
      {dialog === 'pause' && <PauseDialog open t={t} onClose={() => setDialog(null)} onDone={(nt) => done(nt, 'Sending paused')} />}
    </>
  )
}

// ---------- Cards ----------

function SummaryCard({ t }: { t: AdminTenantDetail }) {
  const owner: ReactNode = t.owner ? (
    <>
      <div>{t.owner.name}</div>
      <div className="text-muted fs-xs">{t.owner.email}</div>
    </>
  ) : (
    <span className="text-muted">No owner</span>
  )
  const plan: ReactNode = (
    <>
      <PlanBadge plan={t.plan} /> <span className="text-muted fs-sm text-capitalize">{t.subscription.cycle ?? 'monthly'}</span>
    </>
  )
  const rows: [string, ReactNode][] = [
    ['Owner', owner],
    ['Plan', plan],
    ['Renews', t.subscription.renewsAt ? formatDateTime(String(t.subscription.renewsAt)) : '—'],
    ['Time zone', t.settings?.timezone ?? '—'],
    ['Language', t.settings?.locale ?? '—'],
    ['Last active', <Ago key="ago" at={t.lastActiveAt} />],
  ]
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Summary</h6>
      </div>
      <div className="card-body">
        <dl className="row mb-0 fs-sm">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <dt className="col-5 text-muted fw-normal mb-3">{k}</dt>
              <dd className="col-7 mb-3">{v}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </div>
  )
}

function UsageCard({ t }: { t: AdminTenantDetail }) {
  const u = t.usage
  const meters: { label: string; used: number; max: number | null }[] = [
    { label: 'Contacts', used: u.contacts ?? 0, max: t.limits.contacts },
    { label: 'Emails this month', used: u.emailsMonth ?? 0, max: t.limits.emailsPerMonth },
    { label: 'Seats', used: t.members.length, max: t.limits.seats },
    { label: 'Live automations', used: u.liveAutomations ?? 0, max: t.limits.activeAutomations },
  ]
  const counts: [string, number][] = [
    ['Lists', u.lists ?? 0],
    ['Campaigns', u.campaigns ?? 0],
    ['Templates', u.templates ?? 0],
    ['Automations', u.automations ?? 0],
    ['Deals', u.deals ?? 0],
    ['Conversations', u.conversations ?? 0],
    ['Messages this month', u.messagesMonth ?? 0],
    ['Queued now', u.messagesQueued ?? 0],
    ['Failed (30 days)', u.messagesFailed30d ?? 0],
  ]
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Usage and plan limits</h6>
        {Object.keys(t.limitOverrides ?? {}).length > 0 && <span className="badge bg-info-subtle text-info">Custom limits apply</span>}
      </div>
      <div className="card-body">
        <div className="row g-4 mb-4">
          {meters.map((m) => {
            const pct = m.max ? Math.min(100, Math.round((m.used / m.max) * 100)) : 0
            const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'primary'
            return (
              <div key={m.label} className="col-sm-6">
                <div className="d-flex justify-content-between fs-sm mb-1">
                  <span>{m.label}</span>
                  <span className="fw-medium">
                    {formatNumber(m.used)} / {m.max == null ? 'Unlimited' : formatNumber(m.max)}
                  </span>
                </div>
                <div className="progress" style={{ height: 6 }} role="progressbar" aria-label={m.label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`progress-bar bg-${tone}`} style={{ width: `${m.max == null ? 0 : pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="row g-3">
          {counts.map(([k, v]) => (
            <div key={k} className="col-6 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="text-muted fs-xs">{k}</div>
                <div className="fw-semibold fs-5">{formatNumber(v)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2 mt-4">
          {Object.entries(t.limits.features).map(([f, on]) => (
            <span key={f} className={`badge ${on ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
              <i className={on ? 'ri-check-line me-1' : 'ri-close-line me-1'} />
              {f.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MembersCard({ t }: { t: AdminTenantDetail }) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        <h6 className="card-title mb-0">Members ({t.members.length})</h6>
        {t.invitations.length > 0 && <span className="text-muted fs-sm">{t.invitations.length} pending invitation(s)</span>}
      </div>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Person</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {t.members.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link to={`${ROUTES.ADMIN_USERS}?user=${m.userId}`}>{m.name}</Link>
                  <div className="text-muted fs-xs">{m.email}</div>
                </td>
                <td>{m.role.name}</td>
                <td>
                  <StatusBadge status={m.userStatus === 'disabled' ? 'disabled' : m.status} />
                </td>
                <td className="fs-sm">
                  <Ago at={m.lastLoginAt} />
                </td>
              </tr>
            ))}
            {t.invitations.map((i) => (
              <tr key={i.id} className="text-muted">
                <td>{i.email}</td>
                <td colSpan={2}>Invited, not accepted yet</td>
                <td className="fs-sm">
                  <Ago at={i.createdAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChannelsCard({ t }: { t: AdminTenantDetail }) {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Connected channels</h6>
      </div>
      <div className="card-body">
        {t.channels.length === 0 ? (
          <p className="text-muted mb-0">No sending accounts connected.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {t.channels.map((c) => (
              <li key={c.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                <span className="badge bg-light text-body text-uppercase">{c.channel}</span>
                <span className="flex-grow-1">
                  {c.name ?? c.provider}
                  {c.provider && <span className="text-muted fs-xs ms-2">{c.provider}</span>}
                  {c.isDefault && <span className="badge bg-primary-subtle text-primary ms-2">Default</span>}
                </span>
                <span className={`badge ${c.status === 'connected' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>{c.status ?? 'unknown'}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted fs-xs mt-3 mb-0">Credentials are encrypted and never shown here.</p>
      </div>
    </div>
  )
}

function ActivityCard({ t }: { t: AdminTenantDetail }) {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Recent activity (workspace audit log)</h6>
      </div>
      <div className="card-body p-0">
        {t.audit.length === 0 ? (
          <p className="text-muted p-4 mb-0">Nothing recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <tbody>
                {t.audit.map((a) => (
                  <tr key={a.id}>
                    <td className="text-nowrap fs-sm ps-4">
                      <Ago at={a.createdAt} />
                    </td>
                    <td>
                      {a.action.startsWith('platform.') ? (
                        <span className="badge bg-warning-subtle text-warning me-1">Platform</span>
                      ) : null}
                      <code className="fs-xs">{a.action.startsWith('platform.') ? describeAction(a.action) : a.action}</code>
                      {describeMeta(a.metadata) && <div className="text-muted fs-xs">{describeMeta(a.metadata)}</div>}
                    </td>
                    <td className="fs-sm text-muted pe-4">{a.actorEmail ?? (a.actorType === 'api_key' ? 'API key' : 'System')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SendingCard({ t, onPause, onResumed }: { t: AdminTenantDetail; onPause: () => void; onResumed: (t: AdminTenantDetail) => void }) {
  const toast = useToast()
  const resume = useMutation({
    mutationFn: () => adminApi.setSending(t.id, false),
    onSuccess: ({ data }) => onResumed(data.data),
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Outgoing messages</h6>
      </div>
      <div className="card-body">
        {t.sending.paused ? (
          <>
            <p className="fs-sm mb-3">
              <span className="badge bg-warning-subtle text-warning me-2">Paused</span>
              {t.sending.reason}
            </p>
            <button type="button" className="btn btn-success btn-sm" onClick={() => resume.mutate()} disabled={resume.isPending}>
              <i className="ri-play-line" /> {resume.isPending ? 'Resuming…' : 'Resume sending'}
            </button>
          </>
        ) : (
          <>
            <p className="text-muted fs-sm mb-3">Hold every message this workspace sends (spam complaints, a compromised account, unpaid usage) while its team keeps working.</p>
            <button type="button" className="btn btn-outline-warning btn-sm" onClick={onPause}>
              <i className="ri-pause-line" /> Pause sending
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function NotesCard({ t, onSaved }: { t: AdminTenantDetail; onSaved: (t: AdminTenantDetail) => void }) {
  const toast = useToast()
  const [notes, setNotes] = useState(t.adminNotes)
  const save = useMutation({
    mutationFn: () => adminApi.updateTenant(t.id, { adminNotes: notes }),
    onSuccess: ({ data }) => onSaved(data.data),
    onError: (e) => toast.error(errorMessage(e)),
  })
  const dirty = notes !== t.adminNotes
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Private notes</h6>
        <p className="text-muted fs-xs mb-0">Only the platform team sees these. Never shown in the workspace.</p>
      </div>
      <div className="card-body">
        <textarea className="form-control mb-3" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={10000} aria-label="Private notes" placeholder="Deals, support history, billing arrangements…" />
        <button type="button" className="btn btn-primary btn-sm" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}

// ---------- Dialogs ----------

interface DialogProps {
  open: boolean
  t: AdminTenantDetail
  onClose: () => void
  onDone: (t: AdminTenantDetail) => void
}

function SuspendDialog({ open, t, onClose, onDone }: DialogProps) {
  const [reason, setReason] = useState('')
  const m = useMutation({
    mutationFn: () => adminApi.updateTenant(t.id, { status: 'suspended', reason: reason.trim() }),
    onSuccess: ({ data }) => {
      setReason('')
      onDone(data.data)
    },
  })
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Suspend ${t.name}?`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={m.isPending}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={() => m.mutate()} disabled={m.isPending || !reason.trim()}>
            {m.isPending ? 'Suspending…' : 'Suspend workspace'}
          </button>
        </>
      }
    >
      <p>Members are signed out of this workspace and its API keys stop working. Campaigns, automations and queued messages pause until you reactivate it. No data is deleted.</p>
      <label className="form-label" htmlFor="suspend-reason">
        Reason <span className="text-danger">*</span>
      </label>
      <textarea id="suspend-reason" className="form-control" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Unpaid invoice, spam complaints, terms violation" />
      <div className="form-text">Recorded in the platform audit log and the workspace's own audit log.</div>
      {m.isError && <div className="alert alert-danger mt-3 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}

function PlanDialog({ open, t, onClose, onDone }: DialogProps) {
  const [planId, setPlanId] = useState<AdminPlanId>(t.plan)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>((t.subscription.cycle as 'monthly' | 'yearly') ?? 'monthly')
  const [doesNotFit, setDoesNotFit] = useState<string | null>(null)
  const m = useMutation({
    mutationFn: (force: boolean) => adminApi.changePlan(t.id, { planId, cycle, force }),
    onSuccess: ({ data }) => onDone(data.data),
    onError: (e) => {
      const err = toApiError(e)
      setDoesNotFit(err.code === 'PLAN_DOES_NOT_FIT' ? err.message : null)
    },
  })
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change plan"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={m.isPending}>
            Cancel
          </button>
          {doesNotFit ? (
            <button type="button" className="btn btn-warning" onClick={() => m.mutate(true)} disabled={m.isPending}>
              Change anyway
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => m.mutate(false)} disabled={m.isPending || (planId === t.plan && cycle === t.subscription.cycle)}>
              {m.isPending ? 'Saving…' : 'Change plan'}
            </button>
          )}
        </>
      }
    >
      <p className="text-muted">Takes effect immediately, without checkout. Use this for Enterprise deals, trials, refunds and support cases.</p>
      <div className="row g-3">
        <div className="col-sm-7">
          <label className="form-label" htmlFor="plan-id">
            Plan
          </label>
          <select
            id="plan-id"
            className="form-select"
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value as AdminPlanId)
              setDoesNotFit(null)
            }}
          >
            {ADMIN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.id === t.plan ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-5">
          <label className="form-label" htmlFor="plan-cycle">
            Billing cycle
          </label>
          <select id="plan-cycle" className="form-select" value={cycle} onChange={(e) => setCycle(e.target.value as 'monthly' | 'yearly')}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      {doesNotFit && (
        <div className="alert alert-warning mt-4 mb-0">
          <strong>This workspace uses more than the plan allows.</strong> {doesNotFit} You can change it anyway; the workspace keeps its data but cannot add more until it is under the limits.
        </div>
      )}
      {m.isError && !doesNotFit && <div className="alert alert-danger mt-4 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}

function RenameDialog({ open, t, onClose, onDone }: DialogProps) {
  const [name, setName] = useState(t.name)
  const m = useMutation({
    mutationFn: () => adminApi.updateTenant(t.id, { name: name.trim() }),
    onSuccess: ({ data }) => onDone(data.data),
  })
  const valid = name.trim().length >= 2 && name.trim() !== t.name
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rename workspace"
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => m.mutate()} disabled={!valid || m.isPending}>
            Save
          </button>
        </>
      }
    >
      <label className="form-label" htmlFor="ws-name">
        Name
      </label>
      <input id="ws-name" className="form-control" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
      {m.isError && <div className="alert alert-danger mt-3 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}

function DeleteDialog({ open, t, onClose }: Omit<DialogProps, 'onDone'>) {
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const m = useMutation({
    mutationFn: () => adminApi.deleteTenant(t.id, confirm),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success(`${t.name} was deleted`)
      navigate(ROUTES.ADMIN_TENANTS)
    },
  })
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete ${t.name} permanently?`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={m.isPending}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={() => m.mutate()} disabled={confirm !== t.slug || m.isPending}>
            {m.isPending ? 'Deleting…' : 'Delete forever'}
          </button>
        </>
      }
    >
      <div className="alert alert-danger">
        This deletes the workspace and <strong>all of its data</strong>: {formatNumber(t.usage.contacts ?? 0)} contacts, campaigns, automations, messages, members' access and API keys. It cannot be undone. People's accounts are kept. Consider suspending instead.
      </div>
      <label className="form-label" htmlFor="confirm-slug">
        Type <code>{t.slug}</code> to confirm
      </label>
      <input id="confirm-slug" className="form-control" autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {m.isError && <div className="alert alert-danger mt-3 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}

function PauseDialog({ open, t, onClose, onDone }: DialogProps) {
  const [reason, setReason] = useState('')
  const m = useMutation({
    mutationFn: () => adminApi.setSending(t.id, true, reason.trim()),
    onSuccess: ({ data }) => onDone(data.data),
  })
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Pause sending for ${t.name}?`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={m.isPending}>
            Cancel
          </button>
          <button type="button" className="btn btn-warning" onClick={() => m.mutate()} disabled={m.isPending || !reason.trim()}>
            {m.isPending ? 'Pausing…' : 'Pause sending'}
          </button>
        </>
      }
    >
      <p>Nothing leaves this workspace until you resume: campaigns, automations, inbox replies and form confirmations stay queued. Members can still sign in and work.</p>
      <label className="form-label" htmlFor="pause-reason">
        Reason <span className="text-danger">*</span>
      </label>
      <textarea id="pause-reason" className="form-control" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Spam complaints under review" />
      <div className="form-text">Recorded in the platform audit log and the workspace’s own audit log.</div>
      {m.isError && <div className="alert alert-danger mt-3 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}

const LIMIT_FIELDS = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'emailsPerMonth', label: 'Emails per month' },
  { key: 'emailsPerDay', label: 'Emails per day' },
  { key: 'seats', label: 'Seats' },
  { key: 'activeAutomations', label: 'Live automations' },
] as const
const FEATURES = [
  { key: 'abTesting', label: 'A/B testing' },
  { key: 'removeBranding', label: 'No branding footer' },
  { key: 'segments', label: 'Segments' },
  { key: 'salesCrm', label: 'Sales CRM' },
  { key: 'voice', label: 'Voice' },
] as const

type LimitKey = (typeof LIMIT_FIELDS)[number]['key']
type LimitMode = 'plan' | 'number' | 'unlimited'
type FeatureMode = 'plan' | 'on' | 'off'
const WHOLE = /^\d+$/

function LimitsDialog({ open, t, onClose, onDone }: DialogProps) {
  const o = t.limitOverrides ?? {}
  const [limits, setLimits] = useState(
    () =>
      Object.fromEntries(
        LIMIT_FIELDS.map((f) => {
          const has = f.key in o
          const v = o[f.key]
          return [f.key, { mode: (!has ? 'plan' : v === null ? 'unlimited' : 'number') as LimitMode, value: has && v != null ? String(v) : '' }]
        }),
      ) as Record<LimitKey, { mode: LimitMode; value: string }>,
  )
  const [features, setFeatures] = useState(
    () => Object.fromEntries(FEATURES.map((f) => [f.key, (o.features?.[f.key] === undefined ? 'plan' : o.features[f.key] ? 'on' : 'off') as FeatureMode])) as Record<string, FeatureMode>,
  )
  const [reason, setReason] = useState('')
  const bad = LIMIT_FIELDS.some((f) => limits[f.key].mode === 'number' && !WHOLE.test(limits[f.key].value))

  const build = (): AdminLimitOverrides => {
    const out: AdminLimitOverrides = {}
    for (const f of LIMIT_FIELDS) {
      const l = limits[f.key]
      if (l.mode === 'unlimited') out[f.key] = null
      else if (l.mode === 'number') out[f.key] = Number(l.value)
    }
    const fs = Object.fromEntries(
      Object.entries(features)
        .filter(([, m]) => m !== 'plan')
        .map(([k, m]) => [k, m === 'on']),
    )
    if (Object.keys(fs).length) out.features = fs
    return out
  }
  const m = useMutation({
    mutationFn: (overrides: AdminLimitOverrides) => adminApi.setLimits(t.id, overrides, reason.trim() || undefined),
    onSuccess: ({ data }) => onDone(data.data),
  })
  const fmt = (v: number | null) => (v == null ? 'Unlimited' : formatNumber(v))

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Custom limits"
      footer={
        <>
          {Object.keys(o).length > 0 && (
            <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => m.mutate({})} disabled={m.isPending}>
              Use plan limits only
            </button>
          )}
          <button type="button" className="btn btn-light" onClick={onClose} disabled={m.isPending}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => m.mutate(build())} disabled={m.isPending || bad}>
            {m.isPending ? 'Saving…' : 'Save limits'}
          </button>
        </>
      }
    >
      <p className="text-muted fs-sm">
        Replace individual limits of the <strong className="text-capitalize">{t.plan}</strong> plan for this workspace only, for custom deals or trials. They stay when the plan changes.
      </p>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Limit</th>
              <th>Plan</th>
              <th style={{ minWidth: 260 }}>This workspace</th>
            </tr>
          </thead>
          <tbody>
            {LIMIT_FIELDS.map((f) => {
              const l = limits[f.key]
              const set = (patch: Partial<typeof l>) => setLimits({ ...limits, [f.key]: { ...l, ...patch } })
              return (
                <tr key={f.key}>
                  <td>{f.label}</td>
                  <td className="text-muted">{fmt(t.planLimits[f.key])}</td>
                  <td>
                    <div className="input-group input-group-sm">
                      <select className="form-select" style={{ maxWidth: 140 }} aria-label={`${f.label}: source`} value={l.mode} onChange={(e) => set({ mode: e.target.value as LimitMode })}>
                        <option value="plan">Plan default</option>
                        <option value="number">Custom</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                      {l.mode === 'number' && (
                        <input type="number" min={0} className={`form-control${WHOLE.test(l.value) ? '' : ' is-invalid'}`} aria-label={`${f.label}: custom value`} value={l.value} onChange={(e) => set({ value: e.target.value })} />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {FEATURES.map((f) => (
              <tr key={f.key}>
                <td>{f.label}</td>
                <td className="text-muted">{t.planLimits.features[f.key] ? 'Included' : 'Not included'}</td>
                <td>
                  <select className="form-select form-select-sm" style={{ maxWidth: 180 }} aria-label={`${f.label}: access`} value={features[f.key]} onChange={(e) => setFeatures({ ...features, [f.key]: e.target.value as FeatureMode })}>
                    <option value="plan">Plan default</option>
                    <option value="on">Always on</option>
                    <option value="off">Always off</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="form-label" htmlFor="limits-reason">
        Reason <span className="text-muted fw-normal">(optional)</span>
      </label>
      <input id="limits-reason" className="form-control" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Annual contract with 100k contacts" />
      {m.isError && <div className="alert alert-danger mt-3 mb-0">{errorMessage(m.error)}</div>}
    </Modal>
  )
}
