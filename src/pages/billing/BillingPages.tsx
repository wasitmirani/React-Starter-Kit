import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { billingService } from '@/services/billing.service'
import type { PlanId } from '@/types/billing.types'
import { ROUTES } from '@/constants/routes.constants'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingService.subscription(),
  })
  const sub = data?.data

  return (
    <>
      <BreadCrumb
        activePage="Billing Overview"
        breadcrumbs={[{ label: 'Billing', href: ROUTES.BILLING }]}
      />
      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-8 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between">
              <div className="box-title">Current Plan</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="ti-btn ti-btn-outline-primary ti-btn-sm"
                  onClick={() => void billingService.openPortal()}
                >
                  Manage billing
                </button>
                <Link to={ROUTES.BILLING_PLANS} className="ti-btn ti-btn-primary ti-btn-sm">
                  Change plan
                </Link>
              </div>
            </div>
            <div className="box-body">
              {isLoading || !sub ? (
                <p className="text-textmuted mb-0">Loading…</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-textmuted fs-12">Plan</div>
                    <div className="font-semibold fs-20">{sub.planName}</div>
                  </div>
                  <div>
                    <div className="text-textmuted fs-12">Monthly price</div>
                    <div className="font-semibold fs-20">{money(sub.monthlyPrice)}</div>
                  </div>
                  <div>
                    <div className="text-textmuted fs-12">AI minutes</div>
                    <div>
                      {sub.aiMinutesUsed.toLocaleString()} /{' '}
                      {sub.aiMinutesIncluded.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-textmuted fs-12">Remaining</div>
                    <div>{sub.remainingMinutes.toLocaleString()} min</div>
                  </div>
                  <div>
                    <div className="text-textmuted fs-12">Overage</div>
                    <div>
                      {sub.overageMinutes} min · {money(sub.overageCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-textmuted fs-12">Next billing</div>
                    <div>{new Date(sub.nextBillingDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Quick links</div>
            </div>
            <div className="box-body flex flex-col gap-2">
              <Link to={ROUTES.BILLING_USAGE} className="ti-btn ti-btn-outline-primary ti-btn-sm">
                Usage
              </Link>
              <Link to={ROUTES.BILLING_INVOICES} className="ti-btn ti-btn-outline-primary ti-btn-sm">
                Invoices
              </Link>
              <Link
                to={ROUTES.BILLING_PAYMENT_METHODS}
                className="ti-btn ti-btn-outline-primary ti-btn-sm"
              >
                Payment methods
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function BillingPlansPage() {
  const queryClient = useQueryClient()
  const plans = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingService.plans(),
  })
  const sub = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingService.subscription(),
  })
  const change = useMutation({
    mutationFn: (planId: PlanId) => billingService.changePlan(planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing'] }),
  })

  return (
    <>
      <BreadCrumb
        activePage="Plans"
        breadcrumbs={[{ label: 'Billing', href: ROUTES.BILLING }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {(plans.data?.data ?? []).map((plan) => {
          const current = sub.data?.data?.planId === plan.id
          return (
            <div key={plan.id} className="xl:col-span-3 md:col-span-6 col-span-12">
              <div className={`box h-full ${current ? 'border-primary' : ''}`}>
                <div className="box-body">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-semibold mb-0">{plan.name}</h6>
                    {current && <span className="badge bg-primary">Current</span>}
                  </div>
                  <div className="fs-22 font-semibold mb-2">
                    {plan.monthlyPrice > 0 ? money(plan.monthlyPrice) : 'Custom'}
                    {plan.monthlyPrice > 0 && (
                      <span className="fs-12 text-textmuted"> /mo</span>
                    )}
                  </div>
                  <div className="fs-12 text-textmuted mb-3">
                    {plan.aiMinutes.toLocaleString()} AI minutes
                  </div>
                  <ul className="list-disc ps-4 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="fs-12">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="ti-btn ti-btn-primary ti-btn-sm w-full"
                    disabled={current || change.isPending}
                    onClick={() => change.mutate(plan.id)}
                  >
                    {current ? 'Current plan' : plan.id === 'enterprise' ? 'Contact sales' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function BillingUsagePage() {
  const { data } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingService.subscription(),
  })
  const sub = data?.data
  const pct = sub
    ? Math.min(100, Math.round((sub.aiMinutesUsed / sub.aiMinutesIncluded) * 100))
    : 0

  return (
    <>
      <BreadCrumb
        activePage="Usage"
        breadcrumbs={[{ label: 'Billing', href: ROUTES.BILLING }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">AI Minutes Usage</div>
        </div>
        <div className="box-body">
          {!sub ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <>
              <div className="flex justify-between mb-2">
                <span>
                  {sub.aiMinutesUsed.toLocaleString()} used of{' '}
                  {sub.aiMinutesIncluded.toLocaleString()}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="progress mb-3">
                <div className="progress-bar bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-textmuted mb-0">
                Remaining {sub.remainingMinutes.toLocaleString()} minutes · Overage{' '}
                {sub.overageMinutes} ({money(sub.overageCost)})
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export function BillingInvoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingService.invoices(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Invoices"
        breadcrumbs={[{ label: 'Billing', href: ROUTES.BILLING }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.number}</td>
                    <td>{new Date(inv.issuedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-success-transparent">{inv.status}</span>
                    </td>
                    <td className="text-end">{money(inv.amount)}</td>
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

export function BillingPaymentMethodsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'payment-methods'],
    queryFn: () => billingService.paymentMethods(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Payment Methods"
        breadcrumbs={[{ label: 'Billing', href: ROUTES.BILLING }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {isLoading && <p className="text-textmuted">Loading…</p>}
          {(data?.data ?? []).map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between p-3 border border-defaultborder rounded"
            >
              <div>
                <div className="font-medium">
                  {pm.brand} ···· {pm.last4}
                </div>
                <div className="fs-12 text-textmuted">
                  Exp {pm.expMonth}/{pm.expYear}
                </div>
              </div>
              {pm.isDefault && <span className="badge bg-primary">Default</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
