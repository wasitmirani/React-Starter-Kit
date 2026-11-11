import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { returnsApi } from '@/api/endpoints/shipping.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { DetailList, Stepper } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import type { ReturnCondition, ReturnDisposition, ReturnRequest } from '@/types/shipping.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'

const REASONS = ['Size does not fit', 'Damaged in transit', 'Wrong item received', 'Changed mind', 'Quality not as expected']
const STEPS: ReturnRequest['status'][] = ['requested', 'approved', 'received', 'inspected', 'completed']

const columns: DataTableColumn<ReturnRequest>[] = [
  { key: 'number', label: 'RMA', sortable: true, render: (r) => <span className="fw-medium">{r.number}</span> },
  { key: 'orderNumber', label: 'Order', render: (r) => <Link to={to(ROUTES.ORDER, { id: r.orderId })} onClick={(e) => e.stopPropagation()}>{r.orderNumber}</Link> },
  { key: 'customerName', label: 'Customer', sortable: true },
  { key: 'reason', label: 'Reason' },
  { key: 'items', label: 'Units', align: 'end', render: (r) => r.items.reduce((n, i) => n + i.quantity, 0) },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'refundStatus', label: 'Refund', render: (r) => <div><StatusBadge status={r.refundStatus} /><div className="text-muted fs-xs tabular-nums">{formatMoney(r.refundAmount, r.currency)}</div></div> },
  { key: 'createdAt', label: 'Requested', sortable: true, render: (r) => formatDate(r.createdAt) },
]

export function ReturnsPage() {
  const [params, setParams] = useSearchParams()
  const orderId = params.get('new')
  return (
    <>
      <PageHeader title="Returns / RMA" description="Return authorisations from request to restock. Returned stock is not sellable until inspected; refunds are tracked separately from inventory." />
      <ResourceList<ReturnRequest> resource="returns" list={returnsApi.list} columns={columns} itemsLabel="returns" exportName="returns" searchPlaceholder="RMA, order, customer…" rowLink={(r) => to(ROUTES.RETURN, { id: r.id })} filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.returnStatus }, { key: 'reason', allLabel: 'All reasons', options: REASONS.map((r) => ({ value: r, label: r })) }]} />
      <CreateReturnModal orderId={orderId} onClose={() => setParams((p) => { p.delete('new'); return p }, { replace: true })} />
    </>
  )
}

/** Opened from an order (`?new=<orderId>`): choose items and quantities to return. */
function CreateReturnModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const order = useOne('orders', ordersApi.get, orderId ?? undefined)
  const [qty, setQty] = useState<Record<string, number>>({})
  const [reason, setReason] = useState(REASONS[0])
  const create = useAction('returns', returnsApi.create, { success: (r) => `${r.number} created`, onSuccess: onClose })
  const o = order.data
  return (
    <Modal open={orderId !== null} onClose={onClose} title={`Return for ${o?.number ?? ''}`} footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={!o || create.isPending || !Object.values(qty).some(Boolean)} onClick={() => o && create.mutate({ orderId: o.id, reason, items: Object.entries(qty).map(([sku, quantity]) => ({ sku, quantity })) })}>Create RMA</button></>}>
      {!o ? <Loader label="Loading order…" /> : (
        <>
          <FormField id="rma-reason" label="Reason" required className="mb-4"><select id="rma-reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></FormField>
          <table className="table align-middle">
            <thead><tr className="text-muted fs-sm"><th>Item</th><th className="text-end">Ordered</th><th style={{ width: 110 }}>Return</th></tr></thead>
            <tbody>
              {o.items.map((i) => <tr key={i.sku}><td><div className="fw-medium">{i.title}</div><div className="font-monospace fs-sm text-muted">{i.sku}</div></td><td className="text-end">{i.quantity}</td><td><input type="number" min={0} max={i.quantity} className="form-control form-control-sm" aria-label={`Return quantity ${i.sku}`} value={qty[i.sku] ?? 0} onChange={(e) => setQty({ ...qty, [i.sku]: Math.min(i.quantity, Math.max(0, Number(e.target.value))) })} /></td></tr>)}
            </tbody>
          </table>
        </>
      )}
    </Modal>
  )
}

