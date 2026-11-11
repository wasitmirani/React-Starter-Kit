import { useState } from 'react'
import { rateCardsApi, statementsApi, usageApi } from '@/api/endpoints/threepl.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import { useClientOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { BillableActivity, ClientStatement, Rate, RateCard, UsageEntry } from '@/types/threepl.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate, formatDateTime } from '@/utils/formatters/date.formatter'

export const usageColumns: DataTableColumn<UsageEntry>[] = [
  { key: 'createdAt', label: 'Date', sortable: true, render: (u) => formatDateTime(u.createdAt) },
  { key: 'clientName', label: 'Client', sortable: true },
  { key: 'activity', label: 'Activity', render: (u) => humanize(u.activity) },
  { key: 'quantity', label: 'Quantity', align: 'end', render: (u) => <span className="tabular-nums">{u.quantity} <span className="text-muted fs-sm">{u.unit}</span></span> },
  { key: 'rate', label: 'Rate', align: 'end', render: (u) => <span className="tabular-nums">{formatMoney(u.rate, u.currency)}</span> },
  { key: 'amount', label: 'Amount', align: 'end', sortable: true, render: (u) => <span className="tabular-nums fw-medium">{formatMoney(u.amount, u.currency)}</span> },
  { key: 'reference', label: 'Reference' },
]

const ACTIVITY_UNITS: Record<BillableActivity, string> = { storage: 'bin / day', receiving: 'unit', putaway: 'unit', pick: 'order line', pack: 'order', dispatch: 'parcel', returns: 'unit', vas: 'unit' }

export function RateCardsPage() {
  const cards = useAll('rate-cards', rateCardsApi.list)
  const [editing, setEditing] = useState<RateCard | 'new' | null>(null)
  const activities = Object.keys(ACTIVITY_UNITS) as BillableActivity[]
  const save = useAction('rate-cards', (v: Record<string, unknown>) => {
    const rates: Rate[] = activities.filter((a) => Number(v[`rate_${a}`]) > 0).map((a) => ({ activity: a, unit: ACTIVITY_UNITS[a], rate: Number(v[`rate_${a}`]), minimum: a === 'storage' ? Number(v.minimum) || 0 : 0 }))
    const body = { name: String(v.name), currency: v.currency as RateCard['currency'], effectiveFrom: new Date(String(v.effectiveFrom)).toISOString(), status: v.status as RateCard['status'], rates }
    return editing === 'new' ? rateCardsApi.create(body) : rateCardsApi.update((editing as RateCard).id, body)
  }, { success: 'Rate card saved' })
  const initial = (c?: RateCard) => ({ name: c?.name ?? '', currency: c?.currency ?? 'PKR', status: c?.status ?? 'draft', effectiveFrom: c?.effectiveFrom ?? new Date().toISOString(), minimum: c?.rates.find((r) => r.activity === 'storage')?.minimum ?? 0, ...Object.fromEntries(activities.map((a) => [`rate_${a}`, c?.rates.find((r) => r.activity === a)?.rate ?? 0])) })

  return (
    <>
      <PageHeader title="Service rate cards" description="Client-specific prices per billable activity with effective dates and minimum charges. Changes apply to usage recorded after the effective date." actions={<Guard permission="clients.manage"><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />New rate card</button></Guard>} />
      {cards.isLoading && <Loader label="Loading rate cards…" />}
      <div className="row g-4">
        {cards.data?.data.map((c) => (
          <div key={c.id} className="col-lg-6 col-xxl-4">
            <Panel title={c.name} description={`${c.currency} · effective ${formatDate(c.effectiveFrom)}`} actions={<><StatusBadge status={c.status} /><Guard permission="clients.manage"><button type="button" className="btn btn-sm btn-light" onClick={() => setEditing(c)}>Edit</button></Guard></>} flush className="h-100 mb-0">
              <table className="table table-sm mb-0">
                <tbody>
                  {c.rates.map((r) => <tr key={r.activity}><td className="ps-4">{humanize(r.activity)}</td><td className="text-muted">per {r.unit}</td><td className="text-end tabular-nums pe-4">{formatMoney(r.rate, c.currency)}{r.minimum > 0 && <div className="fs-xs text-muted">min {formatMoney(r.minimum, c.currency)}</div>}</td></tr>)}
                </tbody>
              </table>
            </Panel>
          </div>
        ))}
      </div>
      <EntityFormModal
        open={editing !== null}
        title={editing === 'new' ? 'New rate card' : 'Edit rate card'}
        submitLabel="Save rate card"
        size="lg"
        onClose={() => setEditing(null)}
        initial={initial(editing && editing !== 'new' ? editing : undefined)}
        fields={[
          { name: 'name', label: 'Name', required: true, col: 6 },
          { name: 'currency', label: 'Currency', type: 'select', required: true, options: OPTIONS.currency, col: 3 },
          { name: 'status', label: 'Status', type: 'select', required: true, options: OPTIONS.rateCardStatus, col: 3 },
          { name: 'effectiveFrom', label: 'Effective from', type: 'date', required: true, col: 6 },
          { name: 'minimum', label: 'Monthly storage minimum', type: 'number', min: 0, col: 6 },
          ...activities.map((a) => ({ name: `rate_${a}`, label: `${humanize(a)} (per ${ACTIVITY_UNITS[a]})`, type: 'number' as const, min: 0, col: 3 as const })),
        ]}
        onSubmit={(v) => save.mutateAsync(v)}
      />
    </>
  )
}

