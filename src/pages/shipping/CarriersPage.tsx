import { useState } from 'react'
import { carriersApi, codApi } from '@/api/endpoints/shipping.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal, type FieldDef } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge, TagList } from '@/components/ui/StatusBadge'
import { CARRIERS, OPTIONS } from '@/constants/domain.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import { useCan } from '@/hooks/useCan'
import type { CarrierAccount, CodRemittance } from '@/types/shipping.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'

const CARRIER_FIELDS: FieldDef[] = [
  { name: 'carrier', label: 'Carrier', type: 'select', required: true, options: CARRIERS.map((c) => ({ value: c.key, label: `${c.name} (${c.country})` })), col: 6 },
  { name: 'name', label: 'Display name', required: true, col: 6 },
  { name: 'accountNumber', label: 'Account number', required: true, col: 6 },
  { name: 'mode', label: 'Mode', type: 'select', required: true, options: [{ value: 'sandbox', label: 'Sandbox' }, { value: 'live', label: 'Live' }], col: 6 },
  { name: 'apiKey', label: 'API key', required: true, hint: 'Encrypted at rest and never shown again.', placeholder: '••••••••••' },
  { name: 'services', label: 'Services', type: 'tags', required: true, placeholder: 'overnight, economy…' },
  { name: 'codSupported', label: 'Collect cash on delivery', type: 'switch' },
]

