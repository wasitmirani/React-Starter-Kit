import { Link } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { analyticsService } from '@/services/analytics.service'
import { CallsBarChart } from '@/components/charts/CallsCharts'
import { ROUTES } from '@/constants/routes.constants'

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

export function AnalyticsCallsPage() {
  const kpis = useQuery({ queryKey: ['analytics', 'kpis'], queryFn: () => analyticsService.kpis() })
  const series = useQuery({
    queryKey: ['analytics', 'calls-series'],
    queryFn: () => analyticsService.callsSeries(),
  })
  const k = kpis.data?.data

  return (
    <>
      <BreadCrumb
        activePage="Call Analytics"
        breadcrumbs={[{ label: 'Analytics', href: ROUTES.ANALYTICS }]}
      />
      <div className="grid grid-cols-12 gap-4 mb-3">
        {[
          { label: 'Total Calls', value: k?.totalCalls },
          { label: 'Answered', value: k?.answeredCalls },
          { label: 'Success Rate', value: k ? `${k.successRate}%` : undefined },
          { label: 'Avg Duration', value: k ? formatDuration(k.averageDurationSec) : undefined },
        ].map((card) => (
          <div key={card.label} className="xl:col-span-3 md:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="text-textmuted fs-12">{card.label}</div>
                <div className="font-semibold fs-22">{card.value ?? '…'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="box">
        <div className="box-header">
          <div className="box-title">Calls Over Time</div>
        </div>
        <div className="box-body">
          <CallsBarChart data={series.data?.data ?? []} />
        </div>
      </div>
    </>
  )
}

export function AnalyticsAgentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'agents'],
    queryFn: () => analyticsService.agentPerformance(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Agent Performance"
        breadcrumbs={[{ label: 'Analytics', href: ROUTES.ANALYTICS }]}
      />
      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">Agents</div>
          <Link to={ROUTES.AGENTS} className="fs-12 text-primary">
            Manage agents
          </Link>
        </div>
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Calls</th>
                  <th>Success</th>
                  <th>Avg Duration</th>
                  <th>AI Minutes</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.calls.toLocaleString()}</td>
                    <td>{row.successRate}%</td>
                    <td>{formatDuration(row.avgDurationSec)}</td>
                    <td>{row.aiMinutes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function AnalyticsCampaignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => analyticsService.campaignAnalytics(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Campaign Reports"
        breadcrumbs={[{ label: 'Analytics', href: ROUTES.ANALYTICS }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Campaign Performance</div>
        </div>
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Contacted</th>
                  <th>Answered</th>
                  <th>Converted</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.contacted}</td>
                    <td>{row.answered}</td>
                    <td>{row.converted}</td>
                    <td>{formatMoney(row.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function AnalyticsCostsPage() {
  const kpis = useQuery({ queryKey: ['analytics', 'kpis'], queryFn: () => analyticsService.kpis() })
  const k = kpis.data?.data

  return (
    <>
      <BreadCrumb
        activePage="Cost Analysis"
        breadcrumbs={[{ label: 'Analytics', href: ROUTES.ANALYTICS }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {[
          { label: 'AI Minutes', value: k?.aiMinutes.toLocaleString() },
          { label: 'Estimated Cost', value: k ? formatMoney(k.estimatedCost) : undefined },
          { label: 'Cost Per Call', value: k ? formatMoney(k.costPerCall) : undefined },
          { label: 'Conversion Rate', value: k ? `${k.conversionRate}%` : undefined },
        ].map((card) => (
          <div key={card.label} className="xl:col-span-3 md:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="text-textmuted fs-12">{card.label}</div>
                <div className="font-semibold fs-22">{card.value ?? '…'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
