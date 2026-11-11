import { useState } from 'react'
import { Link } from 'react-router-dom'
import { growthAnalyticsApi } from '@/api/endpoints/marketplace.api'
import { errorMessage } from '@/api/errors'
import { BarChart, DonutChart, LineChart, compact, seriesColor, shortDate } from '@/components/charts'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { APP_CATALOG } from '@/constants/apps.constants'
import { regionLabel, regionOf, TARGET_REGIONS } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { delta, formatPercent } from '@/utils/formatters/number.formatter'

const RANGES = [7, 30, 90] as const
const usd = (v: number) => formatMoney(v, 'USD')

/** Best-effort provider for a marketplace row label, for its logo tile. */
const providerOf = (name: string) => APP_CATALOG.find((a) => name.toLowerCase().includes(a.id.replace('_', ' ')) || name.toLowerCase().startsWith(a.name.split(' ')[0].toLowerCase()))?.id ?? 'store'

export function GlobalSalesDashboardPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const [region, setRegion] = useState('')
  const q = useTenantQuery('global-sales', [days, region], () => growthAnalyticsApi.globalSales(days, region || undefined))
  const d = q.data
  const labels = d?.daily.map((p) => shortDate(p.date)) ?? []
  const regionSeries = (d?.regions ?? []).map((r, i) => ({ key: r.region, label: `${regionOf(r.region)?.flag ?? ''} ${regionOf(r.region)?.short ?? r.region}`, color: seriesColor(i + 1), values: d!.daily.map((p) => p.byRegion[r.region] ?? 0) }))
  const maxRegion = Math.max(1, ...(d?.regions ?? []).map((r) => r.revenueUsd))

  return (
    <>
      <PageHeader
        title="Global sales"
        description={`Every market and marketplace in one view, converted to USD for comparison${d ? ` · last ${days} days` : ''}.`}
        actions={<><Link to={ROUTES.DASH_SHIPPING} className="btn btn-light btn-sm"><i className="ri-truck-line me-1" />Shipping performance</Link><Segmented ariaLabel="Date range" value={days} onChange={setDays} options={RANGES.map((r) => ({ value: r, label: `${r}d` }))} /></>}
      />
      {q.isError && <QueryError message={errorMessage(q.error)} onRetry={() => q.refetch()} />}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xxl-2">
          <button type="button" className={`region-card ${!region ? 'active' : ''}`} onClick={() => setRegion('')}>
            <div className="flag">🌍</div><div className="fw-semibold mt-2">All markets</div><div className="text-muted fs-sm tabular-nums">{d && !region ? usd(d.totals.revenueUsd) : 'Combined view'}</div>
          </button>
        </div>
        {TARGET_REGIONS.map((r) => {
          const row = d?.regions.find((x) => x.region === r.code)
          const change = row ? delta(row.revenueUsd, row.previousUsd) : null
          return (
            <div key={r.code} className="col-6 col-md-4 col-xxl-2">
              <button type="button" className={`region-card ${region === r.code ? 'active' : ''}`} onClick={() => setRegion(region === r.code ? '' : r.code)} aria-pressed={region === r.code}>
                <div className="d-flex justify-content-between"><span className="flag">{r.flag}</span>{change != null && <span className={`fs-xs fw-semibold ${change >= 0 ? 'text-success' : 'text-danger'}`}>{change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(change))}</span>}</div>
                <div className="fw-semibold mt-2">{r.short}</div>
                <div className="text-muted fs-sm tabular-nums">{row ? formatMoney(row.revenueLocal, row.currency) : region ? '—' : '…'}</div>
                {row && <div className="share-bar mt-2"><span style={{ width: `${(row.revenueUsd / maxRegion) * 100}%` }} /></div>}
              </button>
            </div>
          )
        })}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Revenue (USD)" value={d ? usd(d.totals.revenueUsd) : '—'} icon="ri-money-dollar-circle-line" tone="success" delta={d ? delta(d.totals.revenueUsd, d.totals.previousUsd) : null} loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Orders" value={d?.totals.orders.toLocaleString() ?? '—'} icon="ri-shopping-bag-3-line" delta={d ? delta(d.totals.orders, d.totals.previousOrders) : null} loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Est. gross profit" value={d ? usd(d.totals.profitUsd) : '—'} icon="ri-funds-line" tone="primary" hint={d ? `${formatPercent(d.totals.profitUsd / Math.max(1, d.totals.revenueUsd))} margin after fees` : undefined} loading={q.isLoading} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Marketplace fees" value={d ? usd(d.totals.feesUsd) : '—'} icon="ri-percent-line" tone="warning" hint={d ? `${d.totals.activeListings} live listings on ${d.totals.marketplaces} accounts` : undefined} lowerIsBetter loading={q.isLoading} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <ChartPanel title="Revenue by market" icon="ri-line-chart-line" description="Daily revenue in USD" table={d && { labels, series: regionSeries, format: usd }}>
            {d ? <LineChart labels={labels} series={regionSeries} format={compact} ariaLabel="Daily revenue by market" /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-4">
          <ChartPanel title="Share by channel" icon="ri-pie-chart-2-line" className="h-100" table={d && { labels: d.byMarketplace.map((m) => m.marketplace), series: [{ key: 'rev', label: 'Revenue', color: seriesColor(1), values: d.byMarketplace.map((m) => m.revenueUsd) }], format: usd }}>
            {d ? <DonutChart ariaLabel="Revenue share by channel" centerLabel="USD" format={compact} slices={d.byMarketplace.slice(0, 7).map((m, i) => ({ key: m.marketplace, label: m.marketplace, value: m.revenueUsd, color: seriesColor(i + 1) }))} /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-7">
          <Panel title="Marketplaces and stores" icon="ri-store-3-line" flush actions={<Link to={ROUTES.LISTINGS} className="btn btn-sm btn-light">Listings</Link>}>
            {d ? (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Channel</th><th>Market</th><th className="text-end">Orders</th><th className="text-end">Revenue</th><th className="text-end">Fees</th><th className="text-end">Net</th></tr></thead>
                  <tbody>
                    {d.byMarketplace.map((m) => (
                      <tr key={m.marketplace}>
                        <td><div className="d-flex align-items-center gap-2"><AppLogo appId={providerOf(m.marketplace)} size="sm" fallbackIcon="ri-store-2-line" /><span className="text-nowrap">{m.marketplace}</span></div></td>
                        <td className="text-nowrap">{regionLabel(m.region)}</td>
                        <td className="text-end tabular-nums">{m.orders.toLocaleString()}</td>
                        <td className="text-end tabular-nums">{usd(m.revenueUsd)}</td>
                        <td className="text-end tabular-nums text-muted">{usd(m.feesUsd)}</td>
                        <td className="text-end tabular-nums fw-medium">{usd(m.revenueUsd - m.feesUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-4"><SkeletonLines lines={6} /></div>}
          </Panel>
        </div>
        <div className="col-xl-5">
          <Panel title="Top products worldwide" icon="ri-fire-line" flush>
            {d ? (
              <ul className="list-group list-group-flush">
                {d.topProducts.map((p, i) => (
                  <li key={p.sku} className="list-group-item d-flex align-items-center gap-3">
                    <span className="badge bg-light text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0"><div className="text-truncate fw-medium">{p.title}</div><div className="text-muted fs-xs">{p.sku} · live on {p.channels} channel{p.channels === 1 ? '' : 's'}</div></div>
                    <div className="text-end"><div className="tabular-nums fw-semibold">{usd(p.revenueUsd)}</div><div className="text-muted fs-xs">{p.unitsSold.toLocaleString()} units</div></div>
                  </li>
                ))}
              </ul>
            ) : <div className="p-4"><SkeletonLines lines={6} /></div>}
          </Panel>
        </div>
      </div>

      <Panel title="Market health" icon="ri-heart-pulse-line" flush>
        {d ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Market</th><th className="text-end">Revenue (local)</th><th className="text-end">Orders</th><th className="text-end">AOV (USD)</th><th className="text-end">Margin</th><th className="text-end">On-time</th><th className="text-end">Returns</th><th>Compliance</th></tr></thead>
              <tbody>
                {d.regions.map((r) => (
                  <tr key={r.region}>
                    <td className="text-nowrap fw-medium">{regionOf(r.region)?.flag} {regionOf(r.region)?.name}</td>
                    <td className="text-end tabular-nums">{formatMoney(r.revenueLocal, r.currency)}</td>
                    <td className="text-end tabular-nums">{r.orders.toLocaleString()}</td>
                    <td className="text-end tabular-nums">{usd(r.aov)}</td>
                    <td className="text-end tabular-nums">{formatPercent(r.marginRate)}</td>
                    <td className={`text-end tabular-nums ${r.onTimeRate < 0.93 ? 'text-warning fw-medium' : ''}`}>{formatPercent(r.onTimeRate)}</td>
                    <td className={`text-end tabular-nums ${r.returnRate > 0.06 ? 'text-danger fw-medium' : ''}`}>{formatPercent(r.returnRate)}</td>
                    <td className="fs-xs text-muted">{regionOf(r.region)?.compliance.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-4"><SkeletonLines lines={5} /></div>}
      </Panel>
      {d && d.regions.length > 1 && (
        <div className="mt-4">
          <ChartPanel title="Orders and fees by market" icon="ri-bar-chart-grouped-line" table={{ labels: d.regions.map((r) => regionOf(r.region)?.short ?? r.region), series: [{ key: 'orders', label: 'Orders', color: seriesColor(1), values: d.regions.map((r) => r.orders) }, { key: 'fees', label: 'Fees (USD)', color: seriesColor(5), values: d.regions.map((r) => r.fees) }], format: (v) => v.toLocaleString() }}>
            <BarChart height={200} labels={d.regions.map((r) => regionOf(r.region)?.short ?? r.region)} series={[{ key: 'orders', label: 'Orders', color: seriesColor(1), values: d.regions.map((r) => r.orders) }, { key: 'fees', label: 'Fees (USD)', color: seriesColor(5), values: d.regions.map((r) => Math.round(r.fees)) }]} format={compact} ariaLabel="Orders and fees by market" />
          </ChartPanel>
        </div>
      )}
    </>
  )
}