export function UsagePage() {
  const clients = useClientOptions()
  return (
    <>
      <PageHeader title="Usage ledger" description="Every billable activity recorded at the time it happened, priced from the client’s rate card. Statements are generated from these rows." />
      <ResourceList<UsageEntry> resource="usage" list={usageApi.list} columns={usageColumns} itemsLabel="usage entries" exportName="usage-ledger" perPage={30} searchPlaceholder="Client or reference…" filters={[{ key: 'clientId', allLabel: 'All clients', options: clients }, { key: 'activity', allLabel: 'All activities', options: OPTIONS.billableActivity }]} />
    </>
  )
}

export function StatementsPage() {
  const can = useCan()
  const clients = useClientOptions()
  const [generating, setGenerating] = useState(false)
  const generate = useAction('statements', statementsApi.generate, { success: (s) => `${s.number} drafted: ${formatMoney(s.amount, s.currency)}` })
  const advance = useAction('statements', statementsApi.advance, { success: (s) => `${s.number} ${s.status}` })
  const columns: DataTableColumn<ClientStatement>[] = [
    { key: 'number', label: 'Statement', sortable: true, render: (s) => <span className="fw-medium">{s.number}</span> },
    { key: 'clientName', label: 'Client', sortable: true },
    { key: 'periodStart', label: 'Period', render: (s) => `${formatDate(s.periodStart)} – ${formatDate(s.periodEnd)}` },
    { key: 'lineCount', label: 'Lines', align: 'end' },
    { key: 'amount', label: 'Amount', align: 'end', sortable: true, render: (s) => <span className="tabular-nums fw-medium">{formatMoney(s.amount, s.currency)}</span> },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
    { key: 'dueAt', label: 'Due', sortable: true, render: (s) => formatDate(s.dueAt) },
  ]
  return (
    <>
      <PageHeader title="Client statements" description="Billing-period statements built from the usage ledger. Export for your accounting system; tax invoicing follows local rules." actions={<Guard permission="clients.manage"><button type="button" className="btn btn-primary" onClick={() => setGenerating(true)}><i className="ri-file-add-line me-1" />Generate statement</button></Guard>} />
      <ResourceList<ClientStatement>
        resource="statements"
        list={statementsApi.list}
        columns={columns}
        itemsLabel="statements"
        exportName="client-statements"
        searchPlaceholder="Statement or client…"
        filters={[{ key: 'clientId', allLabel: 'All clients', options: clients }, { key: 'status', allLabel: 'All statuses', options: OPTIONS.statementStatus }]}
        actions={can('clients.manage') ? [{ key: 'issued', label: 'Issue', icon: 'ri-send-plane-line', condition: (s) => s.status === 'draft' }, { key: 'paid', label: 'Mark paid', icon: 'ri-check-line', condition: (s) => s.status === 'issued' || s.status === 'overdue' }] : undefined}
        onRowAction={(status, s) => advance.mutate({ id: s.id, status: status as 'issued' | 'paid' })}
      />
      <EntityFormModal open={generating} title="Generate statement" submitLabel="Generate draft" intro="Totals the client’s usage for the last 30 days into a draft you can review before issuing." onClose={() => setGenerating(false)} fields={[{ name: 'clientId', label: 'Client', type: 'select', required: true, options: clients }]} onSubmit={(v) => generate.mutateAsync(String(v.clientId))} />
    </>
  )
}
