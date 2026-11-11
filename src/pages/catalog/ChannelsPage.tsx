import { useState } from 'react'
import { Link } from 'react-router-dom'
import { channelsApi } from '@/api/endpoints/commerce.api'
import { errorMessage } from '@/api/errors'
import { EntityFormModal, type FieldDef } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Switch } from '@/components/ui/Controls'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNEL_META, OPTIONS } from '@/constants/domain.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions, useWarehouses } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { ChannelType, SalesChannel } from '@/types/commerce.types'
import { StatCard } from '@/components/common/StatCard'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { APP_CATALOG } from '@/constants/apps.constants'
import { REGIONS } from '@/constants/regions.constants'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

type ChannelGroup = 'marketplace' | 'storefront' | 'other'
const MARKETPLACE_TYPES: ChannelType[] = ['amazon', 'ebay', 'noon', 'walmart', 'etsy', 'tiktok_shop', 'trendyol', 'catch', 'kogan', 'daraz']
const STORE_TYPES: ChannelType[] = ['first_party_storefront', 'shopify', 'woocommerce', 'salla', 'zid', 'bigcommerce', 'magento', 'custom_api']
const groupOf = (t: ChannelType): ChannelGroup => (MARKETPLACE_TYPES.includes(t) ? 'marketplace' : STORE_TYPES.includes(t) ? 'storefront' : 'other')
const regionOfCurrency = (currency: string) => REGIONS.find((r) => r.currency === currency)?.short ?? null

