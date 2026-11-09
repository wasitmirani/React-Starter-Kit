import { useState, type DragEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { dealsApi, pipelinesApi } from '@/api/endpoints/crm.api'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { DealModal } from '@/components/features/sales/SalesModals'
import { Avatar } from '@/components/ui/Avatar'
import { MoreMenu } from '@/components/ui/Dropdown'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TEAM_MEMBERS } from '@/constants/crm.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Deal } from '@/types/crm.types'
import { formatCurrency } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'

const money = (v: number) => formatCurrency(v).replace(/\.00$/, '')

export function DealsPage() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'list' ? 'list' : 'board'
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>('open')
  const pipelines = useAll('pipelines', pipelinesApi.list)
  const deals = useAll('deals', dealsApi.list)
  const pipeline = pipelines.data?.data[0]
  const [editing, setEditing] = useState<Deal | null>(null)
  const [newStage, setNewStage] = useState<string | undefined>()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  const creating = params.get('new') === '1' || newStage !== undefined

  const move = useAction('deals', ({ id, patch }: { id: string; patch: Partial<Deal> }) => dealsApi.update(id, patch), { invalidates: ['companies'] })

  const all = deals.data?.data ?? []
  const visible = all.filter(
    (d) =>
      (!status || d.status === status) &&
      (!owner || d.ownerName === owner) &&
      (!search || `${d.title} ${d.companyName} ${d.contactName}`.toLowerCase().includes(search.toLowerCase())),
  )
  const open = all.filter((d) => d.status === 'open')
  const weighted = open.reduce((sum, d) => sum + d.value * ((pipeline?.stages.find((s) => s.id === d.stageId)?.probability ?? 0) / 100), 0)
  const won = all.filter((d) => d.status === 'won')
  const closed = won.length + all.filter((d) => d.status === 'lost').length

  const setView = (v: 'board' | 'list') => {
    const next = new URLSearchParams(params)
    if (v === 'list') next.set('view', 'list')
    else next.delete('view')
    setParams(next, { replace: true })
  }
  const closeModal = () => {
    setEditing(null)
    setNewStage(undefined)
    if (params.get('new')) {
      const next = new URLSearchParams(params)
      next.delete('new')
      setParams(next, { replace: true })
    }
  }

  const onDrop = (e: DragEvent, stageId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    setOverStage(null)
    setDragId(null)
    const deal = all.find((d) => d.id === id)
    if (deal && deal.stageId !== stageId) move.mutate({ id, patch: { stageId } })
  }

  const dealMenu = (d: Deal) => (
    <MoreMenu
      items={[
        { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => setEditing(d) },
        { key: 'won', label: 'Mark as won', icon: 'ri-trophy-line', onSelect: () => move.mutate({ id: d.id, patch: { status: 'won' } }) },
        { key: 'lost', label: 'Mark as lost', icon: 'ri-close-circle-line', onSelect: () => move.mutate({ id: d.id, patch: { status: 'lost' } }) },
        ...(d.status !== 'open' ? [{ key: 'reopen', label: 'Reopen', icon: 'ri-refresh-line', onSelect: () => move.mutate({ id: d.id, patch: { status: 'open' } }) }] : []),
      ]}
    />
  )

  const columns: DataTableColumn<Deal>[] = [
    { key: 'title', label: 'Deal', render: (d) => <button type="button" className="btn btn-link p-0 text-reset fw-medium text-start" onClick={() => setEditing(d)}>{d.title}</button> },
    { key: 'value', label: 'Value', align: 'end', render: (d) => <span className="tabular-nums fw-medium">{money(d.value)}</span> },
    { key: 'stageId', label: 'Stage', render: (d) => pipeline?.stages.find((s) => s.id === d.stageId)?.name },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    { key: 'contactName', label: 'Contact', render: (d) => (d.contactId ? <Link to={to(ROUTES.CONTACT, { id: d.contactId })}>{d.contactName}</Link> : '—') },
    { key: 'ownerName', label: 'Owner' },
    { key: 'expectedCloseDate', label: 'Close date', render: (d) => (d.expectedCloseDate ? formatDate(d.expectedCloseDate) : '—') },
    { key: 'id', label: '', render: dealMenu, align: 'end' },
  ]

  return (
    <>
      <PageHeader
        title="Deals"
        description={pipeline?.name}
        actions={
          <>
            <div className="btn-group" role="group" aria-label="View">
              <button type="button" className={`btn ${view === 'board' ? 'btn-primary' : 'btn-light'}`} onClick={() => setView('board')}><i className="ri-layout-column-line me-1" />Board</button>
              <button type="button" className={`btn ${view === 'list' ? 'btn-primary' : 'btn-light'}`} onClick={() => setView('list')}><i className="ri-list-unordered me-1" />List</button>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setNewStage(pipeline?.stages[0].id)}><i className="ri-add-line me-1" />New deal</button>
          </>
        }
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Open pipeline" icon="ri-briefcase-line" loading={!deals.data} value={money(open.reduce((s, d) => s + d.value, 0))} hint={`${open.length} open deals`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Weighted forecast" icon="ri-scales-3-line" tone="info" loading={!deals.data} value={money(weighted)} hint="value × stage probability" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Won" icon="ri-trophy-line" tone="success" loading={!deals.data} value={money(won.reduce((s, d) => s + d.value, 0))} hint={`${won.length} deals`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Win rate" icon="ri-percent-line" tone="warning" loading={!deals.data} value={closed ? `${Math.round((won.length / closed) * 100)}%` : '—'} hint="won ÷ closed" /></div>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search deals…" />
        <FilterSelect value={owner} onChange={setOwner} allLabel="All owners" options={TEAM_MEMBERS.map((m) => ({ value: m, label: m }))} />
        <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={[{ value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }]} />
      </FilterBar>

      {!pipeline || !deals.data ? (
        <SkeletonLines lines={8} />
      ) : view === 'list' ? (
        <div className="card">
          <DataTable<Deal> columns={columns} rows={{ data: visible, current_page: 1, last_page: 1, from: visible.length ? 1 : null, to: visible.length || null, total: visible.length }} itemsLabel="deals" />
        </div>
      ) : (
        <div className="kanban">
          {pipeline.stages.map((stage) => {
            const cards = visible.filter((d) => d.stageId === stage.id)
            return (
              <section
                key={stage.id}
                className={`kanban-col${overStage === stage.id ? ' drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverStage(stage.id)
                }}
                onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
                onDrop={(e) => onDrop(e, stage.id)}
                aria-label={stage.name}
              >
                <header className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    <h6 className="mb-0">{stage.name} <span className="text-muted fw-normal">· {cards.length}</span></h6>
                    <span className="text-muted fs-sm">{money(cards.reduce((s, d) => s + d.value, 0))} · {stage.probability}%</span>
                  </div>
                  <button type="button" className="btn btn-sm btn-light btn-icon" aria-label={`Add deal to ${stage.name}`} onClick={() => setNewStage(stage.id)}><i className="ri-add-line" /></button>
                </header>
                <div className="kanban-cards">
                  {cards.map((d) => (
                    <article
                      key={d.id}
                      className={`kanban-card${dragId === d.id ? ' dragging' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', d.id)
                        setDragId(d.id)
                      }}
                      onDragEnd={() => setDragId(null)}
                    >
                      <div className="d-flex justify-content-between gap-2">
                        <button type="button" className="btn btn-link p-0 text-reset fw-medium text-start lh-sm" onClick={() => setEditing(d)}>{d.title}</button>
                        {dealMenu(d)}
                      </div>
                      <div className="text-muted fs-sm mt-1">{d.companyName ?? d.contactName ?? 'No company'}</div>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="fw-semibold tabular-nums">{money(d.value)}</span>
                        <span className="d-flex align-items-center gap-2">
                          {d.status !== 'open' && <StatusBadge status={d.status} />}
                          {d.expectedCloseDate && <span className={`fs-xs ${Date.parse(d.expectedCloseDate) < Date.now() && d.status === 'open' ? 'text-danger' : 'text-muted'}`}>{formatDate(d.expectedCloseDate, 'en-US', { month: 'short', day: 'numeric' })}</span>}
                          <Avatar name={d.ownerName} size={22} />
                        </span>
                      </div>
                    </article>
                  ))}
                  {cards.length === 0 && <p className="text-muted fs-sm text-center my-3">Drop deals here</p>}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <DealModal open={creating || editing !== null} deal={editing} pipeline={pipeline} defaultStageId={newStage} onClose={closeModal} />
    </>
  )
}