export function ReturnDetailPage() {
  const { id } = useParams()
  const ret = useOne('returns', returnsApi.get, id)
  const [inspection, setInspection] = useState<Record<string, { condition: ReturnCondition; disposition: ReturnDisposition }>>({})
  const opts = { invalidates: ['orders', 'balances', 'ledger'] }
  const decide = useAction('returns', returnsApi.decide, { ...opts, success: (r) => `${r.number} ${r.status}` })
  const receive = useAction('returns', returnsApi.receive, { success: 'Marked received at the warehouse' })
  const inspect = useAction('returns', returnsApi.inspect, { success: 'Inspection saved' })
  const complete = useAction('returns', returnsApi.complete, { ...opts, success: 'Dispositions applied and refund released' })

  useEffect(() => {
    if (ret.data) setInspection(Object.fromEntries(ret.data.items.map((i) => [i.sku, { condition: i.condition ?? 'sellable', disposition: i.disposition ?? 'restock' }])))
  }, [ret.data])

  if (ret.isLoading) return <Loader label="Loading return…" />
  if (ret.isError || !ret.data) return <QueryError message={errorMessage(ret.error)} onRetry={() => ret.refetch()} />
  const r = ret.data
  const inspecting = r.status === 'received'

  return (
    <>
      <PageHeader
        back={{ label: 'Returns', to: ROUTES.RETURNS }}
        title={r.number}
        meta={<StatusBadge status={r.status} />}
        description={<>Order <Link to={to(ROUTES.ORDER, { id: r.orderId })}>{r.orderNumber}</Link> · {r.customerName} · {r.reason}</>}
        actions={
          <>
            {r.status === 'requested' && <Guard permission="returns.approve"><button type="button" className="btn btn-outline-danger" onClick={() => decide.mutate({ id: r.id, approve: false })}>Reject</button></Guard>}
            {r.status === 'requested' && <Guard permission="returns.approve"><button type="button" className="btn btn-primary" onClick={() => decide.mutate({ id: r.id, approve: true })}>Approve</button></Guard>}
            {r.status === 'approved' && <Guard permission="returns.inspect"><button type="button" className="btn btn-primary" onClick={() => receive.mutate(r.id)}>Mark received</button></Guard>}
            {inspecting && <Guard permission="returns.inspect"><button type="button" className="btn btn-primary" disabled={inspect.isPending} onClick={() => inspect.mutate({ id: r.id, items: Object.entries(inspection).map(([sku, v]) => ({ sku, ...v })) })}>Save inspection</button></Guard>}
            {r.status === 'inspected' && <Guard permission="returns.inspect"><button type="button" className="btn btn-primary" disabled={complete.isPending} onClick={() => complete.mutate(r.id)}>Apply dispositions</button></Guard>}
          </>
        }
      />
      {r.status !== 'rejected' && <div className="card card-body mb-4"><Stepper steps={STEPS.map((s) => s[0].toUpperCase() + s.slice(1))} current={r.status === 'completed' ? STEPS.length : STEPS.indexOf(r.status)} /></div>}
      <div className="row g-4">
        <div className="col-xl-8">
          <Panel title="Items and inspection" icon="ri-search-eye-line" flush description="Sellable + restock returns stock to available. Anything else goes to quarantine or is written off.">
            <table className="table align-middle mb-0">
              <thead><tr className="text-muted fs-sm"><th>Item</th><th className="text-end">Qty</th><th>Condition</th><th>Disposition</th></tr></thead>
              <tbody>
                {r.items.map((i) => (
                  <tr key={i.sku}>
                    <td><div className="fw-medium">{i.title}</div><div className="font-monospace fs-sm text-muted">{i.sku}</div></td>
                    <td className="text-end">{i.quantity}</td>
                    <td>{inspecting ? <select className="form-select form-select-sm" aria-label={`Condition ${i.sku}`} value={inspection[i.sku]?.condition} onChange={(e) => setInspection({ ...inspection, [i.sku]: { ...inspection[i.sku], condition: e.target.value as ReturnCondition } })}>{OPTIONS.returnCondition.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : i.condition ? <StatusBadge status={i.condition} /> : '—'}</td>
                    <td>{inspecting ? <select className="form-select form-select-sm" aria-label={`Disposition ${i.sku}`} value={inspection[i.sku]?.disposition} onChange={(e) => setInspection({ ...inspection, [i.sku]: { ...inspection[i.sku], disposition: e.target.value as ReturnDisposition } })}>{OPTIONS.returnDisposition.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : i.disposition ? <StatusBadge status={i.disposition} /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
        <div className="col-xl-4">
          <Panel title="Refund" icon="ri-refund-2-line">
            <DetailList items={[{ label: 'Amount', value: formatMoney(r.refundAmount, r.currency) }, { label: 'Refund status', value: <StatusBadge status={r.refundStatus} /> }, { label: 'Return tracking', value: r.trackingNumber }, { label: 'Warehouse', value: r.warehouseName }]} />
          </Panel>
        </div>
      </div>
    </>
  )
}
