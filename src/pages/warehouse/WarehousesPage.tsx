import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { locationsApi, staffApi, tasksApi, warehousesApi } from '@/api/endpoints/warehouse.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal, type FieldDef } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { DetailList, Meter } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS, TASK_ICONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import { useWarehouseOptions, useWarehouses } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Location, StaffMember, Warehouse } from '@/types/warehouse.types'
import { formatPercent } from '@/utils/formatters/number.formatter'

const WAREHOUSE_FIELDS: FieldDef[] = [
  { name: 'code', label: 'Code', required: true, col: 4, placeholder: 'KHI-02' },
  { name: 'name', label: 'Name', required: true, col: 8 },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'own', label: 'Own warehouse' }, { value: 'third_party', label: 'Third-party (3PL)' }], col: 6 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: OPTIONS.activeStatus, col: 6 },
  { name: 'address', label: 'Address', required: true },
  { name: 'city', label: 'City', required: true, col: 6 },
  { name: 'country', label: 'Country', type: 'select', required: true, options: [{ value: 'PK', label: 'Pakistan' }, { value: 'AE', label: 'United Arab Emirates' }], col: 6 },
  { name: 'timezone', label: 'Timezone', type: 'select', required: true, options: [{ value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' }, { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' }], col: 6 },
  { name: 'cutoffTime', label: 'Same-day cutoff', type: 'time', required: true, col: 6 },
  { name: 'workingHours', label: 'Operating hours', required: true, placeholder: 'Mon–Sat 09:00–21:00' },
]

export function WarehousesPage() {
  const warehouses = useWarehouses()
  const [editing, setEditing] = useState<Warehouse | 'new' | null>(null)
  const save = useAction('warehouses', (v: Record<string, unknown>) => (editing === 'new' ? warehousesApi.create({ binsCount: 0, utilization: 0, staffCount: 0, openTasks: 0, ...v } as Warehouse) : warehousesApi.update((editing as Warehouse).id, v)), { success: 'Warehouse saved' })

  return (
    <>
      <PageHeader title="Warehouses" description="Sites, operating hours and cutoffs. Bins, staff and workload per site." actions={<Guard permission="warehouse.manage"><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><i className="ri-add-line me-1" />Add warehouse</button></Guard>} />
      {warehouses.isError && <QueryError message={errorMessage(warehouses.error)} onRetry={() => warehouses.refetch()} />}
      {warehouses.isLoading && <Loader label="Loading warehouses…" />}
      <div className="row g-4">
        {warehouses.data?.data.map((w) => (
          <div key={w.id} className="col-md-6 col-xxl-4">
            <div className="card h-100 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <span className="icon-tile bg-primary-subtle text-primary"><i className="ri-building-4-line" /></span>
                  <div className="flex-1 min-w-0">
                    <Link to={to(ROUTES.WAREHOUSE, { id: w.id })} className="h6 mb-0 d-block text-truncate">{w.name}</Link>
                    <div className="text-muted fs-sm">{w.code} · {w.city}, {w.country} · {humanize(w.type)}</div>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="d-flex justify-content-between fs-sm mb-1"><span>Utilization</span><span className="tabular-nums">{formatPercent(w.utilization)}</span></div>
                <Meter value={w.utilization} max={1} tone={w.utilization > 0.85 ? 'danger' : w.utilization > 0.7 ? 'warning' : 'success'} />
                <div className="row text-center mt-4 g-0">
                  <div className="col"><div className="fw-semibold tabular-nums">{w.binsCount}</div><div className="text-muted fs-xs">Bins</div></div>
                  <div className="col"><div className="fw-semibold tabular-nums">{w.openTasks}</div><div className="text-muted fs-xs">Open tasks</div></div>
                  <div className="col"><div className="fw-semibold tabular-nums">{w.staffCount}</div><div className="text-muted fs-xs">Staff</div></div>
                  <div className="col"><div className="fw-semibold">{w.cutoffTime}</div><div className="text-muted fs-xs">Cutoff</div></div>
                </div>
              </div>
              <div className="card-footer d-flex gap-2">
                <Link to={to(ROUTES.WAREHOUSE, { id: w.id })} className="btn btn-sm btn-light">Open</Link>
                <Link to={`${ROUTES.LOCATIONS}?warehouseId=${w.id}`} className="btn btn-sm btn-light">Locations</Link>
                <Guard permission="warehouse.manage"><button type="button" className="btn btn-sm btn-light ms-auto" onClick={() => setEditing(w)}><i className="ri-settings-3-line" /> Edit</button></Guard>
              </div>
            </div>
          </div>
        ))}
      </div>
      <EntityFormModal open={editing !== null} title={editing === 'new' ? 'Add warehouse' : `Edit ${(editing as Warehouse | null)?.code ?? ''}`} fields={WAREHOUSE_FIELDS} initial={editing && editing !== 'new' ? (editing as unknown as Record<string, unknown>) : { type: 'own', status: 'active', country: 'PK', timezone: 'Asia/Karachi', cutoffTime: '15:00' }} submitLabel="Save warehouse" size="lg" onClose={() => setEditing(null)} onSubmit={(v) => save.mutateAsync(v)} />
    </>
  )
}

