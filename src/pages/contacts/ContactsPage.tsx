import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { DataTable } from '@/components/common/DataTable'
import type {
  DataTableAction,
  DataTableActionPayload,
  DataTableColumn,
} from '@/components/common/DataTable'
import { contactsService } from '@/services/contacts.service'
import { toDataTableRows } from '@/lib/mock'
import type { Contact } from '@/types/contact.types'
import { ROUTES, contactDetailPath } from '@/constants/routes.constants'

export function ContactsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts', page, search],
    queryFn: () =>
      contactsService.list({ page, per_page: 10, search: search || undefined }),
  })

  const rows = useMemo(() => {
    if (!data?.success || !data.data) {
      return toDataTableRows<Contact>([], {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
      })
    }
    return toDataTableRows(
      data.data,
      data.meta ?? {
        page,
        per_page: 10,
        total: data.data.length,
        total_pages: 1,
      },
    )
  }, [data, page])

  const columns: DataTableColumn<Contact>[] = [
    {
      key: 'firstName',
      header: 'Contact',
      render: (row) => (
        <div>
          <Link to={contactDetailPath(row.id)} className="font-medium text-primary">
            {row.firstName} {row.lastName}
          </Link>
          <div className="text-textmuted fs-12">{row.email}</div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'company', header: 'Company', render: (row) => row.company ?? '—' },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((t) => (
            <span key={t} className="badge bg-primary-transparent">
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'active'
              ? 'badge bg-success-transparent'
              : 'badge bg-warning-transparent'
          }
        >
          {row.status}
        </span>
      ),
    },
  ]

  const actions: DataTableAction<Contact>[] = [
    { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  ]

  const onAction = (payload: DataTableActionPayload<Contact>) => {
    if ('row' in payload && payload.action === 'view') {
      navigate(contactDetailPath(payload.row.id))
    }
  }

  return (
    <>
      <BreadCrumb
        activePage="Contacts"
        breadcrumbs={[{ label: 'CRM', href: ROUTES.CONTACTS }]}
      />
      <div className="box">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div className="box-title">All Contacts</div>
          <div className="flex flex-wrap gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="Search…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ minWidth: 200 }}
            />
            <Link to={ROUTES.CONTACTS_IMPORT} className="ti-btn ti-btn-outline-primary ti-btn-sm">
              Import CSV
            </Link>
          </div>
        </div>
        <div className="box-body">
          {isError ? (
            <p className="text-danger mb-0">Failed to load contacts.</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              actions={actions}
              onAction={onAction}
              fetchData={(p) => setPage(p ?? 1)}
              itemsLabel="contacts"
              emptyMessage="No contacts"
              emptyDescription="Import a CSV or add contacts manually."
            />
          )}
        </div>
      </div>
    </>
  )
}
