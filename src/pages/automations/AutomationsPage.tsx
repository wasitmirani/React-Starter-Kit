import { useState, type MouseEvent, type ReactNode } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { workflowsApi, type WorkflowOverview } from '@/api/endpoints/automation.api'
import { Sparkline } from '@/components/charts'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { RunsTable } from '@/components/features/automation/Runs'
import { StepChain } from '@/components/features/automation/StepChain'
import { Meter, OptionCard } from '@/components/ui/Controls'
import { MoreMenu, type DropdownItem } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ChannelBadge, StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { TRIGGERS } from '@/constants/automation.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Workflow } from '@/types/automation.types'
import type { Tone } from '@/types/common.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { formatCompact, formatRate, plural } from '@/utils/formatters/number.formatter'
import { channelsOf, countSteps, createStep, defaultSettings, defaultTriggerConfig, hasUnpublishedChanges, newCondition, stepKey } from '@/utils/helpers/workflow'

type Recipe = { key: string; title: string; description: string; icon: string; build: () => Pick<Workflow, 'name' | 'description' | 'trigger' | 'steps'> }

const RECIPES: Recipe[] = [
  { key: 'blank', title: 'Start from scratch', description: 'Pick a trigger and add steps yourself.', icon: 'ri-add-circle-line', build: () => ({ name: 'Untitled automation', description: '', trigger: { type: 'contact_created', config: {} }, steps: [] }) },
  {
    key: 'welcome',
    title: 'Welcome series',
    description: 'Email new subscribers, wait, then follow up.',
    icon: 'ri-hand-heart-line',
    build: () => ({ name: 'Welcome series', description: 'Greets new subscribers.', trigger: { type: 'added_to_list', config: {} }, steps: [createStep('send_email'), createStep('delay', { amount: '3', unit: 'days' }), createStep('send_email')] }),
  },
  {
    key: 'cart',
    title: 'Abandoned cart',
    description: 'Wait an hour, check the cart over HTTP, then remind by WhatsApp.',
    icon: 'ri-shopping-cart-line',
    build: () => ({ name: 'Abandoned cart recovery', description: '', trigger: { type: 'webhook', config: { ...defaultTriggerConfig('webhook'), event: 'cart.abandoned' } }, steps: [createStep('delay', { amount: '1', unit: 'hours' }), createStep('http_request'), createStep('send_whatsapp'), createStep('goal', { goal: 'Completes checkout' })] }),
  },
  {
    key: 'lead',
    title: 'Lead routing',
    description: 'Branch form leads by country and create a sales task.',
    icon: 'ri-route-line',
    build: () => ({ name: 'Lead routing', description: '', trigger: { type: 'form_submitted', config: {} }, steps: [createStep('add_tag', { tag: 'inbound-lead' }), createStep('condition')] }),
  },
  {
    key: 'webhook',
    title: 'Incoming webhook',
    description: 'Get a URL any system can POST to, then tag and welcome the contact.',
    icon: 'ri-webhook-line',
    build: () => ({ name: 'Webhook lead capture', description: 'Started by a signed HTTP request from your own system.', trigger: { type: 'incoming_webhook', config: defaultTriggerConfig('incoming_webhook') }, steps: [createStep('add_tag', { tag: 'webhook-lead' }), createStep('send_email')] }),
  },
  {
    key: 'reminder-loop',
    title: 'Payment reminder loop',
    description: 'Remind every 2 days until paid, max 3 times, using If / else, Go to step and End.',
    icon: 'ri-repeat-line',
    build: () => {
      const remind = createStep('send_email')
      const check = createStep('if_else')
      const [yes, no] = check.paths!
      check.paths = [
        { ...yes, label: 'Paid', conditions: [newCondition('contact.tags', 'contains', 'paid')], steps: [createStep('terminate', { outcome: 'completed', reason: 'Invoice paid' })] },
        { ...no, label: 'Not paid', steps: [createStep('jump', { target: remind.id, maxLoops: '3' })] },
      ]
      return { name: 'Payment reminder loop', description: 'Chases unpaid invoices without spamming.', trigger: { type: 'webhook', config: { ...defaultTriggerConfig('webhook'), event: 'invoice.overdue' } }, steps: [remind, createStep('delay', { amount: '2', unit: 'days' }), check] }
    },
  },
  {
    key: 'vip-alert',
    title: 'VIP order alert',
    description: 'Webhook order → Shopify lookup → If big spender: Slack + HubSpot, else an AI thank-you email.',
    icon: 'ri-vip-crown-line',
    build: () => {
      const shop = createStep('shopify_customer')
      const check = createStep('if_else')
      const [yes, no] = check.paths!
      check.paths = [
        { ...yes, label: 'VIP', conditions: [newCondition(`steps.${stepKey(shop.id)}.total_spent`, 'greater_than', '500')], steps: [createStep('slack_message', { channel: '#vip-orders', message: 'VIP order from {{contact.first_name}} ({{steps.' + stepKey(shop.id) + '.total_spent}} lifetime)' }), createStep('hubspot_sync')] },
        { ...no, label: 'Everyone else', steps: [createStep('ai_generate', { prompt: 'Thank {{contact.first_name}} for their order', style: 'friendly', variable: 'thanks' }), createStep('send_email')] },
      ]
      return { name: 'VIP order alert', description: 'Routes big spenders to the team.', trigger: { type: 'incoming_webhook', config: defaultTriggerConfig('incoming_webhook') }, steps: [shop, check] }
    },
  },
  {
    key: 'winback',
    title: 'Win-back',
    description: 'Re-engage contacts who stopped opening, with an SMS fallback.',
    icon: 'ri-refresh-line',
    build: () => ({ name: 'Win-back', description: 'Brings inactive contacts back.', trigger: { type: 'tag_added', config: { tag: 'inactive-90d' } }, steps: [createStep('send_email'), createStep('wait_for_event'), createStep('send_sms')] }),
  },
  {
    key: 'birthday',
    title: 'Birthday greeting',
    description: 'Send a yearly WhatsApp message with a personal offer.',
    icon: 'ri-cake-2-line',
    build: () => ({ name: 'Birthday greeting', description: '', trigger: { type: 'date_attribute', config: { attribute: 'birthday' } }, steps: [createStep('send_whatsapp'), createStep('add_tag', { tag: 'birthday-sent' })] }),
  },
]

