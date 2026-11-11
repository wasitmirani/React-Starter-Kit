import { useState } from 'react'
import { Link } from 'react-router-dom'
import { connectorsApi, failedEventsApi, syncJobsApi } from '@/api/endpoints/integrations.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { APP_KINDS } from '@/constants/apps.constants'
import { regionLabel } from '@/constants/regions.constants'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { Drawer } from '@/components/ui/Drawer'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, TagList } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Connector, FailedEvent, SyncJob } from '@/types/integration.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

const KINDS = APP_KINDS.map((k) => k.value)

export function ConnectorsPage() {
  const connectors = useAll('connectors', connectorsApi.list)
  const [connecting, setConnecting] = useState<Connector | null>(null)
  const connect = useAction('connectors', connectorsApi.connect, { success: (c) => `${c.name} connected` })
  const disconnect = useAction('connectors', connectorsApi.disconnect, { success: (c) => `${c.name} disconnected` })
  const sync = useAction('connectors', connectorsApi.sync, { invalidates: ['sync-jobs', 'orders'], success: (j) => `Sync ${j.status}: ${j.processed} records` })

  return (
    <>
      <PageHeader title="Connectors" description="Marketplaces, storefronts and couriers. A connector is only offered once credentials, sandbox tests and provider approval are complete." actions={<><Link to={ROUTES.SYNC_JOBS} className="btn btn-light">Sync jobs</Link><Link to={ROUTES.APP_MARKETPLACE} className="btn btn-primary order-last"><i className="ri-apps-2-add-line me-1" />Add from app marketplace</Link><Link to={ROUTES.FAILED_EVENTS} className="btn btn-light">Failed events</Link></>} />
      {connectors.isError && <QueryError message={errorMessage(connectors.error)} onRetry={() => connectors.refetch()} />}
      {connectors.isLoading && <div className="card card-body"><SkeletonLines lines={6} /></div>}
      {KINDS.map((kind) => {
        const list = (connectors.data?.data ?? []).filter((c) => c.kind === kind)
        if (!list.length) return null
        return (
          <section key={kind} className="mb-5">
            <h6 className="text-muted text-uppercase fs-sm mb-3">{APP_KINDS.find((k) => k.value === kind)?.label ?? humanize(kind)}</h6>
            <div className="row g-4">
              {list.map((c) => (
                <div key={c.id} className="col-md-6 col-xxl-4">
                  <div className="card h-100 mb-0">
                    <div className="card-body">
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <AppLogo appId={c.provider} fallbackIcon={APP_KINDS.find((k) => k.value === c.kind)?.icon} />
                        <div className="flex-1 min-w-0"><h6 className="mb-0 text-truncate">{c.name}</h6><div className="text-muted fs-sm text-truncate">{regionLabel(c.region)} · {c.account ?? 'Not connected'} · {humanize(c.mode)}</div></div>
                        <StatusBadge status={c.status} />
                      </div>
                      <TagList tags={c.capabilities} max={4} />
                      <div className="d-flex justify-content-between text-muted fs-sm mt-3">
                        <span>{c.lastSyncAt ? `Synced ${formatRelativeTime(c.lastSyncAt)}` : 'Never synced'}</span>
                        <span className={c.errors24h ? 'text-danger fw-medium' : ''}>{c.errors24h} errors / 24h</span>
                      </div>
                    </div>
                    <div className="card-footer d-flex gap-2">
                      {c.status === 'disconnected' ? (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setConnecting(c)}>Connect</button>
                      ) : (
                        <>
                          <button type="button" className="btn btn-sm btn-light" disabled={sync.isPending} onClick={() => sync.mutate(c.id)}><i className="ri-refresh-line" /> Sync now</button>
                          {c.status === 'error' && <button type="button" className="btn btn-sm btn-warning" onClick={() => setConnecting(c)}>Reconnect</button>}
                          <button type="button" className="btn btn-sm btn-light ms-auto text-danger" onClick={() => disconnect.mutate(c.id)}>Disconnect</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
      <EntityFormModal
        open={connecting !== null}
        title={`Connect ${connecting?.name ?? ''}`}
        submitLabel="Connect"
        intro="Credentials are verified with the provider and stored encrypted. OAuth providers redirect you to approve access."
        onClose={() => setConnecting(null)}
        initial={{ account: connecting?.account ?? '', mode: 'sandbox' }}
        fields={[{ name: 'account', label: 'Account / store ID', required: true }, { name: 'apiKey', label: 'API key or token', required: true, placeholder: '••••••••••' }, { name: 'mode', label: 'Mode', type: 'select', required: true, options: [{ value: 'sandbox', label: 'Sandbox (test first)' }, { value: 'live', label: 'Live' }] }]}
        onSubmit={(v) => connect.mutateAsync({ id: connecting!.id, account: String(v.account), mode: v.mode as Connector['mode'] })}
      />
    </>
  )
}

export function SyncJobsPage() {
  const columns: DataTableColumn<SyncJob>[] = [
    { key: 'connectorName', label: 'Connector', sortable: true },
    { key: 'type', label: 'Job', render: (j) => humanize(j.type) },
    { key: 'status', label: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'processed', label: 'Processed', align: 'end' },
    { key: 'failed', label: 'Failed', align: 'end', render: (j) => <span className={j.failed ? 'text-danger fw-medium' : ''}>{j.failed}</span> },
    { key: 'startedAt', label: 'Started', sortable: true, render: (j) => formatDateTime(j.startedAt) },
    { key: 'finishedAt', label: 'Duration', render: (j) => (j.finishedAt ? `${Math.round((new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime()) / 1000)} s` : 'Running…') },
  ]
  return (
    <>
      <PageHeader title="Sync jobs" description="Imports, inventory publishing and tracking pulls with cursor checkpoints. Failed records go to Failed events for replay." />
      <ResourceList<SyncJob> resource="sync-jobs" list={syncJobsApi.list} columns={columns} itemsLabel="jobs" perPage={30} searchPlaceholder="Connector…" filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.syncJobStatus }, { key: 'type', allLabel: 'All job types', options: OPTIONS.syncJobType }]} />
    </>
  )
}

export function FailedEventsPage() {
  const [open, setOpen] = useState<FailedEvent | null>(null)
  const retry = useAction('failed-events', failedEventsApi.retry, { success: (e) => (e.status === 'resolved' ? 'Replayed successfully' : 'Still failing; check the error'), onSuccess: () => setOpen(null) })
  const ignore = useAction('failed-events', failedEventsApi.ignore, { success: 'Event ignored', onSuccess: () => setOpen(null) })
  const columns: DataTableColumn<FailedEvent>[] = [
    { key: 'lastAttemptAt', label: 'Last attempt', sortable: true, render: (e) => formatRelativeTime(e.lastAttemptAt) },
    { key: 'source', label: 'Source' },
    { key: 'eventType', label: 'Event', render: (e) => <div><span className="font-monospace">{e.eventType}</span><div className="text-muted fs-sm">#{e.externalId}</div></div> },
    { key: 'error', label: 'Error', render: (e) => <span className="text-danger fs-sm">{e.error}</span> },
    { key: 'attempts', label: 'Attempts', align: 'end' },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge status={e.status} /> },
  ]
  return (
    <>
      <PageHeader title="Failed events" description="Dead-lettered webhooks and sync records. Fix the cause (e.g. map the SKU), then replay; the external event ID keeps replays idempotent." />
      <ResourceList<FailedEvent>
        resource="failed-events"
        list={failedEventsApi.list}
        columns={columns}
        itemsLabel="events"
        searchPlaceholder="Source, event, external ID, error…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.failedEventStatus }]}
        actions={[{ key: 'view', label: 'Inspect', icon: 'ri-eye-line', variant: 'view' }, { key: 'retry', label: 'Replay', icon: 'ri-restart-line', condition: (e) => e.status === 'failed' }]}
        onRowAction={(action, e) => (action === 'retry' ? retry.mutate(e.id) : setOpen(e))}
        bulkActions={[{ action: 'retry', label: 'Replay selected' }]}
        onBulkAction={(_, rows) => rows.filter((e) => e.status === 'failed').forEach((e) => retry.mutate(e.id))}
      />
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open?.eventType} subtitle={open && `${open.source} · #${open.externalId}`} size="lg" footer={open?.status === 'failed' && <><button type="button" className="btn btn-light" onClick={() => ignore.mutate(open.id)}>Ignore</button><button type="button" className="btn btn-primary" disabled={retry.isPending} onClick={() => retry.mutate(open.id)}>Replay</button></>}>
        {open && (
          <>
            <div className="alert alert-danger">{open.error}</div>
            <h6 className="fs-sm text-muted">Payload (sensitive fields redacted)</h6>
            <pre className="bg-light p-3 rounded fs-sm mb-0">{open.payload}</pre>
          </>
        )}
      </Drawer>
    </>
  )
}
