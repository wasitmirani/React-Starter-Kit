import { Link, useParams } from 'react-router-dom'
import { balancesApi, ledgerApi, lotsApi, reservationsApi } from '@/api/endpoints/inventory.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { Meter } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAll, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useListParams } from '@/hooks/useListParams'
import type { LedgerEntry, StockBalance } from '@/types/inventory.types'
import { formatCompact } from '@/utils/formatters/number.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'
import { ledgerColumns } from './InventoryRecordsPages'

const n = (v: number) => <span className="tabular-nums">{v.toLocaleString()}</span>

const columns: DataTableColumn<StockBalance>[] = [
  { key: 'sku', label: 'SKU', sortable: true, render: (b) => <div><div className="font-monospace fw-medium">{b.sku}</div><div className="text-muted fs-sm text-truncate" style={{ maxWidth: 260 }}>{b.productTitle}</div></div> },
  { key: 'warehouseName', label: 'Warehouse', sortable: true, render: (b) => <div><div>{b.warehouseName}</div><div className="text-muted fs-sm font-monospace">{b.binCode}</div></div> },
  { key: 'clientName', label: 'Owner', hidden: true, render: (b) => b.clientName ?? 'Own stock' },
  { key: 'onHand', label: 'On hand', align: 'end', sortable: true, render: (b) => n(b.onHand) },
  { key: 'reserved', label: 'Reserved', align: 'end', sortable: true, render: (b) => n(b.reserved) },
  { key: 'damaged', label: 'Damaged', align: 'end', render: (b) => n(b.damaged) },
  { key: 'quarantined', label: 'Quarantine', align: 'end', render: (b) => n(b.quarantined) },
  {
    key: 'available',
    label: 'Available',
    align: 'end',
    sortable: true,
    render: (b) => <span className={`tabular-nums fw-semibold ${b.available <= 0 ? 'text-danger' : b.available <= b.reorderPoint ? 'text-warning' : 'text-success'}`}>{b.available.toLocaleString()}</span>,
  },
  { key: 'incoming', label: 'Incoming', align: 'end', render: (b) => n(b.incoming) },
  { key: 'inTransit', label: 'In transit', align: 'end', render: (b) => n(b.inTransit) },
  { key: 'reorderPoint', label: 'Reorder at', align: 'end', hidden: true, render: (b) => n(b.reorderPoint) },
]

