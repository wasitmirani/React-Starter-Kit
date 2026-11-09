import { Link, useParams } from 'react-router-dom'
import { listsApi, segmentsApi } from '@/api/endpoints/crm.api'
import { campaignsApi, messagesApi } from '@/api/endpoints/messaging.api'
import { errorMessage } from '@/api/errors'
import { BarChart, seriesColor } from '@/components/charts'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { ChartPanel, Panel } from '@/components/common/Panel'
import { StatCard } from '@/components/common/StatCard'
import { Meter } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useList, useOne } from '@/hooks/queries/resource.queries'
import { formatCurrency } from '@/utils/formatters/currency.formatter'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { formatNumber, formatRate } from '@/utils/formatters/number.formatter'

export function CampaignReportPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = useOne('campaigns', campaignsApi.get, id)
  const lists = useAll('lists', listsApi.list)
  const segments = useAll('segments', segmentsApi.list)
  const messages = useList('messages', messagesApi.list, { perPage: 8, filters: { campaignId: id } })
  const pause = useAction('campaigns', campaignsApi.pause, { success: 'Paused' })
  const resume = useAction('campaigns', campaignsApi.resume, { success: 'Resumed' })

  if (campaign.isError) return <QueryError message={errorMessage(campaign.error)} onRetry={() => campaign.refetch()} />
  if (!campaign.data) return <SkeletonLines lines={10} />
  const c = campaign.data
  const s = c.stats
  const engagedLabel = c.channel === 'email' ? 'Opened' : c.channel === 'whatsapp' ? 'Read' : 'Replied'
  const engaged = c.channel === 'email' || c.channel === 'whatsapp' ? s.opened : s.replied

  const funnel = [
    { label: 'Sent', value: s.sent, base: s.recipients },
    { label: 'Delivered', value: s.delivered, base: s.sent },
    { label: engagedLabel, value: engaged, base: s.delivered },
    { label: 'Clicked', value: s.clicked, base: s.delivered },
  ]
  // Hourly engagement curve over the first 24h, shaped from the totals for display.
  const hours = Array.from({ length: 24 }, (_, h) => `${h}h`)
  const curve = hours.map((_, h) => Math.round((engaged * Math.exp(-h / 4) * (1 - Math.exp(-(h + 1) / 1.2))) / 3.2))
  const clicks = curve.map((v) => Math.round(v * (s.clicked / (engaged || 1))))
  const hourly = [
    { key: 'engaged', label: engagedLabel, color: seriesColor(1), values: curve },
    { key: 'clicked', label: 'Clicked', color: seriesColor(2), values: clicks },
  ]
  const audienceNames = [
    ...c.audience.listIds.map((lid) => lists.data?.data.find((l) => l.id === lid)?.name),
    ...c.audience.segmentIds.map((sid) => segments.data?.data.find((x) => x.id === sid)?.name),
  ].filter(Boolean)

  return (
    <>
      <PageHeader
        back={{ label: 'Campaigns', to: ROUTES.CAMPAIGNS }}
        title={c.name}
        meta={<><ChannelBadge channel={c.channel} /><StatusBadge status={c.status} label={c.status === 'running' ? 'Sending' : undefined} /></>}
        description={c.sentAt ? `Sent ${formatDateTime(c.sentAt)} by ${c.senderLabel}` : c.schedule.at ? `Scheduled for ${formatDateTime(c.schedule.at)}` : undefined}
        actions={
          <>
            {c.status === 'running' && <button type="button" className="btn btn-light" onClick={() => pause.mutate(c.id)}><i className="ri-pause-line me-1" />Pause</button>}
            {c.status === 'paused' && <button type="button" className="btn btn-primary" onClick={() => resume.mutate(c.id)}><i className="ri-play-line me-1" />Resume</button>}
            {['draft', 'scheduled'].includes(c.status) && <Link to={to(ROUTES.CAMPAIGN_EDIT, { id: c.id })} className="btn btn-primary">Edit</Link>}
          </>
        }
      />

      {c.status === 'running' && (
        <div className="alert alert-info d-flex align-items-center gap-3">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span className="flex-1">Sending in batches: {formatNumber(s.sent)} of {formatNumber(s.recipients)}.</span>
          <Meter value={s.sent} max={s.recipients} className="flex-1" />
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Recipients" icon="ri-group-line" value={formatNumber(s.recipients)} hint={audienceNames.join(', ') || undefined} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Delivery rate" icon="ri-checkbox-circle-line" tone="success" value={formatRate(s.delivered, s.sent)} hint={`${formatNumber(s.bounced)} bounced`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label={`${engagedLabel} rate`} icon="ri-eye-line" tone="info" value={formatRate(engaged, s.delivered)} hint={`${formatNumber(engaged)} contacts`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Revenue" icon="ri-money-dollar-circle-line" tone="warning" value={formatCurrency(s.revenue).replace(/\.00$/, '')} hint={`${formatRate(s.clicked, s.delivered)} click rate`} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <Panel title="Funnel" className="h-100 mb-0">
            {funnel.map((f) => (
              <div key={f.label} className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span>{f.label}</span>
                  <span><span className="fw-medium tabular-nums">{formatNumber(f.value)}</span> <span className="text-muted fs-sm">· {formatRate(f.value, f.base)}</span></span>
                </div>
                <Meter value={f.value} max={s.recipients || 1} />
              </div>
            ))}
            <div className="d-flex flex-wrap gap-4 fs-sm text-muted">
              <span>Unsubscribed <strong className="text-body">{formatNumber(s.unsubscribed)}</strong></span>
              <span>Failed <strong className="text-body">{formatNumber(s.failed)}</strong></span>
              <span>Bounced <strong className="text-body">{formatNumber(s.bounced)}</strong></span>
            </div>
          </Panel>
        </div>
        <div className="col-xl-7">
          <ChartPanel title="Engagement in the first 24 hours" className="h-100 mb-0" table={{ labels: hours, series: hourly, format: formatNumber }}>
            <BarChart labels={hours} series={hourly} format={formatNumber} ariaLabel="Engagement per hour after sending" />
          </ChartPanel>
        </div>
      </div>

      <Panel title="Recent deliveries" actions={<Link to={`${ROUTES.MESSAGES}?campaignId=${c.id}`} className="btn btn-sm btn-light">All message logs</Link>} flush>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light"><tr><th>Recipient</th><th>To</th><th>Status</th><th>Provider</th><th>Time</th></tr></thead>
            <tbody>
              {(messages.data?.data ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="fw-medium">{m.contactName}</td>
                  <td className="text-muted">{m.to}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td className="text-muted">{m.provider}</td>
                  <td className="text-muted">{formatDateTime(m.createdAt)}</td>
                </tr>
              ))}
              {messages.data?.data.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-5">No individual deliveries logged for this campaign yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
