import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { purchaseOrdersApi } from '@/api/endpoints/procurement.api'
import { receiptsApi } from '@/api/endpoints/warehouse.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { DetailList, Meter } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import { useSupplierOptions, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import type { PurchaseOrder } from '@/types/procurement.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'

const units = (po: PurchaseOrder, k: 'ordered' | 'received') => po.lines.reduce((n, l) => n + l[k], 0)

const columns: DataTableColumn<PurchaseOrder>[] = [
  { key: 'number', label: 'PO', sortable: true, render: (p) => <span className="fw-medium">{p.number}</span> },
  { key: 'supplierName', label: 'Supplier', sortable: true },
  { key: 'warehouseName', label: 'Deliver to' },
  { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  { key: 'lines', label: 'Received', render: (p) => <div style={{ minWidth: 120 }}><Meter value={units(p, 'received')} max={units(p, 'ordered')} tone="success" /><div className="text-muted fs-xs mt-1 tabular-nums">{units(p, 'received')} / {units(p, 'ordered')} units</div></div> },
  { key: 'total', label: 'Total', align: 'end', sortable: true, render: (p) => <span className="tabular-nums fw-medium">{formatMoney(p.total, p.currency)}</span> },
  { key: 'expectedAt', label: 'Expected', sortable: true, render: (p) => <span className={['approved', 'partially_received'].includes(p.status) && new Date(p.expectedAt) < new Date() ? 'text-danger fw-medium' : ''}>{formatDate(p.expectedAt)}</span> },
]

export function PurchaseOrdersPage() {
  const suppliers = useSupplierOptions()
  const warehouses = useWarehouseOptions()
  return (
    <>
      <PageHeader title="Purchase orders" description="Orders to suppliers. Approval creates the expected goods receipt and raises incoming stock; inventory increases only for accepted quantities." actions={<Guard permission="procurement.create"><Link to={ROUTES.PURCHASE_ORDER_NEW} className="btn btn-primary"><i className="ri-add-line me-1" />New purchase order</Link></Guard>} />
      <ResourceList<PurchaseOrder>
        resource="purchase-orders"
        list={purchaseOrdersApi.list}
        columns={columns}
        itemsLabel="purchase orders"
        exportName="purchase-orders"
        searchPlaceholder="PO number or supplier…"
        rowLink={(p) => to(ROUTES.PURCHASE_ORDER, { id: p.id })}
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.poStatus }, { key: 'supplierId', allLabel: 'All suppliers', options: suppliers }, { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses }]}
      />
    </>
  )
}

type PoAction = 'submit' | 'approve' | 'cancel' | 'close'
const ACTIONS: Record<PoAction, { label: string; statuses: PurchaseOrder['status'][]; permission: string; message: string }> = {
  submit: { label: 'Submit for approval', statuses: ['draft'], permission: 'procurement.create', message: 'An approver with procurement.approve must accept it before it is sent.' },
  approve: { label: 'Approve', statuses: ['pending_approval'], permission: 'procurement.approve', message: 'Creates the expected goods receipt and marks ordered units as incoming.' },
  cancel: { label: 'Cancel PO', statuses: ['draft', 'pending_approval', 'approved'], permission: 'procurement.create', message: 'The supplier order is withdrawn. Nothing has been received yet.' },
  close: { label: 'Close PO', statuses: ['partially_received', 'received'], permission: 'procurement.approve', message: 'Remaining open quantities will no longer be expected.' },
}

