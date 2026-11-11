import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ordersApi, productsApi } from '@/api/endpoints/commerce.api'
import { errorMessage } from '@/api/errors'
import { clientsApi, usageApi } from '@/api/endpoints/threepl.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal, type FieldDef } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { DetailList, Meter } from '@/components/ui/Controls'
import { StatusBadge, TagList } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import { useRateCards, useWarehouses } from '@/hooks/queries/reference.queries'
import type { Order, Product } from '@/types/commerce.types'
import type { Client, UsageEntry } from '@/types/threepl.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'
import { orderColumns } from '@/pages/orders/OrdersPage'
import { usageColumns } from './BillingPages'

const columns: DataTableColumn<Client>[] = [
  { key: 'name', label: 'Client', sortable: true, render: (c) => <div><div className="fw-medium">{c.name}</div><div className="text-muted fs-sm">{c.code} · {c.contactName}</div></div> },
  { key: 'warehouseNames', label: 'Warehouses', render: (c) => <TagList tags={c.warehouseNames} /> },
  { key: 'skuCount', label: 'SKUs', align: 'end', sortable: true },
  { key: 'unitsStored', label: 'Units stored', align: 'end', sortable: true, render: (c) => c.unitsStored.toLocaleString() },
  { key: 'ordersMtd', label: 'Orders (MTD)', align: 'end', sortable: true },
  { key: 'slaOnTime', label: 'SLA on time', align: 'end', render: (c) => <span className={c.slaOnTime < 0.9 ? 'text-danger fw-medium' : 'text-success'}>{formatPercent(c.slaOnTime)}</span> },
  { key: 'rateCardName', label: 'Rate card' },
  { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
]

function useClientFields(): FieldDef[] {
  const cards = useRateCards()
  const warehouses = useWarehouses()
  return [
    { name: 'code', label: 'Code', required: true, col: 4, placeholder: 'ABC' },
    { name: 'name', label: 'Company name', required: true, col: 8 },
    { name: 'contactName', label: 'Contact person', required: true, col: 6 },
    { name: 'email', label: 'Email', type: 'email', required: true, col: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, col: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, options: OPTIONS.clientStatus, col: 6 },
    { name: 'rateCardId', label: 'Rate card', type: 'select', required: true, options: (cards.data?.data ?? []).filter((r) => r.status !== 'retired').map((r) => ({ value: r.id, label: `${r.name} (${r.currency})` })), col: 6 },
    { name: 'billingCycle', label: 'Billing cycle', type: 'select', required: true, options: [{ value: 'monthly', label: 'Monthly' }, { value: 'biweekly', label: 'Every two weeks' }], col: 6 },
    { name: 'warehouseNames', label: 'Warehouses', type: 'tags', required: true, hint: `Available: ${(warehouses.data?.data ?? []).map((w) => w.name).join(', ')}` },
  ]
}

export function ClientsPage() {
  const fields = useClientFields()
  const [editing, setEditing] = useState<Client | 'new' | null>(null)
  const save = useAction('clients', (v: Record<string, unknown>) => (editing === 'new' ? clientsApi.create({ ...v, rateCardName: null, skuCount: 0, unitsStored: 0, ordersMtd: 0, slaOnTime: 1 } as Client) : clientsApi.update((editing as Client).id, v)), { success: 'Client saved' })
  return (
    <>
      <PageHeader title="3PL clients" description="Merchants whose stock you store and fulfil. Client data is scoped: client users only ever see their own products, orders and charges." actions={<Guard permission="clients.manage"><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-user-add-line me-1" />Onboard client</button></Guard>} />
      <ResourceList<Client> resource="clients" list={clientsApi.list} columns={columns} itemsLabel="clients" exportName="clients" searchPlaceholder="Name, code, contact…" rowLink={(c) => to(ROUTES.CLIENT, { id: c.id })} filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.clientStatus }]} />
      <EntityFormModal open={editing !== null} title={editing === 'new' ? 'Onboard client' : 'Edit client'} fields={fields} size="lg" initial={editing && editing !== 'new' ? (editing as unknown as Record<string, unknown>) : { status: 'onboarding', billingCycle: 'monthly', warehouseNames: [] }} submitLabel="Save client" onClose={() => setEditing(null)} onSubmit={(v) => save.mutateAsync(v)} />
    </>
  )
}

