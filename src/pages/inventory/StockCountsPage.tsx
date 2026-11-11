import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { stockCountsApi } from '@/api/endpoints/inventory.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import { useStaffOptions, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import type { CountLine, StockCount } from '@/types/inventory.types'
import { formatDate } from '@/utils/formatters/date.formatter'

const variance = (c: StockCount) => c.lines.reduce((n, l) => n + (l.counted == null ? 0 : l.counted - l.expected), 0)

const columns: DataTableColumn<StockCount>[] = [
  { key: 'number', label: 'Count', sortable: true, render: (c) => <div><div className="fw-medium">{c.number}</div><div className="text-muted fs-sm">{humanize(c.type)} · zone {c.zone}</div></div> },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  { key: 'lines', label: 'Progress', render: (c) => `${c.lines.filter((l) => l.counted != null).length} / ${c.lines.length} lines` },
  { key: 'updatedAt', label: 'Variance', align: 'end', render: (c) => { const v = variance(c); return <span className={`tabular-nums ${v ? 'text-danger fw-semibold' : 'text-muted'}`}>{v > 0 ? `+${v}` : v}</span> } },
  { key: 'assigneeName', label: 'Counter' },
  { key: 'scheduledFor', label: 'Scheduled', sortable: true, render: (c) => formatDate(c.scheduledFor) },
]

export function StockCountsPage() {
  const [creating, setCreating] = useState(false)
  const warehouses = useWarehouseOptions()
  const staff = useStaffOptions()
  const create = useAction('stock-counts', stockCountsApi.create, { success: (c) => `${c.number} scheduled with ${c.lines.length} lines` })
  return (
    <>
      <PageHeader
        title="Stock counts"
        description="Cycle counts by zone and full stocktakes. Variances post to the ledger only after approval."
        actions={<Guard permission="inventory.adjust"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />Schedule count</button></Guard>}
      />
      <ResourceList<StockCount> resource="stock-counts" list={stockCountsApi.list} columns={columns} itemsLabel="counts" searchPlaceholder="Number, zone, counter…" rowLink={(c) => to(ROUTES.STOCK_COUNT, { id: c.id })} filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.countStatus }, { key: 'type', allLabel: 'All types', options: OPTIONS.countType }, { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses }]} />
      <EntityFormModal
        open={creating}
        title="Schedule stock count"
        submitLabel="Schedule"
        onClose={() => setCreating(false)}
        initial={{ type: 'cycle', zone: 'A', scheduledFor: new Date().toISOString() }}
        fields={[
          { name: 'warehouseId', label: 'Warehouse', type: 'select', required: true, options: warehouses },
          { name: 'type', label: 'Type', type: 'select', required: true, options: OPTIONS.countType, col: 6 },
          { name: 'zone', label: 'Zone', type: 'select', required: true, options: ['A', 'B', 'C'].map((z) => ({ value: z, label: `Zone ${z}` })), col: 6, hint: 'Ignored for a full stocktake.' },
          { name: 'assigneeName', label: 'Counter', type: 'select', required: true, options: staff, col: 6 },
          { name: 'scheduledFor', label: 'Date', type: 'date', required: true, col: 6 },
        ]}
        onSubmit={(v) => create.mutateAsync({ warehouseId: String(v.warehouseId), type: v.type as StockCount['type'], zone: String(v.zone), assigneeName: String(v.assigneeName), scheduledFor: new Date(String(v.scheduledFor)).toISOString() })}
      />
    </>
  )
}

export function StockCountPage() {
  const { id } = useParams()
  const count = useOne('stock-counts', stockCountsApi.get, id)
  const [lines, setLines] = useState<CountLine[]>([])
  const save = useAction('stock-counts', stockCountsApi.saveCounts, { success: (c) => (c.status === 'submitted' ? 'Submitted for approval' : 'Progress saved') })
  const approve = useAction('stock-counts', stockCountsApi.approve, { invalidates: ['balances', 'ledger'], success: 'Variances posted to the ledger' })

  useEffect(() => {
    if (count.data) setLines(count.data.lines)
  }, [count.data])

  if (count.isLoading) return <Loader label="Loading count…" />
  if (count.isError || !count.data) return <QueryError message={errorMessage(count.error)} onRetry={() => count.refetch()} />
  const c = count.data
  const editable = c.status === 'scheduled' || c.status === 'in_progress'
  const total = lines.reduce((n, l) => n + (l.counted == null ? 0 : l.counted - l.expected), 0)

  return (
    <>
      <PageHeader
        back={{ label: 'Stock counts', to: ROUTES.STOCK_COUNTS }}
        title={c.number}
        meta={<StatusBadge status={c.status} />}
        description={`${humanize(c.type)} count · ${c.warehouseName} · zone ${c.zone} · ${c.assigneeName}`}
        actions={
          <>
            {editable && (
              <Guard permission="inventory.adjust">
                <button type="button" className="btn btn-light" disabled={save.isPending} onClick={() => save.mutate({ id: c.id, lines, submit: false })}>Save progress</button>
              </Guard>
            )}
            {editable && (
              <Guard permission="inventory.adjust">
                <button type="button" className="btn btn-primary" disabled={save.isPending || lines.some((l) => l.counted == null)} onClick={() => save.mutate({ id: c.id, lines, submit: true })}>Submit count</button>
              </Guard>
            )}
            {c.status === 'submitted' && (
              <Guard permission="inventory.approve">
                <button type="button" className="btn btn-primary" disabled={approve.isPending} onClick={() => approve.mutate(c.id)}>Approve variances</button>
              </Guard>
            )}
          </>
        }
      />
      <Panel flush title="Count sheet" description={editable ? 'Blind count: enter what is on the shelf. Expected quantities are shown for supervisors.' : `Net variance ${total > 0 ? '+' : ''}${total} units`}>
        <table className="table align-middle mb-0">
          <thead><tr className="text-muted fs-sm"><th>Bin</th><th>SKU</th><th className="text-end">Expected</th><th style={{ width: 140 }}>Counted</th><th className="text-end">Variance</th></tr></thead>
          <tbody>
            {lines.map((l, i) => {
              const v = l.counted == null ? null : l.counted - l.expected
              return (
                <tr key={`${l.sku}-${l.binCode}`} className={v ? 'table-warning' : ''}>
                  <td className="font-monospace">{l.binCode}</td>
                  <td className="font-monospace">{l.sku}</td>
                  <td className="text-end tabular-nums">{l.expected}</td>
                  <td>
                    {editable ? (
                      <input type="number" min={0} className="form-control form-control-sm" aria-label={`Counted ${l.sku}`} value={l.counted ?? ''} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, counted: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) } : x)))} />
                    ) : <span className="tabular-nums">{l.counted ?? '—'}</span>}
                  </td>
                  <td className={`text-end tabular-nums fw-semibold ${v ? (v > 0 ? 'text-success' : 'text-danger') : 'text-muted'}`}>{v == null ? '—' : v > 0 ? `+${v}` : v}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>
    </>
  )
}
