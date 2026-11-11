import { useState } from 'react'
import { dispatchApi } from '@/api/endpoints/warehouse.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useCarrierOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { DispatchBatch } from '@/types/warehouse.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<DispatchBatch>[] = [
  { key: 'number', label: 'Manifest', sortable: true, render: (b) => <span className="fw-medium">{b.number}</span> },
  { key: 'carrierName', label: 'Carrier', sortable: true },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'shipmentIds', label: 'Shipments', align: 'end', render: (b) => b.shipmentIds.length },
  { key: 'parcels', label: 'Parcels', align: 'end' },
  { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  { key: 'driverName', label: 'Driver / vehicle', render: (b) => (b.driverName ? `${b.driverName} · ${b.vehicle}` : '—') },
  { key: 'handedOverAt', label: 'Handed over', render: (b) => (b.handedOverAt ? formatDateTime(b.handedOverAt) : '—') },
]

export function DispatchPage() {
  const can = useCan()
  const carriers = useCarrierOptions()
  const [creating, setCreating] = useState(false)
  const [handover, setHandover] = useState<DispatchBatch | null>(null)
  const create = useAction('dispatch', dispatchApi.create, { success: (b) => `${b.number} opened with ${b.shipmentIds.length} shipments` })
  const hand = useAction('dispatch', dispatchApi.handover, { invalidates: ['orders', 'shipments', 'balances', 'ledger', 'reservations', 'dashboard'], success: (b) => `${b.number} handed over; orders dispatched` })

  return (
    <>
      <PageHeader title="Dispatch manifests" description="Group booked shipments per carrier and record the handover. Orders become Dispatched and stock leaves the warehouse only at handover." actions={<Guard permission="warehouse.dispatch"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-file-list-3-line me-1" />New manifest</button></Guard>} />
      <ResourceList<DispatchBatch>
        resource="dispatch"
        list={dispatchApi.list}
        columns={columns}
        itemsLabel="manifests"
        searchPlaceholder="Manifest, carrier, driver…"
        filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.dispatchStatus }]}
        actions={can('warehouse.dispatch') ? [{ key: 'handover', label: 'Hand over', icon: 'ri-truck-line', condition: (b) => b.status !== 'handed_over' }] : undefined}
        onRowAction={(_, b) => setHandover(b)}
      />
      <EntityFormModal open={creating} title="New manifest" submitLabel="Create manifest" intro="Adds every booked shipment for the carrier that is not on another manifest." onClose={() => setCreating(false)} fields={[{ name: 'carrierId', label: 'Carrier', type: 'select', required: true, options: carriers }]} onSubmit={(v) => create.mutateAsync({ carrierId: String(v.carrierId) })} />
      <EntityFormModal
        open={handover !== null}
        title={`Hand over ${handover?.number ?? ''}`}
        submitLabel="Confirm handover"
        intro={`${handover?.parcels ?? 0} parcels to ${handover?.carrierName ?? ''}. Check the parcel count before the driver signs.`}
        onClose={() => setHandover(null)}
        fields={[{ name: 'driverName', label: 'Driver name', required: true, col: 6 }, { name: 'vehicle', label: 'Vehicle number', required: true, col: 6 }]}
        onSubmit={(v) => hand.mutateAsync({ id: handover!.id, driverName: String(v.driverName), vehicle: String(v.vehicle) })}
      />
    </>
  )
}
