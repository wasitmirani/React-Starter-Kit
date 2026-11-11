import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/endpoints/commerce.api'
import { connectorsApi } from '@/api/endpoints/integrations.api'
import { listingsApi } from '@/api/endpoints/marketplace.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { FormAlert } from '@/components/common/FormAlert'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { regionLabel, TARGET_REGIONS, toUsd } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Listing } from '@/types/marketplace.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'

export function ListingsPage() {
  const all = useAll('listings', listingsApi.list)
  const connectors = useAll('connectors', connectorsApi.list)
  const marketplaces = (connectors.data?.data ?? []).filter((c) => c.kind === 'marketplace')
  const [publishing, setPublishing] = useState(false)
  const [repricing, setRepricing] = useState<Listing | null>(null)
  const resubmit = useAction('listings', listingsApi.resubmit, { success: 'Sent to marketplace for review' })
  const setStatus = useAction('listings', listingsApi.setStatus, { success: (l) => (l.status === 'live' ? 'Listing activated' : 'Listing paused') })

  const stats = useMemo(() => {
    const rows = all.data?.data ?? []
    return {
      live: rows.filter((l) => l.status === 'live').length,
      pending: rows.filter((l) => l.status === 'pending').length,
      issues: rows.filter((l) => l.status === 'suppressed' || l.status === 'error').length,
      revenue: rows.reduce((s, l) => s + toUsd(l.revenue30d, l.currency), 0),
  }
  }, [all.data])

  const columns: DataTableColumn<Listing>[] = [
    { key: 'title', label: 'Product', sortable: true, render: (l) => <div className="min-w-0"><div className="fw-medium text-truncate" style={{ maxWidth: 280 }}>{l.title}</div><div className="text-muted fs-xs font-monospace">{l.sku}</div></div> },
    { key: 'marketplace', label: 'Marketplace', render: (l) => <div className="d-flex align-items-center gap-2"><AppLogo appId={l.provider} size="sm" /><div><div className="text-nowrap">{l.marketplace}</div><div className="text-muted fs-xs">{regionLabel(l.region)} · {l.externalId ?? 'Awaiting ID'}</div></div></div> },
    { key: 'price', label: 'Price', align: 'end', sortable: true, render: (l) => <button type="button" className="btn btn-link p-0 tabular-nums" onClick={(e) => { e.stopPropagation(); setRepricing(l) }} title="Change price">{formatMoney(l.price, l.currency)}</button> },
    { key: 'publishedQty', label: 'Qty', align: 'end', sortable: true },
    { key: 'buyBoxShare', label: 'Buy box', align: 'end', render: (l) => (l.buyBoxShare == null ? <span className="text-muted">—</span> : <span className={l.buyBoxShare < 0.7 ? 'text-warning fw-medium' : ''}>{formatPercent(l.buyBoxShare)}</span>) },
    { key: 'unitsSold30d', label: 'Sold 30d', align: 'end', sortable: true },
    { key: 'revenue30d', label: 'Revenue 30d', align: 'end', sortable: true, render: (l) => formatMoney(l.revenue30d, l.currency) },
    { key: 'status', label: 'Status', render: (l) => <div><StatusBadge status={l.status} />{l.issue && <div className="text-danger fs-xs mt-1" style={{ maxWidth: 220 }}>{l.issue}</div>}</div> },
    { key: 'lastSyncedAt', label: 'Synced', render: (l) => <span className="text-muted fs-sm">{l.lastSyncedAt ? formatRelativeTime(l.lastSyncedAt) : '—'}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Marketplace listings"
        description="Every product offer on Amazon, eBay, Noon and other marketplaces, with price, published stock, buy-box share and sales. Fix suppressed listings here."
        actions={<><Link to={ROUTES.APP_MARKETPLACE} className="btn btn-light"><i className="ri-add-line me-1" />Add marketplace</Link><button type="button" className="btn btn-primary" onClick={() => setPublishing(true)}><i className="ri-upload-cloud-2-line me-1" />Publish products</button></>}
      />
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Live listings" value={stats.live.toLocaleString()} icon="ri-checkbox-circle-line" tone="success" loading={all.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Pending review" value={stats.pending.toLocaleString()} icon="ri-time-line" tone="info" loading={all.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Need attention" value={stats.issues.toLocaleString()} icon="ri-error-warning-line" tone="danger" hint="Suppressed or sync errors" loading={all.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Revenue 30d (USD)" value={formatMoney(stats.revenue, 'USD')} icon="ri-money-dollar-circle-line" tone="primary" loading={all.isLoading} /></div>
      </div>
      <ResourceList<Listing>
        resource="listings"
        list={listingsApi.list}
        columns={columns}
        itemsLabel="listings"
        searchPlaceholder="SKU, title, ASIN / item ID…"
        exportName="marketplace-listings"
        filters={[
          { key: 'status', allLabel: 'All statuses', options: OPTIONS.listingStatus },
          { key: 'region', allLabel: 'All markets', options: TARGET_REGIONS.map((r) => ({ value: r.code, label: `${r.flag} ${r.short}` })) },
          { key: 'connectorId', allLabel: 'All marketplaces', options: marketplaces.map((c) => ({ value: c.id, label: c.name })) },
        ]}
        actions={[
          { key: 'resubmit', label: 'Resubmit', icon: 'ri-send-plane-line', condition: (l) => l.status === 'suppressed' || l.status === 'error' },
          { key: 'pause', label: 'Pause', icon: 'ri-pause-line', condition: (l) => l.status === 'live' },
          { key: 'activate', label: 'Activate', icon: 'ri-play-line', condition: (l) => l.status === 'inactive' },
          { key: 'reprice', label: 'Change price', icon: 'ri-price-tag-3-line' },
        ]}
        onRowAction={(action, l) => {
          if (action === 'resubmit') resubmit.mutate(l.id)
          else if (action === 'pause') setStatus.mutate({ id: l.id, status: 'inactive' })
          else if (action === 'activate') setStatus.mutate({ id: l.id, status: 'live' })
          else setRepricing(l)
        }}
        bulkActions={[{ action: 'resubmit', label: 'Resubmit selected' }, { action: 'pause', label: 'Pause selected' }]}
        onBulkAction={(action, selected) => selected.forEach((l) => (action === 'resubmit' ? (l.status === 'suppressed' || l.status === 'error') && resubmit.mutate(l.id) : l.status === 'live' && setStatus.mutate({ id: l.id, status: 'inactive' })))}
      />
      <PublishModal open={publishing} onClose={() => setPublishing(false)} marketplaces={marketplaces.filter((c) => c.status === 'connected').map((c) => ({ id: c.id, label: `${c.name} · ${regionLabel(c.region)}`, provider: c.provider }))} />
      <RepriceModal listing={repricing} onClose={() => setRepricing(null)} />
    </>
  )
}

function PublishModal({ open, onClose, marketplaces }: { open: boolean; onClose: () => void; marketplaces: { id: string; label: string; provider: string }[] }) {
  const products = useAll('products', productsApi.list, { status: 'active' })
  const [connectorId, setConnectorId] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const publish = useAction('listings', listingsApi.publish, { success: (r) => `${r.created} listing${r.created === 1 ? '' : 's'} sent for review${r.skipped ? `, ${r.skipped} already listed` : ''}`, onSuccess: () => { setSelected([]); onClose() } })
  const list = (products.data?.data ?? []).filter((p) => !search || `${p.title} ${p.brand}`.toLowerCase().includes(search.toLowerCase()))
  const submit = () => {
    if (!connectorId) return setError('Choose a marketplace.')
    if (!selected.length) return setError('Select at least one product.')
    setError(null)
    publish.mutate({ productIds: selected, connectorId })
  }
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Publish products to a marketplace" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={publish.isPending} onClick={submit}>{publish.isPending ? 'Publishing…' : `Publish ${selected.length || ''} product${selected.length === 1 ? '' : 's'}`}</button></>}>
      <FormAlert message={error} onClose={() => setError(null)} />
      {!marketplaces.length ? (
        <p className="mb-0">No marketplace is connected yet. <Link to={ROUTES.APP_MARKETPLACE} onClick={onClose}>Install Amazon, eBay or Noon</Link> first.</p>
      ) : (
        <>
          <label className="form-label" htmlFor="pub-mkt">Marketplace account</label>
          <select id="pub-mkt" className="form-select mb-3" value={connectorId} onChange={(e) => setConnectorId(e.target.value)}>
            <option value="">Choose…</option>
            {marketplaces.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <p className="text-muted fs-sm">Prices are converted from your base price into the marketplace currency. Titles, images and attributes come from the product; listings stay pending until the marketplace approves them.</p>
          <div className="d-flex gap-2 mb-2">
            <input className="form-control form-control-sm" placeholder="Filter products…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Filter products" />
            <button type="button" className="btn btn-sm btn-light text-nowrap" onClick={() => setSelected(selected.length === list.length ? [] : list.map((p) => p.id))}>{selected.length === list.length && list.length ? 'Clear' : 'Select all'}</button>
          </div>
          <div className="border rounded-3" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {list.map((p) => (
              <label key={p.id} className="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
                <input type="checkbox" className="form-check-input m-0" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))} />
                <span className="flex-1 min-w-0"><span className="d-block text-truncate">{p.title}</span><span className="text-muted fs-xs">{p.brand} · {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}</span></span>
              </label>
            ))}
            {products.isLoading && <p className="text-muted p-3 mb-0">Loading products…</p>}
          </div>
        </>
      )}
    </Modal>
  )
}

