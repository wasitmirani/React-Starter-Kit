import { useState } from 'react'
import { billingApi } from '@/api/endpoints/platform.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { Meter } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { useAction, useList, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Plan, Subscription } from '@/types/platform.types'
import { formatCurrency } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'
import { formatNumber } from '@/utils/formatters/number.formatter'

const YEARLY_DISCOUNT = 0.2

export function BillingPage() {
  const subscription = useTenantQuery('billing', 'subscription', billingApi.subscription)
  const plans = useTenantQuery('billing', 'plans', billingApi.plans, { staleTime: Infinity })
  const invoices = useList('invoices', billingApi.invoices, { perPage: 6 })
  const [cycle, setCycle] = useState<Subscription['cycle']>('monthly')
  const [choosing, setChoosing] = useState<Plan | null>(null)
  const change = useAction('billing', ({ planId }: { planId: Plan['id'] }) => billingApi.changePlan(planId, cycle), { success: 'Plan updated', onSuccess: () => setChoosing(null) })

  const sub = subscription.data
  const current = plans.data?.find((p) => p.id === sub?.planId)
  const price = (p: Plan) => (p.priceMonthly === null ? null : cycle === 'yearly' ? Math.round(p.priceMonthly * (1 - YEARLY_DISCOUNT)) : p.priceMonthly)

  return (
    <>
      <PageHeader title="Billing & usage" description="Your plan, what you have used this period, and invoices." />
      {!sub || !plans.data ? (
        <SkeletonLines lines={10} />
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-xl-4">
              <Panel title="Current plan" className="h-100 mb-0">
                <div className="d-flex align-items-baseline gap-2 mb-1">
                  <h3 className="mb-0">{current?.name}</h3>
                  <StatusBadge status={sub.status} />
                </div>
                <p className="text-muted">{current?.priceMonthly != null ? `${formatCurrency(current.priceMonthly)} / month, billed ${sub.cycle}` : 'Custom pricing'} · renews {formatDate(sub.renewsAt)}</p>
                <dl className="kv-list mt-3 pt-3 border-top">
                  <div><dt>Seats</dt><dd className="tabular-nums">{sub.seats}</dd></div>
                  <div><dt>Prepaid credits</dt><dd className="tabular-nums">{formatCurrency(sub.creditBalance)}</dd></div>
                  <div>
                    <dt>Payment method</dt>
                    <dd>{sub.paymentMethod ? <><i className="ri-bank-card-line me-1" />{sub.paymentMethod.brand} •••• {sub.paymentMethod.last4} · exp {sub.paymentMethod.expires}</> : <span className="text-muted fw-normal">None</span>}</dd>
                  </div>
                </dl>
              </Panel>
            </div>
            <div className="col-xl-8">
              <Panel title="Usage this period" description="Channel usage beyond the included amount is billed at the overage rate." className="h-100 mb-0">
                <div className="row g-4">
                  {sub.usage.map((u) => {
                    const over = u.included !== null && u.used > u.included
                    return (
                      <div key={u.key} className="col-md-6">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="d-flex align-items-center gap-2">{u.channel && <i className={`${CHANNELS[u.channel].icon} text-muted`} />}{u.label}</span>
                          <span className="tabular-nums fs-sm">
                            <strong>{formatNumber(u.used)}</strong>
                            <span className="text-muted"> / {u.included === null ? 'pay as you go' : formatNumber(u.included)}</span>
                          </span>
                        </div>
                        {u.included !== null ? <Meter value={u.used} max={u.included} tone={over ? 'danger' : u.used / u.included > 0.8 ? 'warning' : 'primary'} /> : <Meter value={1} max={1} tone="secondary" />}
                        {over && u.overageRate !== null && <div className="text-danger fs-xs mt-1">{formatNumber(u.used - u.included!)} over · ≈ {formatCurrency((u.used - u.included!) * u.overageRate)}</div>}
                        {u.included === null && u.overageRate !== null && <div className="text-muted fs-xs mt-1">≈ {formatCurrency(u.used * u.overageRate)} at {formatCurrency(u.overageRate)} / {u.unit.replace(/s$/, '')}</div>}
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </div>
          </div>

          <Panel
            title="Plans"
            className="mb-4"
            actions={
              <div className="btn-group btn-group-sm" role="group" aria-label="Billing cycle">
                <button type="button" className={`btn ${cycle === 'monthly' ? 'btn-primary' : 'btn-light'}`} onClick={() => setCycle('monthly')}>Monthly</button>
                <button type="button" className={`btn ${cycle === 'yearly' ? 'btn-primary' : 'btn-light'}`} onClick={() => setCycle('yearly')}>Yearly · save 20%</button>
              </div>
            }
          >
            <div className="row g-4">
              {plans.data.map((p) => {
                const isCurrent = p.id === sub.planId
                const amount = price(p)
                return (
                  <div key={p.id} className="col-md-6 col-xl-3">
                    <div className={`border rounded-3 p-4 h-100 d-flex flex-column ${isCurrent ? 'border-primary' : ''}`}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{p.name}</h6>
                        {isCurrent && <ToneBadge tone="primary">Current</ToneBadge>}
                      </div>
                      <div className="mb-2">{amount === null ? <span className="fs-4 fw-semibold">Custom</span> : <><span className="fs-3 fw-semibold">${amount}</span><span className="text-muted"> / month</span></>}</div>
                      <p className="text-muted fs-sm">{p.description}</p>
                      <ul className="list-unstyled fs-sm flex-1">
                        {p.features.map((f) => <li key={f} className="mb-1"><i className="ri-check-line text-success me-1" />{f}</li>)}
                      </ul>
                      {p.priceMonthly === null ? (
                        <a href="mailto:sales@birdcrm.app" className="btn btn-light">Contact sales</a>
                      ) : (
                        <button type="button" className={`btn ${isCurrent ? 'btn-light' : 'btn-primary'}`} disabled={isCurrent && sub.cycle === cycle} onClick={() => setChoosing(p)}>
                          {isCurrent ? (sub.cycle === cycle ? 'Current plan' : `Switch to ${cycle}`) : (p.priceMonthly ?? 0) > (current?.priceMonthly ?? 0) ? 'Upgrade' : 'Downgrade'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel title="Invoices" flush>
            <table className="table align-middle mb-0">
              <thead className="table-light"><tr><th>Invoice</th><th>Period</th><th className="text-end">Amount</th><th>Status</th><th /></tr></thead>
              <tbody>
                {(invoices.data?.data ?? []).map((inv) => (
                  <tr key={inv.id}>
                    <td className="fw-medium">{inv.number}</td>
                    <td className="text-muted">{formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}</td>
                    <td className="text-end tabular-nums">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td className="text-end"><button type="button" className="btn btn-sm btn-light" title="PDF download is available once billing is connected" disabled><i className="ri-download-2-line me-1" />PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      <ConfirmDialog
        open={choosing !== null}
        title={`Switch to ${choosing?.name}?`}
        message={choosing && <>You’ll pay <strong>${price(choosing)}/month</strong>, billed {cycle}. Upgrades apply now and are prorated; downgrades apply at the end of the period.</>}
        confirmLabel="Confirm change"
        busy={change.isPending}
        onClose={() => setChoosing(null)}
        onConfirm={() => change.mutate({ planId: choosing!.id })}
      />
    </>
  )
}
