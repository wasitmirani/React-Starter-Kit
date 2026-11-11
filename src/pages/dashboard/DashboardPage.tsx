import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/api/endpoints/platform.api'
import { errorMessage } from '@/api/errors'
import { BarChart, DonutChart, LineChart, compact, seriesColor, shortDate } from '@/components/charts'
import { QueryError } from '@/components/common/Misc'
import { LaunchAndActions } from './LaunchChecklist'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPEN_ORDER_STATUSES, TASK_ICONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useAuth } from '@/hooks/useAuth'
import { useCan } from '@/hooks/useCan'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { delta, formatPercent } from '@/utils/formatters/number.formatter'

const RANGES = [7, 30, 90] as const

export function DashboardPage() {
  const { user } = useAuth()
  const can = useCan()
  const warehouses = useWarehouseOptions()
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const [warehouseId, setWarehouseId] = useState('')
  const overview = useTenantQuery('dashboard', [days, warehouseId], () => dashboardApi.overview(days, warehouseId || undefined))
  const d = overview.data
  const money = (v: number) => formatMoney(v, d?.currency ?? 'PKR')
  const kpi = (k: keyof NonNullable<typeof d>['kpis']) => (d ? delta(d.kpis[k].value, d.kpis[k].previous) : null)
  const labels = d?.daily.map((p) => shortDate(p.date)) ?? []
  const openStatuses = OPEN_ORDER_STATUSES.map((s) => ({ status: s, count: d?.ordersByStatus[s] ?? 0 }))

  return (
    <>
      <div className="dash-hero">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
          <div>
            <h4>{`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0] ?? 'there'}`} 👋</h4>
            <p>{d ? `Last ${days} days · ${d.timezone} · amounts in ${d.currency}` : 'Operations at a glance.'}</p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Link to={ROUTES.DASH_GLOBAL_SALES} className="hero-chip"><i className="ri-global-line" />Global sales</Link>
              <Link to={ROUTES.LISTINGS} className="hero-chip"><i className="ri-store-3-line" />Listings</Link>
              <Link to={ROUTES.APP_MARKETPLACE} className="hero-chip"><i className="ri-apps-2-add-line" />Add an app</Link>
              <Link to={ROUTES.AUTOMATION_TEMPLATES} className="hero-chip"><i className="ri-magic-line" />Automations</Link>
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <select className="form-select form-select-sm" style={{ minWidth: 200 }} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} aria-label="Warehouse">
              <option value="">All warehouses</option>
              {warehouses.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            <Segmented ariaLabel="Date range" value={days} onChange={setDays} options={RANGES.map((r) => ({ value: r, label: `${r}d` }))} />
          </div>
        </div>
      </div>
      {overview.isError && <QueryError message={errorMessage(overview.error)} onRetry={() => overview.refetch()} />}

      <LaunchAndActions />

      <div className="row g-4 mb-4 fade-up d1">
        {can('reports.read') && <div className="col-sm-6 col-xxl-2"><StatCard label="Revenue" value={d ? money(d.kpis.revenue.value) : '—'} icon="ri-money-dollar-circle-line" tone="success" delta={kpi('revenue')} loading={overview.isLoading} /></div>}
        <div className="col-sm-6 col-xxl-2"><Link to={ROUTES.ORDERS} className="d-block h-100"><StatCard label="Orders" value={d?.kpis.orders.value.toLocaleString() ?? '—'} icon="ri-shopping-bag-3-line" delta={kpi('orders')} loading={overview.isLoading} /></Link></div>
        <div className="col-sm-6 col-xxl-2"><Link to={ROUTES.SHIPMENTS} className="d-block h-100"><StatCard label="Units shipped" value={d?.kpis.unitsShipped.value.toLocaleString() ?? '—'} icon="ri-truck-line" tone="info" delta={kpi('unitsShipped')} loading={overview.isLoading} /></Link></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="On-time dispatch" value={d ? formatPercent(d.kpis.onTimeDispatch.value) : '—'} icon="ri-timer-line" tone="primary" delta={kpi('onTimeDispatch')} hint="Before warehouse cutoff" loading={overview.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><Link to={ROUTES.INVENTORY} className="d-block h-100"><StatCard label="Inventory value" value={d ? compact(d.kpis.inventoryValue.value) : '—'} icon="ri-stack-line" tone="warning" hint="On hand × unit cost" loading={overview.isLoading} /></Link></div>
        <div className="col-sm-6 col-xxl-2"><Link to={ROUTES.RETURNS} className="d-block h-100"><StatCard label="Return rate" value={d ? formatPercent(d.kpis.returnRate.value) : '—'} icon="ri-arrow-go-back-line" tone="pink" delta={kpi('returnRate')} lowerIsBetter loading={overview.isLoading} /></Link></div>
      </div>

      <div className="row g-4 mb-4 fade-up d2">
        <div className="col-xl-8">
          <ChartPanel title="Orders and shipments" icon="ri-line-chart-line" description="Orders placed vs. shipments booked per day" table={d && { labels, series: [{ key: 'orders', label: 'Orders', color: seriesColor(1), values: d.daily.map((p) => p.orders) }, { key: 'shipped', label: 'Shipped', color: seriesColor(2), values: d.daily.map((p) => p.shipped) }], format: (v) => v.toLocaleString() }}>
            {d ? <LineChart area labels={labels} series={[{ key: 'orders', label: 'Orders', color: seriesColor(1), values: d.daily.map((p) => p.orders) }, { key: 'shipped', label: 'Shipped', color: seriesColor(2), values: d.daily.map((p) => p.shipped) }]} ariaLabel="Orders and shipments per day" /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-4">
          <Panel title="Open order pipeline" icon="ri-flow-chart" className="h-100" actions={<Link to={ROUTES.ORDERS} className="btn btn-sm btn-light">Orders</Link>}>
            {d ? (
              <ul className="list-unstyled mb-0">
                {openStatuses.map(({ status, count }) => (
                  <li key={status} className="d-flex justify-content-between align-items-center py-2 border-bottom border-dashed">
                    <Link to={`${ROUTES.ORDERS}?status=${status}`}><StatusBadge status={status} /></Link>
                    <span className="tabular-nums fw-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            ) : <SkeletonLines lines={7} />}
          </Panel>
        </div>
      </div>

      <div className="row g-4 mb-4 fade-up d3">
        <div className="col-xl-4">
          <Panel title="Exceptions" icon="ri-alarm-warning-line" className="h-100">
            {d ? (
              <div className="row g-3">
                {[
                  { label: 'On hold', value: d.exceptions.onHold, link: `${ROUTES.ORDERS}?status=on_hold`, icon: 'ri-pause-circle-line', tone: 'orange' },
                  { label: 'Delivery failed', value: d.exceptions.deliveryFailed, link: ROUTES.TRACKING_EXCEPTIONS, icon: 'ri-error-warning-line', tone: 'danger' },
                  { label: 'Short picks', value: d.exceptions.shortPicks, link: `${ROUTES.TASKS}?status=exception`, icon: 'ri-hand-coin-line', tone: 'warning' },
                  { label: 'Failed sync events', value: d.exceptions.failedEvents, link: `${ROUTES.FAILED_EVENTS}?status=failed`, icon: 'ri-plug-line', tone: 'danger' },
                ].map((x) => (
                  <div key={x.label} className="col-6">
                    <Link to={x.link} className="d-block p-3 rounded border h-100">
                      <i className={`${x.icon} text-${x.tone} fs-4`} />
                      <div className="fs-3 fw-semibold tabular-nums">{x.value}</div>
                      <div className="text-muted fs-sm">{x.label}</div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : <SkeletonLines lines={5} />}
          </Panel>
        </div>
        <div className="col-xl-4">
          <ChartPanel title="Revenue by channel" icon="ri-store-2-line" className="h-100" table={d && { labels: d.ordersByChannel.map((c) => c.channel), series: [{ key: 'revenue', label: 'Revenue', color: seriesColor(1), values: d.ordersByChannel.map((c) => c.revenue) }], format: money }}>
            {d ? <DonutChart ariaLabel="Revenue by channel" centerLabel="Revenue" format={compact} slices={d.ordersByChannel.map((c, i) => ({ key: c.channel, label: c.channel, value: c.revenue, color: seriesColor(i + 1) }))} /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-4">
          <Panel title="Warehouse backlog" icon="ri-task-line" className="h-100" actions={<Link to={ROUTES.TASKS} className="btn btn-sm btn-light">Tasks</Link>}>
            {d ? (
              <>
                <BarChart height={160} labels={d.taskBacklog.map((t) => humanize(t.type))} series={[{ key: 'open', label: 'Open', color: seriesColor(1), values: d.taskBacklog.map((t) => t.open) }, { key: 'overdue', label: 'Overdue', color: seriesColor(5), values: d.taskBacklog.map((t) => t.overdue) }]} ariaLabel="Open and overdue tasks by type" />
                <div className="d-flex flex-wrap gap-3 mt-3 fs-sm">
                  {d.taskBacklog.filter((t) => t.overdue).map((t) => <Link key={t.type} to={`${ROUTES.TASKS}?type=${t.type}`} className="text-danger"><i className={TASK_ICONS[t.type]} /> {t.overdue} {t.type} overdue</Link>)}
                </div>
              </>
            ) : <SkeletonLines lines={6} />}
          </Panel>
        </div>
      </div>

      <div className="row g-4 fade-up d4">
        <div className="col-xl-5">
          <Panel title="Low stock" icon="ri-alert-line" flush actions={<Link to={ROUTES.REPLENISHMENT} className="btn btn-sm btn-light">Replenish</Link>}>
            {d ? (
              d.lowStock.length ? (
                <table className="table align-middle mb-0">
                  <tbody>
                    {d.lowStock.map((s) => (
                      <tr key={s.sku + s.warehouse}>
                        <td><div className="font-monospace fw-medium">{s.sku}</div><div className="text-muted fs-sm text-truncate" style={{ maxWidth: 240 }}>{s.title} · {s.warehouse}</div></td>
                        <td className="text-end"><span className={`tabular-nums fw-semibold ${s.available <= 0 ? 'text-danger' : 'text-warning'}`}>{s.available}</span><div className="text-muted fs-xs">reorder at {s.reorderPoint}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-muted p-4 mb-0">All SKUs are above reorder point.</p>
            ) : <div className="p-4"><SkeletonLines lines={5} /></div>}
          </Panel>
        </div>
        <div className="col-xl-3">
          <Panel title="Inbound" icon="ri-inbox-archive-line" className="h-100">
            {d ? (
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom border-dashed"><Link to={`${ROUTES.PURCHASE_ORDERS}?status=approved`}>POs due in 7 days</Link><strong className="tabular-nums">{d.inbound.purchaseOrdersDue}</strong></li>
                <li className="d-flex justify-content-between py-2 border-bottom border-dashed"><Link to={`${ROUTES.RECEIPTS}?status=expected`}>Receipts expected</Link><strong className="tabular-nums">{d.inbound.receiptsExpected}</strong></li>
                <li className="d-flex justify-content-between py-2"><span>Units incoming</span><strong className="tabular-nums">{d.inbound.unitsIncoming.toLocaleString()}</strong></li>
              </ul>
            ) : <SkeletonLines lines={3} />}
          </Panel>
        </div>
        <div className="col-xl-4">
          <Panel title="Channel health" icon="ri-plug-line" flush actions={<Link to={ROUTES.CHANNELS} className="btn btn-sm btn-light">Channels</Link>}>
            {d ? (
              <ul className="list-group list-group-flush">
                {d.channelHealth.map((c) => (
                  <li key={c.name} className="list-group-item d-flex justify-content-between align-items-center gap-2">
                    <div className="min-w-0"><div className="text-truncate">{c.name}</div><div className="text-muted fs-xs">{c.lastSyncAt ? `Synced ${formatRelativeTime(c.lastSyncAt)}` : 'Manual'}{c.errors24h ? ` · ${c.errors24h} errors` : ''}</div></div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            ) : <div className="p-4"><SkeletonLines lines={5} /></div>}
          </Panel>
        </div>
      </div>
    </>
  )
}
