import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ledgerApi, lotsApi, replenishmentApi, reservationsApi } from '@/api/endpoints/inventory.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { LedgerEntry, Lot, ReplenishmentSuggestion, Reservation } from '@/types/inventory.types'
import { formatDate, formatDateTime } from '@/utils/formatters/date.formatter'

export const ledgerColumns: DataTableColumn<LedgerEntry>[] = [
  { key: 'createdAt', label: 'When', sortable: true, render: (l) => <span className="text-nowrap">{formatDateTime(l.createdAt)}</span> },
  { key: 'movementType', label: 'Movement', render: (l) => <ToneBadge tone={l.quantity >= 0 ? 'success' : 'danger'}>{humanize(l.movementType)}</ToneBadge> },
  { key: 'sku', label: 'SKU', sortable: true, render: (l) => <span className="font-monospace">{l.sku}</span> },
  { key: 'warehouseName', label: 'Warehouse', render: (l) => <div>{l.warehouseName}<div className="text-muted fs-sm font-monospace">{l.binCode}</div></div> },
  { key: 'quantity', label: 'Change', align: 'end', render: (l) => <span className={`tabular-nums fw-semibold ${l.quantity >= 0 ? 'text-success' : 'text-danger'}`}>{l.quantity > 0 ? `+${l.quantity}` : l.quantity}</span> },
  { key: 'balanceAfter', label: 'On hand after', align: 'end', render: (l) => <span className="tabular-nums">{l.balanceAfter}</span> },
  { key: 'referenceNumber', label: 'Reference', render: (l) => <div>{l.referenceNumber}<div className="text-muted fs-sm">{humanize(l.referenceType)}</div></div> },
  { key: 'actorName', label: 'By', render: (l) => <div>{l.actorName}{l.reason && <div className="text-muted fs-sm">{l.reason}</div>}</div> },
]

export function LedgerPage() {
  const warehouses = useWarehouseOptions('name')
  return (
    <>
      <PageHeader title="Stock ledger" description="Immutable record of every stock movement. Balances can always be rebuilt from these rows; entries are never edited or deleted." />
      <ResourceList<LedgerEntry>
        resource="ledger"
        list={ledgerApi.list}
        columns={ledgerColumns}
        itemsLabel="movements"
        exportName="stock-ledger"
        perPage={30}
        searchPlaceholder="SKU, reference, user…"
        filters={[{ key: 'movementType', allLabel: 'All movements', options: OPTIONS.movementType }, { key: 'warehouseName', allLabel: 'All warehouses', options: warehouses }]}
      />
    </>
  )
}

export function ReservationsPage() {
  const can = useCan()
  const [releasing, setReleasing] = useState<Reservation | null>(null)
  const release = useAction('reservations', reservationsApi.release, { invalidates: ['balances', 'ledger'], success: 'Reservation released', onSuccess: () => setReleasing(null) })
  const columns: DataTableColumn<Reservation>[] = [
    { key: 'orderNumber', label: 'Order', sortable: true, render: (r) => <Link to={to(ROUTES.ORDER, { id: r.orderId })} onClick={(e) => e.stopPropagation()}>{r.orderNumber}</Link> },
    { key: 'sku', label: 'SKU', sortable: true, render: (r) => <span className="font-monospace">{r.sku}</span> },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'quantity', label: 'Quantity', align: 'end' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Reserved', sortable: true, render: (r) => formatDateTime(r.createdAt) },
  ]
  return (
    <>
      <PageHeader title="Reservations" description="Stock held for allocated orders. Reservations are released on cancellation and consumed on dispatch." />
      <ResourceList<Reservation>
        resource="reservations"
        list={reservationsApi.list}
        columns={columns}
        itemsLabel="reservations"
        searchPlaceholder="Order number or SKU…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.reservationStatus }]}
        actions={can('orders.allocate') ? [{ key: 'release', label: 'Release', icon: 'ri-lock-unlock-line', condition: (r) => r.status === 'active' }] : undefined}
        onRowAction={(_, r) => setReleasing(r)}
      />
      <ConfirmDialog open={releasing !== null} title="Release reservation?" message={<>{releasing?.quantity} × {releasing?.sku} returns to available stock and order <strong>{releasing?.orderNumber}</strong> loses this allocation.</>} confirmLabel="Release" danger busy={release.isPending} onClose={() => setReleasing(null)} onConfirm={() => release.mutate(releasing!.id)} />
    </>
  )
}

