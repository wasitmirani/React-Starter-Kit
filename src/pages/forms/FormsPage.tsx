import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listsApi } from '@/api/endpoints/crm.api'
import { formsApi } from '@/api/endpoints/platform.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { MoreMenu } from '@/components/ui/Dropdown'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { SignupForm } from '@/types/platform.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { formatCompact, formatRate } from '@/utils/formatters/number.formatter'

const TYPE_LABEL: Record<SignupForm['type'], [string, string]> = { embedded: ['Embedded form', 'ri-code-box-line'], popup: ['Popup', 'ri-window-line'], landing_page: ['Landing page', 'ri-pages-line'] }

export function FormsPage() {
  const navigate = useNavigate()
  const forms = useAll('forms', formsApi.list)
  const lists = useAll('lists', listsApi.list)
  const [deleting, setDeleting] = useState<SignupForm | null>(null)
  const create = useAction(
    'forms',
    () =>
      formsApi.create({
        name: 'Untitled form',
        type: 'embedded',
        status: 'draft',
        listId: null,
        doubleOptIn: true,
        title: 'Join our newsletter',
        description: 'News and offers, straight to your inbox.',
        submitLabel: 'Subscribe',
        successMessage: 'Thanks! Check your inbox to confirm.',
        fields: [{ id: crypto.randomUUID(), type: 'email', label: 'Email', attribute: 'email', required: true, options: [] }],
        views: 0,
        submissions: 0,
      }),
    { onSuccess: (f) => navigate(to(ROUTES.FORM, { id: f.id })) },
  )
  const toggle = useAction('forms', (f: SignupForm) => formsApi.update(f.id, { status: f.status === 'published' ? 'draft' : 'published' }), { success: (f) => (f.status === 'published' ? 'Form published' : 'Form unpublished') })
  const remove = useAction('forms', formsApi.remove, { success: 'Form deleted', onSuccess: () => setDeleting(null) })

  const rows = forms.data?.data ?? []
  const views = rows.reduce((n, f) => n + f.views, 0)
  const subs = rows.reduce((n, f) => n + f.submissions, 0)

  const columns: DataTableColumn<SignupForm>[] = [
    {
      key: 'name',
      label: 'Form',
      render: (f) => (
        <div className="d-flex align-items-center gap-3">
          <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={TYPE_LABEL[f.type][1]} /></span>
          <div>
            <Link to={to(ROUTES.FORM, { id: f.id })} className="fw-medium text-reset">{f.name}</Link>
            <div className="text-muted fs-sm">{TYPE_LABEL[f.type][0]} · edited {formatRelativeTime(f.updatedAt)}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (f) => <StatusBadge status={f.status} /> },
    { key: 'listId', label: 'Adds to list', render: (f) => lists.data?.data.find((l) => l.id === f.listId)?.name ?? <span className="text-muted">—</span> },
    { key: 'views', label: 'Views', align: 'end', render: (f) => <span className="tabular-nums">{formatCompact(f.views)}</span> },
    { key: 'submissions', label: 'Signups', align: 'end', render: (f) => <span className="tabular-nums">{formatCompact(f.submissions)}</span> },
    { key: 'doubleOptIn', label: 'Conversion', align: 'end', render: (f) => <span className="tabular-nums fw-medium">{formatRate(f.submissions, f.views)}</span> },
    {
      key: 'id',
      label: '',
      align: 'end',
      render: (f) => (
        <MoreMenu
          items={[
            { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => navigate(to(ROUTES.FORM, { id: f.id })) },
            { key: 'toggle', label: f.status === 'published' ? 'Unpublish' : 'Publish', icon: f.status === 'published' ? 'ri-eye-off-line' : 'ri-global-line', onSelect: () => toggle.mutate(f) },
            'divider',
            { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(f) },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Forms & landing pages" description="Grow your lists with signup forms, popups and hosted landing pages." actions={<button type="button" className="btn btn-primary" disabled={create.isPending} onClick={() => create.mutate(undefined)}><i className="ri-add-line me-1" />New form</button>} />
      <div className="row g-4 mb-4">
        <div className="col-md-4"><StatCard label="Views" icon="ri-eye-line" loading={!forms.data} value={formatCompact(views)} /></div>
        <div className="col-md-4"><StatCard label="Signups" icon="ri-user-add-line" tone="success" loading={!forms.data} value={formatCompact(subs)} /></div>
        <div className="col-md-4"><StatCard label="Average conversion" icon="ri-percent-line" tone="info" loading={!forms.data} value={formatRate(subs, views)} /></div>
      </div>
      <div className="card">
        <DataTable<SignupForm> columns={columns} rows={{ data: rows, current_page: 1, last_page: 1, from: rows.length ? 1 : null, to: rows.length || null, total: rows.length }} isLoading={forms.isLoading} itemsLabel="forms" emptyMessage="No forms yet" />
      </div>
      <ConfirmDialog open={deleting !== null} title="Delete form?" message={<>Sites embedding <strong>{deleting?.name}</strong> will show nothing.</>} confirmLabel="Delete" danger busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting!.id)} />
    </>
  )
}