export function ChannelsPage() {
  const can = useCan()
  const channels = useAll('channels', channelsApi.list)
  const warehouses = useWarehouses()
  const warehouseOptions = useWarehouseOptions()
  const [editing, setEditing] = useState<SalesChannel | 'new' | null>(null)
  const update = useAction('channels', ({ id, patch }: { id: string; patch: Partial<SalesChannel> }) => channelsApi.update(id, patch), { success: 'Channel updated' })
  const sync = useAction('channels', channelsApi.sync, { invalidates: ['orders'], success: (c) => `${c.name} synced` })
  const manage = can('integrations.manage')

  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: OPTIONS.channelType.map((o) => ({ ...o, label: CHANNEL_META[o.value].label })), col: 6 },
    { name: 'currency', label: 'Currency', type: 'select', required: true, options: OPTIONS.currency, col: 6 },
    { name: 'defaultWarehouseId', label: 'Default warehouse', type: 'select', options: warehouseOptions, col: 6 },
    { name: 'safetyStock', label: 'Safety stock per SKU', type: 'number', min: 0, col: 6, hint: 'Held back from published availability.' },
    { name: 'orderImport', label: 'Import orders', type: 'switch', col: 4 },
    { name: 'inventorySync', label: 'Publish inventory', type: 'switch', col: 4 },
    { name: 'fulfillmentCallbacks', label: 'Fulfillment callbacks', type: 'switch', col: 4 },
  ]

  const save = (v: Record<string, unknown>) => {
    const wh = warehouses.data?.data.find((w) => w.id === v.defaultWarehouseId)
    const body = { ...v, defaultWarehouseId: wh?.id ?? null, defaultWarehouseName: wh?.name ?? null } as Partial<SalesChannel>
    return editing === 'new'
      ? channelsApi.create({ status: 'connected', lastSyncAt: null, ordersToday: 0, errors24h: 0, ...body } as SalesChannel)
      : channelsApi.update((editing as SalesChannel).id, body)
  }
  const saveAction = useAction('channels', save, { success: 'Channel saved' })
  const [group, setGroup] = useState<ChannelGroup | 'all'>('all')
  const all = channels.data?.data ?? []
  const visible = all.filter((c) => group === 'all' || groupOf(c.type) === group)
  const connectedTypes = new Set(all.map((c) => c.type as string))
  const suggestions = APP_CATALOG.filter((a) => a.popular && (a.kind === 'marketplace' || a.kind === 'storefront') && !connectedTypes.has(a.id))

  return (
    <>
      <PageHeader
        title="Sales channels"
        description="Every place you sell: marketplaces, your own stores, POS and manual orders. Orders flow in, stock flows out."
        actions={
          <>
            <Link to={ROUTES.DIRECT_API} className="btn btn-light"><i className="ri-code-s-slash-line me-1" />Direct API</Link>
            <Guard permission="integrations.manage"><button type="button" className="btn btn-light" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />Custom channel</button></Guard>
            <Link to={`${ROUTES.APP_MARKETPLACE}?kind=marketplace`} className="btn btn-primary"><i className="ri-apps-2-add-line me-1" />Connect marketplace</Link>
          </>
        }
      />
      {all.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-xl-3"><StatCard label="Connected channels" value={all.filter((c) => c.status === 'connected').length} icon="ri-plug-line" tone="success" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard label="Marketplaces" value={all.filter((c) => groupOf(c.type) === 'marketplace').length} icon="ri-store-3-line" tone="primary" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard label="Markets covered" value={new Set(all.map((c) => regionOfCurrency(c.currency)).filter(Boolean)).size} icon="ri-global-line" tone="info" hint="By channel currency" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard label="Errors in 24h" value={all.reduce((s, c) => s + c.errors24h, 0)} icon="ri-error-warning-line" tone="danger" lowerIsBetter /></div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="card mb-4">
          <div className="card-body d-flex flex-wrap align-items-center gap-3">
            <div className="me-auto"><h6 className="mb-0">Reach more customers</h6><div className="text-muted fs-sm">Popular channels you haven't connected yet</div></div>
            {suggestions.slice(0, 6).map((a) => <Link key={a.id} to={`${ROUTES.APP_MARKETPLACE}?kind=${a.kind}`} className="chip"><AppLogo appId={a.id} size="sm" />{a.name}</Link>)}
          </div>
        </div>
      )}
      {all.length > 0 && (
        <div className="chip-row mb-3" role="group" aria-label="Channel type">
          {(['all', 'marketplace', 'storefront', 'other'] as const).map((g) => <button key={g} type="button" className={`chip ${group === g ? 'active' : ''}`} onClick={() => setGroup(g)}>{{ all: 'All', marketplace: 'Marketplaces', storefront: 'Stores', other: 'POS, B2B & manual' }[g]}<span className="chip-count">{g === 'all' ? all.length : all.filter((c) => groupOf(c.type) === g).length}</span></button>)}
        </div>
      )}
      {channels.isError && <QueryError message={errorMessage(channels.error)} onRetry={() => channels.refetch()} />}
      {channels.isLoading ? <div className="card card-body"><SkeletonLines lines={6} /></div> : !channels.data?.data.length ? (
        <EmptyState icon="ri-store-2-line" title="No sales channels" description="Add your storefront or a marketplace to start receiving orders." />
      ) : (
        <div className="row g-4">
          {visible.map((c) => (
            <div key={c.id} className="col-md-6 col-xxl-4">
              <div className="card app-card h-100 mb-0">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <AppLogo appId={c.type} fallbackIcon={CHANNEL_META[c.type].icon} />
                    <div className="flex-1 min-w-0">
                      <h6 className="mb-0 text-truncate">{c.name}</h6>
                      <div className="text-muted fs-sm">{CHANNEL_META[c.type].label} · {c.currency}{regionOfCurrency(c.currency) ? ` · ${regionOfCurrency(c.currency)}` : ''}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="d-flex justify-content-between text-muted fs-sm mb-3">
                    <span>{c.ordersToday} orders today</span>
                    <span>{c.lastSyncAt ? `Synced ${formatRelativeTime(c.lastSyncAt)}` : 'Never synced'}</span>
                    <span className={c.errors24h ? 'text-danger' : ''}>{c.errors24h} errors / 24h</span>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {(['orderImport', 'inventorySync', 'fulfillmentCallbacks'] as const).map((k) => (
                      <Switch key={k} id={`${c.id}-${k}`} checked={c[k]} disabled={!manage || update.isPending} onChange={(v) => update.mutate({ id: c.id, patch: { [k]: v } })} label={{ orderImport: 'Import orders', inventorySync: 'Publish inventory', fulfillmentCallbacks: 'Fulfillment callbacks' }[k]} />
                    ))}
                  </div>
                  <div className="text-muted fs-sm mt-3">Default warehouse: {c.defaultWarehouseName ?? 'Allocation rules decide'}</div>
                </div>
                <div className="card-footer d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-light" disabled={!manage || c.type === 'manual' || sync.isPending} onClick={() => sync.mutate(c.id)}><i className="ri-refresh-line" /> Sync now</button>
                  <button type="button" className="btn btn-sm btn-light ms-auto" disabled={!manage} onClick={() => setEditing(c)}><i className="ri-settings-3-line" /> Configure</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <EntityFormModal
        open={editing !== null}
        title={editing === 'new' ? 'Add sales channel' : `Configure ${(editing as SalesChannel | null)?.name ?? ''}`}
        fields={fields}
        initial={editing && editing !== 'new' ? (editing as unknown as Record<string, unknown>) : { type: 'first_party_storefront', currency: 'AED', orderImport: true, inventorySync: true, fulfillmentCallbacks: true, safetyStock: 0 }}
        submitLabel="Save channel"
        onClose={() => setEditing(null)}
        onSubmit={(v) => saveAction.mutateAsync(v)}
      />
    </>
  )
}