function RepriceModal({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  const [value, setValue] = useState('')
  const reprice = useAction('listings', listingsApi.reprice, { success: 'Price updated on the marketplace', onSuccess: onClose })
  if (!listing) return null
  const price = value === '' ? listing.price : Number(value)
  const fees = price * listing.feeRate
  return (
    <Modal open onClose={() => { setValue(''); onClose() }} size="sm" title="Change price" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={reprice.isPending || !(price > 0)} onClick={() => reprice.mutate({ id: listing.id, price })}>Update price</button></>}>
      <p className="text-muted fs-sm">{listing.title} on {listing.marketplace}</p>
      <label className="form-label" htmlFor="rp-price">Price ({listing.currency})</label>
      <input id="rp-price" type="number" min="0" step="0.01" className="form-control mb-3" value={value === '' ? String(listing.price) : value} onChange={(e) => setValue(e.target.value)} />
      <div className="d-flex justify-content-between fs-sm"><span className="text-muted">Marketplace fees ({formatPercent(listing.feeRate)})</span><span>{formatMoney(fees, listing.currency)}</span></div>
      <div className="d-flex justify-content-between fs-sm fw-medium"><span>You receive (before cost)</span><span>{formatMoney(price - fees, listing.currency)}</span></div>
    </Modal>
  )
}