export function ClientDetailPage() {
  const { id } = useParams()
  const client = useOne('clients', clientsApi.get, id)
  const fields = useClientFields()
  const [tab, setTab] = useState<'orders' | 'catalog' | 'usage'>('orders')
  const [editing, setEditing] = useState(false)
  const usage = useAll('usage', usageApi.list, { clientId: id })
  const save = useAction('clients', (v: Record<string, unknown>) => clientsApi.update(id!, v), { success: 'Client saved' })

  if (client.isLoading) return <Loader label="Loading client…" />
  if (client.isError || !client.data) return <QueryError message={errorMessage(client.error)} onRetry={() => client.refetch()} />
  const c = client.data
  const charges = (usage.data?.data ?? []).filter((u) => Date.now() - new Date(u.createdAt).getTime() < 30 * 86_400_000)
  const currency = charges[0]?.currency ?? 'PKR'

  return (
    <>
      <PageHeader back={{ label: 'Clients', to: ROUTES.CLIENTS }} title={c.name} meta={<StatusBadge status={c.status} />} description={`${c.code} · ${c.contactName} · ${c.email}`} actions={<Guard permission="clients.manage"><button type="button" className="btn btn-light" onClick={() => setEditing(true)}><i className="ri-edit-line me-1" />Edit</button></Guard>} />
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Units stored" value={c.unitsStored.toLocaleString()} icon="ri-stack-line" hint={`${c.skuCount} SKUs`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Orders this month" value={c.ordersMtd} icon="ri-shopping-bag-3-line" tone="info" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Charges (30 days)" value={formatMoney(charges.reduce((n, u) => n + u.amount, 0), currency)} icon="ri-money-dollar-circle-line" tone="success" loading={usage.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="SLA on time" value={formatPercent(c.slaOnTime)} icon="ri-timer-line" tone={c.slaOnTime < 0.9 ? 'danger' : 'success'} hint="Dispatched before warehouse cutoff" /></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-8">
          <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ value: 'orders', label: 'Client orders' }, { value: 'catalog', label: 'Client catalog' }, { value: 'usage', label: 'Usage ledger' }]} />
          {tab === 'orders' && <ResourceList<Order> resource="orders" list={ordersApi.list} scope={{ clientId: c.id }} columns={orderColumns} itemsLabel="orders" perPage={10} rowLink={(o) => to(ROUTES.ORDER, { id: o.id })} />}
          {tab === 'catalog' && <ResourceList<Product> resource="products" list={productsApi.list} scope={{ clientId: c.id }} columns={[{ key: 'title', label: 'Product', render: (p) => <Link to={to(ROUTES.PRODUCT, { id: p.id })}>{p.title}</Link> }, { key: 'variants', label: 'SKUs', render: (p) => p.variants.map((v) => v.sku).join(', ') }, { key: 'onHand', label: 'On hand', align: 'end' }, { key: 'available', label: 'Available', align: 'end' }, { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> }]} itemsLabel="products" perPage={10} />}
          {tab === 'usage' && <ResourceList<UsageEntry> resource="usage" list={usageApi.list} scope={{ clientId: c.id }} columns={usageColumns.filter((col) => col.key !== 'clientName')} itemsLabel="usage entries" perPage={15} exportName={`usage-${c.code}`} />}
        </div>
        <div className="col-xl-4">
          <Panel title="Account" icon="ri-building-line">
            <DetailList items={[{ label: 'Phone', value: c.phone }, { label: 'Rate card', value: c.rateCardName }, { label: 'Billing cycle', value: humanize(c.billingCycle) }, { label: 'Warehouses', value: <TagList tags={c.warehouseNames} max={5} /> }, { label: 'Client since', value: formatDate(c.createdAt) }]} />
          </Panel>
        </div>
      </div>
      <EntityFormModal open={editing} title="Edit client" fields={fields} size="lg" initial={c as unknown as Record<string, unknown>} submitLabel="Save client" onClose={() => setEditing(false)} onSubmit={(v) => save.mutateAsync(v)} />
    </>
  )
}

export function SlaPage() {
  const clients = useAll('clients', clientsApi.list)
  const rows = (clients.data?.data ?? []).filter((c) => c.status !== 'onboarding')
  return (
    <>
      <PageHeader title="SLA reports" description="On-time dispatch per client: orders dispatched before the warehouse cutoff on the promised day. Target 95%." />
      <Panel flush>
        {clients.isLoading ? <Loader label="Loading…" /> : (
          <table className="table align-middle mb-0">
            <thead><tr className="text-muted fs-sm"><th>Client</th><th className="text-end">Orders (MTD)</th><th style={{ width: '35%' }}>On time</th><th className="text-end">Rate</th><th>vs target</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><Link to={to(ROUTES.CLIENT, { id: c.id })}>{c.name}</Link></td>
                  <td className="text-end tabular-nums">{c.ordersMtd}</td>
                  <td><Meter value={c.slaOnTime} max={1} tone={c.slaOnTime >= 0.95 ? 'success' : c.slaOnTime >= 0.9 ? 'warning' : 'danger'} /></td>
                  <td className="text-end tabular-nums fw-semibold">{formatPercent(c.slaOnTime)}</td>
                  <td>{c.slaOnTime >= 0.95 ? <StatusBadge status="success" label="Met" /> : <StatusBadge status="failed" label={`${((0.95 - c.slaOnTime) * 100).toFixed(1)} pts below`} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  )
}
