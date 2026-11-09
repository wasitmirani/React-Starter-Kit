import { useEffect, useState } from 'react'
import { callsApi, ivrApi, numbersApi } from '@/api/endpoints/channels.api'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { ChannelAccountsPanel } from '@/components/features/channels/ChannelAccounts'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { useAction, useAll, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import type { Call, IvrMenu, PhoneNumber } from '@/types/channel.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { formatDuration } from '@/utils/formatters/number.formatter'

type Tab = 'calls' | 'numbers' | 'ivr' | 'accounts'

function CallsTab() {
  const { query, filters, setFilter, setSearch, setPage } = useListParams({ perPage: 20, filterKeys: ['direction', 'status'] })
  const calls = useList('calls', callsApi.list, query)
  const all = useAll('calls', callsApi.list)
  const rows = all.data?.data ?? []
  const answered = rows.filter((c) => c.status === 'completed')
  const columns: DataTableColumn<Call>[] = [
    { key: 'direction', label: '', width: '2.5rem', render: (c) => <i className={c.direction === 'inbound' ? 'ri-phone-line text-success' : 'ri-phone-fill text-primary'} title={c.direction} /> },
    { key: 'contactName', label: 'Contact', render: (c) => <div><div className="fw-medium">{c.contactName ?? 'Unknown'}</div><div className="text-muted fs-sm tabular-nums">{c.direction === 'inbound' ? c.from : c.to}</div></div> },
    { key: 'status', label: 'Outcome', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'durationSec', label: 'Duration', align: 'end', render: (c) => <span className="tabular-nums">{c.durationSec ? formatDuration(c.durationSec) : '—'}</span> },
    { key: 'agentName', label: 'Agent', render: (c) => c.agentName ?? <span className="text-muted">—</span> },
    { key: 'recorded', label: 'Recording', render: (c) => (c.recorded ? <button type="button" className="btn btn-sm btn-light" title="Recording playback is available once the voice backend is connected" disabled><i className="ri-play-circle-line me-1" />Play</button> : null) },
    { key: 'startedAt', label: 'Time', render: (c) => formatDateTime(c.startedAt) },
  ]
  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-md-3"><StatCard label="Calls (30d)" icon="ri-phone-line" value={rows.length} loading={!all.data} /></div>
        <div className="col-md-3"><StatCard label="Answer rate" icon="ri-phone-find-line" tone="success" value={rows.length ? `${Math.round((answered.length / rows.length) * 100)}%` : '—'} loading={!all.data} /></div>
        <div className="col-md-3"><StatCard label="Avg. duration" icon="ri-timer-line" tone="info" value={answered.length ? formatDuration(answered.reduce((n, c) => n + c.durationSec, 0) / answered.length) : '—'} loading={!all.data} /></div>
        <div className="col-md-3"><StatCard label="Missed" icon="ri-phone-lock-line" tone="danger" value={rows.filter((c) => ['no_answer', 'busy', 'voicemail'].includes(c.status)).length} loading={!all.data} lowerIsBetter /></div>
      </div>
      <div className="card">
        <div className="card-body pb-0">
          <FilterBar>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search number, contact, agent…" />
            <FilterSelect value={filters.direction} onChange={(v) => setFilter('direction', v)} allLabel="Both directions" options={[{ value: 'inbound', label: 'Inbound' }, { value: 'outbound', label: 'Outbound' }]} />
            <FilterSelect value={filters.status} onChange={(v) => setFilter('status', v)} allLabel="Any outcome" options={['completed', 'no_answer', 'busy', 'voicemail', 'failed'].map((s) => ({ value: s, label: s.replace('_', ' ') }))} />
          </FilterBar>
        </div>
        <DataTable<Call> columns={columns} rows={calls.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }} isLoading={calls.isLoading} itemsLabel="calls" fetchData={(p) => p && setPage(p)} />
      </div>
    </>
  )
}

