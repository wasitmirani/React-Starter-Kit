import { useState, type ReactNode } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link } from 'react-router-dom'
import { workflowsApi } from '@/api/endpoints/automation.api'
import { channelAccountsApi, domainsApi } from '@/api/endpoints/channels.api'
import { contactsApi, tasksApi } from '@/api/endpoints/crm.api'
import { inboxApi } from '@/api/endpoints/inbox.api'
import { campaignsApi } from '@/api/endpoints/messaging.api'
import { analyticsApi, notificationsApi } from '@/api/endpoints/platform.api'
import { CHANNEL_SERIES_SLOT, DonutChart, LineChart, Sparkline, compact, seriesColor, shortDate } from '@/components/charts'
import { PageHeader } from '@/components/common/PageHeader'
import { RangePicker } from '@/components/common/RangePicker'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { Meter } from '@/components/ui/Controls'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useNow } from '@/hooks/useNow'
import { useAction, useAll, useList, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Tone } from '@/types/common.types'
import type { AppNotification } from '@/types/platform.types'
import { formatCurrency } from '@/utils/formatters/currency.formatter'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { delta, formatRate } from '@/utils/formatters/number.formatter'

type Metric = 'sent' | 'delivered' | 'engaged'

const METRICS: { value: Metric; label: string }[] = [
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'engaged', label: 'Engaged' },
]

const SETUP_HIDDEN_KEY = 'birdcrm.dashboard.setup-hidden'

