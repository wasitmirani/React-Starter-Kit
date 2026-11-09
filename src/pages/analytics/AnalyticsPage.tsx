import { useState } from 'react'
import { Link } from 'react-router-dom'
import { campaignsApi } from '@/api/endpoints/messaging.api'
import { analyticsApi } from '@/api/endpoints/platform.api'
import { BarChart, CHANNEL_SERIES_SLOT, LineChart, compact, seriesColor, shortDate } from '@/components/charts'
import { PageHeader } from '@/components/common/PageHeader'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { RangePicker } from '@/components/common/RangePicker'
import { StatCard } from '@/components/common/StatCard'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Meter } from '@/components/ui/Controls'
import { ChannelBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useList, useTenantQuery } from '@/hooks/queries/resource.queries'
import { delta, formatNumber, formatRate } from '@/utils/formatters/number.formatter'

export function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const overview = useTenantQuery('analytics', days, () => analyticsApi.overview(days))
  const campaigns = useList('campaigns', campaignsApi.list, { perPage: 100, filters: { status: 'completed' } })
  const data = overview.data
  const t = data?.totals
  const p = data?.previous
  const labels = data?.series[0].points.map((pt) => shortDate(pt.date)) ?? []

  const engagement = data?.series.map((s) => ({
    key: s.channel,
    label: CHANNELS[s.channel].label,
    color: seriesColor(CHANNEL_SERIES_SLOT[s.channel]),
    values: s.points.map((pt) => (pt.delivered ? Math.round((pt.engaged / pt.delivered) * 1000) / 10 : 0)),
  })) ?? []
  const outcome = data
    ? [
        { key: 'delivered', label: 'Delivered', color: seriesColor(1), values: labels.map((_, i) => data.series.reduce((n, s) => n + s.points[i].delivered, 0)) },
        { key: 'failed', label: 'Failed or bounced', color: seriesColor(2), values: labels.map((_, i) => data.series.reduce((n, s) => n + s.points[i].sent - s.points[i].delivered, 0)) },
      ]
    : []
  const growth = data ? [{ key: 'contacts', label: 'Contacts', color: seriesColor(1), values: data.contactGrowth.map((g) => g.value) }] : []
  const top = [...(campaigns.data?.data ?? [])]
    .sort((a, b) => b.stats.clicked / (b.stats.delivered || 1) - a.stats.clicked / (a.stats.delivered || 1))
    .slice(0, 6)

  return (
    <>
      <PageHeader title="Analytics" description="Delivery, engagement and audience growth across every channel." actions={<RangePicker value={days} onChange={setDays} />} />

      <div className="row g-4 mb-4">
        {[
          { label: 'Sent', icon: 'ri-send-plane-line', value: t?.sent, prev: p?.sent },
          { label: 'Delivered', icon: 'ri-checkbox-circle-line', value: t?.delivered, prev: p?.delivered, tone: 'success' as const },
          { label: 'Engaged', icon: 'ri-cursor-line', value: t?.engaged, prev: p?.engaged, tone: 'info' as const },
          { label: 'New contacts', icon: 'ri-user-add-line', value: t?.newContacts, prev: p?.newContacts, tone: 'warning' as const },
          { label: 'Conversations', icon: 'ri-chat-3-line', value: t?.conversations, prev: p?.conversations, tone: 'secondary' as const },
        ].map((k) => (
          <div key={k.label} className="col-sm-6 col-lg-4 col-xxl">
            <StatCard label={k.label} icon={k.icon} tone={k.tone} loading={!t} value={k.value !== undefined && compact(k.value)} delta={k.value !== undefined && k.prev ? delta(k.value, k.prev) : null} hint={`vs previous ${days}d`} />
          </div>
        ))}
        <div className="col-sm-6 col-lg-4 col-xxl">
          <StatCard label="First response" icon="ri-timer-line" tone="danger" loading={!t} value={t && `${t.avgFirstResponseMin}m`} delta={t && p ? delta(t.avgFirstResponseMin, p.avgFirstResponseMin) : null} lowerIsBetter hint="median, inbox" />
        </div>
      </div>

      <Panel title="Channel performance" flush className="mb-4">
        {!data ? (
          <div className="p-4"><SkeletonLines lines={4} /></div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Channel</th>
                  <th className="text-end">Sent</th>
                  <th className="text-end">Delivered</th>
                  <th style={{ width: '22%' }}>Delivery rate</th>
                  <th className="text-end">Engaged</th>
                  <th className="text-end">Engagement rate</th>
                  <th className="text-end">Failed</th>
                </tr>
              </thead>
              <tbody>
                {data.series.map((s) => {
                  const sum = (k: 'sent' | 'delivered' | 'engaged' | 'failed') => s.points.reduce((n, pt) => n + pt[k], 0)
                  const [sent, delivered, engaged, failed] = [sum('sent'), sum('delivered'), sum('engaged'), sum('failed')]
                  return (
                    <tr key={s.channel}>
                      <td><ChannelBadge channel={s.channel} /></td>
                      <td className="text-end tabular-nums">{formatNumber(sent)}</td>
                      <td className="text-end tabular-nums">{formatNumber(delivered)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Meter value={delivered} max={sent} tone="success" className="flex-1" />
                          <span className="tabular-nums fs-sm">{formatRate(delivered, sent)}</span>
                        </div>
                      </td>
                      <td className="text-end tabular-nums">{formatNumber(engaged)}</td>
                      <td className="text-end tabular-nums">{formatRate(engaged, delivered)}</td>
                      <td className="text-end tabular-nums text-danger">{formatNumber(failed)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <ChartPanel title="Engagement rate by channel" description="Engaged ÷ delivered, per day" className="h-100 mb-0" table={{ labels, series: engagement, format: (v) => `${v}%` }}>
            {data ? <LineChart labels={labels} series={engagement} format={(v) => `${v}%`} ariaLabel="Daily engagement rate by channel" /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-6">
          <ChartPanel title="Delivery outcome" description="All channels, per day" className="h-100 mb-0" table={{ labels, series: outcome, format: formatNumber }}>
            {data ? <BarChart labels={labels} series={outcome} format={formatNumber} ariaLabel="Delivered versus failed messages per day" /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <ChartPanel title="Audience growth" description="Total contacts" className="h-100 mb-0" table={{ labels, series: growth, format: formatNumber }}>
            {data ? <LineChart labels={labels} series={growth} area ariaLabel="Total contacts over time" /> : <SkeletonLines lines={6} />}
          </ChartPanel>
        </div>
        <div className="col-xl-7">
          <Panel title="Top campaigns by click rate" flush className="h-100 mb-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Campaign</th>
                    <th className="text-end">Delivered</th>
                    <th className="text-end">Open rate</th>
                    <th className="text-end">Click rate</th>
                    <th className="text-end">Unsub.</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ChannelBadge channel={c.channel} iconOnly />
                          <Link to={to(ROUTES.CAMPAIGN, { id: c.id })} className="text-reset fw-medium text-truncate">{c.name}</Link>
                        </div>
                      </td>
                      <td className="text-end tabular-nums">{formatNumber(c.stats.delivered)}</td>
                      <td className="text-end tabular-nums">{c.stats.opened ? formatRate(c.stats.opened, c.stats.delivered) : '—'}</td>
                      <td className="text-end tabular-nums">{formatRate(c.stats.clicked, c.stats.delivered)}</td>
                      <td className="text-end tabular-nums">{formatRate(c.stats.unsubscribed, c.stats.delivered, 2)}</td>
                    </tr>
                  ))}
                  {top.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">No completed campaigns in this workspace yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
