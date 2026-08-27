import { Link } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { analyticsService } from '@/services/analytics.service'
import { CallsBarChart } from '@/components/charts/CallsCharts'
import { ROUTES } from '@/constants/routes.constants'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function AnalyticsPage() {
  const kpis = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: () => analyticsService.kpis(),
  })
  const series = useQuery({
    queryKey: ['analytics', 'calls-series'],
    queryFn: () => analyticsService.callsSeries(),
  })
  const k = kpis.data?.data
  const points = series.data?.data ?? []

  return (
    <>
      <BreadCrumb
        activePage="Analytics Overview"
        breadcrumbs={[{ label: 'Analytics', href: ROUTES.ANALYTICS }]}
      />

      <div className="flex flex-wrap gap-2 mb-3">
        <Link to={ROUTES.ANALYTICS_CALLS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
          Call Analytics
        </Link>
        <Link to={ROUTES.ANALYTICS_AGENTS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
          Agent Performance
        </Link>
        <Link to={ROUTES.ANALYTICS_CAMPAIGNS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
          Campaign Reports
        </Link>
        <Link to={ROUTES.ANALYTICS_COSTS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
          Cost Analysis
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-3">
        {[
          { label: 'Total Calls', value: k?.totalCalls.toLocaleString() },
          { label: 'Success Rate', value: k ? `${k.successRate}%` : undefined },
          { label: 'AI Minutes', value: k?.aiMinutes.toLocaleString() },
          { label: 'Est. Cost', value: k ? money(k.estimatedCost) : undefined },
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
          <div className="box-title">Calls (7 days)</div>
        </div>
        <div className="box-body">
          <CallsBarChart data={points} />
        </div>
      </div>
    </>
  )
}
