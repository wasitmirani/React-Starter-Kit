import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { segmentsApi } from '@/api/endpoints/crm.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, SearchInput } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import type { Segment } from '@/types/crm.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { describeRules } from '@/utils/helpers/segment'

export function SegmentsPage() {
  const navigate = useNavigate()
  const { query, setSearch, setPage } = useListParams()
  const segments = useList('segments', segmentsApi.list, query)
  const [deleting, setDeleting] = useState<Segment | null>(null)
  const remove = useAction('segments', (id: string) => segmentsApi.remove(id), { success: 'Segment deleted', onSuccess: () => setDeleting(null) })

  const columns: DataTableColumn<Segment>[] = [
    {
      key: 'name',
      label: 'Segment',
      render: (s) => (
        <div className="min-w-0">
          <Link to={to(ROUTES.SEGMENT, { id: s.id })} className="fw-medium text-reset">{s.name}</Link>
          <div className="text-muted fs-sm text-truncate" style={{ maxWidth: 520 }}>{describeRules(s)}</div>
        </div>
      ),
    },
    { key: 'contactCount', label: 'Contacts', align: 'end', render: (s) => <span className="fw-medium tabular-nums">{s.contactCount.toLocaleString()}</span> },
    { key: 'updatedAt', label: 'Updated', render: (s) => formatRelativeTime(s.updatedAt) },
  ]

  return (
    <>
      <PageHeader
        title="Segments"
        description="Dynamic audiences: membership updates automatically as contacts change."
        actions={<Link to={ROUTES.SEGMENT_NEW} className="btn btn-primary"><i className="ri-add-line me-1" />New segment</Link>}
      />
      <div className="card">
        <div className="card-body pb-0">
          <FilterBar>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search segments…" />
          </FilterBar>
        </div>
        <DataTable<Segment>
          columns={columns}
          rows={segments.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={segments.isLoading}
          itemsLabel="segments"
          emptyMessage="No segments yet"
          emptyDescription="Build one from contact fields, consent, tags and activity."
          fetchData={(page) => page && setPage(page)}
          actions={[
            { key: 'contacts', label: 'View contacts', icon: 'ri-group-line', variant: 'view' },
            { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
            { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
          ]}
          onAction={(p) => {
            if (!('row' in p)) return
            if (p.action === 'contacts') navigate(`${ROUTES.CONTACTS}?segmentId=${p.row.id}`)
            if (p.action === 'edit') navigate(to(ROUTES.SEGMENT, { id: p.row.id }))
            if (p.action === 'delete') setDeleting(p.row)
          }}
        />
      </div>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete segment?"
        message={<>Campaigns and automations that target <strong>{deleting?.name}</strong> will no longer have this audience.</>}
        confirmLabel="Delete segment"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
