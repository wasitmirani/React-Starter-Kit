import { useState } from 'react'
import { Link } from 'react-router-dom'
import { growthAnalyticsApi } from '@/api/endpoints/marketplace.api'
import { errorMessage } from '@/api/errors'
import { BarChart, compact, seriesColor, shortDate } from '@/components/charts'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { APP_CATALOG } from '@/constants/apps.constants'
import { regionLabel } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'

const RANGES = [7, 30, 90] as const
const appIdOf = (name: string) => APP_CATALOG.find((a) => a.name === name)?.id ?? name

export function ShippingDashboardPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const q = useTenantQuery('shipping-performance', [days], () => growthAnalyticsApi.shippingPerformance(days))
  const d = q.data
  const labels = d?.daily.map((p) => shortDate(p.date)) ?? []
  const series = d ? [{ key: 'delivered', label: 'Delivered', color: seriesColor(2), values: d.daily.map((p) => p.delivered) }, { key: 'failed', label: 'Failed', color: seriesColor(5), values: d.daily.map((p) => p.failed) }] : []

  return (
    <>
      <PageHeader
        title="Shipping performance"
        description="Courier scorecards across markets: on-time delivery, cost per parcel, failed attempts and COD."
        actions={<><Link to={ROUTES.COURIERS} className="btn btn-light btn-sm"><i className="ri-scales-3-line me-1" />Rate shopper</Link><Segmented ariaLabel="Date range" value={days} onChange={setDays} options={RANGES.map((r) => ({ value: r, label: `${r}d` }))} /></>}
      />
      {q.isError && <QueryError message={errorMessage(q.error)} onRetry={() => q.refetch()} />}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xxl-2"><StatCard label="Parcels" value={d?.totals.parcels.toLocaleString() ?? '—'} icon="ri-box-3-line" loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="On-time delivery" value={d ? formatPercent(d.totals.onTimeRate) : '—'} icon="ri-timer-line" tone="success" loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="Avg cost / parcel" value={d ? formatMoney(d.totals.avgCostUsd, 'USD') : '—'} icon="ri-money-dollar-box-line" tone="info" loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="Failed deliveries" value={d ? formatPercent(d.totals.failedRate) : '—'} icon="ri-error-warning-line" tone="danger" lowerIsBetter loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="Avg transit" value={d ? `${d.totals.avgTransitDays} days` : '—'} icon="ri-route-line" tone="primary" loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xxl-2"><StatCard label="Saved by rate shopping" value={d ? formatMoney(d.totals.savingsUsd, 'USD') : '—'} icon="ri-hand-coin-line" tone="warning" hint="vs. one default courier" loading={q.isLoading} /></div>
      </div>
      <div className="mb-4">
        <ChartPanel title="Deliveries per day" icon="ri-bar-chart-2-line" table={d && { labels, series, format: (v) => v.toLocaleString() }}>
          {d ? <BarChart height={220} labels={labels} series={series} format={compact} ariaLabel="Delivered and failed parcels per day" /> : <SkeletonLines lines={6} />}
        </ChartPanel>
      </div>
      <Panel title="Courier scorecard" icon="ri-medal-line" flush actions={<Link to={ROUTES.COURIERS} className="btn btn-sm btn-light">All couriers</Link>}>
        {d ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Courier</th><th>Market</th><th className="text-end">Parcels</th><th className="text-end">On-time</th><th className="text-end">Failed</th><th className="text-end">Transit</th><th className="text-end">Cost / parcel</th><th className="text-end">COD parcels</th></tr></thead>
              <tbody>
                {d.couriers.map((c) => (
                  <tr key={c.courier}>
                    <td><div className="d-flex align-items-center gap-2"><AppLogo appId={appIdOf(c.courier)} size="sm" /><span className="fw-medium">{c.courier}</span></div></td>
                    <td>{regionLabel(c.region)}</td>
                    <td className="text-end tabular-nums">{c.parcels.toLocaleString()}</td>
                    <td className={`text-end tabular-nums ${c.onTimeRate < 0.9 ? 'text-warning fw-medium' : 'text-success'}`}>{formatPercent(c.onTimeRate)}</td>
                    <td className={`text-end tabular-nums ${c.failedRate > 0.05 ? 'text-danger fw-medium' : ''}`}>{formatPercent(c.failedRate)}</td>
                    <td className="text-end tabular-nums">{c.avgTransitDays} d</td>
                    <td className="text-end tabular-nums">{formatMoney(c.avgCostUsd, 'USD')}</td>
                    <td className="text-end tabular-nums">{c.codParcels ? c.codParcels.toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-4"><SkeletonLines lines={6} /></div>}
      </Panel>
    </>
  )
}
