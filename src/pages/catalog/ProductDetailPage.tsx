import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { channelsApi, productsApi } from '@/api/endpoints/commerce.api'
import { balancesApi, ledgerApi } from '@/api/endpoints/inventory.api'
import { errorMessage } from '@/api/errors'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { DetailList } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { CHANNEL_META } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAll, useOne } from '@/hooks/queries/resource.queries'
import type { LedgerEntry } from '@/types/inventory.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { ledgerColumns } from '@/pages/inventory/InventoryRecordsPages'

export function ProductDetailPage() {
  const { id } = useParams()
  const product = useOne('products', productsApi.get, id)
  const balances = useAll('balances', balancesApi.list, { productId: id })
  const channels = useAll('channels', channelsApi.list)
  const [tab, setTab] = useState<'stock' | 'variants' | 'channels' | 'movements'>('stock')
  const [sku, setSku] = useState<string | null>(null)

  if (product.isLoading) return <Loader label="Loading product…" />
  if (product.isError || !product.data) return <QueryError message={errorMessage(product.error)} onRetry={() => product.refetch()} />
  const p = product.data
  const rows = balances.data?.data ?? []
  const activeSku = sku ?? p.variants[0]?.sku
  const sum = (k: 'onHand' | 'reserved' | 'available' | 'damaged' | 'quarantined' | 'incoming' | 'inTransit') => rows.reduce((n, b) => n + b[k], 0)

  return (
    <>
      <PageHeader
        back={{ label: 'Products', to: ROUTES.PRODUCTS }}
        title={p.title}
        meta={<><StatusBadge status={p.status} /><ToneBadge tone="light">{humanize(p.type)}</ToneBadge></>}
        description={`${p.brand} · ${p.category}${p.clientName ? ` · owned by ${p.clientName}` : ''}`}
        actions={<Guard permission="products.manage"><Link to={to(ROUTES.PRODUCT_EDIT, { id: p.id })} className="btn btn-primary"><i className="ri-edit-line me-1" />Edit</Link></Guard>}
      />
      <div className="row g-4">
        <div className="col-xl-8">
          <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ value: 'stock', label: 'Stock by warehouse', icon: 'ri-stack-line' }, { value: 'variants', label: 'Variants', icon: 'ri-barcode-line', count: p.variants.length }, { value: 'channels', label: 'Channel listings', icon: 'ri-store-2-line' }, { value: 'movements', label: 'Movement history', icon: 'ri-history-line' }]} />
          {tab === 'stock' && (
            <Panel flush title="Stock" description="Available = on hand − reserved − damaged − quarantined. Incoming and in transit never count as sellable.">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr className="text-muted fs-sm"><th>SKU · warehouse</th><th>Bin</th><th className="text-end">On hand</th><th className="text-end">Reserved</th><th className="text-end">Damaged</th><th className="text-end">Quarantine</th><th className="text-end">Available</th><th className="text-end">Incoming</th><th className="text-end">In transit</th></tr></thead>
                  <tbody>
                    {rows.map((b) => (
                      <tr key={b.id}>
                        <td><Link to={to(ROUTES.INVENTORY_ITEM, { id: b.id })} className="font-monospace">{b.sku}</Link><div className="text-muted fs-sm">{b.warehouseName}</div></td>
                        <td className="font-monospace">{b.binCode}</td>
                        {(['onHand', 'reserved', 'damaged', 'quarantined'] as const).map((k) => <td key={k} className="text-end tabular-nums">{b[k]}</td>)}
                        <td className={`text-end tabular-nums fw-semibold ${b.available <= b.reorderPoint ? 'text-danger' : 'text-success'}`}>{b.available}</td>
                        <td className="text-end tabular-nums">{b.incoming}</td>
                        <td className="text-end tabular-nums">{b.inTransit}</td>
                      </tr>
                    ))}
                    {!rows.length && <tr><td colSpan={9} className="text-muted text-center py-4">No stock recorded yet.</td></tr>}
                  </tbody>
                  {rows.length > 1 && (
                    <tfoot><tr className="fw-semibold"><td colSpan={2}>Total</td>{(['onHand', 'reserved', 'damaged', 'quarantined', 'available', 'incoming', 'inTransit'] as const).map((k) => <td key={k} className="text-end tabular-nums">{sum(k)}</td>)}</tr></tfoot>
                  )}
                </table>
              </div>
            </Panel>
          )}
          {tab === 'variants' && (
            <Panel flush>
              <table className="table align-middle mb-0">
                <thead><tr className="text-muted fs-sm"><th>Variant</th><th>SKU</th><th>Barcode</th><th className="text-end">Price</th><th className="text-end">Cost</th><th className="text-end">Margin</th><th className="text-end">Weight</th></tr></thead>
                <tbody>
                  {p.variants.map((v) => (
                    <tr key={v.id}>
                      <td className="fw-medium">{v.title}</td><td className="font-monospace">{v.sku}</td><td className="font-monospace text-muted">{v.barcode}</td>
                      <td className="text-end tabular-nums">{formatMoney(v.price, p.currency)}</td><td className="text-end tabular-nums">{formatMoney(v.cost, p.currency)}</td>
                      <td className="text-end tabular-nums">{v.price ? `${Math.round(((v.price - v.cost) / v.price) * 100)}%` : '—'}</td><td className="text-end tabular-nums">{v.weightKg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
          {tab === 'channels' && (
            <Panel flush description="Inventory publishing per channel; safety stock is held back from the published quantity.">
              <table className="table align-middle mb-0">
                <thead><tr className="text-muted fs-sm"><th>Channel</th><th>Inventory sync</th><th className="text-end">Safety stock</th><th className="text-end">Published qty</th><th>Status</th></tr></thead>
                <tbody>
                  {(channels.data?.data ?? []).filter((c) => c.type !== 'manual').map((c) => (
                    <tr key={c.id}>
                      <td><i className={`${CHANNEL_META[c.type].icon} me-2 text-muted`} />{c.name}</td>
                      <td>{c.inventorySync ? 'On' : 'Off'}</td>
                      <td className="text-end tabular-nums">{c.safetyStock}</td>
                      <td className="text-end tabular-nums">{c.inventorySync ? Math.max(0, sum('available') - c.safetyStock) : '—'}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
          {tab === 'movements' && (
            <>
              {p.variants.length > 1 && (
                <select className="form-select mb-3" style={{ maxWidth: 280 }} value={activeSku} onChange={(e) => setSku(e.target.value)} aria-label="Variant">
                  {p.variants.map((v) => <option key={v.sku} value={v.sku}>{v.sku} · {v.title}</option>)}
                </select>
              )}
              <ResourceList<LedgerEntry> resource="ledger" list={ledgerApi.list} scope={{ sku: activeSku }} columns={ledgerColumns.filter((c) => c.key !== 'sku')} itemsLabel="movements" perPage={15} />
            </>
          )}
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Details" icon="ri-information-line">
            <DetailList
              items={[
                { label: 'Supplier', value: p.supplierName },
                { label: 'Dimensions', value: `${p.dimensionsCm.length} × ${p.dimensionsCm.width} × ${p.dimensionsCm.height} cm` },
                { label: 'Reorder point', value: p.reorderPoint },
                { label: 'Lot tracking', value: p.lotTracked ? 'Lots and expiry (FEFO)' : 'Off' },
                { label: 'Total on hand', value: sum('onHand') },
                { label: 'Total available', value: sum('available') },
              ]}
            />
            {p.description && <p className="text-muted mt-3 mb-0">{p.description}</p>}
          </Panel>
          {p.type === 'bundle' && (
            <Panel title="Bundle composition" icon="ri-gift-line" description="Bundle availability is limited by its scarcest component.">
              <ul className="list-group list-group-flush">
                {p.bundle.map((c) => <li key={c.sku} className="list-group-item d-flex justify-content-between px-0"><span className="font-monospace">{c.sku}</span><span>× {c.quantity}</span></li>)}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
