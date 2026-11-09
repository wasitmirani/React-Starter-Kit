import { useState } from 'react'
import { webhooksApi } from '@/api/endpoints/platform.api'
import { WEBHOOK_EVENTS } from '@/constants/webhooks.constants'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { CopyButton } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { DetailList } from '@/components/ui/Controls'
import { Drawer } from '@/components/ui/Drawer'
import { MoreMenu } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { WebhookDelivery, WebhookEndpoint } from '@/types/platform.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

function EndpointModal({ endpoint, open, onClose }: { endpoint: WebhookEndpoint | null; open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState(endpoint?.url ?? '')
  const [description, setDescription] = useState(endpoint?.description ?? '')
  const [events, setEvents] = useState<string[]>(endpoint?.events ?? ['message.delivered', 'message.failed'])
  const valid = /^https:\/\/[^\s]+$/.test(url) && events.length > 0
  const save = useAction(
    'webhooks',
    () => (endpoint ? webhooksApi.update(endpoint.id, { url, description, events }) : webhooksApi.create({ url, description, events, status: 'active', secretPrefix: 'whsec_new', successRate: 100, lastDeliveryAt: null })),
    { success: endpoint ? 'Endpoint updated' : 'Endpoint added', onSuccess: onClose },
  )
  return (
    <Modal open={open} onClose={onClose} title={endpoint ? 'Edit endpoint' : 'Add endpoint'} size="lg" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={!valid || save.isPending} onClick={() => save.mutate(undefined)}>Save</button></>}>
      <FormField id="wh-url" label="Endpoint URL" hint="Must be HTTPS. We POST JSON signed with your secret." className="mb-3">
        <input id="wh-url" className="form-control" placeholder="https://api.example.com/webhooks" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
      </FormField>
      <FormField id="wh-desc" label="Description" className="mb-3"><input id="wh-desc" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} /></FormField>
      <span className="form-label d-block">Events</span>
      <div className="row g-2">
        {WEBHOOK_EVENTS.map((ev) => (
          <div key={ev} className="col-md-4">
            <label className="form-check">
              <input type="checkbox" className="form-check-input" checked={events.includes(ev)} onChange={(e) => setEvents(e.target.checked ? [...events, ev] : events.filter((x) => x !== ev))} />
              <code className="form-check-label">{ev}</code>
            </label>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export function WebhooksPage() {
  const endpoints = useAll('webhooks', webhooksApi.list)
  const [filter, setFilter] = useState<string | undefined>()
  const deliveries = useTenantQuery('webhooks', { deliveries: filter }, () => webhooksApi.deliveries(filter))
  const [editing, setEditing] = useState<WebhookEndpoint | null | 'new'>(null)
  const [deleting, setDeleting] = useState<WebhookEndpoint | null>(null)
  const [delivery, setDelivery] = useState<WebhookDelivery | null>(null)
  const [secret, setSecret] = useState<string | null>(null)

  const test = useAction('webhooks', webhooksApi.sendTest, { success: (d) => (d.success ? 'Test event delivered (200)' : 'Test failed: endpoint is disabled') })
  const toggle = useAction('webhooks', (e: WebhookEndpoint) => webhooksApi.update(e.id, { status: e.status === 'active' ? 'disabled' : 'active' }), { success: 'Endpoint updated' })
  const rotate = useAction('webhooks', webhooksApi.rotateSecret, { onSuccess: (r) => setSecret(r.secret) })
  const redeliver = useAction('webhooks', webhooksApi.redeliver, { success: 'Event redelivered', onSuccess: setDelivery })
  const remove = useAction('webhooks', webhooksApi.remove, { success: 'Endpoint deleted', onSuccess: () => setDeleting(null) })
  const rows = endpoints.data?.data ?? []

  return (
    <>
      <PageHeader title="Webhooks" description="Get notified in your systems when messages, contacts and conversations change." actions={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />Add endpoint</button>} />

      <Panel title="Endpoints" flush className="mb-4">
        {endpoints.isLoading ? (
          <div className="p-4"><SkeletonLines lines={3} /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon="ri-webhook-line" title="No endpoints" description="Add an HTTPS URL to start receiving events." />
        ) : (
          <ul className="list-group list-group-flush">
            {rows.map((e) => (
              <li key={e.id} className="list-group-item d-flex flex-wrap align-items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="fw-medium text-truncate"><code>{e.url}</code></div>
                  <div className="text-muted fs-sm">{e.description} · {e.events.length} events · secret <code>{e.secretPrefix}…</code>{e.lastDeliveryAt && ` · last delivery ${formatRelativeTime(e.lastDeliveryAt)}`}</div>
                </div>
                {e.status === 'active' && <span className={`fs-sm fw-medium ${e.successRate >= 95 ? 'text-success' : 'text-warning'}`}>{e.successRate}% success</span>}
                <StatusBadge status={e.status} />
                <button type="button" className="btn btn-sm btn-light" disabled={test.isPending} onClick={() => test.mutate(e.id)}>Send test</button>
                <MoreMenu
                  items={[
                    { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => setEditing(e) },
                    { key: 'log', label: 'Show deliveries', icon: 'ri-list-check', onSelect: () => setFilter(e.id) },
                    { key: 'rotate', label: 'Rotate secret', icon: 'ri-key-2-line', onSelect: () => rotate.mutate(e.id) },
                    { key: 'toggle', label: e.status === 'active' ? 'Disable' : 'Enable', icon: 'ri-shut-down-line', onSelect: () => toggle.mutate(e) },
                    'divider',
                    { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(e) },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Recent deliveries"
        description="Failed deliveries are retried with exponential backoff for up to 24 hours."
        actions={filter && <button type="button" className="btn btn-sm btn-light" onClick={() => setFilter(undefined)}>Show all endpoints</button>}
        flush
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th>Event</th><th>Endpoint</th><th>Response</th><th className="text-end">Attempt</th><th className="text-end">Duration</th><th>Time</th></tr></thead>
            <tbody>
              {(deliveries.data ?? []).map((d) => (
                <tr key={d.id} className="cursor-pointer" onClick={() => setDelivery(d)}>
                  <td><code>{d.event}</code></td>
                  <td className="text-muted text-truncate" style={{ maxWidth: 240 }}>{rows.find((e) => e.id === d.endpointId)?.url}</td>
                  <td><StatusBadge status={d.success ? 'delivered' : 'failed'} label={d.statusCode ? String(d.statusCode) : 'Timeout'} /></td>
                  <td className="text-end">{d.attempt}</td>
                  <td className="text-end tabular-nums">{d.durationMs} ms</td>
                  <td className="text-muted text-nowrap">{formatDateTime(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Drawer
        open={delivery !== null}
        onClose={() => setDelivery(null)}
        title={<code>{delivery?.event}</code>}
        subtitle={delivery && <StatusBadge status={delivery.success ? 'delivered' : 'failed'} label={delivery.statusCode ? `HTTP ${delivery.statusCode}` : 'No response'} />}
        footer={delivery && <button type="button" className="btn btn-primary" disabled={redeliver.isPending} onClick={() => redeliver.mutate(delivery.id)}><i className="ri-refresh-line me-1" />Redeliver</button>}
      >
        {delivery && (
          <>
            <DetailList items={[{ label: 'Delivery ID', value: <code>{delivery.id}</code> }, { label: 'Attempt', value: delivery.attempt }, { label: 'Duration', value: `${delivery.durationMs} ms` }, { label: 'Sent', value: formatDateTime(delivery.createdAt) }]} />
            <h6 className="fs-sm text-muted text-uppercase mt-4">Request body</h6>
            <pre className="code-block">{delivery.requestBody}</pre>
            <h6 className="fs-sm text-muted text-uppercase mt-4">Response</h6>
            <pre className="code-block">{delivery.responseBody}</pre>
            <h6 className="fs-sm text-muted text-uppercase mt-4">Verifying signatures</h6>
            <p className="text-muted fs-sm mb-0">Each request has <code>X-Bird-Timestamp</code> and <code>X-Bird-Signature</code> headers. Compute HMAC-SHA256 of <code>timestamp.body</code> with your secret and compare in constant time. Reject timestamps older than 5 minutes.</p>
          </>
        )}
      </Drawer>

      {editing !== null && <EndpointModal open endpoint={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <Modal open={secret !== null} onClose={() => setSecret(null)} title="New signing secret" footer={<button type="button" className="btn btn-primary" onClick={() => setSecret(null)}>I’ve saved it</button>}>
        <div className="alert alert-warning">Copy this secret now. It will not be shown again. The old secret keeps working for 24 hours.</div>
        <div className="input-group"><input className="form-control font-monospace" readOnly value={secret ?? ''} /><CopyButton value={secret ?? ''} className="btn btn-light" /></div>
      </Modal>
      <ConfirmDialog open={deleting !== null} title="Delete endpoint?" message={<>Events will stop being sent to <code>{deleting?.url}</code>.</>} confirmLabel="Delete" danger busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting!.id)} />
    </>
  )
}
