import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { receiptsApi, type ReceiveLine } from '@/api/endpoints/warehouse.api'
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
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { Meter } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Receipt } from '@/types/warehouse.types'
import { formatDate } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<Receipt>[] = [
  { key: 'number', label: 'Receipt', sortable: true, render: (r) => <div><div className="fw-medium">{r.number}</div><div className="text-muted fs-sm">{r.purchaseOrderNumber ?? `${humanize(r.mode)} receipt`}</div></div> },
  { key: 'supplierName', label: 'Supplier', sortable: true },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'lines', label: 'Received', render: (r) => { const exp = r.lines.reduce((n, l) => n + l.expected, 0); const got = r.lines.reduce((n, l) => n + l.received, 0); return <div style={{ minWidth: 120 }}><Meter value={got} max={Math.max(exp, 1)} tone="success" /><div className="text-muted fs-xs mt-1 tabular-nums">{got} / {exp}</div></div> } },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'expectedAt', label: 'Expected', sortable: true, render: (r) => formatDate(r.expectedAt) },
]

export function ReceiptsPage() {
  const warehouses = useWarehouseOptions()
  const [blind, setBlind] = useState(false)
  return (
    <>
      <PageHeader title="Inbound receipts" description="Goods receipt notes (GRN) for purchase orders and blind receipts. Only accepted quantities increase stock." actions={<Guard permission="warehouse.receive"><button type="button" className="btn btn-primary" onClick={() => setBlind(true)}><i className="ri-add-line me-1" />Blind receipt</button></Guard>} />
      <ResourceList<Receipt> resource="receipts" list={receiptsApi.list} columns={columns} itemsLabel="receipts" exportName="receipts" searchPlaceholder="GRN, PO number, supplier…" rowLink={(r) => to(ROUTES.RECEIPT, { id: r.id })} filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.receiptStatus }, { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses }]} />
      <BlindReceiptModal open={blind} onClose={() => setBlind(false)} />
    </>
  )
}

function BlindReceiptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const warehouses = useWarehouseOptions()
  const skus = useSkus()
  const [warehouseId, setWarehouseId] = useState('')
  const [supplierName, setSupplier] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: 1 }])
  const [error, setError] = useState<string>()
  const create = useAction('receipts', receiptsApi.createBlind, { success: (r) => `${r.number} created`, onSuccess: onClose })
  const wh = warehouseId || warehouses[0]?.value || ''
  const submit = () => {
    const problem = !supplierName.trim() ? 'Enter the sender.' : validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null)
    setError(problem ?? undefined)
    if (!problem) create.mutate({ warehouseId: wh, supplierName: supplierName.trim(), lines: lines.map((l) => ({ sku: l.sku, expected: l.quantity })) })
  }
  return (
    <Modal open={open} onClose={onClose} title="Blind receipt" size="lg" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={create.isPending} onClick={submit}>Create receipt</button></>}>
      <p className="text-muted">For goods arriving without a purchase order (client stock, samples). Quantities are counted on arrival.</p>
      <div className="row g-4">
        <FormField id="br-wh" label="Warehouse" required className="col-md-6"><select id="br-wh" className="form-select" value={wh} onChange={(e) => setWarehouseId(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <FormField id="br-sup" label="Sender / client" required className="col-md-6"><input id="br-sup" className="form-control" value={supplierName} onChange={(e) => setSupplier(e.target.value)} /></FormField>
        <div className="col-12"><LineItemsEditor lines={lines} onChange={setLines} error={error} /></div>
      </div>
    </Modal>
  )
}

