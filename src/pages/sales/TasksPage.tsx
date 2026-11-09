import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi } from '@/api/endpoints/crm.api'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { TaskModal } from '@/components/features/sales/SalesModals'
import { MoreMenu } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { TEAM_MEMBERS } from '@/constants/crm.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Task } from '@/types/crm.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const TYPE_ICON: Record<Task['type'], string> = { todo: 'ri-checkbox-line', call: 'ri-phone-line', email: 'ri-mail-line', meeting: 'ri-calendar-event-line' }
type Bucket = 'overdue' | 'today' | 'upcoming' | 'done'

function bucket(t: Task): Bucket {
  if (t.done) return 'done'
  if (!t.dueAt) return 'upcoming'
  const due = new Date(t.dueAt)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  if (due.getTime() < Date.now()) return 'overdue'
  return due <= end ? 'today' : 'upcoming'
}

export function TasksPage() {
  const tasks = useAll('tasks', tasksApi.list)
  const [tab, setTab] = useState<Bucket>('overdue')
  const [search, setSearch] = useState('')
  const [assignee, setAssignee] = useState<string | undefined>()
  const [editing, setEditing] = useState<Task | null>(null)
  const [creating, setCreating] = useState(false)
  const update = useAction('tasks', ({ id, patch }: { id: string; patch: Partial<Task> }) => tasksApi.update(id, patch))
  const remove = useAction('tasks', (id: string) => tasksApi.remove(id), { success: 'Task deleted' })

  const all = (tasks.data?.data ?? []).filter((t) => (!assignee || t.assigneeName === assignee) && (!search || t.title.toLowerCase().includes(search.toLowerCase())))
  const counts = all.reduce<Record<Bucket, number>>((acc, t) => ({ ...acc, [bucket(t)]: acc[bucket(t)] + 1 }), { overdue: 0, today: 0, upcoming: 0, done: 0 })
  const shown = all.filter((t) => bucket(t) === tab).sort((a, b) => (a.dueAt ?? '9').localeCompare(b.dueAt ?? '9'))

  return (
    <>
      <PageHeader title="Tasks" description="Follow-ups for your team: calls, emails, meetings and to-dos." actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />New task</button>} />
      <div className="card">
        <div className="card-header pb-0 border-0">
          <Tabs<Bucket>
            value={tab}
            onChange={setTab}
            items={[
              { value: 'overdue', label: 'Overdue', count: counts.overdue },
              { value: 'today', label: 'Today', count: counts.today },
              { value: 'upcoming', label: 'Upcoming', count: counts.upcoming },
              { value: 'done', label: 'Completed', count: counts.done },
            ]}
          />
        </div>
        <div className="card-body">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search tasks…" />
            <FilterSelect value={assignee} onChange={setAssignee} allLabel="Everyone" options={TEAM_MEMBERS.map((m) => ({ value: m, label: m }))} />
          </FilterBar>
          {tasks.isLoading ? (
            <SkeletonLines lines={6} />
          ) : shown.length === 0 ? (
            <EmptyState icon="ri-task-line" title={tab === 'overdue' ? 'Nothing overdue' : 'No tasks here'} description={tab === 'overdue' ? 'Nice work — every task is on time.' : undefined} />
          ) : (
            <ul className="list-group list-group-flush">
              {shown.map((t) => (
                <li key={t.id} className="list-group-item d-flex align-items-center gap-3 px-0 py-3">
                  <input
                    className="form-check-input mt-0 flex-shrink-0"
                    type="checkbox"
                    checked={t.done}
                    aria-label={`Mark ${t.title} ${t.done ? 'not done' : 'done'}`}
                    onChange={() => update.mutate({ id: t.id, patch: { done: !t.done } })}
                  />
                  <span className="icon-tile icon-tile-sm bg-light text-muted"><i className={TYPE_ICON[t.type]} /></span>
                  <div className="min-w-0 flex-1">
                    <div className={`fw-medium text-truncate${t.done ? ' text-decoration-line-through text-muted' : ''}`}>{t.title}</div>
                    <div className="text-muted fs-sm d-flex flex-wrap gap-2">
                      <span className={tab === 'overdue' ? 'text-danger' : ''}>{t.dueAt ? formatDateTime(t.dueAt) : 'No due date'}</span>
                      <span>· {t.assigneeName}</span>
                      {t.related && (
                        <span>
                          · <Link to={t.related.type === 'contact' ? to(ROUTES.CONTACT, { id: t.related.id }) : ROUTES.DEALS}>{t.related.name}</Link>
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={t.priority} />
                  <MoreMenu
                    items={[
                      { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => setEditing(t) },
                      { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => remove.mutate(t.id) },
                    ]}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <TaskModal open={creating || editing !== null} task={editing} onClose={() => { setCreating(false); setEditing(null) }} />
    </>
  )
}
