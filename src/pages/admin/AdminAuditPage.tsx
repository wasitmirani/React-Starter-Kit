import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/endpoints/admin.api'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { ROUTES, to } from '@/constants/routes.constants'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { AdminNav } from './admin-ui'
import { describeAction, describeMeta } from './admin-utils'

const LIMIT = 50

/** What platform admins did, across all workspaces. Append-only. */
export function AdminAuditPage() {
  const [page, setPage] = useState(1)
  const q = useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: async () => (await adminApi.audit({ page, limit: LIMIT })).data.data,
    placeholderData: keepPreviousData,
  })
  const data = q.data
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  return (
    <>
      <PageHeader title="Platform audit" description="Every action taken from this console, newest first. Entries cannot be edited or deleted; each also appears in the affected workspace's own audit log." />
      <AdminNav />
      <div className="card">
        <div className="card-body p-0">
          {q.isLoading ? (
            <div className="p-5">
              <Loader />
            </div>
          ) : q.isError ? (
            <div className="alert alert-danger m-4">{errorMessage(q.error)}</div>
          ) : !data?.items.length ? (
            <p className="text-muted text-center py-6 mb-0">No platform actions yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Workspace / user</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((a) => (
                    <tr key={a.id}>
                      <td className="text-nowrap fs-sm">{formatDateTime(a.createdAt)}</td>
                      <td className="fs-sm">{a.actorEmail ?? '—'}</td>
                      <td>
                        <span className="fw-medium">{describeAction(a.action)}</span>
                        {describeMeta(a.metadata) && <div className="text-muted fs-xs">{describeMeta(a.metadata)}</div>}
                      </td>
                      <td className="fs-sm">
                        {a.tenant ? (
                          a.tenant.name ? (
                            <Link to={to(ROUTES.ADMIN_TENANT, { id: a.tenant.id })}>{a.tenant.name}</Link>
                          ) : (
                            <span className="text-muted">Deleted workspace</span>
                          )
                        ) : a.targetType === 'user' && a.targetId ? (
                          <Link to={`${ROUTES.ADMIN_USERS}?user=${a.targetId}`}>View user</Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="fs-sm text-muted">{a.ip ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pages > 1 && (
          <div className="card-footer d-flex justify-content-end">
            <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </>
  )
}