export function LotsPage() {
  const columns: DataTableColumn<Lot>[] = [
    { key: 'lotNumber', label: 'Lot', sortable: true, render: (l) => <span className="font-monospace fw-medium">{l.lotNumber}</span> },
    { key: 'sku', label: 'SKU', render: (l) => <div><span className="font-monospace">{l.sku}</span><div className="text-muted fs-sm">{l.productTitle}</div></div> },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'quantity', label: 'Quantity', align: 'end' },
    { key: 'expiresAt', label: 'Expires', sortable: true, render: (l) => (l.expiresAt ? <span className={new Date(l.expiresAt).getTime() < Date.now() + 30 * 86_400_000 ? 'text-danger fw-medium' : ''}>{formatDate(l.expiresAt)}</span> : '—') },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
  ]
  return (
    <>
      <PageHeader title="Lots and expiry" description="Lot-tracked stock sorted by expiry. FEFO allocation picks the earliest-expiring lot first; red dates expire within 30 days." />
      <ResourceList<Lot> resource="lots" list={lotsApi.list} columns={columns} itemsLabel="lots" exportName="lots" searchPlaceholder="Lot, SKU, product…" filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.lotStatus }]} />
    </>
  )
}

export function ReplenishmentPage() {
  const navigate = useNavigate()
  const can = useCan()
  const createPos = useAction('replenishment', replenishmentApi.createPurchaseOrders, { invalidates: ['purchase-orders'], success: (pos) => `${pos.length} draft purchase order${pos.length === 1 ? '' : 's'} created`, onSuccess: () => navigate(`${ROUTES.PURCHASE_ORDERS}?status=draft`) })
  const dismiss = useAction('replenishment', replenishmentApi.dismiss, { success: 'Suggestion dismissed' })
  const columns: DataTableColumn<ReplenishmentSuggestion>[] = [
    { key: 'sku', label: 'SKU', sortable: true, render: (s) => <div><span className="font-monospace fw-medium">{s.sku}</span><div className="text-muted fs-sm">{s.productTitle}</div></div> },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'available', label: 'Available', align: 'end', render: (s) => <span className="text-danger tabular-nums fw-medium">{s.available}</span> },
    { key: 'reorderPoint', label: 'Reorder point', align: 'end' },
    { key: 'suggestedQty', label: 'Suggested qty', align: 'end', render: (s) => <span className="tabular-nums fw-semibold">{s.suggestedQty}</span> },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ]
  return (
    <>
      <PageHeader title="Replenishment" description="SKUs at or below reorder point. Suggested quantity = 3 × reorder point − available − incoming. Select rows to raise draft purchase orders grouped by supplier." />
      <ResourceList<ReplenishmentSuggestion>
        resource="replenishment"
        list={replenishmentApi.list}
        columns={columns}
        itemsLabel="suggestions"
        searchPlaceholder="SKU, product, supplier…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.replenishmentStatus }]}
        bulkActions={can('procurement.create') ? [{ action: 'po', label: 'Create purchase orders' }] : undefined}
        onBulkAction={(_, rows) => createPos.mutate(rows.map((r) => r.id))}
        actions={can('procurement.create') ? [{ key: 'dismiss', label: 'Dismiss', icon: 'ri-close-line', condition: (s) => s.status === 'open' }] : undefined}
        onRowAction={(_, s) => dismiss.mutate(s.id)}
      />
    </>
  )
}