export function WarehouseDetailPage() {
  const { id } = useParams()
  const warehouse = useOne('warehouses', warehousesApi.get, id)
  const tasks = useAll('tasks', tasksApi.list, { warehouseId: id })
  const bins = useAll('locations', locationsApi.list, { warehouseId: id })
  const staff = useAll('staff', staffApi.list, { warehouseName: warehouse.data?.name })

  if (warehouse.isLoading) return <Loader label="Loading warehouse…" />
  if (warehouse.isError || !warehouse.data) return <QueryError message={errorMessage(warehouse.error)} onRetry={() => warehouse.refetch()} />
  const w = warehouse.data
  const open = (tasks.data?.data ?? []).filter((t) => t.status !== 'completed')
  const zones = [...new Set((bins.data?.data ?? []).map((b) => b.zone))].map((zone) => {
    const list = (bins.data?.data ?? []).filter((b) => b.zone === zone)
    return { zone, bins: list.length, used: list.reduce((n, b) => n + b.used, 0), capacity: list.reduce((n, b) => n + b.capacity, 0), blocked: list.filter((b) => b.status === 'blocked').length }
  })

  return (
    <>
      <PageHeader back={{ label: 'Warehouses', to: ROUTES.WAREHOUSES }} title={w.name} meta={<><StatusBadge status={w.status} /><ToneBadge tone="light">{w.code}</ToneBadge></>} description={`${w.address}, ${w.city} · ${w.timezone}`} actions={<Link to={ROUTES.SCAN} className="btn btn-primary"><i className="ri-barcode-line me-1" />Open scanner</Link>} />
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Open tasks" value={open.length} icon="ri-task-line" hint={`${open.filter((t) => new Date(t.dueAt) < new Date()).length} overdue`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Exceptions" value={open.filter((t) => t.status === 'exception').length} icon="ri-error-warning-line" tone="danger" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Utilization" value={formatPercent(w.utilization)} icon="ri-pie-chart-2-line" tone="info" hint={`${w.binsCount} bins`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Staff on shift" value={(staff.data?.data ?? []).filter((s) => s.status === 'on_shift').length} icon="ri-team-line" tone="success" hint={`Cutoff ${w.cutoffTime}`} /></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-6">
          <Panel title="Task backlog" icon="ri-task-line" flush actions={<Link to={`${ROUTES.TASKS}?warehouseId=${w.id}`} className="btn btn-sm btn-light">All tasks</Link>}>
            <table className="table align-middle mb-0">
              <thead><tr className="text-muted fs-sm"><th>Type</th><th className="text-end">Open</th><th className="text-end">In progress</th><th className="text-end">Exceptions</th></tr></thead>
              <tbody>
                {OPTIONS.taskType.map((t) => {
                  const list = open.filter((x) => x.type === t.value)
                  return <tr key={t.value}><td><i className={`${TASK_ICONS[t.value]} me-2 text-muted`} />{t.label}</td><td className="text-end tabular-nums">{list.length}</td><td className="text-end tabular-nums">{list.filter((x) => x.status === 'in_progress').length}</td><td className="text-end tabular-nums text-danger">{list.filter((x) => x.status === 'exception').length || ''}</td></tr>
                })}
              </tbody>
            </table>
          </Panel>
        </div>
        <div className="col-xl-6">
          <Panel title="Zones" icon="ri-layout-grid-line" flush>
            <table className="table align-middle mb-0">
              <thead><tr className="text-muted fs-sm"><th>Zone</th><th className="text-end">Bins</th><th style={{ width: '40%' }}>Fill</th><th className="text-end">Blocked</th></tr></thead>
              <tbody>
                {zones.map((z) => <tr key={z.zone}><td>{z.zone}</td><td className="text-end tabular-nums">{z.bins}</td><td><Meter value={z.used} max={z.capacity} tone={z.used / z.capacity > 0.85 ? 'danger' : 'primary'} /></td><td className="text-end tabular-nums">{z.blocked || ''}</td></tr>)}
              </tbody>
            </table>
          </Panel>
        </div>
        <div className="col-xl-6">
          <Panel title="Operating details" icon="ri-time-line">
            <DetailList items={[{ label: 'Type', value: humanize(w.type) }, { label: 'Operating hours', value: w.workingHours }, { label: 'Same-day cutoff', value: w.cutoffTime }, { label: 'Timezone', value: w.timezone }]} />
          </Panel>
        </div>
        <div className="col-xl-6">
          <Panel title="Staff" icon="ri-team-line" flush actions={<Link to={ROUTES.STAFF} className="btn btn-sm btn-light">Productivity</Link>}>
            <ul className="list-group list-group-flush">
              {(staff.data?.data ?? []).map((s) => <li key={s.id} className="list-group-item d-flex justify-content-between"><span>{s.name} <span className="text-muted fs-sm">· {humanize(s.role)}</span></span><StatusBadge status={s.status} /></li>)}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}

export function LocationsPage() {
  const can = useCan()
  const warehouses = useWarehouseOptions()
  const rows = useWarehouses()
  const [creating, setCreating] = useState(false)
  const toggle = useAction('locations', locationsApi.toggleBlock, { success: (l) => `${l.code} ${l.status === 'blocked' ? 'blocked' : 'unblocked'}` })
  const create = useAction('locations', (v: Record<string, unknown>) => {
    const w = rows.data?.data.find((x) => x.id === v.warehouseId)
    return locationsApi.create({ ...v, code: String(v.code).toUpperCase(), warehouseName: w?.name ?? '', used: 0, status: 'active' } as Location)
  }, { success: 'Bin created' })

  const columns: DataTableColumn<Location>[] = [
    { key: 'code', label: 'Bin', sortable: true, render: (l) => <span className="font-monospace fw-medium">{l.code}</span> },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'type', label: 'Type', render: (l) => humanize(l.type) },
    { key: 'used', label: 'Fill', render: (l) => <div style={{ minWidth: 120 }}><Meter value={l.used} max={l.capacity} tone={l.used / l.capacity > 0.9 ? 'danger' : 'primary'} /><div className="text-muted fs-xs mt-1 tabular-nums">{l.used} / {l.capacity}</div></div> },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
  ]
  return (
    <>
      <PageHeader title="Locations" description="Zones, aisles, shelves and bins. Blocked bins cannot receive putaway or moves." actions={<Guard permission="warehouse.manage"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />Add bin</button></Guard>} />
      <ResourceList<Location>
        resource="locations"
        list={locationsApi.list}
        columns={columns}
        itemsLabel="bins"
        perPage={50}
        exportName="locations"
        searchPlaceholder="Bin code or zone…"
        filters={[{ key: 'warehouseId', allLabel: 'All warehouses', options: warehouses }, { key: 'type', allLabel: 'All types', options: OPTIONS.binType }, { key: 'status', allLabel: 'Any status', options: OPTIONS.binStatus }]}
        actions={can('warehouse.manage') ? [{ key: 'block', label: 'Block / unblock', icon: 'ri-forbid-line' }] : undefined}
        onRowAction={(_, l) => toggle.mutate(l.id)}
      />
      <EntityFormModal
        open={creating}
        title="Add bin"
        submitLabel="Create bin"
        onClose={() => setCreating(false)}
        initial={{ type: 'storage', zone: 'A', capacity: 200 }}
        fields={[
          { name: 'warehouseId', label: 'Warehouse', type: 'select', required: true, options: warehouses },
          { name: 'code', label: 'Bin code', required: true, col: 6, placeholder: 'A-04-01', hint: 'Zone-aisle-shelf; printed on the bin label.' },
          { name: 'zone', label: 'Zone', required: true, col: 6 },
          { name: 'type', label: 'Type', type: 'select', required: true, options: OPTIONS.binType, col: 6 },
          { name: 'capacity', label: 'Capacity (units)', type: 'number', required: true, min: 1, col: 6 },
        ]}
        onSubmit={(v) => create.mutateAsync(v)}
      />
    </>
  )
}

