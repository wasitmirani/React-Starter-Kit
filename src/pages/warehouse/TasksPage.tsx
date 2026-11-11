import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tasksApi } from '@/api/endpoints/warehouse.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError, Timeline } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { DetailList, Meter } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS, TASK_ICONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import { useStaffOptions, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { WarehouseTask } from '@/types/warehouse.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

const overdue = (t: WarehouseTask) => t.status !== 'completed' && new Date(t.dueAt).getTime() < Date.now()

export const taskColumns: DataTableColumn<WarehouseTask>[] = [
  { key: 'number', label: 'Task', sortable: true, render: (t) => <div className="d-flex align-items-center gap-2"><span className="icon-tile icon-tile-sm bg-light text-muted"><i className={TASK_ICONS[t.type]} /></span><div><div className="fw-medium">{t.number}</div><div className="text-muted fs-sm">{humanize(t.type)}{t.waveNumber ? ` · ${t.waveNumber}` : ''}</div></div></div> },
  { key: 'sku', label: 'Item', render: (t) => <div><span className="font-monospace">{t.sku}</span><div className="text-muted fs-sm text-truncate" style={{ maxWidth: 220 }}>{t.productTitle}</div></div> },
  { key: 'fromBin', label: 'From → to', render: (t) => <span className="font-monospace fs-sm">{t.fromBin ?? '—'} → {t.toBin ?? '—'}</span> },
  { key: 'quantity', label: 'Progress', render: (t) => <div style={{ minWidth: 90 }}><Meter value={t.quantityDone} max={t.quantity} tone={t.status === 'exception' ? 'danger' : 'success'} /><div className="text-muted fs-xs mt-1 tabular-nums">{t.quantityDone} / {t.quantity}</div></div> },
  { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  { key: 'priority', label: 'Priority', render: (t) => (t.priority === 'normal' ? <span className="text-muted">Normal</span> : <StatusBadge status={t.priority} />) },
  { key: 'assigneeName', label: 'Assignee', render: (t) => t.assigneeName ?? <span className="text-muted">Unassigned</span> },
  { key: 'orderNumber', label: 'Order', hidden: true },
  { key: 'dueAt', label: 'Due', sortable: true, render: (t) => <span className={overdue(t) ? 'text-danger fw-medium' : 'text-muted'}>{formatRelativeTime(t.dueAt)}</span> },
]

function TaskList({ scope, title, description }: { scope?: Record<string, string>; title: string; description: string }) {
  const can = useCan()
  const warehouses = useWarehouseOptions()
  const staff = useStaffOptions()
  const [assigning, setAssigning] = useState<WarehouseTask[] | null>(null)
  const [assignee, setAssignee] = useState('')
  const assign = useAction('tasks', tasksApi.assign, { success: 'Tasks assigned', onSuccess: () => setAssigning(null) })
  const resolve = useAction('tasks', tasksApi.resolveException, { success: 'Exception resolved' })

  return (
    <>
      <PageHeader title={title} description={description} actions={<Link to={ROUTES.SCAN} className="btn btn-primary"><i className="ri-barcode-line me-1" />Open scanner</Link>} />
      <ResourceList<WarehouseTask>
        resource="tasks"
        list={tasksApi.list}
        scope={scope}
        columns={taskColumns}
        itemsLabel="tasks"
        exportName="warehouse-tasks"
        searchPlaceholder="Task, SKU, order, assignee…"
        rowLink={(t) => to(ROUTES.TASK, { id: t.id })}
        filters={[
          ...(scope?.type ? [] : [{ key: 'type', allLabel: 'All types', options: OPTIONS.taskType }]),
          { key: 'status', allLabel: 'All statuses', options: OPTIONS.taskStatus },
          { key: 'warehouseId', allLabel: 'All warehouses', options: warehouses },
          { key: 'assigneeName', allLabel: 'Anyone', options: staff },
        ]}
        bulkActions={can('warehouse.manage') ? [{ action: 'assign', label: 'Assign / reassign' }] : undefined}
        onBulkAction={(_, rows) => setAssigning(rows)}
        actions={can('warehouse.manage') ? [{ key: 'resolve', label: 'Resolve exception', icon: 'ri-check-double-line', condition: (t) => t.status === 'exception' }] : undefined}
        onRowAction={(_, t) => resolve.mutate(t.id)}
      />
      <Modal
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        title={`Assign ${assigning?.length ?? 0} task(s)`}
        size="sm"
        footer={<><button type="button" className="btn btn-light" onClick={() => setAssigning(null)}>Cancel</button><button type="button" className="btn btn-primary" disabled={!assignee || assign.isPending} onClick={() => assigning && assign.mutate({ ids: assigning.map((t) => t.id), assigneeName: assignee })}>Assign</button></>}
      >
        <p className="text-muted">Completed tasks are skipped. Reassignment keeps the task history.</p>
        <select className="form-select" value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Assignee">
          <option value="">Choose operator…</option>
          {staff.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </Modal>
    </>
  )
}

export function TasksPage() {
  return <TaskList title="Warehouse tasks" description="Putaway, pick, pack, replenishment, count and move tasks across warehouses. Overdue tasks are red." />
}

export function PutawayPage() {
  return <TaskList scope={{ type: 'putaway' }} title="Putaway" description="Accepted receipt stock waiting on the dock. Operators scan the destination bin to confirm." />
}

export function TaskDetailPage() {
  const { id } = useParams()
  const task = useOne('tasks', tasksApi.get, id)
  if (task.isLoading) return <Loader label="Loading task…" />
  if (task.isError || !task.data) return <QueryError message={errorMessage(task.error)} onRetry={() => task.refetch()} />
  const t = task.data
  return (
    <>
      <PageHeader
        back={{ label: 'Tasks', to: ROUTES.TASKS }}
        title={t.number}
        meta={<><StatusBadge status={t.status} /><ToneBadge tone="light" icon={TASK_ICONS[t.type]}>{humanize(t.type)}</ToneBadge>{overdue(t) && <ToneBadge tone="danger">Overdue</ToneBadge>}</>}
        description={`${t.warehouseName} · due ${formatDateTime(t.dueAt)}`}
        actions={t.status !== 'completed' && <Guard permission={`warehouse.${t.type === 'putaway' ? 'putaway' : t.type === 'pack' ? 'pack' : 'pick'}`}><Link to={to(ROUTES.SCAN_TASK, { id: t.id })} className="btn btn-primary"><i className="ri-barcode-line me-1" />Work in scanner</Link></Guard>}
      />
      {t.exception && <div className="alert alert-danger"><i className="ri-error-warning-line me-1" /><strong>Exception:</strong> {t.exception}</div>}
      <div className="row g-4">
        <div className="col-xl-5">
          <Panel title="Task" icon="ri-task-line">
            <DetailList
              items={[
                { label: 'SKU', value: <span className="font-monospace">{t.sku}</span> },
                { label: 'Product', value: t.productTitle },
                { label: 'Quantity', value: `${t.quantityDone} / ${t.quantity}` },
                { label: 'Source bin', value: t.fromBin },
                { label: 'Destination bin', value: t.toBin },
                { label: 'Required scans', value: t.type === 'putaway' ? 'Destination bin, then SKU' : 'Source bin, then SKU per unit' },
                { label: 'Order', value: t.orderNumber },
                { label: 'Wave', value: t.waveNumber },
                { label: 'Priority', value: humanize(t.priority) },
                { label: 'Assignee', value: t.assigneeName ?? 'Unassigned' },
              ]}
            />
          </Panel>
        </div>
        <div className="col-xl-7">
          <Panel title="Scan and completion history" icon="ri-history-line">
            <Timeline items={[...t.history].reverse().map((h, i) => ({ id: String(i), icon: /short|exception/i.test(h.event) ? 'ri-error-warning-line' : /scan/i.test(h.event) ? 'ri-barcode-line' : /assign/i.test(h.event) ? 'ri-user-shared-line' : 'ri-checkbox-circle-line', tone: /short|exception/i.test(h.event) ? 'danger' : 'primary', title: h.event, description: h.actor, at: formatDateTime(h.at) }))} />
          </Panel>
        </div>
      </div>
    </>
  )
}
