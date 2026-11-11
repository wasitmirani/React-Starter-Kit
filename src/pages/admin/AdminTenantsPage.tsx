import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminApi } from '@/api/endpoints/admin.api'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { ROUTES, to } from '@/constants/routes.constants'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { formatNumber } from '@/utils/formatters/number.formatter'
import { AdminNav, Ago, PlanBadge, StatusBadge } from './admin-ui'
import { ADMIN_PLANS } from './admin-utils'

const LIMIT = 25

/** Every customer workspace, searchable by name, slug, owner email or id. Filters live in the URL. */
export function AdminTenantsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const debounced = useDebounce(search.trim(), 350)
  const status = params.get('status') ?? ''
  const plan = params.get('plan') ?? ''
  const sort = params.get('sort') ?? 'created'
  const page = Number(params.get('page') ?? 1) || 1

  const set = (key: string, value: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true },
    )

  useEffect(() => {
    if ((params.get('search') ?? '') !== debounced) set('search', debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const q = useQuery({
    queryKey: ['admin', 'tenants', { search: debounced, status, plan, sort, page }],
    queryFn: async () => (await adminApi.tenants({ search: debounced, status, plan, sort, page, limit: LIMIT })).data.data,
    placeholderData: keepPreviousData,
  })
  const data = q.data
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1
  const toast = useToast()
  const [exporting, setExporting] = useState(false)
  const exportCsv = async () => {
    setExporting(true)
    try {
      const res = await adminApi.exportTenants({ search: debounced, status, plan, sort })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `workspaces-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="All workspaces"
        description="Every customer workspace: plan, owner, usage and status."
        actions={
          <button type="button" className="btn btn-light" onClick={() => void exportCsv()} disabled={exporting}>
            <i className="ri-download-2-line" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        }
      />
      <AdminNav />
      <div className="card">
        <div className="card-header d-flex flex-wrap gap-2 align-items-center">
          <input
            type="search"
            className="form-control"
            style={{ maxWidth: 320 }}
            placeholder="Search name, slug, owner email or ID"
            aria-label="Search workspaces"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select w-auto" aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select className="form-select w-auto" aria-label="Plan" value={plan} onChange={(e) => set('plan', e.target.value)}>
            <option value="">All plans</option>
            {ADMIN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="form-select w-auto" aria-label="Sort" value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="created">Newest first</option>
            <option value="name">Name</option>
            <option value="contacts">Most contacts</option>
            <option value="messages">Most messages (30 days)</option>
            <option value="members">Most members</option>
          </select>
          <span className="ms-auto text-muted fs-sm">{data ? `${formatNumber(data.total)} workspace${data.total === 1 ? '' : 's'}` : ''}</span>
        </div>
        <div className="card-body p-0">
          {q.isLoading ? (
            <div className="p-5">
              <Loader />
            </div>
          ) : q.isError ? (
            <div className="alert alert-danger m-4">{errorMessage(q.error)}</div>
          ) : !data?.items.length ? (
            <p className="text-muted text-center py-6 mb-0">No workspaces match these filters.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Owner</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th className="text-end">Members</th>
                    <th className="text-end">Contacts</th>
                    <th className="text-end">Messages 30d</th>
                    <th>Last active</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link to={to(ROUTES.ADMIN_TENANT, { id: t.id })} className="fw-medium">
                          {t.name}
                        </Link>
                        <div className="text-muted fs-xs">{t.slug}</div>
                      </td>
                      <td className="fs-sm">
                        {t.owner ? (
                          <>
                            <div>{t.owner.name}</div>
                            <div className="text-muted fs-xs">{t.owner.email}</div>
                          </>
                        ) : (
                          <span className="text-muted">No owner</span>
                        )}
                      </td>
                      <td>
                        <PlanBadge plan={t.plan} />
                        {t.customLimits && <span className="badge bg-info-subtle text-info ms-1" title="Custom limits replace some of the plan's">Custom</span>}
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                        {t.sendingPaused && <span className="badge bg-warning-subtle text-warning ms-1">Sending paused</span>}
                        {t.suspendedReason && <div className="text-muted fs-xs text-truncate" style={{ maxWidth: 180 }} title={t.suspendedReason}>{t.suspendedReason}</div>}
                      </td>
                      <td className="text-end">{formatNumber(t.members)}</td>
                      <td className="text-end">{formatNumber(t.contacts)}</td>
                      <td className="text-end">{formatNumber(t.messages30d)}</td>
                      <td className="fs-sm text-nowrap">
                        <Ago at={t.lastActiveAt} />
                      </td>
                      <td className="fs-sm text-nowrap">
                        <Ago at={t.createdAt} />
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
    </>
  )
}