export function StaffPage() {
  const warehouses = useWarehouseOptions('name')
  const [creating, setCreating] = useState(false)
  const create = useAction('staff', (v: Record<string, unknown>) => staffApi.create({ ...v, status: 'off_shift', tasksToday: 0, unitsPerHour: 0, accuracy: 1 } as StaffMember), { success: 'Staff member added' })
  const columns: DataTableColumn<StaffMember>[] = [
    { key: 'name', label: 'Name', sortable: true, render: (s) => <span className="fw-medium">{s.name}</span> },
    { key: 'role', label: 'Role', render: (s) => humanize(s.role) },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'status', label: 'Shift', render: (s) => <StatusBadge status={s.status} /> },
    { key: 'tasksToday', label: 'Tasks today', align: 'end', sortable: true },
    { key: 'unitsPerHour', label: 'Units / hour', align: 'end', sortable: true },
    { key: 'accuracy', label: 'Scan accuracy', align: 'end', sortable: true, render: (s) => <span className={s.accuracy < 0.97 ? 'text-warning fw-medium' : ''}>{formatPercent(s.accuracy)}</span> },
  ]
  return (
    <>
      <PageHeader title="Staff and productivity" description="Throughput and scan accuracy by operator. Accuracy = correct scans / all scans." actions={<Guard permission="warehouse.manage"><button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />Add staff</button></Guard>} />
      <ResourceList<StaffMember> resource="staff" list={staffApi.list} columns={columns} itemsLabel="staff" exportName="warehouse-staff" searchPlaceholder="Name…" filters={[{ key: 'warehouseName', allLabel: 'All warehouses', options: warehouses }, { key: 'role', allLabel: 'All roles', options: OPTIONS.staffRole }]} />
      <EntityFormModal
        open={creating}
        title="Add warehouse staff"
        submitLabel="Add"
        onClose={() => setCreating(false)}
        fields={[{ name: 'name', label: 'Name', required: true }, { name: 'role', label: 'Role', type: 'select', required: true, options: OPTIONS.staffRole, col: 6 }, { name: 'warehouseName', label: 'Warehouse', type: 'select', required: true, options: warehouses, col: 6 }]}
        onSubmit={(v) => create.mutateAsync(v)}
        intro="Operators sign in to the scanner app with a workspace account; this record tracks their warehouse assignment and productivity."
      />
    </>
  )
}
