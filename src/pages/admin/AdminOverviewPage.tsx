import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/endpoints/admin.api'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { ROUTES, to } from '@/constants/routes.constants'
import { formatNumber } from '@/utils/formatters/number.formatter'
import { AdminNav, PlanBadge } from './admin-ui'
import { ADMIN_PLANS } from './admin-utils'

/** Platform (master) console home: the whole customer base at a glance. */
export function AdminOverviewPage() {
  const q = useQuery({ queryKey: ['admin', 'overview'], queryFn: async () => (await adminApi.overview()).data.data })
  const o = q.data

  return (
    <>
      <PageHeader title="Platform admin" description="Every customer workspace and user on this installation." />
      <AdminNav />
      {q.isLoading ? (
        <Loader />
      ) : q.isError || !o ? (
        <div className="alert alert-danger">{errorMessage(q.error)}</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Workspaces" value={formatNumber(o.tenants.total)} icon="ri-building-line" hint={`${o.tenants.new30d} new in 30 days`} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Suspended" value={formatNumber(o.tenants.suspended)} icon="ri-forbid-line" tone="danger" hint={`${o.tenants.active} active`} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Users" value={formatNumber(o.users.total)} icon="ri-group-line" tone="info" hint={`${o.users.active7d} signed in this week`} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Messages (30 days)" value={formatNumber(o.messages30d.total)} icon="ri-mail-send-line" tone="success" hint={`${formatNumber(o.contacts)} contacts stored`} />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card h-100 mb-0">
                <div className="card-header">
                  <h6 className="card-title mb-0">New workspaces, last 30 days</h6>
                </div>
                <div className="card-body">
                  <SignupBars data={o.signups} />
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card h-100 mb-0">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0">Workspaces by plan</h6>
                  <span className="text-muted fs-sm" title="List price × workspaces on each plan. No payments are collected yet.">
                    Est. ${formatNumber(o.estimatedMrr)}/mo
                  </span>
                </div>
                <div className="card-body">
                  {ADMIN_PLANS.map((p) => {
                    const n = o.plans[p.id] ?? 0
                    const pct = o.tenants.total ? Math.round((n / o.tenants.total) * 100) : 0
                    return (
                      <Link key={p.id} to={`${ROUTES.ADMIN_TENANTS}?plan=${p.id}`} className="d-block text-reset mb-4">
                        <div className="d-flex justify-content-between mb-1">
                          <PlanBadge plan={p.id} />
                          <span className="fw-medium">{formatNumber(n)}</span>
                        </div>
                        <div className="progress" style={{ height: 6 }} role="progressbar" aria-label={`${p.name}: ${pct}%`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100 mb-0">
                <div className="card-header">
                  <h6 className="card-title mb-0">Busiest workspaces (messages, 30 days)</h6>
                </div>
                <div className="card-body">
                  {o.topTenants.length === 0 ? (
                    <p className="text-muted mb-0">No messages sent in the last 30 days.</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {o.topTenants.map((t) => (
                        <li key={t.id} className="d-flex justify-content-between py-2 border-bottom">
                          <Link to={to(ROUTES.ADMIN_TENANT, { id: t.id })}>{t.name}</Link>
                          <span className="fw-medium">{formatNumber(t.messages30d)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 mb-0">
                <div className="card-header">
                  <h6 className="card-title mb-0">Messages by channel and status (30 days)</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <Breakdown title="Channel" data={o.messages30d.byChannel} />
                    <Breakdown title="Status" data={o.messages30d.byStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1])
  return (
    <div className="col-6">
      <div className="text-muted fs-xs text-uppercase fw-semibold mb-2">{title}</div>
      {rows.length === 0 ? (
        <p className="text-muted fs-sm mb-0">None</p>
      ) : (
        rows.map(([k, v]) => (
          <div key={k} className="d-flex justify-content-between fs-sm py-1">
            <span className="text-capitalize">{k}</span>
            <span className="fw-medium">{formatNumber(v)}</span>
          </div>
        ))
      )}
    </div>
  )
}

/** Simple bar chart (no chart library): one bar per day. */
function SignupBars({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((a, d) => a + d.count, 0)
  return (
    <>
      <div className="d-flex align-items-end gap-1" style={{ height: 160 }} role="img" aria-label={`${total} new workspaces in the last 30 days`}>
        {data.map((d) => (
          <div
            key={d.day}
            className="flex-fill rounded-top"
            title={`${d.day}: ${d.count}`}
            style={{ height: `${Math.max(2, (d.count / max) * 100)}%`, background: d.count ? 'var(--dx-primary)' : 'var(--dx-border-color)' }}
          />
        ))}
      </div>
      <div className="d-flex justify-content-between text-muted fs-xs mt-2">
        <span>{data[0]?.day}</span>
        <span>{total} total</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </>
  )
}