function NumbersTab() {
  const numbers = useAll('numbers', numbersApi.list)
  const [buying, setBuying] = useState(false)
  const [country, setCountry] = useState('US')
  const [type, setType] = useState<PhoneNumber['type']>('local')
  const buy = useAction(
    'numbers',
    () => numbersApi.create({ number: `+1415555${Math.floor(1000 + Math.random() * 8999)}`, country, type, capabilities: ['voice', 'sms'], status: 'pending', provider: 'Twilio', monthlyCost: type === 'toll_free' ? 2.15 : 1.15, label: 'New number' }),
    { success: 'Number ordered. It becomes active once the provider confirms.', onSuccess: () => setBuying(false) },
  )
  const release = useAction('numbers', (n: PhoneNumber) => numbersApi.update(n.id, { status: 'released' }), { success: 'Number released' })
  const columns: DataTableColumn<PhoneNumber>[] = [
    { key: 'number', label: 'Number', render: (n) => <div><div className="fw-medium tabular-nums">{n.number}</div><div className="text-muted fs-sm">{n.label}</div></div> },
    { key: 'country', label: 'Country' },
    { key: 'type', label: 'Type', render: (n) => <span className="text-capitalize">{n.type.replace('_', ' ')}</span> },
    { key: 'capabilities', label: 'Capabilities', render: (n) => <span className="d-flex gap-1">{n.capabilities.map((c) => <ToneBadge key={c} tone="secondary">{c.toUpperCase()}</ToneBadge>)}</span> },
    { key: 'monthlyCost', label: 'Monthly', align: 'end', render: (n) => `$${n.monthlyCost.toFixed(2)}` },
    { key: 'status', label: 'Status', render: (n) => <StatusBadge status={n.status} /> },
  ]
  return (
    <>
      <Panel title="Phone numbers" actions={<button type="button" className="btn btn-sm btn-primary" onClick={() => setBuying(true)}><i className="ri-add-line me-1" />Buy number</button>} flush>
        <DataTable<PhoneNumber>
          columns={columns}
          rows={{ data: numbers.data?.data ?? [], current_page: 1, last_page: 1, from: 1, to: numbers.data?.total ?? 0, total: numbers.data?.total ?? 0 }}
          isLoading={numbers.isLoading}
          itemsLabel="numbers"
          actions={[{ key: 'release', label: 'Release', icon: 'ri-delete-bin-line', variant: 'delete', condition: (n) => n.status === 'active' }]}
          onAction={(p) => 'row' in p && release.mutate(p.row)}
        />
      </Panel>
      <Modal open={buying} onClose={() => setBuying(false)} title="Buy a phone number" footer={<><button type="button" className="btn btn-light" onClick={() => setBuying(false)}>Cancel</button><button type="button" className="btn btn-primary" disabled={buy.isPending} onClick={() => buy.mutate(undefined)}>Buy number</button></>}>
        <div className="row g-3">
          <FormField id="n-country" label="Country" className="col-6">
            <select id="n-country" className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {[['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'], ['CA', 'Canada'], ['AU', 'Australia']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField id="n-type" label="Type" className="col-6">
            <select id="n-type" className="form-select" value={type} onChange={(e) => setType(e.target.value as PhoneNumber['type'])}>
              <option value="local">Local</option>
              <option value="toll_free">Toll-free</option>
              <option value="mobile">Mobile</option>
            </select>
          </FormField>
        </div>
        <p className="text-muted fs-sm mt-3 mb-0">Some countries require a regulatory bundle (business address and ID) before the number is activated.</p>
      </Modal>
    </>
  )
}

function IvrTab() {
  const menus = useAll('ivr', ivrApi.list)
  const numbers = useAll('numbers', numbersApi.list)
  const menu = menus.data?.data[0]
  const [draft, setDraft] = useState<IvrMenu | null>(null)
  useEffect(() => {
    if (menu) setDraft(menu)
  }, [menu])
  const save = useAction('ivr', () => ivrApi.update(draft!.id, draft!), { success: 'IVR menu saved' })
  if (!draft) return <SkeletonLines lines={6} />
  const setOption = (i: number, patch: Partial<IvrMenu['options'][number]>) => setDraft({ ...draft, options: draft.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) })
  return (
    <div className="row g-4">
      <div className="col-xl-7">
        <Panel title="Menu" actions={<button type="button" className="btn btn-sm btn-primary" disabled={save.isPending} onClick={() => save.mutate(undefined)}>Save menu</button>}>
          <div className="row g-3 mb-4">
            <FormField id="ivr-name" label="Name" className="col-md-6"><input id="ivr-name" className="form-control" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></FormField>
            <FormField id="ivr-number" label="Answers calls on" className="col-md-6">
              <select id="ivr-number" className="form-select" value={draft.numberId ?? ''} onChange={(e) => setDraft({ ...draft, numberId: e.target.value || null })}>
                <option value="">Not assigned</option>
                {(numbers.data?.data ?? []).filter((n) => n.capabilities.includes('voice')).map((n) => <option key={n.id} value={n.id}>{n.number} — {n.label}</option>)}
              </select>
            </FormField>
            <FormField id="ivr-greeting" label="Greeting (text to speech)" className="col-12"><textarea id="ivr-greeting" rows={3} className="form-control" value={draft.greeting} onChange={(e) => setDraft({ ...draft, greeting: e.target.value })} /></FormField>
          </div>
          <h6 className="fs-sm text-muted text-uppercase">Key presses</h6>
          {draft.options.map((o, i) => (
            <div key={i} className="d-flex gap-2 align-items-center mb-2">
              <input className="form-control text-center" style={{ width: 56 }} value={o.digit} maxLength={1} onChange={(e) => setOption(i, { digit: e.target.value })} aria-label="Digit" />
              <input className="form-control" value={o.label} onChange={(e) => setOption(i, { label: e.target.value })} aria-label="Label" />
              <select className="form-select" style={{ maxWidth: 150 }} value={o.action} onChange={(e) => setOption(i, { action: e.target.value as IvrMenu['options'][number]['action'] })} aria-label="Action">
                <option value="queue">Queue</option><option value="agent">Agent</option><option value="voicemail">Voicemail</option><option value="hangup">Hang up</option>
              </select>
              <input className="form-control" value={o.target} onChange={(e) => setOption(i, { target: e.target.value })} aria-label="Target" />
              <button type="button" className="btn btn-light text-danger" aria-label="Remove" onClick={() => setDraft({ ...draft, options: draft.options.filter((_, j) => j !== i) })}><i className="ri-close-line" /></button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-light mt-2" disabled={draft.options.length >= 10} onClick={() => setDraft({ ...draft, options: [...draft.options, { digit: String(draft.options.length + 1), label: '', action: 'queue', target: '' }] })}><i className="ri-add-line me-1" />Add option</button>
        </Panel>
      </div>
      <div className="col-xl-5">
        <Panel title="Business hours" description="Outside these hours callers go to voicemail.">
          <div className="row g-3">
            <FormField id="bh-days" label="Days" className="col-12"><input id="bh-days" className="form-control" value={draft.businessHours.days} onChange={(e) => setDraft({ ...draft, businessHours: { ...draft.businessHours, days: e.target.value } })} /></FormField>
            <FormField id="bh-open" label="Open" className="col-6"><input id="bh-open" type="time" className="form-control" value={draft.businessHours.open} onChange={(e) => setDraft({ ...draft, businessHours: { ...draft.businessHours, open: e.target.value } })} /></FormField>
            <FormField id="bh-close" label="Close" className="col-6"><input id="bh-close" type="time" className="form-control" value={draft.businessHours.close} onChange={(e) => setDraft({ ...draft, businessHours: { ...draft.businessHours, close: e.target.value } })} /></FormField>
            <FormField id="bh-tz" label="Time zone" className="col-12"><input id="bh-tz" className="form-control" value={draft.businessHours.timezone} onChange={(e) => setDraft({ ...draft, businessHours: { ...draft.businessHours, timezone: e.target.value } })} /></FormField>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function VoiceChannelPage() {
  const [tab, setTab] = useState<Tab>('calls')
  return (
    <>
      <PageHeader title="Voice" description="Call logs, phone numbers and the IVR menu callers hear." />
      <Tabs<Tab> className="mb-4" value={tab} onChange={setTab} items={[{ value: 'calls', label: 'Calls' }, { value: 'numbers', label: 'Numbers' }, { value: 'ivr', label: 'IVR' }, { value: 'accounts', label: 'Provider' }]} />
      {tab === 'calls' && <CallsTab />}
      {tab === 'numbers' && <NumbersTab />}
      {tab === 'ivr' && <IvrTab />}
      {tab === 'accounts' && <ChannelAccountsPanel channel="voice" title="Voice provider" />}
    </>
  )
}
