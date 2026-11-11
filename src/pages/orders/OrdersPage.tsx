import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi, type BulkResult } from '@/api/endpoints/commerce.api'
import { Guard } from '@/components/common/Guard'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { PromptDialog } from '@/components/common/PromptDialog'
import { ResourceList } from '@/components/common/ResourceList'
import type { DataTableColumn } from '@/components/common/DataTable'
import { StatusBadge, TagList, ToneBadge } from '@/components/ui/StatusBadge'
import { OPEN_ORDER_STATUSES, ORDER_ACTION_META, OPTIONS, type OrderAction } from '@/constants/domain.constants'
import { ChannelLogo, CountryFlag, PaymentPill } from '@/components/features/orders/OrderVisuals'
import { Avatar } from '@/components/ui/Avatar'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useChannelOptions, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import { useListParams } from '@/hooks/useListParams'
import type { Order, OrderStatus } from '@/types/commerce.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

const QUICK_TABS = ['', 'pending_validation', 'on_hold', 'ready_to_allocate', 'allocated', 'picking', 'packed', 'dispatched', 'delivery_failed'] as const
const TAB_META: Record<(typeof QUICK_TABS)[number], { icon: string; tone: string }> = {
  '': { icon: 'ri-stack-line', tone: 'primary' },
  pending_validation: { icon: 'ri-shield-check-line', tone: 'warning' },
  on_hold: { icon: 'ri-pause-circle-line', tone: 'orange' },
  ready_to_allocate: { icon: 'ri-inbox-archive-line', tone: 'info' },
  allocated: { icon: 'ri-building-4-line', tone: 'primary' },
  picking: { icon: 'ri-hand-coin-line', tone: 'info' },
  packed: { icon: 'ri-archive-2-line', tone: 'secondary' },
  dispatched: { icon: 'ri-truck-line', tone: 'success' },
  delivery_failed: { icon: 'ri-error-warning-line', tone: 'danger' },
}
const BULK: OrderAction[] =['validate', 'allocate', 'hold', 'release', 'cancel']