export function StockOverviewPage() {
  const warehouses = useWarehouseOptions()
  const { query } = useListParams({ filterKeys: ['warehouseId'] })
  const summary = useTenantQuery('balances', ['summary', query.filters?.warehouseId], () => balancesApi.summary({ filters: { warehouseId: query.filters?.warehouseId } }))
  const s = summary.data

  return (
    <>
      <PageHeader
        title="Stock overview"
        description="Balances by SKU, warehouse and bin. Incoming and in-transit stock never increases sellable availability."
        actions={
          <>
            <Guard permission="inventory.transfer"><Link to={`${ROUTES.TRANSFERS}?new=1`} className="btn btn-light"><i className="ri-arrow-left-right-line me-1" />Transfer</Link></Guard>
            <Guard permission="inventory.adjust"><Link to={`${ROUTES.ADJUSTMENTS}?new=1`} className="btn btn-primary"><i className="ri-equalizer-line me-1" />Adjust stock</Link></Guard>
          </>
        }
      />
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Available to sell" value={s ? formatCompact(s.available) : '—'} icon="ri-checkbox-circle-line" tone="success" hint={s && `${s.skus} SKUs in stock`} loading={summary.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Reserved for orders" value={s ? formatCompact(s.reserved) : '—'} icon="ri-lock-line" tone="info" hint={s && `of ${formatCompact(s.onHand)} on hand`} loading={summary.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Damaged + quarantine" value={s ? formatCompact(s.damaged + s.quarantined) : '—'} icon="ri-alert-line" tone="warning" hint="Not sellable until disposition" loading={summary.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Incoming / in transit" value={s ? `${formatCompact(s.incoming)} / ${formatCompact(s.inTransit)}` : '—'} icon="ri-truck-line" tone="primary" hint={s && <><Link to={`${ROUTES.INVENTORY}?stock=low`}>{s.low} low</Link> · <Link to={`${ROUTES.INVENTORY}?stock=out`} className="text-danger">{s.out} out of stock</Link></>} loading={summary.isLoading} /></div>
      </div>
      <ResourceList<StockBalance>
        resource="balances"
        list={balancesApi.list}
        columns={columns}
        itemsLabel="balances"
        exportName="stock-balances"
        searchPlaceholder="SKU, product, bin…"
        rowLink={(b) => to(ROUTES.INVENTORY_ITEM, { id: b.id })}
        filters={[
          { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses },
          { key: 'stock', allLabel: 'Any stock level', options: [{ value: 'low', label: 'Low (≤ reorder point)' }, { value: 'out', label: 'Out of stock' }] },
        ]}
      />
    </>
  )
}

export function InventoryItemPage() {
  const { id } = useParams()
  const balance = useOne('balances', balancesApi.get, id)
  const reservations = useAll('reservations', reservationsApi.list, { sku: balance.data?.sku, status: 'active' })
  const lots = useAll('lots', lotsApi.list, { sku: balance.data?.sku })

  if (balance.isLoading) return <Loader label="Loading balance…" />
  if (balance.isError || !balance.data) return <QueryError message={errorMessage(balance.error)} onRetry={() => balance.refetch()} />
  const b = balance.data
  const parts = [
    { label: 'Available', value: b.available, tone: 'success' as const },
    { label: 'Reserved', value: b.reserved, tone: 'info' as const },
    { label: 'Damaged', value: b.damaged, tone: 'danger' as const },
    { label: 'Quarantined', value: b.quarantined, tone: 'warning' as const },
  ]
  const myReservations = (reservations.data?.data ?? []).filter((r) => r.warehouseName === b.warehouseName)

  return (
    <>
      <PageHeader back={{ label: 'Stock overview', to: ROUTES.INVENTORY }} title={<span className="font-monospace">{b.sku}</span>} meta={<ToneBadge tone="light">{b.warehouseName}</ToneBadge>} description={<Link to={to(ROUTES.PRODUCT, { id: b.productId })}>{b.productTitle}</Link>} />
      <div className="row g-4">
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Balance" icon="ri-stack-line" description={`Bin ${b.binCode} · reorder at ${b.reorderPoint}`}>
            <h2 className="tabular-nums mb-1">{b.onHand.toLocaleString()} <span className="fs-6 text-muted fw-normal">on hand</span></h2>
            {parts.map((p) => (
              <div key={p.label} className="mt-3">
                <div className="d-flex justify-content-between fs-sm mb-1"><span>{p.label}</span><span className="tabular-nums fw-medium">{p.value}</span></div>
                <Meter value={p.value} max={Math.max(1, b.onHand)} tone={p.tone} />
              </div>
            ))}
            <div className="d-flex justify-content-between mt-4 pt-3 border-top fs-sm"><span className="text-muted">Incoming (POs)</span><span className="tabular-nums">{b.incoming}</span></div>
            <div className="d-flex justify-content-between fs-sm"><span className="text-muted">In transit (transfers)</span><span className="tabular-nums">{b.inTransit}</span></div>
            <div className="d-flex justify-content-between fs-sm"><span className="text-muted">Unit cost</span><span className="tabular-nums">{b.unitCost.toLocaleString()}</span></div>
          </Panel>
          <Panel title="Active reservations" icon="ri-lock-line" flush>
            {myReservations.length ? (
              <ul className="list-group list-group-flush">
                {myReservations.map((r) => <li key={r.id} className="list-group-item d-flex justify-content-between"><Link to={to(ROUTES.ORDER, { id: r.orderId })}>{r.orderNumber}</Link><span className="tabular-nums">{r.quantity}</span></li>)}
              </ul>
            ) : <p className="text-muted p-4 mb-0">Nothing reserved.</p>}
          </Panel>
          {!!lots.data?.data.length && (
            <Panel title="Lots" icon="ri-calendar-event-line" flush>
              <ul className="list-group list-group-flush">
                {lots.data.data.map((l) => <li key={l.id} className="list-group-item d-flex justify-content-between gap-2"><span className="font-monospace">{l.lotNumber}</span><span className="text-muted">{l.expiresAt ? `exp. ${formatDate(l.expiresAt)}` : ''}</span><StatusBadge status={l.status} /></li>)}
              </ul>
            </Panel>
          )}
        </div>
        <div className="col-xl-8">
          <h6 className="mb-3">Ledger</h6>
          <ResourceList<LedgerEntry> resource="ledger" list={ledgerApi.list} scope={{ sku: b.sku, warehouseName: b.warehouseName }} columns={ledgerColumns.filter((c) => c.key !== 'sku' && c.key !== 'warehouseName')} itemsLabel="movements" perPage={15} exportName={`ledger-${b.sku}`} />
        </div>
      </div>
    </>
  )
}