type Tab = 'workflows' | 'runs'
type Layout = 'table' | 'cards'
type SortKey = 'name' | 'active' | 'enrolled' | 'conversion' | 'success' | 'lastRun'

const LAYOUT_KEY = 'birdcrm.automations.layout'

const EMPTY_OVERVIEW: WorkflowOverview = { running: 0, waiting: 0, completed: 0, failed: 0, onStep: {}, passed: {}, failedAt: {}, lastRunAt: null, daily: [], successRate: null }

const builderUrl = (w: Workflow, view?: 'runs' | 'versions') => `${to(ROUTES.AUTOMATION, { id: w.id })}${view ? `?view=${view}` : ''}`

function statusLabel(w: Workflow) {
  return w.status === 'active' ? `Live · v${w.version}` : w.status === 'paused' ? `Paused · v${w.version}` : 'Draft'
}

function successTone(rate: number | null): Tone {
  return rate == null ? 'secondary' : rate >= 0.9 ? 'success' : rate >= 0.7 ? 'warning' : 'danger'
}

export function AutomationsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'workflows'
  const workflows = useAll('workflows', workflowsApi.list)
  const overview = useTenantQuery('executions', 'overview', workflowsApi.overview, { refetchInterval: 5000 })
  const [picking, setPicking] = useState(params.get('new') === '1')
  const [recipe, setRecipe] = useState('blank')
  const [deleting, setDeleting] = useState<Workflow | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [trigger, setTrigger] = useState<string | undefined>()
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'lastRun', desc: true })
  const [layout, setLayoutState] = useState<Layout>(() => (localStorage.getItem(LAYOUT_KEY) as Layout) || 'table')
  const setLayout = (l: Layout) => {
    localStorage.setItem(LAYOUT_KEY, l)
    setLayoutState(l)
  }

  const create = useAction(
    'workflows',
    (key: string) => workflowsApi.create({ ...RECIPES.find((r) => r.key === key)!.build(), status: 'draft', variables: [], settings: defaultSettings(), version: 0, versions: [], allowReentry: false, stats: { enrolled: 0, active: 0, completed: 0, goalReached: 0 } }),
    { onSuccess: (w) => navigate(to(ROUTES.AUTOMATION, { id: w.id })) },
  )
  const pause = useAction('workflows', workflowsApi.pause, { success: 'Automation paused' })
  const resume = useAction('workflows', workflowsApi.resume, { success: 'Automation resumed' })
  const remove = useAction('workflows', workflowsApi.remove, { success: 'Automation deleted', onSuccess: () => setDeleting(null) })

  const closePicker = () => {
    setPicking(false)
    if (params.get('new')) setParams({}, { replace: true })
  }

  const all = workflows.data?.data ?? []
  const o = overview.data ?? {}
  const statsOf = (w: Workflow) => o[w.id] ?? EMPTY_OVERVIEW
  const sum = (k: 'running' | 'waiting' | 'completed' | 'failed') => Object.values(o).reduce((n, s) => n + s[k], 0)
  const dailyTotal = Array.from({ length: 14 }, (_, i) => Object.values(o).reduce((n, s) => n + (s.daily[i] ?? 0), 0))
  const finished = sum('completed') + sum('failed')

  const sortValue = (w: Workflow): number | string => {
    const s = statsOf(w)
    switch (sort.key) {
      case 'name': return w.name.toLowerCase()
      case 'active': return s.running + s.waiting
      case 'enrolled': return w.stats.enrolled
      case 'conversion': return w.stats.enrolled ? w.stats.goalReached / w.stats.enrolled : -1
      case 'success': return s.successRate ?? -1
      case 'lastRun': return s.lastRunAt ?? ''
    }
  }
  const rows = all
    .filter((w) => (!status || w.status === status) && (!trigger || w.trigger.type === trigger) && (!search || `${w.name} ${w.description}`.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const x = sortValue(a)
      const y = sortValue(b)
      const cmp = typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)
      return sort.desc ? -cmp : cmp
    })
  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'name' }))

  /** Things a person should look at, most urgent first. */
  const attention = all.flatMap((w) => {
    const s = statsOf(w)
    const out: { key: string; tone: Tone; icon: string; text: ReactNode; action: ReactNode }[] = []
    if (s.failed) out.push({ key: `${w.id}-failed`, tone: 'danger', icon: 'ri-error-warning-line', text: <><strong>{w.name}</strong> has {s.failed} failed run{s.failed === 1 ? '' : 's'}</>, action: <Link className="btn btn-sm btn-light" to={builderUrl(w, 'runs')}>Review &amp; retry</Link> })
    if (w.status === 'paused' && s.waiting) out.push({ key: `${w.id}-paused`, tone: 'warning', icon: 'ri-pause-circle-line', text: <><strong>{w.name}</strong> is paused with {s.waiting} contact{s.waiting === 1 ? '' : 's'} on hold</>, action: <button type="button" className="btn btn-sm btn-light" onClick={() => resume.mutate(w.id)}>Resume</button> })
    if (hasUnpublishedChanges(w)) out.push({ key: `${w.id}-draft`, tone: 'info', icon: 'ri-draft-line', text: <><strong>{w.name}</strong> has unpublished changes</>, action: <Link className="btn btn-sm btn-light" to={builderUrl(w)}>Review &amp; publish</Link> })
    return out
  })
  const toneRank: Record<string, number> = { danger: 0, warning: 1, info: 2 }
  attention.sort((a, b) => toneRank[a.tone] - toneRank[b.tone])

  const quickAction = (w: Workflow) =>
    w.status === 'active' ? (
      <button type="button" className="btn btn-sm btn-icon btn-light" title="Pause" aria-label={`Pause ${w.name}`} onClick={() => pause.mutate(w.id)}><i className="ri-pause-line" /></button>
    ) : w.status === 'paused' ? (
      <button type="button" className="btn btn-sm btn-icon btn-light" title="Resume" aria-label={`Resume ${w.name}`} onClick={() => resume.mutate(w.id)}><i className="ri-play-line" /></button>
    ) : (
      <Link className="btn btn-sm btn-icon btn-light" title="Open builder to publish" aria-label={`Publish ${w.name}`} to={builderUrl(w)}><i className="ri-rocket-2-line" /></Link>
    )

  const menu = (w: Workflow) => {
    const items: (DropdownItem | 'divider')[] = [
      { key: 'edit', label: 'Open builder', icon: 'ri-git-branch-line', onSelect: () => navigate(builderUrl(w)) },
      { key: 'runs', label: 'View runs', icon: 'ri-pulse-line', onSelect: () => navigate(builderUrl(w, 'runs')) },
      { key: 'versions', label: 'Version history', icon: 'ri-git-commit-line', onSelect: () => navigate(builderUrl(w, 'versions')) },
    ]
    if (w.status === 'active') items.push({ key: 'pause', label: 'Pause', icon: 'ri-pause-line', onSelect: () => pause.mutate(w.id) })
    if (w.status === 'paused') items.push({ key: 'resume', label: 'Resume', icon: 'ri-play-line', onSelect: () => resume.mutate(w.id) })
    items.push('divider', { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(w) })
    return <MoreMenu items={items} />
  }

  const openRow = (e: MouseEvent, w: Workflow) => {
    if (!(e.target as HTMLElement).closest('button, a, [role="menu"]')) navigate(builderUrl(w))
  }

  const sortTh = (k: SortKey, children: ReactNode, end = false) => (
    <th className={`text-nowrap ${end ? 'text-end' : ''}`} aria-sort={sort.key === k ? (sort.desc ? 'descending' : 'ascending') : 'none'}>
      <button type="button" className={`th-sort ${sort.key === k ? 'active' : ''}`} onClick={() => toggleSort(k)}>
        {children}
        <i className={sort.key === k ? (sort.desc ? 'ri-arrow-down-s-fill' : 'ri-arrow-up-s-fill') : 'ri-expand-up-down-fill'} />
      </button>
    </th>
  )

  const activeFilters = [search, status, trigger].filter(Boolean).length
  const usedTriggers = [...new Set(all.map((w) => w.trigger.type))]

  const statusCell = (w: Workflow) => (
    <div className="d-flex flex-wrap align-items-center gap-1">
      <StatusBadge status={w.status === 'active' ? 'live' : w.status} label={statusLabel(w)} />
      {hasUnpublishedChanges(w) && <ToneBadge tone="warning" icon="ri-draft-line">Unpublished</ToneBadge>}
    </div>
  )

  const successCell = (s: WorkflowOverview) =>
    s.successRate == null ? (
      <span className="text-muted fs-sm">No runs</span>
    ) : (
      <div className="row-meter" title={`${s.completed} finished, ${s.failed} failed`}>
        <Meter value={s.successRate * 100} max={100} tone={successTone(s.successRate)} />
        <span>{Math.round(s.successRate * 100)}%</span>
      </div>
    )

  const inProgress = (s: WorkflowOverview) =>
    s.running + s.waiting > 0 ? (
      <span className="d-inline-flex align-items-center gap-2"><span className="live-dot on" />{s.running + s.waiting}</span>
    ) : (
      <span className="text-muted">0</span>
    )

  return (
    <>
      <PageHeader
        title="Automations"
        description="Journeys that react to what contacts do. Edit a draft, publish a version, and watch contacts move through it live."
        actions={<Guard permission="automations.manage"><button type="button" className="btn btn-primary" onClick={() => setPicking(true)}><i className="ri-add-line me-1" />Create automation</button></Guard>}
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Live workflows" icon="ri-rocket-2-line" loading={!workflows.data} value={all.filter((w) => w.status === 'active').length} hint={`of ${all.length} · ${plural(all.filter((w) => w.status === 'draft').length, 'draft')}`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Contacts in progress" icon="ri-loader-4-line" tone="info" loading={!overview.data} value={formatCompact(sum('running') + sum('waiting'))} hint={`${sum('waiting')} waiting on a delay or event`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Runs started" icon="ri-play-circle-line" tone="success" loading={!overview.data} value={formatCompact(dailyTotal.reduce((a, b) => a + b, 0))} hint={finished ? `last 14 days · ${formatRate(sum('completed'), finished)} succeeded` : 'last 14 days'} trend={dailyTotal} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Failed runs" icon="ri-error-warning-line" tone="danger" loading={!overview.data} value={sum('failed')} lowerIsBetter hint={sum('failed') ? 'retry them from Runs' : 'nothing to fix'} /></div>
      </div>

      {tab === 'workflows' && attention.length > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i className="ri-alarm-warning-line text-warning" />
            <h2 className="card-title mb-0 fs-6">Needs your attention</h2>
            <span className="badge bg-warning-subtle text-warning ms-1">{attention.length}</span>
          </div>
          <ul className="list-group list-group-flush">
            {attention.slice(0, 5).map((a) => (
              <li key={a.key} className="list-group-item d-flex align-items-center gap-3 py-2">
                <span className={`icon-tile icon-tile-sm bg-${a.tone}-subtle text-${a.tone}`}><i className={a.icon} /></span>
                <span className="flex-1 min-w-0">{a.text}</span>
                {a.action}
              </li>
            ))}
          </ul>
          {attention.length > 5 && <div className="card-footer text-muted fs-sm">and {attention.length - 5} more</div>}
        </div>
      )}

      <Tabs<Tab> className="mb-4" value={tab} onChange={(t) => setParams(t === 'workflows' ? {} : { tab: t }, { replace: true })} items={[{ value: 'workflows', label: 'Workflows', count: all.length }, { value: 'runs', label: 'All runs', icon: 'ri-pulse-line' }]} />

      {tab === 'runs' ? (
        <RunsTable />
      ) : workflows.isLoading ? (
        <SkeletonLines lines={6} />
      ) : all.length === 0 ? (
        <div className="card"><EmptyState icon="ri-git-branch-line" title="No automations yet" description="Start with a recipe like a welcome series or abandoned-cart reminder." action={<button type="button" className="btn btn-primary" onClick={() => setPicking(true)}>Create automation</button>} /></div>
      ) : (
        <>
          <FilterBar
            activeCount={activeFilters}
            onClear={() => { setSearch(''); setStatus(undefined); setTrigger(undefined) }}
            end={
              <div className="d-flex gap-2 align-items-center">
                {layout === 'cards' && (
                  <select className="form-select form-select-sm w-auto" aria-label="Sort by" value={`${sort.key}:${sort.desc ? 'desc' : 'asc'}`} onChange={(e) => { const [key, dir] = e.target.value.split(':'); setSort({ key: key as SortKey, desc: dir === 'desc' }) }}>
                    <option value="lastRun:desc">Recently run</option>
                    <option value="active:desc">Most in progress</option>
                    <option value="enrolled:desc">Most enrolled</option>
                    <option value="conversion:desc">Best conversion</option>
                    <option value="success:asc">Lowest success rate</option>
                    <option value="name:asc">Name A–Z</option>
                  </select>
                )}
                <Segmented<Layout> ariaLabel="Layout" value={layout} onChange={setLayout} options={[{ value: 'table', label: '', icon: 'ri-list-unordered', title: 'Table view' }, { value: 'cards', label: '', icon: 'ri-layout-grid-line', title: 'Card view' }]} />
              </div>
            }
          >
            <SearchInput value={search} onChange={setSearch} placeholder="Search automations…" />
            <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={[{ value: 'active', label: 'Live' }, { value: 'paused', label: 'Paused' }, { value: 'draft', label: 'Draft (never published)' }]} />
            <FilterSelect value={trigger} onChange={setTrigger} allLabel="All triggers" options={usedTriggers.map((t) => ({ value: t, label: TRIGGERS[t].label }))} />
          </FilterBar>

          {rows.length === 0 ? (
            <div className="card"><EmptyState icon="ri-filter-off-line" title="No automations match these filters" action={<button type="button" className="btn btn-light btn-sm" onClick={() => { setSearch(''); setStatus(undefined); setTrigger(undefined) }}>Clear filters</button>} /></div>
          ) : layout === 'table' ? (
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      {sortTh('name', 'Automation')}
                      <th>Status</th>
                      <th className="text-nowrap">Runs · 14d</th>
                      {sortTh('active', 'In progress', true)}
                      {sortTh('success', 'Success')}
                      {sortTh('conversion', 'Conversion', true)}
                      {sortTh('lastRun', 'Last run')}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((w) => {
                      const s = statsOf(w)
                      const t = TRIGGERS[w.trigger.type]
                      return (
                        <tr key={w.id} className="cursor-pointer" onClick={(e) => openRow(e, w)}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary" title={t.label}><i className={t.icon} /></span>
                              <div className="min-w-0">
                                <Link to={builderUrl(w)} className="fw-medium text-reset d-block text-truncate">{w.name}</Link>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <StepChain steps={w.steps} max={6} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{statusCell(w)}</td>
                          <td>{s.daily.some(Boolean) ? <Sparkline values={s.daily} width={84} height={24} /> : <span className="text-muted fs-sm">—</span>}</td>
                          <td className="text-end tabular-nums">
                            {inProgress(s)}
                            {s.failed > 0 && <div className="text-danger fs-xs">{s.failed} failed</div>}
                          </td>
                          <td>{successCell(s)}</td>
                          <td className="text-end tabular-nums">{formatRate(w.stats.goalReached, w.stats.enrolled)}{w.stats.enrolled > 0 && <div className="text-muted fs-xs">of {formatCompact(w.stats.enrolled)} enrolled</div>}</td>
                          <td className="text-muted text-nowrap">{s.lastRunAt ? formatRelativeTime(s.lastRunAt) : '—'}</td>
                          <td className="text-end text-nowrap">
                            <div className="d-inline-flex gap-1">{quickAction(w)}{menu(w)}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="wf-grid">
              {rows.map((w) => {
                const s = statsOf(w)
                const t = TRIGGERS[w.trigger.type]
                const channels = channelsOf(w.steps)
                return (
                  <article key={w.id} className="wf-card" onClick={(e) => openRow(e, w)}>
                    <div className="d-flex align-items-start gap-3 mb-2">
                      <span className="icon-tile bg-primary-subtle text-primary"><i className={t.icon} /></span>
                      <div className="min-w-0 flex-1">
                        <Link to={builderUrl(w)} className="fw-semibold text-reset d-block text-truncate">{w.name}</Link>
                        <span className="text-muted fs-sm">{t.label} · {plural(countSteps(w.steps), 'step')}</span>
                      </div>
                      {menu(w)}
                    </div>
                    <div className="mb-3">{statusCell(w)}</div>
                    {w.description && <p className="text-muted fs-sm mb-3 text-truncate">{w.description}</p>}
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                      <StepChain steps={w.steps} max={7} />
                      {s.daily.some(Boolean) && <Sparkline values={s.daily} width={72} height={22} />}
                    </div>
                    <div className="wf-card-stats">
                      <div><strong>{inProgress(s)}</strong><small>in progress</small></div>
                      <div><strong>{formatCompact(w.stats.enrolled)}</strong><small>enrolled</small></div>
                      <div><strong>{formatRate(w.stats.goalReached, w.stats.enrolled)}</strong><small>conversion</small></div>
                    </div>
                    <div className="mb-3">{successCell(s)}</div>
                    <div className="wf-card-foot">
                      <span className="d-inline-flex gap-1">
                        {channels.length ? channels.map((c) => <ChannelBadge key={c} channel={c} iconOnly />) : <span className="text-muted">No messages</span>}
                      </span>
                      <span className="text-muted ms-auto">{s.lastRunAt ? `Ran ${formatRelativeTime(s.lastRunAt)}` : 'Never run'}</span>
                      {quickAction(w)}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <section className="mt-5" aria-labelledby="recipes-title">
            <div className="d-flex align-items-baseline justify-content-between mb-3">
              <h2 id="recipes-title" className="fs-6 mb-0">Start from a template</h2>
              <span className="text-muted fs-sm">Creates a draft you can edit before publishing</span>
            </div>
            <div className="recipe-strip">
              {RECIPES.filter((r) => r.key !== 'blank').map((r) => (
                <button key={r.key} type="button" className="recipe-tile" disabled={create.isPending} onClick={() => create.mutate(r.key)}>
                  <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={r.icon} /></span>
                  <span className="min-w-0">
                    <strong>{r.title}</strong>
                    <span className="text-muted d-block">{r.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <Modal
        open={picking}
        onClose={closePicker}
        title="Create an automation"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={closePicker}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={create.isPending} onClick={() => create.mutate(recipe)}>{create.isPending ? 'Creating…' : 'Continue'}</button>
          </>
        }
      >
        <div className="row g-3">
          {RECIPES.map((r) => (
            <div key={r.key} className="col-md-6">
              <OptionCard selected={recipe === r.key} onSelect={() => setRecipe(r.key)} icon={r.icon} title={r.title} description={r.description} />
            </div>
          ))}
        </div>
        <p className="text-muted fs-sm mt-3 mb-0">New automations start as a draft. Nothing runs until you publish.</p>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete automation?"
        message={<>Contacts currently in <strong>{deleting?.name}</strong> leave it immediately and get no further steps. Its version history is deleted.</>}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