export const orderColumns: DataTableColumn<Order>[] = [
  {
    key: 'number',
    label: 'Order',
    sortable: true,
    render: (o) => (
      <div className="d-flex align-items-center gap-2">
        <ChannelLogo channelId={o.channelId} />
        <div className="min-w-0">
          <Link to={to(ROUTES.ORDER, { id: o.id })} className="fw-semibold" onClick={(e) => e.stopPropagation()}>{o.number}</Link>
          {o.priority !== 'normal' && <ToneBadge tone={o.priority === 'urgent' ? 'danger' : 'orange'} icon="ri-flashlight-line" className="ms-2">{humanize(o.priority)}</ToneBadge>}
          <div className="text-muted fs-xs text-truncate" style={{ maxWidth: 220 }}>{o.externalId ? `${o.channelName} · ${o.externalId}` : o.channelName}</div>
        </div>
      </div>
    ),
  },
  { key: 'customerName', label: 'Customer', sortable: true, render: (o) => <div className="d-flex align-items-center gap-2"><Avatar name={o.customerName} size={32} /><div className="min-w-0"><div className="text-truncate">{o.customerName}</div><div className="text-muted fs-xs"><CountryFlag code={o.shippingAddress.country} /> {o.shippingAddress.city}</div></div></div> },
  { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
  { key: 'paymentMethod', label: 'Payment', render: (o) => <PaymentPill method={o.paymentMethod} status={o.paymentStatus} /> },
  { key: 'warehouseName', label: 'Warehouse', render: (o) => o.warehouseName ?? <span className="text-muted">Unallocated</span> },
  { key: 'items', label: 'Items', align: 'end', render: (o) => <span className="tabular-nums">{o.items.reduce((n, i) => n + i.quantity, 0)}</span> },
  { key: 'total', label: 'Total', align: 'end', sortable: true, render: (o) => <span className="tabular-nums fw-medium">{formatMoney(o.total, o.currency)}</span> },
  { key: 'tags', label: 'Tags', hidden: true, render: (o) => <TagList tags={o.tags} /> },
  { key: 'placedAt', label: 'Placed', sortable: true, render: (o) => <span className="text-muted text-nowrap" title={new Date(o.placedAt).toLocaleString()}>{formatRelativeTime(o.placedAt)}</span> },
]

export function OrdersPage() {
  const can = useCan()
  const navigate = useNavigate()
  const { filters, setFilter } = useListParams({ filterKeys: ['status'] })
  const counts = useTenantQuery('orders', 'counts', ordersApi.counts)
  const channels = useChannelOptions()
  const warehouses = useWarehouseOptions()
  const [pending, setPending] = useState<{ action: OrderAction; rows: Order[] } | null>(null)
  const [results, setResults] = useState<BulkResult[] | null>(null)
  const bulk = useAction('orders', ordersApi.bulk, { invalidates: ['reservations', 'balances', 'dashboard'], onSuccess: (r) => { setPending(null); setResults(r) } })

  const run = (action: OrderAction, rows: Order[], reason?: string) => bulk.mutate({ ids: rows.map((r) => r.id), action, reason })
  const c = (k: OrderStatus) => counts.data?.[k] ?? 0
  const summary = [
    { label: 'Open orders', value: OPEN_ORDER_STATUSES.reduce((n, s) => n + c(s), 0), icon: 'ri-inbox-2-line', tone: 'primary', status: '' },
    { label: 'Need attention', value: c('on_hold') + c('pending_validation') + c('delivery_failed'), icon: 'ri-alarm-warning-line', tone: 'danger', status: 'on_hold' },
    { label: 'In the warehouse', value: c('allocated') + c('picking') + c('packed'), icon: 'ri-building-4-line', tone: 'info', status: 'picking' },
    { label: 'On the way', value: c('dispatched'), icon: 'ri-truck-line', tone: 'success', status: 'dispatched' },
  ]

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every channel’s orders in one queue. Validate, hold, allocate and track fulfillment."
        actions={
          <Guard permission="orders.create">
            <Link to={ROUTES.ORDER_NEW} className="btn btn-primary"><i className="ri-add-line me-1" />New order</Link>
          </Guard>
        }
      />
      <div className="row g-3 mb-3 fade-up">
        {summary.map((s) => (
          <div key={s.label} className="col-6 col-xl-3">
            <button type="button" className="mini-kpi w-100 text-start" onClick={() => setFilter('status', s.status || undefined)}>
              <span className={`mini-kpi-icon bg-${s.tone}-subtle text-${s.tone}`}><i className={s.icon} /></span>
              <span className="min-w-0"><span className="d-block text-muted fs-xs">{s.label}</span><span className="d-block fs-4 fw-bold tabular-nums">{counts.isLoading ? '–' : s.value.toLocaleString()}</span></span>
            </button>
          </div>
        ))}
      </div>
      <div className="status-rail mb-4 fade-up d1" role="tablist" aria-label="Order status">
        {QUICK_TABS.map((s) => {
          const meta = TAB_META[s]
          const active = (filters.status ?? '') === s
          const count = counts.data?.[s || 'all']
          return (
            <button key={s || 'all'} type="button" role="tab" aria-selected={active} className={`status-tab tone-${meta.tone} ${active ? 'active' : ''}`} onClick={() => setFilter('status', s || undefined)}>
              <span className="status-tab-icon"><i className={meta.icon} /></span>
              <span className="status-tab-text">
                <span className="status-tab-count tabular-nums">{count == null ? '–' : count.toLocaleString()}</span>
                <span className="status-tab-label">{s ? humanize(s) : 'All orders'}</span>
              </span>
            </button>
          )
        })}
      </div>
      <ResourceList<Order>
        resource="orders"
        list={ordersApi.list}
        columns={orderColumns}
        itemsLabel="orders"
        exportName="orders"
        searchPlaceholder="Order no., external ID, customer, phone…"
        rowLink={(o) => to(ROUTES.ORDER, { id: o.id })}
        filters={[
          { key: 'status', allLabel: 'All statuses', options: OPTIONS.orderStatus },
          { key: 'channelId', allLabel: 'All channels', options: channels },
          { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses },
          { key: 'paymentMethod', allLabel: 'Any payment', options: OPTIONS.paymentMethod },
          { key: 'priority', allLabel: 'Any priority', options: OPTIONS.priority },
        ]}
        bulkActions={[...BULK.filter((a) => can(ORDER_ACTION_META[a].permission)).map((a) => ({ action: a as string, label: ORDER_ACTION_META[a].label })), { action: 'print_awb', label: 'Print airway bills' }, { action: 'print_invoice', label: 'Print invoices' }]}
        onBulkAction={(action, rows) => {
          if (action === 'print_awb' || action === 'print_invoice') return navigate(`${ROUTES.DOCUMENTS_PRINT}?type=${action === 'print_awb' ? 'awb' : 'invoice'}&ids=${rows.map((r) => r.id).join(',')}`)
          const a = action as OrderAction
          if (a === 'hold' || a === 'cancel') setPending({ action: a, rows })
          else run(a, rows)
        }}
      />
      <PromptDialog
        open={pending !== null}
        title={`${pending ? ORDER_ACTION_META[pending.action].label : ''} · ${pending?.rows.length ?? 0} orders`}
        message="Orders that cannot take this action are skipped and reported individually."
        label="Reason"
        confirmLabel={pending ? ORDER_ACTION_META[pending.action].label : ''}
        danger={pending?.action === 'cancel'}
        busy={bulk.isPending}
        onClose={() => setPending(null)}
        onConfirm={(reason) => pending && run(pending.action, pending.rows, reason)}
      />
      <BulkResultsModal results={results} onClose={() => setResults(null)} />
    </>
  )
}

function BulkResultsModal({ results, onClose }: { results: BulkResult[] | null; onClose: () => void }) {
  const ok = results?.filter((r) => r.ok).length ?? 0
  return (
    <Modal open={results !== null} onClose={onClose} title="Bulk action results" footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}>
      <p className="text-muted">{ok} succeeded, {(results?.length ?? 0) - ok} skipped.</p>
      <ul className="list-group list-group-flush">
        {results?.map((r) => (
          <li key={r.id} className="list-group-item d-flex justify-content-between gap-3 px-0">
            <Link to={to(ROUTES.ORDER, { id: r.id })}>{r.number}</Link>
            <span className={r.ok ? 'text-success' : 'text-danger'}><i className={r.ok ? 'ri-check-line' : 'ri-close-line'} /> {r.message}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
