import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { packingApi } from '@/api/endpoints/warehouse.api'
import { toApiError } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Guard } from '@/components/common/Guard'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { ScanInput, type ScanFeedback } from '@/components/features/scan/ScanInput'
import { Meter } from '@/components/ui/Controls'
import { Drawer } from '@/components/ui/Drawer'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import { useCan } from '@/hooks/useCan'
import type { PackingSession } from '@/types/warehouse.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

const PACKAGES = ['Mailer S', 'Mailer M', 'Box S', 'Box M', 'Box L']

const columns: DataTableColumn<PackingSession>[] = [
  { key: 'orderNumber', label: 'Order', sortable: true, render: (s) => <Link to={to(ROUTES.ORDER, { id: s.orderId })} className="fw-medium" onClick={(e) => e.stopPropagation()}>{s.orderNumber}</Link> },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'station', label: 'Station' },
  { key: 'items', label: 'Verified', render: (s) => { const q = s.items.reduce((n, i) => n + i.quantity, 0); const v = s.items.reduce((n, i) => n + i.verified, 0); return <div style={{ minWidth: 100 }}><Meter value={v} max={q} tone={s.status === 'exception' ? 'danger' : 'success'} /><div className="text-muted fs-xs mt-1">{v} / {q} units</div></div> } },
  { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  { key: 'packageType', label: 'Package', render: (s) => (s.packageType ? `${s.packageType} · ${s.weightKg} kg` : '—') },
  { key: 'packerName', label: 'Packer' },
  { key: 'updatedAt', label: 'Updated', render: (s) => formatRelativeTime(s.updatedAt) },
]

export function PackingPage() {
  const can = useCan()
  const [openId, setOpenId] = useState<string | null>(null)
  const picking = useAll('orders', ordersApi.list, { status: 'picking' })
  const start = useAction('packing', packingApi.open, { onSuccess: (s) => setOpenId(s.id) })

  return (
    <>
      <PageHeader
        title="Packing"
        description="Scan every unit into the parcel. An order can only be packed once all quantities are verified."
        actions={
          <Guard permission="warehouse.pack">
            <select className="form-select" style={{ minWidth: 240 }} value="" aria-label="Start packing an order" disabled={start.isPending} onChange={(e) => e.target.value && start.mutate({ orderId: e.target.value, station: 'Station 1' })}>
              <option value="">Start packing an order…</option>
              {(picking.data?.data ?? []).map((o) => <option key={o.id} value={o.id}>{o.number} · {o.customerName}</option>)}
            </select>
          </Guard>
        }
      />
      <ResourceList<PackingSession>
        resource="packing"
        list={packingApi.list}
        columns={columns}
        itemsLabel="sessions"
        searchPlaceholder="Order, station, packer…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.packingStatus }]}
        actions={can('warehouse.pack') ? [{ key: 'open', label: 'Open', icon: 'ri-archive-2-line', condition: (s) => s.status !== 'packed' }] : undefined}
        onRowAction={(_, s) => setOpenId(s.id)}
      />
      <PackingDrawer id={openId} onClose={() => setOpenId(null)} />
    </>
  )
}

function PackingDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const session = useOne('packing', packingApi.get, id ?? undefined)
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const [pkg, setPkg] = useState(PACKAGES[1])
  const [weight, setWeight] = useState(1)
  const verify = useAction('packing', packingApi.verify, { quietErrors: true })
  const pack = useAction('packing', packingApi.pack, { invalidates: ['orders', 'shipments'], success: (s) => `${s.orderNumber} packed; shipment ready to book`, onSuccess: onClose })
  const s = session.data

  return (
    <Drawer open={id !== null} onClose={onClose} title={s ? `Pack ${s.orderNumber}` : 'Packing'} subtitle={s && `${s.station} · ${s.warehouseName}`} size="lg"
      footer={s && s.status !== 'packed' && (
        <>
          <select className="form-select w-auto" value={pkg} onChange={(e) => setPkg(e.target.value)} aria-label="Package type">{PACKAGES.map((p) => <option key={p}>{p}</option>)}</select>
          <input type="number" min={0.05} step={0.05} className="form-control w-auto" style={{ maxWidth: 110 }} value={weight} onChange={(e) => setWeight(Number(e.target.value))} aria-label="Weight in kg" />
          <button type="button" className="btn btn-primary" disabled={s.status !== 'verified' || pack.isPending || weight <= 0} onClick={() => pack.mutate({ id: s.id, packageType: pkg, weightKg: weight })}>Pack and create shipment</button>
        </>
      )}
    >
      {s && (
        <>
          {s.status !== 'packed' && (
            <ScanInput
              label="Scan item barcode or SKU"
              feedback={feedback}
              busy={verify.isPending}
              onScan={(code) => verify.mutateAsync({ id: s.id, code }).then((r) => setFeedback({ ok: true, message: r.status === 'verified' ? 'All items verified. Choose a package and weight.' : `${code} verified` })).catch((e) => setFeedback({ ok: false, message: toApiError(e).message }))}
            />
          )}
          <table className="table align-middle mt-4">
            <thead><tr className="text-muted fs-sm"><th>Item</th><th className="text-end">Verified</th></tr></thead>
            <tbody>
              {s.items.map((i) => (
                <tr key={i.sku} className={i.verified >= i.quantity ? 'table-success' : ''}>
                  <td><div className="font-monospace fw-medium">{i.sku}</div><div className="text-muted fs-sm">{i.title}</div></td>
                  <td className="text-end tabular-nums fs-5">{i.verified} / {i.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Drawer>
  )
}
