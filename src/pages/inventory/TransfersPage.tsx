import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { transfersApi } from '@/api/endpoints/inventory.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Transfer } from '@/types/inventory.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<Transfer>[] = [
  { key: 'number', label: 'Transfer', sortable: true, render: (t) => <span className="fw-medium">{t.number}</span> },
  { key: 'fromWarehouseName', label: 'Route', render: (t) => <span>{t.fromWarehouseName} <i className="ri-arrow-right-line text-muted mx-1" /> {t.toWarehouseName}</span> },
  { key: 'lines', label: 'Units', align: 'end', render: (t) => <span className="tabular-nums">{t.lines.reduce((n, l) => n + l.quantity, 0)}{t.status === 'received' && <span className="text-muted"> / {t.lines.reduce((n, l) => n + l.received, 0)} rcvd</span>}</span> },
  { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  { key: 'dispatchedAt', label: 'Dispatched', render: (t) => (t.dispatchedAt ? formatDateTime(t.dispatchedAt) : '—') },
  { key: 'receivedAt', label: 'Received', render: (t) => (t.receivedAt ? formatDateTime(t.receivedAt) : '—') },
]

export function TransfersPage() {
  const can = useCan()
  const [params, setParams] = useSearchParams()
  const [receiving, setReceiving] = useState<Transfer | null>(null)
  const opts = { invalidates: ['balances', 'ledger'] }
  const dispatch = useAction('transfers', transfersApi.dispatch, { ...opts, success: (t) => `${t.number} dispatched: stock is now in transit` })
  const cancel = useAction('transfers', transfersApi.cancel, { success: 'Transfer cancelled' })

  return (
    <>
      <PageHeader
        title="Transfers"
        description="Move stock between warehouses. Dispatched units stay in transit (not sellable anywhere) until the destination receives them."
        actions={<Guard permission="inventory.transfer"><button type="button" className="btn btn-primary" onClick={() => setParams({ new: '1' })}><i className="ri-add-line me-1" />New transfer</button></Guard>}
      />
      <ResourceList<Transfer>
        resource="transfers"
        list={transfersApi.list}
        columns={columns}
        itemsLabel="transfers"
        searchPlaceholder="Transfer number…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.transferStatus }]}
        actions={can('inventory.transfer') ? [
          { key: 'dispatch', label: 'Dispatch', icon: 'ri-truck-line', condition: (t) => t.status === 'draft' },
          { key: 'receive', label: 'Receive', icon: 'ri-inbox-archive-line', condition: (t) => t.status === 'in_transit' },
          { key: 'cancel', label: 'Cancel', icon: 'ri-close-line', variant: 'delete', condition: (t) => t.status === 'draft' },
        ] : undefined}
        onRowAction={(action, t) => (action === 'dispatch' ? dispatch.mutate(t.id) : action === 'cancel' ? cancel.mutate(t.id) : setReceiving(t))}
      />
      <TransferModal open={params.get('new') === '1'} onClose={() => setParams((p) => { p.delete('new'); return p }, { replace: true })} />
      <ReceiveTransferModal transfer={receiving} onClose={() => setReceiving(null)} />
    </>
  )
}

function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const warehouses = useWarehouseOptions()
  const skus = useSkus()
  const [from, setFrom] = useState('')
  const [toWh, setTo] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: 1 }])
  const [error, setError] = useState<string>()
  const create = useAction('transfers', transfersApi.create, { success: (t) => `${t.number} created as draft`, onSuccess: () => { setLines([{ sku: '', quantity: 1 }]); onClose() } })
  const source = from || warehouses[0]?.value || ''
  const dest = toWh || warehouses.find((w) => w.value !== source)?.value || ''

  const submit = () => {
    const problem = source === dest ? 'Source and destination must differ.' : validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null)
    setError(problem ?? undefined)
    if (!problem) create.mutate({ fromWarehouseId: source, toWarehouseId: dest, note: '', lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })) })
  }

  return (
    <Modal open={open} onClose={onClose} title="New transfer" size="lg" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={create.isPending} onClick={submit}>Create draft</button></>}>
      <div className="row g-4">
        <FormField id="trf-from" label="From" required className="col-md-6"><select id="trf-from" className="form-select" value={source} onChange={(e) => setFrom(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <FormField id="trf-to" label="To" required className="col-md-6"><select id="trf-to" className="form-select" value={dest} onChange={(e) => setTo(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
        <div className="col-12"><LineItemsEditor lines={lines} onChange={setLines} error={error} /></div>
      </div>
    </Modal>
  )
}

function ReceiveTransferModal({ transfer, onClose }: { transfer: Transfer | null; onClose: () => void }) {
  const [received, setReceived] = useState<Record<string, number>>({})
  const receive = useAction('transfers', transfersApi.receive, { invalidates: ['balances', 'ledger'], success: (t) => `${t.number} received`, onSuccess: () => { setReceived({}); onClose() } })
  return (
    <Modal open={transfer !== null} onClose={onClose} title={`Receive ${transfer?.number ?? ''}`} footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={receive.isPending} onClick={() => transfer && receive.mutate({ id: transfer.id, received })}>Confirm receipt</button></>}>
      <p className="text-muted">Enter what physically arrived at {transfer?.toWarehouseName}. Shortages are recorded and leave transit.</p>
      <table className="table align-middle">
        <thead><tr className="text-muted fs-sm"><th>SKU</th><th className="text-end">Sent</th><th style={{ width: 130 }}>Received</th></tr></thead>
        <tbody>
          {transfer?.lines.map((l) => (
            <tr key={l.sku}>
              <td className="font-monospace">{l.sku}</td>
              <td className="text-end tabular-nums">{l.quantity}</td>
              <td><input type="number" min={0} max={l.quantity} className="form-control form-control-sm" aria-label={`Received ${l.sku}`} value={received[l.sku] ?? l.quantity} onChange={(e) => setReceived({ ...received, [l.sku]: Number(e.target.value) })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