export function CarriersPage() {
  const can = useCan()
  const [editing, setEditing] = useState<CarrierAccount | 'new' | null>(null)
  const test = useAction('carriers', carriersApi.test, { success: (c) => `${c.name}: credentials valid` })
  const save = useAction('carriers', ({ apiKey: _secret, ...v }: Record<string, unknown>) => {
    const country = CARRIERS.find((c) => c.key === v.carrier)?.country ?? 'PK'
    return editing === 'new' ? carriersApi.create({ ...v, country, status: 'connected', shipments30d: 0, onTimeRate: 1 } as CarrierAccount) : carriersApi.update((editing as CarrierAccount).id, v)
  }, { success: 'Carrier account saved' })
  const columns: DataTableColumn<CarrierAccount>[] = [
    { key: 'name', label: 'Account', sortable: true, render: (c) => <div><div className="fw-medium">{c.name}</div><div className="text-muted fs-sm font-monospace">{c.accountNumber} · {c.country}</div></div> },
    { key: 'services', label: 'Services', render: (c) => <TagList tags={c.services} /> },
    { key: 'codSupported', label: 'COD', render: (c) => (c.codSupported ? 'Yes' : 'No') },
    { key: 'mode', label: 'Mode', render: (c) => <StatusBadge status={c.mode} /> },
    { key: 'status', label: 'Connection', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'shipments30d', label: 'Shipments (30d)', align: 'end', sortable: true },
    { key: 'onTimeRate', label: 'On time', align: 'end', render: (c) => formatPercent(c.onTimeRate) },
  ]
  return (
    <>
      <PageHeader title="Carrier accounts" description="Courier accounts for Pakistan and the UAE. Credentials are stored encrypted; a carrier is only offered once a test booking succeeds." actions={<Guard permission="integrations.manage"><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />Add carrier</button></Guard>} />
      <ResourceList<CarrierAccount>
        resource="carriers"
        list={carriersApi.list}
        columns={columns}
        itemsLabel="carrier accounts"
        searchPlaceholder="Carrier or account…"
        filters={[{ key: 'country', allLabel: 'All countries', options: [{ value: 'PK', label: 'Pakistan' }, { value: 'AE', label: 'UAE' }] }, { key: 'status', allLabel: 'Any connection', options: OPTIONS.connection }]}
        actions={can('integrations.manage') ? [{ key: 'test', label: 'Test connection', icon: 'ri-pulse-line' }, { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' }] : undefined}
        onRowAction={(action, c) => (action === 'test' ? test.mutate(c.id) : setEditing(c))}
      />
      <EntityFormModal open={editing !== null} title={editing === 'new' ? 'Add carrier account' : 'Edit carrier account'} fields={editing === 'new' ? CARRIER_FIELDS : CARRIER_FIELDS.filter((f) => f.name !== 'apiKey')} initial={editing && editing !== 'new' ? (editing as unknown as Record<string, unknown>) : { carrier: 'tcs', mode: 'sandbox', codSupported: true, services: ['overnight'] }} submitLabel="Save" size="lg" onClose={() => setEditing(null)} onSubmit={(v) => save.mutateAsync(v)} />
    </>
  )
}

export function CodPage() {
  const can = useCan()
  const all = useAll('cod', codApi.list)
  const mark = useAction('cod', codApi.mark, { success: (r) => `${r.number} marked ${r.status}` })
  const rows = all.data?.data ?? []
  const pkr = rows.filter((r) => r.currency === 'PKR')
  const pending = pkr.filter((r) => r.status === 'pending').reduce((n, r) => n + r.collected - r.fees, 0)
  const disputed = pkr.filter((r) => r.status === 'disputed').reduce((n, r) => n + r.collected - r.fees - r.remitted, 0)
  const columns: DataTableColumn<CodRemittance>[] = [
    { key: 'number', label: 'Remittance', sortable: true, render: (r) => <div><div className="fw-medium">{r.number}</div><div className="text-muted fs-sm">{formatDate(r.periodStart)} – {formatDate(r.periodEnd)}</div></div> },
    { key: 'carrierName', label: 'Carrier' },
    { key: 'shipmentsCount', label: 'Shipments', align: 'end' },
    { key: 'collected', label: 'Collected', align: 'end', render: (r) => <span className="tabular-nums">{formatMoney(r.collected, r.currency)}</span> },
    { key: 'fees', label: 'Fees', align: 'end', render: (r) => <span className="tabular-nums text-muted">{formatMoney(r.fees, r.currency)}</span> },
    { key: 'remitted', label: 'Remitted', align: 'end', render: (r) => <span className="tabular-nums fw-medium">{formatMoney(r.remitted, r.currency)}</span> },
    { key: 'updatedAt', label: 'Variance', align: 'end', render: (r) => { const v = r.collected - r.fees - r.remitted; return <span className={`tabular-nums ${v > 1 && r.status !== 'pending' ? 'text-danger fw-semibold' : 'text-muted'}`}>{formatMoney(v, r.currency)}</span> } },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]
  return (
    <>
      <PageHeader title="COD reconciliation" description="Cash collected by carriers against what they remitted. Settlement is tracked separately from delivery status." />
      <div className="row g-4 mb-4">
        <div className="col-md-4"><StatCard label="Awaiting remittance" value={formatMoney(pending, 'PKR')} icon="ri-time-line" tone="warning" loading={all.isLoading} /></div>
        <div className="col-md-4"><StatCard label="Disputed shortfall" value={formatMoney(disputed, 'PKR')} icon="ri-error-warning-line" tone="danger" loading={all.isLoading} /></div>
        <div className="col-md-4"><StatCard label="Reconciled batches" value={rows.filter((r) => r.status === 'reconciled').length} icon="ri-checkbox-circle-line" tone="success" loading={all.isLoading} /></div>
      </div>
      <ResourceList<CodRemittance>
        resource="cod"
        list={codApi.list}
        columns={columns}
        itemsLabel="remittances"
        exportName="cod-remittances"
        searchPlaceholder="Remittance or carrier…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.remittanceStatus }]}
        actions={can('billing.manage') || can('clients.manage') ? [
          { key: 'received', label: 'Mark received', icon: 'ri-bank-line', condition: (r) => r.status === 'pending' },
          { key: 'reconciled', label: 'Reconcile', icon: 'ri-check-double-line', condition: (r) => r.status === 'received' || r.status === 'disputed' },
          { key: 'disputed', label: 'Dispute', icon: 'ri-flag-line', variant: 'delete', condition: (r) => r.status === 'received' },
        ] : undefined}
        onRowAction={(status, r) => mark.mutate({ id: r.id, status: status as CodRemittance['status'] })}
      />
    </>
  )
}
