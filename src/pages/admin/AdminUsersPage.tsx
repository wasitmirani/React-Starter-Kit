import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminApi } from '@/api/endpoints/admin.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Loader } from '@/components/common/Loader'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { formatNumber } from '@/utils/formatters/number.formatter'
import { AdminNav, Ago, PlanBadge, StatusBadge } from './admin-ui'

const LIMIT = 25

/** Every account on the platform: disable or re-enable sign-in, grant platform admin. */
export function AdminUsersPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const debounced = useDebounce(search.trim(), 350)
  const status = params.get('status') ?? ''
  const platformAdmin = params.get('platformAdmin') ?? ''
  const page = Number(params.get('page') ?? 1) || 1
  const openUser = params.get('user')

  const set = (key: string, value: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page' && key !== 'user') next.delete('page')
        return next
      },
      { replace: true },
    )

  useEffect(() => {
    if ((params.get('search') ?? '') !== debounced) set('search', debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const q = useQuery({
    queryKey: ['admin', 'users', { search: debounced, status, platformAdmin, page }],
    queryFn: async () => (await adminApi.users({ search: debounced, status, platformAdmin, page, limit: LIMIT })).data.data,
    placeholderData: keepPreviousData,
  })
  const data = q.data
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  return (
    <>
      <PageHeader title="All users" description="Every account, across all workspaces." />
      <AdminNav />
      <div className="card">
        <div className="card-header d-flex flex-wrap gap-2 align-items-center">
          <input type="search" className="form-control" style={{ maxWidth: 320 }} placeholder="Search name or email" aria-label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-select w-auto" aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <select className="form-select w-auto" aria-label="Platform admins" value={platformAdmin} onChange={(e) => set('platformAdmin', e.target.value)}>
            <option value="">Everyone</option>
            <option value="true">Platform admins</option>
            <option value="false">Customers only</option>
          </select>
          <span className="ms-auto text-muted fs-sm">{data ? `${formatNumber(data.total)} user${data.total === 1 ? '' : 's'}` : ''}</span>
        </div>
        <div className="card-body p-0">
          {q.isLoading ? (
            <div className="p-5">
              <Loader />
            </div>
          ) : q.isError ? (
            <div className="alert alert-danger m-4">{errorMessage(q.error)}</div>
          ) : !data?.items.length ? (
            <p className="text-muted text-center py-6 mb-0">No users match these filters.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th className="text-end">Workspaces</th>
                    <th>Security</th>
                    <th>Last sign-in</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id} role="button" onClick={() => set('user', u.id)}>
                      <td>
                        <span className="fw-medium text-primary">{u.name}</span>
                        {u.isPlatformAdmin && (
                          <span className="badge bg-warning-subtle text-warning ms-2">
                            <i className="ri-shield-star-line me-1" />
                            Platform admin
                          </span>
                        )}
                        <div className="text-muted fs-xs">{u.email}</div>
                      </td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="text-end">{u.workspaces}</td>
                      <td className="fs-xs">
                        <span className={u.emailVerified ? 'text-success' : 'text-warning'}>{u.emailVerified ? 'Verified' : 'Unverified'}</span>
                        {u.mfaEnabled && <span className="text-success ms-2">2FA</span>}
                      </td>
                      <td className="fs-sm">
                        <Ago at={u.lastLoginAt} />
                      </td>
                      <td className="fs-sm">
                        <Ago at={u.createdAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pages > 1 && (
          <div className="card-footer d-flex justify-content-end">
            <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => set('page', String(p))} />
          </div>
        )}
      </div>
      {openUser && <UserDialog id={openUser} onClose={() => set('user', '')} />}
    </>
  )
}

type Pending = null | { label: string; message: string; danger: boolean; body: { status?: 'active' | 'disabled'; isPlatformAdmin?: boolean } }

function UserDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [pending, setPending] = useState<Pending>(null)
  const key = ['admin', 'user', id]
  const q = useQuery({ queryKey: key, queryFn: async () => (await adminApi.user(id)).data.data })
  const m = useMutation({
    mutationFn: (body: NonNullable<Pending>['body']) => adminApi.updateUser(id, body),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(key, data.data)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] })
      toast.success('User updated')
      setPending(null)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const u = q.data
  const self = u?.id === me?.id
  const action = useMutation({
    mutationFn: async (kind: 'signOut' | 'verify' | 'reset') => {
      if (kind === 'signOut') {
        const { data } = await adminApi.signOutUser(id)
        return `Signed out of ${data.data.revoked} session${data.data.revoked === 1 ? '' : 's'}`
      }
      if (kind === 'verify') {
        const { data } = await adminApi.verifyEmail(id)
        queryClient.setQueryData(key, data.data)
        return 'Email marked as verified'
      }
      await adminApi.sendPasswordReset(id)
      return `Password reset link emailed to ${u?.email ?? 'the user'}`
    },
    onSuccess: (message) => {
      void queryClient.invalidateQueries({ queryKey: key })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] })
      toast.success(message)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <>
      <Modal open={!pending} onClose={onClose} title={u ? u.name : 'User'} size="lg">
        {q.isLoading ? (
          <Loader />
        ) : q.isError || !u ? (
          <div className="alert alert-danger">{errorMessage(q.error)}</div>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span>{u.email}</span>
              <StatusBadge status={u.status} />
              {u.isPlatformAdmin && <span className="badge bg-warning-subtle text-warning">Platform admin</span>}
            </div>
            <dl className="row fs-sm mb-4">
              <dt className="col-sm-4 text-muted fw-normal">Joined</dt>
              <dd className="col-sm-8">{formatDateTime(u.createdAt)}</dd>
              <dt className="col-sm-4 text-muted fw-normal">Last sign-in</dt>
              <dd className="col-sm-8">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</dd>
              <dt className="col-sm-4 text-muted fw-normal">Signed-in devices</dt>
              <dd className="col-sm-8">{u.activeSessions}</dd>
              <dt className="col-sm-4 text-muted fw-normal">Email / 2FA</dt>
              <dd className="col-sm-8">
                {u.emailVerified ? 'Verified' : 'Not verified'} · {u.mfaEnabled ? 'Two-step on' : 'Two-step off'}
              </dd>
            </dl>

            <h6 className="mb-2">Workspaces ({u.memberships.length})</h6>
            {u.memberships.length === 0 ? (
              <p className="text-muted">Not a member of any workspace.</p>
            ) : (
              <ul className="list-unstyled mb-4">
                {u.memberships.map((ms) => (
                  <li key={ms.tenant.id} className="d-flex flex-wrap align-items-center gap-2 py-2 border-bottom">
                    <Link to={to(ROUTES.ADMIN_TENANT, { id: ms.tenant.id })} onClick={onClose} className="fw-medium">
                      {ms.tenant.name}
                    </Link>
                    <PlanBadge plan={ms.tenant.plan} />
                    {ms.tenant.status !== 'active' && <StatusBadge status={ms.tenant.status} />}
                    <span className="ms-auto text-muted fs-sm">{ms.role.name}</span>
                  </li>
                ))}
              </ul>
            )}

            {self ? (
              <p className="text-muted fs-sm mb-0">
                <i className="ri-information-line me-1" />
                This is you. Another platform admin must change your access, so nobody locks themselves out.
              </p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {u.status === 'active' ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => setPending({ label: 'Disable sign-in', danger: true, message: `${u.name} is signed out on every device now and cannot sign in until re-enabled. Their workspaces keep running.`, body: { status: 'disabled' } })}
                  >
                    <i className="ri-user-forbid-line" /> Disable sign-in
                  </button>
                ) : (
                  <button type="button" className="btn btn-success" onClick={() => m.mutate({ status: 'active' })} disabled={m.isPending}>
                    <i className="ri-user-follow-line" /> Re-enable sign-in
                  </button>
                )}
                {u.isPlatformAdmin ? (
                  <button type="button" className="btn btn-light" onClick={() => setPending({ label: 'Revoke platform admin', danger: true, message: `${u.name} loses access to this console immediately.`, body: { isPlatformAdmin: false } })}>
                    <i className="ri-shield-cross-line" /> Revoke platform admin
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setPending({ label: 'Make platform admin', danger: false, message: `${u.name} will be able to see and manage every workspace and user on the platform, including suspending and deleting them.`, body: { isPlatformAdmin: true } })}
                  >
                    <i className="ri-shield-star-line" /> Make platform admin
                  </button>
                )}
                <button type="button" className="btn btn-light" onClick={() => action.mutate('signOut')} disabled={action.isPending}>
                  <i className="ri-logout-box-r-line" /> Sign out everywhere
                </button>
                {u.status === 'active' && (
                  <button type="button" className="btn btn-light" onClick={() => action.mutate('reset')} disabled={action.isPending}>
                    <i className="ri-lock-password-line" /> Send password reset
                  </button>
                )}
                {!u.emailVerified && (
                  <button type="button" className="btn btn-light" onClick={() => action.mutate('verify')} disabled={action.isPending}>
                    <i className="ri-mail-check-line" /> Mark email verified
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
      <ConfirmDialog
        open={!!pending}
        title={pending?.label ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.label ?? 'Confirm'}
        danger={pending?.danger}
        busy={m.isPending}
        onConfirm={() => pending && m.mutate(pending.body)}
        onClose={() => setPending(null)}
      />
    </>
  )
}
