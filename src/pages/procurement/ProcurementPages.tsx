import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requisitionsApi, supplierReturnsApi, suppliersApi } from '@/api/endpoints/procurement.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal, type FieldDef } from '@/components/common/EntityFormModal'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useSupplierOptions, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Requisition, Supplier, SupplierReturn } from '@/types/procurement.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate } from '@/utils/formatters/date.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'

const SUPPLIER_FIELDS: FieldDef[] = [
  { name: 'code', label: 'Code', required: true, col: 4 },
  { name: 'name', label: 'Name', required: true, col: 8 },
  { name: 'contactName', label: 'Contact person', required: true, col: 6 },
  { name: 'email', label: 'Email', type: 'email', required: true, col: 6 },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, col: 6 },
  { name: 'city', label: 'City', required: true, col: 6 },
  { name: 'country', label: 'Country', type: 'select', required: true, options: [{ value: 'PK', label: 'Pakistan' }, { value: 'AE', label: 'UAE' }, { value: 'CN', label: 'China' }], col: 4 },
  { name: 'currency', label: 'Currency', type: 'select', required: true, options: OPTIONS.currency, col: 4 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: OPTIONS.activeStatus, col: 4 },
  { name: 'paymentTerms', label: 'Payment terms', type: 'select', required: true, options: ['Advance', 'Net 15', 'Net 30', 'Net 45'].map((t) => ({ value: t, label: t })), col: 6 },
  { name: 'leadTimeDays', label: 'Lead time (days)', type: 'number', required: true, min: 0, col: 6 },
]

export function SuppliersPage() {
  const can = useCan()
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null)
  const save = useAction('suppliers', (v: Record<string, unknown>) => (editing === 'new' ? suppliersApi.create({ onTimeRate: 1, openOrders: 0, ...v } as Supplier) : suppliersApi.update((editing as Supplier).id, v)), { success: 'Supplier saved' })
  const columns: DataTableColumn<Supplier>[] = [
    { key: 'name', label: 'Supplier', sortable: true, render: (s) => <div><div className="fw-medium">{s.name}</div><div className="text-muted fs-sm">{s.code} · {s.city}, {s.country}</div></div> },
    { key: 'contactName', label: 'Contact', render: (s) => <div>{s.contactName}<div className="text-muted fs-sm">{s.email}</div></div> },
    { key: 'paymentTerms', label: 'Terms', render: (s) => `${s.paymentTerms} · ${s.currency}` },
    { key: 'leadTimeDays', label: 'Lead time', align: 'end', sortable: true, render: (s) => `${s.leadTimeDays} d` },
    { key: 'onTimeRate', label: 'On time', align: 'end', sortable: true, render: (s) => <span className={s.onTimeRate < 0.85 ? 'text-warning fw-medium' : ''}>{formatPercent(s.onTimeRate)}</span> },
    { key: 'openOrders', label: 'Open POs', align: 'end' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ]
  return (
    <>
      <PageHeader title="Suppliers" description="Vendors, terms, lead times and delivery performance." actions={<Guard permission="procurement.create"><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />Add supplier</button></Guard>} />
      <ResourceList<Supplier> resource="suppliers" list={suppliersApi.list} columns={columns} itemsLabel="suppliers" exportName="suppliers" searchPlaceholder="Name, code, contact…" filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.activeStatus }]} actions={can('procurement.create') ? [{ key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' }] : undefined} onRowAction={(_, s) => setEditing(s)} />
      <EntityFormModal open={editing !== null} title={editing === 'new' ? 'Add supplier' : 'Edit supplier'} fields={SUPPLIER_FIELDS} initial={editing && editing !== 'new' ? (editing as unknown as Record<string, unknown>) : { country: 'PK', currency: 'PKR', status: 'active', paymentTerms: 'Net 30', leadTimeDays: 14 }} submitLabel="Save supplier" size="lg" onClose={() => setEditing(null)} onSubmit={(v) => save.mutateAsync(v)} />
    </>
  )
}

export function RequisitionsPage() {
  const can = useCan()
  const navigate = useNavigate()
  const suppliers = useSupplierOptions()
  const [creating, setCreating] = useState(false)
  const [converting, setConverting] = useState<Requisition | null>(null)
  const decide = useAction('requisitions', requisitionsApi.decide, { success: (r) => `${r.number} ${r.status}` })
  const convert = useAction('requisitions', requisitionsApi.convert, { invalidates: ['purchase-orders'], success: (p) => `${p.number} created`, onSuccess: (p) => navigate(to(ROUTES.PURCHASE_ORDER, { id: p.id })) })
  const columns: DataTableColumn<Requisition>[] = [
    { key: 'number', label: 'Requisition', sortable: true, render: (r) => <span className="fw-medium">{r.number}</span> },
    { key: 'reason', label: 'Reason' },
    { key: 'warehouseName', label: 'For' },
    { key: 'lines', label: 'Items', render: (r) => <span className="fs-sm">{r.lines.map((l) => `${l.quantity} × ${l.sku}`).join(', ')}</span> },
    { key: 'requestedBy', label: 'Requested by' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'neededBy', label: 'Needed by', sortable: true, render: (r) => formatDate(r.neededBy) },
  ]
  return (
    <>
      <PageHeader title="Requisitions" description="Internal purchase requests. Approved requisitions convert into draft purchase orders." actions={<Guard permission="procurement.create"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />New requisition</button></Guard>} />
      <ResourceList<Requisition>
        resource="requisitions"
        list={requisitionsApi.list}
        columns={columns}
        itemsLabel="requisitions"
        searchPlaceholder="Number, requester, reason…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.requisitionStatus }]}
        actions={[
          ...(can('procurement.approve') ? [{ key: 'approve', label: 'Approve', icon: 'ri-check-line', condition: (r: Requisition) => r.status === 'submitted' }, { key: 'reject', label: 'Reject', icon: 'ri-close-line', variant: 'delete' as const, condition: (r: Requisition) => r.status === 'submitted' }] : []),
          ...(can('procurement.create') ? [{ key: 'convert', label: 'Convert to PO', icon: 'ri-file-transfer-line', condition: (r: Requisition) => r.status === 'approved' }] : []),
        ]}
        onRowAction={(action, r) => (action === 'convert' ? setConverting(r) : decide.mutate({ id: r.id, approve: action === 'approve' }))}
      />
      <RequisitionModal open={creating} onClose={() => setCreating(false)} />
      <EntityFormModal open={converting !== null} title={`Convert ${converting?.number ?? ''}`} submitLabel="Create draft PO" onClose={() => setConverting(null)} fields={[{ name: 'supplierId', label: 'Supplier', type: 'select', required: true, options: suppliers }]} onSubmit={(v) => convert.mutateAsync({ id: converting!.id, supplierId: String(v.supplierId) })} />
    </>
  )
}

function RequisitionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const warehouses = useWarehouseOptions('name')
  const skus = useSkus()
  const [warehouseName, setWarehouse] = useState('')
  const [reason, setReason] = useState('')
  const [neededBy, setNeededBy] = useState(new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10))
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: 10 }])
  const [error, setError] = useState<string>()
  const create = useAction('requisitions', requisitionsApi.create, { success: (r) => `${r.number} submitted`, onSuccess: onClose })
  const wh = warehouseName || warehouses[0]?.value || ''
  const submit = () => {
    const problem = !reason.trim() ? 'Give a reason.' : validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null)
    setError(problem ?? undefined)
    if (!problem) create.mutate({ warehouseName: wh, reason: reason.trim(), neededBy: new Date(neededBy).toISOString(), lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })) })
  }
  return (
    <Modal open={open} onClose={onClose} title="New requisition" size="lg" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={create.isPending} onClick={submit}>Submit</button></>}>
      <div className="row g-4">
        <FormField id="rq-wh" label="Warehouse" required className="col-md-6"><select id="rq-wh" className="form-select" value={wh} onChange={(e) => setWarehouse(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <FormField id="rq-date" label="Needed by" required className="col-md-6"><input id="rq-date" type="date" className="form-control" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} /></FormField>
        <FormField id="rq-reason" label="Reason" required className="col-12"><input id="rq-reason" className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} /></FormField>
        <div className="col-12"><LineItemsEditor lines={lines} onChange={setLines} error={error} /></div>
      </div>
    </Modal>
  )
}

