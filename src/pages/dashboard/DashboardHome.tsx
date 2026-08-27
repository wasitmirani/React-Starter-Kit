import { Link } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { dashboardService } from '@/services/dashboard.service'
import { CallsBarChart } from '@/components/charts/CallsCharts'
import { ROUTES } from '@/constants/routes.constants'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const KPI_CARDS = [
  { key: 'totalCalls', label: 'Total Calls', icon: 'ri-phone-line', tone: 'primary' },
  { key: 'successfulCalls', label: 'Successful Calls', icon: 'ri-checkbox-circle-line', tone: 'success' },
  { key: 'failedCalls', label: 'Failed Calls', icon: 'ri-close-circle-line', tone: 'danger' },
  { key: 'averageDurationSec', label: 'Avg Duration', icon: 'ri-timer-line', tone: 'info' },
  { key: 'aiMinutesUsed', label: 'AI Minutes Used', icon: 'ri-robot-2-line', tone: 'secondary' },
  { key: 'currentBalance', label: 'Current Balance', icon: 'ri-wallet-3-line', tone: 'warning' },
  { key: 'activeCampaigns', label: 'Active Campaigns', icon: 'ri-megaphone-line', tone: 'primary' },
  { key: 'activeAgents', label: 'Active Agents', icon: 'ri-user-voice-line', tone: 'success' },
] as const

export function DashboardHome() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.stats(),
  })
  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardService.activity(),
  })
  const chartQuery = useQuery({
    queryKey: ['dashboard', 'calls-over-time'],
    queryFn: () => dashboardService.callsOverTime(),
  })

  const stats = statsQuery.data?.data
  const activity = activityQuery.data?.data ?? []
  const chart = chartQuery.data?.data ?? []

  const valueFor = (key: (typeof KPI_CARDS)[number]['key']) => {
    if (!stats) return '—'
    if (key === 'averageDurationSec') return formatDuration(stats.averageDurationSec)
    if (key === 'currentBalance') return formatMoney(stats.currentBalance)
    return stats[key].toLocaleString()
  }

  return (
    <>
      <BreadCrumb
        activePage="Dashboard"
        breadcrumbs={[{ label: 'Overview', href: ROUTES.DASHBOARD }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h5 className="font-semibold mb-1">Voice AI Overview</h5>
          <p className="text-textmuted mb-0 fs-12">
            Monitor agents, campaigns, and call performance in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.AGENT_CREATE} className="ti-btn ti-btn-primary ti-btn-sm">
            Create Agent
          </Link>
          <Link to={ROUTES.CAMPAIGN_CREATE} className="ti-btn ti-btn-outline-primary ti-btn-sm">
            New Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {KPI_CARDS.map((card) => (
          <div key={card.key} className="xl:col-span-3 md:col-span-6 col-span-12">
            <div className={`box dashboard-main-card ${card.tone}`}>
              <div className="box-body">
                <div className="flex items-start gap-3">
                  <div className="grow">
                    <div className="mb-1 text-textmuted fs-12">{card.label}</div>
                    <div className="font-semibold fs-22 mb-0">
                      {statsQuery.isLoading ? '…' : valueFor(card.key)}
                    </div>
                  </div>
                  <div className={`avatar avatar-md bg-${card.tone}-transparent`}>
                    <i className={`${card.icon} text-${card.tone}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 mt-1">
        <div className="xl:col-span-8 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between">
              <div className="box-title">Calls Over Time</div>
              <Link to={ROUTES.ANALYTICS_CALLS} className="fs-12 text-primary">
                View analytics
              </Link>
            </div>
            <div className="box-body">
              {chartQuery.isLoading ? (
                <p className="text-textmuted mb-0">Loading chart…</p>
              ) : (
                <CallsBarChart
                  data={chart.map((point) => ({
                    label: point.date.slice(5),
                    value: point.total,
                    secondary: point.successful,
                  }))}
                />
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between">
              <div className="box-title">Recent Activity</div>
              <Link to={ROUTES.CALLS} className="fs-12 text-primary">
                Calls
              </Link>
            </div>
            <div className="box-body">
              {activityQuery.isLoading && (
                <p className="text-textmuted mb-0">Loading activity…</p>
              )}
              <ul className="list-none mb-0 space-y-3">
                {activity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="avatar avatar-sm bg-primary-transparent">
                      <i
                        className={
                          item.type === 'call'
                            ? 'ri-phone-line'
                            : item.type === 'campaign'
                              ? 'ri-megaphone-line'
                              : item.type === 'agent'
                                ? 'ri-robot-2-line'
                                : 'ri-bill-line'
                        }
                      />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-textmuted fs-12">{item.description}</div>
                      <div className="text-textmuted fs-11">
                        {new Date(item.at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
