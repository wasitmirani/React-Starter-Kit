import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adjustmentsApi } from '@/api/endpoints/inventory.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { DataTableColumn } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Adjustment } from '@/types/inventory.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<Adjustment>[] = [
  { key: 'number', label: 'Adjustment', sortable: true, render: (a) => <div><div className="fw-medium">{a.number}</div><div className="text-muted fs-sm">{a.warehouseName}</div></div> },
  { key: 'reason', label: 'Reason', render: (a) => <div>{humanize(a.reason)}{a.note && <div className="text-muted fs-sm">{a.note}</div>}</div> },
  { key: 'lines', label: 'Lines', render: (a) => <div className="fs-sm">{a.lines.map((l) => <div key={l.sku}><span className="font-monospace">{l.sku}</span> <span className={l.quantity < 0 ? 'text-danger' : 'text-success'}>{l.quantity > 0 ? `+${l.quantity}` : l.quantity}</span></div>)}</div> },
  { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  { key: 'requestedBy', label: 'Requested by', render: (a) => <div>{a.requestedBy}{a.approvedBy && <div className="text-muted fs-sm">Decided by {a.approvedBy}</div>}</div> },
  { key: 'createdAt', label: 'Created', sortable: true, render: (a) => formatDateTime(a.createdAt) },
]

export function AdjustmentsPage() {
  const can = useCan()
  const [params, setParams] = useSearchParams()
  const warehouses = useWarehouseOptions()
  const [deciding, setDeciding] = useState<{ row: Adjustment; approve: boolean } | null>(null)
  const decide = useAction('adjustments', adjustmentsApi.decide, { invalidates: ['balances', 'ledger', 'dashboard'], success: (a) => `${a.number} ${a.status}`, onSuccess: () => setDeciding(null) })
  const creating = params.get('new') === '1'
  const closeCreate = () => setParams((p) => { p.delete('new'); return p }, { replace: true })

  return (
    <>
      <PageHeader
        title="Stock adjustments"
        description="Corrections with a reason code. Stock only changes once an approver with inventory.approve accepts the request."
        actions={<Guard permission="inventory.adjust"><button type="button" className="btn btn-primary" onClick={() => setParams({ new: '1' })}><i className="ri-add-line me-1" />New adjustment</button></Guard>}
      />
      <ResourceList<Adjustment>
        resource="adjustments"
        list={adjustmentsApi.list}
        columns={columns}
        itemsLabel="adjustments"
        exportName="adjustments"
        searchPlaceholder="Number, note, requester…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.adjustmentStatus }, { key: 'reason', allLabel: 'All reasons', options: OPTIONS.adjustmentReason }, { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses }]}
        actions={can('inventory.approve') ? [
          { key: 'approve', label: 'Approve', icon: 'ri-check-line', condition: (a) => a.status === 'pending_approval' },
          { key: 'reject', label: 'Reject', icon: 'ri-close-line', variant: 'delete', condition: (a) => a.status === 'pending_approval' },
        ] : undefined}
        onRowAction={(action, row) => setDeciding({ row, approve: action === 'approve' })}
      />
      <AdjustmentModal open={creating} onClose={closeCreate} />
      <ConfirmDialog
        open={deciding !== null}
        title={deciding?.approve ? `Approve ${deciding.row.number}?` : `Reject ${deciding?.row.number}?`}
        message={deciding?.approve ? <>Posts {deciding.row.lines.length} ledger movement(s) in {deciding.row.warehouseName}. This cannot be undone; correct mistakes with another adjustment.</> : 'Stock stays unchanged.'}
        confirmLabel={deciding?.approve ? 'Approve and post' : 'Reject'}
        danger={!deciding?.approve}
        busy={decide.isPending}
        onClose={() => setDeciding(null)}
        onConfirm={() => deciding && decide.mutate({ id: deciding.row.id, approve: deciding.approve })}
      />
    </>
  )
}

function AdjustmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const warehouses = useWarehouseOptions()
  const skus = useSkus()
  const [warehouseId, setWarehouseId] = useState('')
  const [reason, setReason] = useState<Adjustment['reason']>('count_correction')
  const [note, setNote] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: -1 }])
  const [error, setError] = useState<string>()
  const create = useAction('adjustments', adjustmentsApi.create, { success: (a) => `${a.number} sent for approval`, onSuccess: () => { setLines([{ sku: '', quantity: -1 }]); setNote(''); onClose() } })
  const wh = warehouseId || warehouses[0]?.value || ''

  const submit = () => {
    const problem = validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null, true) ?? (reason === 'other' && !note.trim() ? 'Explain the reason in the note.' : null)
    setError(problem ?? undefined)
    if (!problem) create.mutate({ warehouseId: wh, reason, note: note.trim(), lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })) })
  }

  return (
    <Modal open={open} onClose={onClose} title="New stock adjustment" size="lg" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={create.isPending} onClick={submit}>{create.isPending ? 'Submitting…' : 'Submit for approval'}</button></>}>
      <div className="row g-4">
        <FormField id="adj-wh" label="Warehouse" required className="col-md-6"><select id="adj-wh" className="form-select" value={wh} onChange={(e) => setWarehouseId(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <FormField id="adj-reason" label="Reason" required className="col-md-6"><select id="adj-reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value as Adjustment['reason'])}>{OPTIONS.adjustmentReason.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <FormField id="adj-note" label="Note" className="col-12" hint="Visible in the ledger and audit log."><input id="adj-note" className="form-control" value={note} onChange={(e) => setNote(e.target.value)} /></FormField>
        <div className="col-12">
          <label className="form-label">Lines <span className="text-muted fw-normal">(negative removes stock, positive adds)</span></label>
          <LineItemsEditor lines={lines} onChange={setLines} signed error={error} />
        </div>
      </div>
    </Modal>
  )
}