export function SupplierReturnsPage() {
  const can = useCan()
  const advance = useAction('supplier-returns', supplierReturnsApi.advance, { success: (r) => `${r.number}: ${r.status}` })
  const columns: DataTableColumn<SupplierReturn>[] = [
    { key: 'number', label: 'Return', sortable: true, render: (r) => <span className="fw-medium">{r.number}</span> },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'purchaseOrderNumber', label: 'PO' },
    { key: 'lines', label: 'Items', render: (r) => r.lines.map((l) => `${l.quantity} × ${l.sku}`).join(', ') },
    { key: 'reason', label: 'Reason' },
    { key: 'creditAmount', label: 'Credit', align: 'end', render: (r) => <span className="tabular-nums">{formatMoney(r.creditAmount, r.currency)}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]
  return (
    <>
      <PageHeader title="Supplier returns" description="Rejected or defective stock going back to suppliers, tracked until the credit note arrives." />
      <ResourceList<SupplierReturn>
        resource="supplier-returns"
        list={supplierReturnsApi.list}
        columns={columns}
        itemsLabel="supplier returns"
        searchPlaceholder="Number or supplier…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.supplierReturnStatus }]}
        actions={can('procurement.create') ? [{ key: 'ship', label: 'Mark shipped', icon: 'ri-truck-line', condition: (r) => r.status === 'draft' }, { key: 'credit', label: 'Credit received', icon: 'ri-money-dollar-circle-line', condition: (r) => r.status === 'shipped' }] : undefined}
        onRowAction={(_, r) => advance.mutate(r.id)}
      />
    </>
  )
}