export function PurchaseOrderPage() {
  const { id } = useParams()
  const po = useOne('purchase-orders', purchaseOrdersApi.get, id)
  const receipts = useAll('receipts', receiptsApi.list, { purchaseOrderId: id })
  const [pending, setPending] = useState<PoAction | null>(null)
  const act = useAction('purchase-orders', ({ action, id: poId }: { action: PoAction; id: string }) => purchaseOrdersApi[action](poId), { invalidates: ['receipts', 'balances'], success: (p) => `${p.number} updated`, onSuccess: () => setPending(null) })

  if (po.isLoading) return <Loader label="Loading purchase order…" />
  if (po.isError || !po.data) return <QueryError message={errorMessage(po.error)} onRetry={() => po.refetch()} />
  const p = po.data
  const money = (v: number) => formatMoney(v, p.currency)

  return (
    <>
      <PageHeader
        back={{ label: 'Purchase orders', to: ROUTES.PURCHASE_ORDERS }}
        title={p.number}
        meta={<StatusBadge status={p.status} />}
        description={`${p.supplierName} → ${p.warehouseName} · expected ${formatDate(p.expectedAt)}`}
        actions={(Object.keys(ACTIONS) as PoAction[]).filter((a) => ACTIONS[a].statuses.includes(p.status)).map((a) => (
          <Guard key={a} permission={ACTIONS[a].permission}>
            <button type="button" className={`btn ${a === 'cancel' ? 'btn-outline-danger' : a === 'close' ? 'btn-light' : 'btn-primary'}`} onClick={() => setPending(a)}>{ACTIONS[a].label}</button>
          </Guard>
        ))}
      />
      <div className="row g-4">
        <div className="col-xl-8 d-flex flex-column gap-4">
          <Panel title="Lines" icon="ri-list-check" flush description="Ordered, received, accepted and rejected are tracked separately; partial receipts are allowed.">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr className="text-muted fs-sm"><th>SKU</th><th className="text-end">Ordered</th><th className="text-end">Received</th><th className="text-end">Accepted</th><th className="text-end">Rejected</th><th className="text-end">Unit cost</th><th className="text-end">Line total</th></tr></thead>
                <tbody>
                  {p.lines.map((l) => (
                    <tr key={l.sku}>
                      <td><div className="font-monospace fw-medium">{l.sku}</div><div className="text-muted fs-sm">{l.title}</div></td>
                      <td className="text-end tabular-nums">{l.ordered}</td>
                      <td className="text-end tabular-nums">{l.received}</td>
                      <td className="text-end tabular-nums text-success">{l.accepted}</td>
                      <td className={`text-end tabular-nums ${l.rejected ? 'text-danger' : ''}`}>{l.rejected}</td>
                      <td className="text-end tabular-nums">{money(l.unitCost)}</td>
                      <td className="text-end tabular-nums fw-medium">{money(l.unitCost * l.ordered)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-top">
                  <tr><td colSpan={6} className="text-end text-muted border-0 py-1">Subtotal</td><td className="text-end tabular-nums border-0 py-1">{money(p.subtotal)}</td></tr>
                  <tr><td colSpan={6} className="text-end text-muted border-0 py-1">Tax</td><td className="text-end tabular-nums border-0 py-1">{money(p.tax)}</td></tr>
                  <tr><td colSpan={6} className="text-end fw-semibold">Total</td><td className="text-end tabular-nums fw-semibold">{money(p.total)}</td></tr>
                </tfoot>
              </table>
            </div>
          </Panel>
          <Panel title="Goods receipts" icon="ri-inbox-archive-line" flush>
            {receipts.data?.data.length ? (
              <ul className="list-group list-group-flush">
                {receipts.data.data.map((r) => <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center"><Link to={to(ROUTES.RECEIPT, { id: r.id })}>{r.number}</Link><span className="text-muted">{r.receivedBy ?? 'Not counted yet'}</span><StatusBadge status={r.status} /></li>)}
              </ul>
            ) : <p className="text-muted p-4 mb-0">A receipt is created when the PO is approved.</p>}
          </Panel>
        </div>
        <div className="col-xl-4">
          <Panel title="Details" icon="ri-information-line">
            <DetailList items={[{ label: 'Supplier', value: p.supplierName }, { label: 'Warehouse', value: p.warehouseName }, { label: 'Currency', value: p.currency }, { label: 'Approved by', value: p.approvedBy }, { label: 'Created', value: formatDate(p.createdAt) }]} />
            {p.notes && <p className="text-muted mt-3 mb-0">{p.notes}</p>}
          </Panel>
        </div>
      </div>
      <ConfirmDialog open={pending !== null} title={pending ? `${ACTIONS[pending].label}?` : ''} message={pending ? ACTIONS[pending].message : ''} confirmLabel={pending ? ACTIONS[pending].label : ''} danger={pending === 'cancel'} busy={act.isPending} onClose={() => setPending(null)} onConfirm={() => pending && act.mutate({ action: pending, id: p.id })} />
    </>
  )
}