const NOTIFICATION_ICON: Record<AppNotification['type'], [string, Tone]> = {
  info: ['ri-information-line', 'info'],
  success: ['ri-checkbox-circle-line', 'success'],
  warning: ['ri-alert-line', 'warning'],
  error: ['ri-error-warning-line', 'danger'],
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

interface Alert {
  key: string
  tone: Tone
  icon: string
  title: string
  body: ReactNode
  link: string
}

export function DashboardPage() {
  const { user } = useAuth()
  const now = useNow(60_000)
  const [days, setDays] = useState(30)
  const [metric, setMetric] = useState<Metric>('sent')
  const [setupHidden, setSetupHidden] = useState(() => localStorage.getItem(SETUP_HIDDEN_KEY) === '1')

  const overview = useTenantQuery('analytics', days, () => analyticsApi.overview(days))
  const campaigns = useList('campaigns', campaignsApi.list, { perPage: 5, sort: 'updatedAt', order: 'desc' })
  const counts = useTenantQuery('conversations', { counts: user?.name }, () => inboxApi.counts(user?.name ?? ''))
  const tasks = useList('tasks', tasksApi.list, { perPage: 5, sort: 'dueAt', order: 'asc', filters: { done: 'false' } })
  const toggleTask = useAction('tasks', (id: string) => tasksApi.update(id, { done: true }), { success: 'Task completed' })
  const workflows = useAll('workflows', workflowsApi.list)
  const runs = useTenantQuery('executions', 'overview', workflowsApi.overview, { refetchInterval: 10_000 })
  const accounts = useAll('channel-accounts', channelAccountsApi.list)
  const domains = useAll('domains', domainsApi.list)
  const contacts = useList('contacts', contactsApi.list, { perPage: 1 })
  const sentCampaigns = useList('campaigns', campaignsApi.list, { perPage: 1, filters: { status: 'completed' } })
  const activity = useList('notifications', notificationsApi.list, { perPage: 6 })

  const data = overview.data
  const t = data?.totals
  const p = data?.previous
  const labels = data?.series[0].points.map((pt) => shortDate(pt.date)) ?? []
  const volume =
    data?.series.map((s) => ({
      key: s.channel,
      label: CHANNELS[s.channel].label,
      color: seriesColor(CHANNEL_SERIES_SLOT[s.channel]),
      values: s.points.map((pt) => pt[metric]),
    })) ?? []
  const daily = (key: 'sent' | 'delivered' | 'engaged' | 'failed') => data?.series[0].points.map((_, i) => data.series.reduce((n, s) => n + s.points[i][key], 0)) ?? []
  const ratio = (a: number[], b: number[]) => a.map((v, i) => (b[i] ? v / b[i] : 0))
  const metricLabel = METRICS.find((m) => m.value === metric)!.label.toLowerCase()

  // ── Needs attention ──────────────────────────────────────────────
  const wfRows = workflows.data?.data ?? []
  const runStats = runs.data ?? {}
  const failedRuns = Object.values(runStats).reduce((n, s) => n + s.failed, 0)
  const brokenAccounts = (accounts.data?.data ?? []).filter((a) => a.status === 'error' || a.status === 'disconnected')
  const pendingDomains = (domains.data?.data ?? []).filter((d) => d.status !== 'verified')
  const overdue = (tasks.data?.data ?? []).filter((x) => x.dueAt && Date.parse(x.dueAt) < now)
  const alerts: Alert[] = [
    ...brokenAccounts.map((a): Alert => ({ key: `acc-${a.id}`, tone: 'danger', icon: CHANNELS[a.channel].icon, title: `${a.name} ${a.status === 'error' ? 'needs reconnecting' : 'is disconnected'}`, body: a.statusDetail ?? `${CHANNELS[a.channel].label} messages are not being received.`, link: ROUTES.CHANNELS })),
    ...(failedRuns ? [{ key: 'runs', tone: 'danger' as Tone, icon: 'ri-git-branch-line', title: `${failedRuns} automation run${failedRuns === 1 ? '' : 's'} failed`, body: 'Review the error and retry from the step that failed.', link: `${ROUTES.AUTOMATIONS}?tab=runs` }] : []),
    ...pendingDomains.map((d): Alert => ({ key: `dom-${d.id}`, tone: 'warning', icon: 'ri-shield-check-line', title: `${d.domain} is not verified`, body: 'Add the DNS records so email lands in the inbox, not spam.', link: ROUTES.CHANNEL_EMAIL })),
    ...(counts.data?.unassigned ? [{ key: 'inbox', tone: 'warning' as Tone, icon: 'ri-inbox-line', title: `${counts.data.unassigned} unassigned conversation${counts.data.unassigned === 1 ? '' : 's'}`, body: 'Customers are waiting for someone to pick these up.', link: ROUTES.INBOX }] : []),
    ...(overdue.length ? [{ key: 'tasks', tone: 'info' as Tone, icon: 'ri-task-line', title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`, body: overdue[0].title, link: ROUTES.TASKS }] : []),
  ]
  const attentionLoading = !accounts.data || !domains.data || !runs.data || !counts.data

  // ── Setup checklist ──────────────────────────────────────────────
  const setup = [
    { label: 'Connect a messaging channel', done: (accounts.data?.data ?? []).some((a) => a.status === 'connected'), link: ROUTES.CHANNELS },
    { label: 'Verify your sending domain', done: !!domains.data && domains.data.data.length > 0 && pendingDomains.length === 0, link: ROUTES.CHANNEL_EMAIL },
    { label: 'Import your contacts', done: (contacts.data?.total ?? 0) > 0, link: ROUTES.CONTACT_IMPORT },
    { label: 'Send your first campaign', done: (sentCampaigns.data?.total ?? 0) > 0, link: ROUTES.CAMPAIGN_NEW },
    { label: 'Publish an automation', done: wfRows.some((w) => w.version > 0), link: ROUTES.AUTOMATIONS },
  ]
  const setupDone = setup.filter((s) => s.done).length
  const setupReady = !!accounts.data && !!domains.data && !!contacts.data && !!sentCampaigns.data && !!workflows.data
  const showSetup = setupReady && !setupHidden && setupDone < setup.length
  const hideSetup = () => {
    localStorage.setItem(SETUP_HIDDEN_KEY, '1')
    setSetupHidden(true)
  }

  // ── Live automations ─────────────────────────────────────────────
  const liveFlows = wfRows
    .filter((w) => w.status === 'active')
    .map((w) => ({ w, s: runStats[w.id] }))
    .sort((a, b) => (b.s ? b.s.running + b.s.waiting : 0) - (a.s ? a.s.running + a.s.waiting : 0))
    .slice(0, 5)
  const inFlight = Object.values(runStats).reduce((n, s) => n + s.running + s.waiting, 0)

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0] ?? 'there'}`}
        description={`${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · here is how your messaging, conversations and automations are doing.`}
        actions={
          <>
            <RangePicker value={days} onChange={setDays} />
            <Guard permission="automations.manage">
              <Link to={`${ROUTES.AUTOMATIONS}?new=1`} className="btn btn-light">
                <i className="ri-git-branch-line me-1" /> New automation
              </Link>
            </Guard>
            <Guard permission="campaigns.manage">
              <Link to={ROUTES.CAMPAIGN_NEW} className="btn btn-primary">
                <i className="ri-send-plane-line me-1" /> New campaign
              </Link>
            </Guard>
          </>
        }
      />

      <div className="row g-4 mb-4">
        <div className={showSetup ? 'col-xl-8' : 'col-12'}>
          <Panel
            icon="ri-alarm-warning-line"
            title={<span className="d-inline-flex align-items-center gap-2">Needs your attention{alerts.length > 0 && <span className="badge bg-warning-subtle text-warning">{alerts.length}</span>}</span>}
            className="h-100 mb-0"
          >
            {attentionLoading ? (
              <SkeletonLines lines={3} />
            ) : alerts.length === 0 ? (
              <div className="attention-ok"><i className="ri-checkbox-circle-fill fs-5" />Everything looks healthy. Channels are connected and nothing is waiting on you.</div>
            ) : (
              <div className="attention-grid">
                {alerts.map((a) => (
                  <Link key={a.key} to={a.link} className="attention-item">
                    <span className={`icon-tile icon-tile-sm bg-${a.tone}-subtle text-${a.tone}`}><i className={a.icon} /></span>
                    <span className="min-w-0">
                      <strong className="text-truncate">{a.title}</strong>
                      <span className="text-muted d-block">{a.body}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
        {showSetup && (
          <div className="col-xl-4">
            <Panel
              icon="ri-rocket-2-line"
              title="Finish setting up"
              description={`${setupDone} of ${setup.length} done`}
              actions={<button type="button" className="btn btn-sm btn-icon btn-light" aria-label="Hide setup checklist" title="Hide" onClick={hideSetup}><i className="ri-close-line" /></button>}
              className="h-100 mb-0"
            >
              <Meter value={setupDone} max={setup.length} tone="success" className="mb-3" />
              <ul className="setup-list">
                {setup.map((s) => (
                  <li key={s.label} className={s.done ? 'done' : ''}>
                    <span className="setup-check">{s.done && <i className="ri-check-line" />}</span>
                    <span className="setup-label flex-1">{s.label}</span>
                    {!s.done && <Link to={s.link} className="btn btn-sm btn-light">Start</Link>}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Messages sent" icon="ri-send-plane-line" loading={!t} value={t && compact(t.sent)} delta={t && p ? delta(t.sent, p.sent) : null} hint={`vs previous ${days}d`} trend={daily('sent')} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Delivery rate" icon="ri-checkbox-circle-line" tone="success" loading={!t} value={t && formatRate(t.delivered, t.sent)} delta={t && p ? delta(t.delivered / t.sent, p.delivered / p.sent) : null} hint={t && `${compact(t.failed)} failed`} trend={ratio(daily('delivered'), daily('sent'))} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Engagement rate" icon="ri-cursor-line" tone="info" loading={!t} value={t && formatRate(t.engaged, t.delivered)} delta={t && p ? delta(t.engaged / t.delivered, p.engaged / p.delivered) : null} hint="opens, clicks, replies" trend={ratio(daily('engaged'), daily('delivered'))} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Attributed revenue" icon="ri-money-dollar-circle-line" tone="warning" loading={!t} value={t && formatCurrency(t.revenue).replace(/\.00$/, '')} delta={t && p ? delta(t.revenue, p.revenue) : null} hint={t && `${compact(t.newContacts)} new contacts`} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <ChartPanel
            icon="ri-line-chart-line"
            title={`Messages ${metricLabel} by channel`}
            description={`Daily volume, last ${days} days`}
            className="h-100 mb-0"
            actions={<Segmented<Metric> ariaLabel="Metric" value={metric} onChange={setMetric} options={METRICS} />}
            table={{ labels, series: volume, format: compact }}
          >
            {data ? <LineChart labels={labels} series={volume} height={280} ariaLabel={`Messages ${metricLabel} per day by channel`} /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-4">
          <Panel icon="ri-pie-chart-2-line" title="Channel mix" description={`Share of messages ${metricLabel}`} className="h-100 mb-0">
            {data ? (
              <DonutChart
                centerLabel={metricLabel}
                ariaLabel={`Share of messages ${metricLabel} by channel`}
                slices={data.series.map((s) => ({
                  key: s.channel,
                  label: CHANNELS[s.channel].label,
                  color: seriesColor(CHANNEL_SERIES_SLOT[s.channel]),
                  value: s.points.reduce((n, pt) => n + pt[metric], 0),
                }))}
              />
            ) : (
              <SkeletonLines lines={5} />
            )}
          </Panel>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-7">
          <Panel icon="ri-send-plane-line" title="Recent campaigns" actions={<Link to={ROUTES.CAMPAIGNS} className="btn btn-sm btn-light">View all</Link>} flush className="h-100 mb-0">
            {campaigns.isLoading ? (
              <div className="p-4"><SkeletonLines lines={5} /></div>
            ) : (campaigns.data?.data.length ?? 0) === 0 ? (
              <EmptyState icon="ri-send-plane-line" title="No campaigns yet" action={<Link to={ROUTES.CAMPAIGN_NEW} className="btn btn-primary btn-sm">Create campaign</Link>} />
            ) : (
              <ul className="list-group list-group-flush">
                {campaigns.data!.data.map((c) => {
                  const engaged = c.stats.opened || c.stats.clicked || c.stats.replied
                  return (
                    <li key={c.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                      <ChannelBadge channel={c.channel} iconOnly />
                      <div className="min-w-0 flex-1">
                        <Link to={to(ROUTES.CAMPAIGN, { id: c.id })} className="fw-medium text-reset d-block text-truncate">{c.name}</Link>
                        <span className="text-muted fs-sm">{c.stats.sent ? `${compact(c.stats.sent)} sent · ${c.sentAt ? formatRelativeTime(c.sentAt) : 'sending'}` : `Updated ${formatRelativeTime(c.updatedAt)}`}</span>
                      </div>
                      {c.stats.delivered > 0 && (
                        <div className="d-none d-md-block" style={{ width: '9rem' }} title={`${formatRate(engaged, c.stats.delivered)} of delivered engaged`}>
                          <div className="d-flex justify-content-between fs-xs text-muted mb-1"><span>Engaged</span><span className="tabular-nums">{formatRate(engaged, c.stats.delivered)}</span></div>
                          <Meter value={engaged} max={c.stats.delivered} tone="info" />
                        </div>
                      )}
                      <StatusBadge status={c.status} />
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>
        <div className="col-xl-5">
          <Panel
            title={<span className="d-inline-flex align-items-center gap-2">Live automations{inFlight > 0 && <span className="d-inline-flex align-items-center gap-1 fs-sm text-muted fw-normal"><span className="live-dot on" />{inFlight} in progress</span>}</span>}
            actions={<Link to={ROUTES.AUTOMATIONS} className="btn btn-sm btn-light">All automations</Link>}
            flush
            className="h-100 mb-0"
          >
            {!workflows.data ? (
              <div className="p-4"><SkeletonLines lines={5} /></div>
            ) : liveFlows.length === 0 ? (
              <EmptyState icon="ri-git-branch-line" title="Nothing live yet" description="Publish an automation to start reacting to what contacts do." action={<Link to={`${ROUTES.AUTOMATIONS}?new=1`} className="btn btn-primary btn-sm">Create automation</Link>} />
            ) : (
              <ul className="list-group list-group-flush">
                {liveFlows.map(({ w, s }) => (
                  <li key={w.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link to={to(ROUTES.AUTOMATION, { id: w.id })} className="fw-medium text-reset d-block text-truncate">{w.name}</Link>
                      <span className="text-muted fs-sm d-inline-flex align-items-center gap-2">
                        {s && s.running + s.waiting > 0 ? <><span className="live-dot on" />{s.running + s.waiting} in progress</> : 'Idle'}
                        {s?.failed ? <span className="text-danger">· {s.failed} failed</span> : null}
                      </span>
                    </div>
                    {s && s.daily.some(Boolean) && <Sparkline values={s.daily} width={72} height={24} />}
                    <span className="text-end tabular-nums" style={{ minWidth: '3.5rem' }}>
                      <span className="d-block fw-semibold">{s?.successRate == null ? '—' : `${Math.round(s.successRate * 100)}%`}</span>
                      <span className="text-muted fs-xs">success</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-xl-4">
          <Panel icon="ri-inbox-line" title="Inbox" actions={<Link to={ROUTES.INBOX} className="btn btn-sm btn-light">Open</Link>} className="h-100 mb-0">
            {counts.data ? (
              <>
                <div className="d-flex gap-4 mb-4">
                  <div>
                    <div className="stat-value fs-4">{counts.data.open}</div>
                    <div className="text-muted fs-sm">open</div>
                  </div>
                  <div>
                    <div className="stat-value fs-4 text-warning">{counts.data.unassigned}</div>
                    <div className="text-muted fs-sm">unassigned</div>
                  </div>
                  <div>
                    <div className="stat-value fs-4">{counts.data.mine}</div>
                    <div className="text-muted fs-sm">mine</div>
                  </div>
                </div>
                <ul className="list-unstyled mb-0">
                  {Object.entries(counts.data.byChannel).map(([channel, n]) => {
                    const meta = CHANNELS[channel as keyof typeof CHANNELS]
                    return (
                      <li key={channel} className="d-flex align-items-center gap-2 py-1">
                        <i className={`${meta.icon} text-muted`} />
                        <span style={{ width: '5.5rem' }}>{meta.label}</span>
                        <Meter value={n} max={Math.max(1, counts.data!.open)} className="flex-1" />
                        <span className="fw-medium tabular-nums" style={{ minWidth: '1.5rem', textAlign: 'right' }}>{n}</span>
                      </li>
                    )
                  })}
                </ul>
                {t && <p className="text-muted fs-sm mb-0 mt-3">Avg. first response: <strong className="text-body">{t.avgFirstResponseMin} min</strong></p>}
              </>
            ) : (
              <SkeletonLines lines={5} />
            )}
          </Panel>
        </div>
        <div className="col-md-6 col-xl-4">
          <Panel icon="ri-task-line" title="My tasks" actions={<Link to={ROUTES.TASKS} className="btn btn-sm btn-light">All</Link>} flush className="h-100 mb-0">
            {tasks.isLoading ? (
              <div className="p-4"><SkeletonLines lines={4} /></div>
            ) : (tasks.data?.data.length ?? 0) === 0 ? (
              <EmptyState icon="ri-task-line" title="Nothing due" description="You are all caught up." />
            ) : (
              <ul className="list-group list-group-flush">
                {tasks.data!.data.map((task) => {
                  const late = task.dueAt && Date.parse(task.dueAt) < now
                  return (
                    <li key={task.id} className="list-group-item d-flex gap-2 py-3">
                      <input className="form-check-input mt-1 flex-shrink-0" type="checkbox" aria-label={`Complete ${task.title}`} onChange={() => toggleTask.mutate(task.id)} />
                      <div className="min-w-0">
                        <div className="text-truncate">{task.title}</div>
                        <div className={`fs-xs ${late ? 'text-danger' : 'text-muted'}`}>{task.dueAt ? `${late ? 'Overdue · ' : 'Due '}${formatRelativeTime(task.dueAt)}` : 'No due date'}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>
        <div className="col-xl-4">
          <Panel icon="ri-pulse-line" title="Recent activity" className="h-100 mb-0">
            {activity.isLoading ? (
              <SkeletonLines lines={5} />
            ) : (activity.data?.data.length ?? 0) === 0 ? (
              <EmptyState icon="ri-notification-3-line" title="No activity yet" />
            ) : (
              <ul className="activity-feed">
                {activity.data!.data.map((n) => {
                  const [icon, tone] = NOTIFICATION_ICON[n.type]
                  const body = (
                    <>
                      <div className="fw-medium text-body">{n.title}{!n.read && <span className="unread" aria-label="unread" />}</div>
                      <div className="text-muted fs-sm text-truncate-2">{n.body}</div>
                      <div className="text-muted fs-xs mt-1">{formatRelativeTime(n.createdAt)}</div>
                    </>
                  )
                  return (
                    <li key={n.id}>
                      <span className={`icon-tile bg-${tone}-subtle text-${tone}`}><i className={icon} /></span>
                      <div className="min-w-0">{n.link ? <Link to={n.link} className="text-reset">{body}</Link> : body}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
