import { useState } from 'react'
import { Link } from 'react-router-dom'
import { wavesApi } from '@/api/endpoints/warehouse.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { Meter } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions } from '@/hooks/queries/reference.queries'
import type { PickWave } from '@/types/warehouse.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<PickWave>[] = [
  { key: 'number', label: 'Wave', sortable: true, render: (w) => <Link to={`${ROUTES.TASKS}?q=${w.number}`} className="fw-medium" onClick={(e) => e.stopPropagation()}>{w.number}</Link> },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'strategy', label: 'Strategy', render: (w) => humanize(w.strategy) },
  { key: 'ordersCount', label: 'Orders', align: 'end' },
  { key: 'linesCount', label: 'Lines', align: 'end' },
  { key: 'unitsPicked', label: 'Picked', render: (w) => <div style={{ minWidth: 120 }}><Meter value={w.unitsPicked} max={w.unitsTotal} tone="success" /><div className="text-muted fs-xs mt-1 tabular-nums">{w.unitsPicked} / {w.unitsTotal} units</div></div> },
  { key: 'status', label: 'Status', render: (w) => <StatusBadge status={w.status} /> },
  { key: 'assignees', label: 'Pickers', render: (w) => w.assignees.join(', ') || <span className="text-muted">—</span> },
  { key: 'cutoffAt', label: 'Cutoff', sortable: true, render: (w) => formatDateTime(w.cutoffAt) },
]

export function WavesPage() {
  const warehouses = useWarehouseOptions()
  const [creating, setCreating] = useState(false)
  const create = useAction('waves', wavesApi.create, { invalidates: ['tasks', 'orders'], success: (w) => `${w.number} released: ${w.ordersCount} orders, ${w.unitsTotal} units` })
  return (
    <>
      <PageHeader title="Pick waves" description="Batch allocated orders into waves; each line becomes a pick task routed by bin." actions={<Guard permission="warehouse.manage"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-stack-line me-1" />Release wave</button></Guard>} />
      <ResourceList<PickWave> resource="waves" list={wavesApi.list} columns={columns} itemsLabel="waves" searchPlaceholder="Wave number…" filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.waveStatus }, { key: 'strategy', allLabel: 'Any strategy', options: OPTIONS.waveStrategy }]} />
      <EntityFormModal
        open={creating}
        title="Release pick wave"
        submitLabel="Create wave"
        intro="Takes allocated orders in the warehouse (oldest first), creates pick tasks and moves the orders to Picking."
        onClose={() => setCreating(false)}
        initial={{ strategy: 'batch', maxOrders: 25 }}
        fields={[
          { name: 'warehouseId', label: 'Warehouse', type: 'select', required: true, options: warehouses },
          { name: 'strategy', label: 'Strategy', type: 'select', required: true, options: OPTIONS.waveStrategy, col: 6 },
          { name: 'maxOrders', label: 'Max orders', type: 'number', required: true, min: 1, max: 200, col: 6 },
        ]}
        onSubmit={(v) => create.mutateAsync({ warehouseId: String(v.warehouseId), strategy: v.strategy as PickWave['strategy'], maxOrders: Number(v.maxOrders) })}
      />
    </>
  )
}
