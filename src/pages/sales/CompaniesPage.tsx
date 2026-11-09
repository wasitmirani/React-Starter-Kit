import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { companiesApi } from '@/api/endpoints/crm.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, SearchInput } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { CompanyModal } from '@/components/features/sales/SalesModals'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import type { Company } from '@/types/crm.types'
import { formatCurrency } from '@/utils/formatters/currency.formatter'

export function CompaniesPage() {
  const navigate = useNavigate()
  const { query, setSearch, setPage, setSort } = useListParams({ perPage: 25 })
  const companies = useList('companies', companiesApi.list, query)
  const [editing, setEditing] = useState<Company | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Company | null>(null)
  const remove = useAction('companies', (id: string) => companiesApi.remove(id), { success: 'Company deleted', onSuccess: () => setDeleting(null) })

  const columns: DataTableColumn<Company>[] = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (c) => (
        <div className="d-flex align-items-center gap-3">
          <Avatar name={c.name} size={34} />
          <div>
            <div className="fw-medium">{c.name}</div>
            {c.domain && <a href={`https://${c.domain}`} target="_blank" rel="noreferrer" className="text-muted fs-sm">{c.domain}</a>}
          </div>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'size', label: 'Employees' },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'contactCount', label: 'Contacts', align: 'end', render: (c) => <span className="tabular-nums">{c.contactCount}</span> },
    { key: 'openDealsValue', label: 'Open deals', align: 'end', render: (c) => <span className="tabular-nums fw-medium">{c.openDealsValue ? formatCurrency(c.openDealsValue).replace(/\.00$/, '') : '—'}</span> },
    { key: 'ownerName', label: 'Owner' },
  ]

  return (
    <>
      <PageHeader title="Companies" description="Accounts your contacts and deals belong to." actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />New company</button>} />
      <div className="card">
        <div className="card-body pb-0">
          <FilterBar>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search name, domain, industry…" />
          </FilterBar>
        </div>
        <DataTable<Company>
          columns={columns}
          rows={companies.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={companies.isLoading}
          itemsLabel="companies"
          fetchData={(page) => page && setPage(page)}
          actions={[
            { key: 'contacts', label: 'View contacts', icon: 'ri-group-line', variant: 'view' },
            { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
            { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
          ]}
          onAction={(p) => {
            if ('direction' in p) return setSort(p.column, p.direction)
            if (!('row' in p)) return
            if (p.action === 'contacts') navigate(`${ROUTES.CONTACTS}?q=${encodeURIComponent(p.row.name)}`)
            if (p.action === 'edit') setEditing(p.row)
            if (p.action === 'delete') setDeleting(p.row)
          }}
        />
      </div>
      <CompanyModal open={creating || editing !== null} company={editing} onClose={() => { setCreating(false); setEditing(null) }} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete company?"
        message={<>Contacts and deals linked to <strong>{deleting?.name}</strong> are kept but no longer linked.</>}
        confirmLabel="Delete company"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