export function ReceiptPage() {
  const { id } = useParams()
  const can = useCan()
  const receipt = useOne('receipts', receiptsApi.get, id)
  const [lines, setLines] = useState<ReceiveLine[]>([])
  const receive = useAction('receipts', receiptsApi.receive, { invalidates: ['purchase-orders', 'balances', 'ledger', 'tasks'], success: (r) => (r.status === 'completed' ? `${r.number} completed; putaway tasks created` : 'Quantities saved') })

  useEffect(() => {
    if (receipt.data) setLines(receipt.data.lines.map((l) => ({ sku: l.sku, received: l.received || l.expected, rejected: l.rejected })))
  }, [receipt.data])

  if (receipt.isLoading) return <Loader label="Loading receipt…" />
  if (receipt.isError || !receipt.data) return <QueryError message={errorMessage(receipt.error)} onRetry={() => receipt.refetch()} />
  const r = receipt.data
  const editable = r.status !== 'completed' && can('warehouse.receive')
  const set = (sku: string, patch: Partial<ReceiveLine>) => setLines(lines.map((l) => (l.sku === sku ? { ...l, ...patch } : l)))
  const invalid = lines.some((l) => l.received < 0 || l.rejected < 0 || l.rejected > l.received)

  return (
    <>
      <PageHeader
        back={{ label: 'Inbound receipts', to: ROUTES.RECEIPTS }}
        title={r.number}
        meta={<><StatusBadge status={r.status} /><ToneBadge tone="light">{humanize(r.mode)}</ToneBadge></>}
        description={<>{r.supplierName} → {r.warehouseName}{r.purchaseOrderId && <> · <Link to={to(ROUTES.PURCHASE_ORDER, { id: r.purchaseOrderId })}>{r.purchaseOrderNumber}</Link></>}</>}
        actions={editable && (
          <>
            <button type="button" className="btn btn-light" disabled={invalid || receive.isPending} onClick={() => receive.mutate({ id: r.id, lines, complete: false })}>Save counts</button>
            <button type="button" className="btn btn-primary" disabled={invalid || receive.isPending} onClick={() => receive.mutate({ id: r.id, lines, complete: true })}>Complete receipt</button>
          </>
        )}
      />
      <Panel flush title="Lines" description="Received = counted on the dock. Rejected units (damaged, wrong item) go to quarantine and are not added to sellable stock.">
        <table className="table align-middle mb-0">
          <thead><tr className="text-muted fs-sm"><th>SKU</th><th className="text-end">Expected</th><th style={{ width: 130 }}>Received</th><th style={{ width: 130 }}>Rejected</th><th className="text-end">Accepted</th><th className="text-end">Over / short</th></tr></thead>
          <tbody>
            {r.lines.map((l) => {
              const draft = lines.find((x) => x.sku === l.sku) ?? { sku: l.sku, received: l.received, rejected: l.rejected }
              const diff = draft.received - l.expected
              return (
                <tr key={l.sku} className={draft.rejected > draft.received ? 'table-danger' : ''}>
                  <td><div className="font-monospace fw-medium">{l.sku}</div><div className="text-muted fs-sm">{l.title}</div></td>
                  <td className="text-end tabular-nums">{l.expected}</td>
                  <td>{editable ? <input type="number" min={0} className="form-control form-control-sm" aria-label={`Received ${l.sku}`} value={draft.received} onChange={(e) => set(l.sku, { received: Number(e.target.value) })} /> : <span className="tabular-nums">{l.received}</span>}</td>
                  <td>{editable ? <input type="number" min={0} className="form-control form-control-sm" aria-label={`Rejected ${l.sku}`} value={draft.rejected} onChange={(e) => set(l.sku, { rejected: Number(e.target.value) })} /> : <span className="tabular-nums">{l.rejected}</span>}</td>
                  <td className="text-end tabular-nums fw-semibold">{Math.max(0, draft.received - draft.rejected)}</td>
                  <td className={`text-end tabular-nums ${diff ? (diff > 0 ? 'text-warning' : 'text-danger') : 'text-muted'}`}>{diff > 0 ? `+${diff}` : diff || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>
      {r.receivedBy && <p className="text-muted fs-sm mt-3">Last counted by {r.receivedBy}.</p>}
    </>
  )
}
