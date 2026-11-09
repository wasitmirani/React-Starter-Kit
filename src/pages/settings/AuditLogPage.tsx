import { useState } from 'react'
import { errorMessage } from '@/api/errors'
import { PageHeader } from '@/components/common/PageHeader'
import { Loader } from '@/components/common/Loader'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuditLog, useMembers } from '@/hooks/queries/workspace.queries'
import { formatDate } from '@/utils/formatters/date.formatter'

const DATE_TIME: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }

export function AuditLogPage() {
  const [action, setAction] = useState('')
  const debouncedAction = useDebounce(action.trim(), 400)
  const log = useAuditLog(debouncedAction)
  const members = useMembers()

  const actorName = (type: string, id: string | null) => {
    if (type === 'system' || !id) return 'System'
    if (type === 'api_key') return 'API key'
    return members.data?.find((m) => m.user.id === id)?.user.name ?? 'Former member'
  }

  const entries = log.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <PageHeader title="Audit log" description="Security-sensitive actions in this workspace, newest first." />
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 className="card-title mb-0">Audit log</h6>
            <p className="text-muted mb-0 fs-sm">Security-sensitive activity in this workspace. Entries cannot be edited or deleted.</p>
          </div>
          <input
            type="search"
            className="form-control w-auto"
            placeholder="Filter by action, e.g. api_key.created"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            aria-label="Filter by action"
          />
        </div>
        <div className="card-body">
          {log.isLoading ? (
            <Loader />
          ) : log.isError ? (
            <div className="alert alert-danger">{errorMessage(log.error)}</div>
          ) : entries.length === 0 ? (
            <p className="text-muted text-center py-6 mb-0">No activity recorded{debouncedAction ? ` for “${debouncedAction}”` : ''}.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td className="text-nowrap">{formatDate(e.createdAt, undefined, DATE_TIME)}</td>
                      <td>{actorName(e.actorType, e.actorId)}</td>
                      <td>
                        <code>{e.action}</code>
                        {Object.keys(e.metadata).length > 0 && (
                          <div className="text-muted fs-xs text-truncate" style={{ maxWidth: 360 }} title={JSON.stringify(e.metadata)}>
                            {JSON.stringify(e.metadata)}
                          </div>
                        )}
                      </td>
                      <td className="fs-sm text-muted">{e.targetType ? `${e.targetType}` : '—'}</td>
                      <td className="fs-sm text-muted">{e.ip ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {log.hasNextPage && (
            <div className="text-center mt-5">
              <button type="button" className="btn btn-light" onClick={() => log.fetchNextPage()} disabled={log.isFetchingNextPage}>
                {log.isFetchingNextPage ? 'Loading…' : 'Load older entries'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
