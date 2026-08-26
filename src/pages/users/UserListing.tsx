import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import type {
  DataTableAction,
  DataTableActionPayload,
  DataTableColumn,
  PaginatedRows,
} from '@/components/common/DataTable'
import { SortByDropdown } from '@/components/common/SortByDropdown/SortByDropdown'

type SortOption = 'New' | 'Popular' | 'Relevant'

type ApplicantStatus = 'New' | 'Pending' | 'Hired' | 'Rejected'

interface ApplicantRow {
  id: string
  code: string
  name: string
  email: string
  avatarUrl?: string
  position: string
  appliedOn: string
  experience: string
  status: ApplicantStatus
}

const DEMO_APPLICANTS: ApplicantRow[] = [
  {
    id: '1',
    code: '#SM-011',
    name: 'Mayor Kelly',
    email: 'mayorkelly2341@gmail.com',
    avatarUrl: '/assets/images/faces/4.jpg',
    position: 'System Administrator',
    appliedOn: '2023-11-24',
    experience: '2+ Years',
    status: 'New',
  },
  {
    id: '2',
    code: '#SM-012',
    name: 'Andrew Garfield',
    email: 'andrewgarfield21@gmail.com',
    avatarUrl: '/assets/images/faces/15.jpg',
    position: 'UI / UX Designer',
    appliedOn: '2023-10-18',
    experience: '3+ Years',
    status: 'Pending',
  },
  {
    id: '3',
    code: '#SM-013',
    name: 'Simon Cowell',
    email: 'simoncowell34@gmail.com',
    avatarUrl: '/assets/images/faces/11.jpg',
    position: 'React Developer',
    appliedOn: '2023-09-05',
    experience: '1+ Years',
    status: 'Hired',
  },
  {
    id: '4',
    code: '#SM-014',
    name: 'Mirinda Hers',
    email: 'mirindahers@gmail.com',
    avatarUrl: '/assets/images/faces/8.jpg',
    position: 'Project Manager',
    appliedOn: '2023-11-02',
    experience: '5+ Years',
    status: 'Rejected',
  },
  {
    id: '5',
    code: '#SM-015',
    name: 'Andrew Garfield',
    email: 'andrewgarfield21@gmail.com',
    avatarUrl: '/assets/images/faces/16.jpg',
    position: 'Full Stack Developer',
    appliedOn: '2023-08-12',
    experience: '4+ Years',
    status: 'New',
  },
]

const PER_PAGE = 3

const STATUS_BADGE: Record<ApplicantStatus, string> = {
  New: 'badge bg-primary-transparent saas-status',
  Pending: 'badge bg-warning-transparent saas-status',
  Hired: 'badge bg-success-transparent saas-status',
  Rejected: 'badge bg-danger-transparent saas-status',
}

function formatAppliedOn(isoDate: string) {
  const date = new Date(isoDate)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}, ${month} ${year}`
}

function paginateRows(
  items: ApplicantRow[],
  page: number,
  perPage: number,
): PaginatedRows<ApplicantRow> {
  const total = items.length
  const last_page = Math.max(1, Math.ceil(total / perPage))
  const current_page = Math.min(Math.max(1, page), last_page)
  const start = (current_page - 1) * perPage
  const data = items.slice(start, start + perPage)
  return {
    data,
    current_page,
    last_page,
    from: total === 0 ? null : start + 1,
    to: total === 0 ? null : start + data.length,
    total,
  }
}

const columns: DataTableColumn<ApplicantRow>[] = [
  {
    key: 'code',
    header: 'ID',
    sortable: true,
    width: '6.5rem',
    className: 'saas-col-id',
  },
  {
    key: 'name',
    header: 'User',
    sortable: true,
    width: '22%',
    className: 'saas-col-user',
    render: (row) => (
      <div className="saas-user-cell">
        <span className="avatar avatar-sm avatar-rounded">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt="" />
          ) : (
            <span className="avatar-initial bg-primary text-white">{row.name.charAt(0)}</span>
          )}
        </span>
        <div className="saas-user-meta min-w-0">
          <div className="saas-user-name">{row.name}</div>
          <div className="saas-user-email">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'position',
    header: 'Position',
    width: '16%',
    className: 'saas-col-position',
    render: (row) => <span className="saas-cell-text">{row.position}</span>,
  },
  {
    key: 'appliedOn',
    header: 'Applied',
    sortable: true,
    width: '8.5rem',
    className: 'saas-col-date',
    render: (row) => <span className="saas-cell-muted">{formatAppliedOn(row.appliedOn)}</span>,
  },
  {
    key: 'experience',
    header: 'Exp.',
    width: '6rem',
    className: 'saas-col-exp',
  },
  {
    key: 'status',
    header: 'Status',
    width: '7rem',
    className: 'saas-col-status',
    render: (row) => <span className={STATUS_BADGE[row.status]}>{row.status}</span>,
  },
]

const actions: DataTableAction<ApplicantRow>[] = [
  { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
  { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
]

const SORT_OPTIONS: SortOption[] = ['New', 'Popular', 'Relevant']

export function UserListing() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('New')

  const filteredApplicants = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = DEMO_APPLICANTS
    if (q) {
      list = DEMO_APPLICANTS.filter((row) =>
        [row.code, row.name, row.email, row.position, row.experience, row.status]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    if (sortBy === 'New') {
      list = [...list].sort(
        (a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime(),
      )
    } else if (sortBy === 'Popular') {
      list = [...list].sort((a, b) => a.position.localeCompare(b.position))
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    if (!sort) return list
    const { column, direction } = sort
    const dir = direction === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const av = String(a[column as keyof ApplicantRow] ?? '')
      const bv = String(b[column as keyof ApplicantRow] ?? '')
      return av.localeCompare(bv) * dir
    })
  }, [search, sort, sortBy])

  const paginated = useMemo(
    () => paginateRows(filteredApplicants, page, PER_PAGE),
    [filteredApplicants, page],
  )

  const handleFetch = useCallback((nextPage?: number) => {
    if (nextPage != null) setPage(nextPage)
  }, [])

  const handleAction = useCallback((payload: DataTableActionPayload<ApplicantRow>) => {
    if (payload.action === 'sort' && 'column' in payload && 'direction' in payload) {
      setSort({ column: payload.column, direction: payload.direction })
      setPage(1)
      return
    }
    if ('selected' in payload) {
      console.log('bulk', payload.action, payload.selected)
      return
    }
    if ('row' in payload) {
      console.log(payload.action, payload.row.id)
    }
  }, [])

  return (
    <div className="box">
      <div className="box-header justify-between">
        <div className="box-title">User Listing</div>
        <div className="flex flex-wrap gap-2">
          <div>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Search Here"
              aria-label="Search applicants"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <SortByDropdown
            buttonClassName="ti-btn-primary"
            options={SORT_OPTIONS}
            value={sortBy}
            onSelect={(option) => {
              setSortBy(option as SortOption)
              setPage(1)
            }}
          />
        </div>
      </div>
      <div className="box-body p-0!">
        <DataTable
          columns={columns}
          rows={paginated}
          fetchData={handleFetch}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={actions}
          onAction={handleAction}
          actionsHeader="Action"
          itemsLabel="applicants"
          emptyMessage="No applicants found."
        />
      </div>
    </div>
  )
}
