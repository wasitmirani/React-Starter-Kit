import { useMemo, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import type { DataTableColumn } from '@/components/common/DataTable'

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

const STATUS_BADGE: Record<ApplicantStatus, string> = {
  New: 'badge bg-primary-transparent',
  Pending: 'badge bg-warning-transparent',
  Hired: 'badge bg-success-transparent',
  Rejected: 'badge bg-danger-transparent',
}

function formatAppliedOn(isoDate: string) {
  const date = new Date(isoDate)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day},${month} ${year}`
}

const columns: DataTableColumn<ApplicantRow>[] = [
  {
    key: 'code',
    header: 'ID',
  },
  {
    key: 'name',
    header: 'User Name',
    render: (row) => (
      <div className="flex items-center">
        <span className="avatar avatar-sm me-2 avatar-rounded">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt={row.name} />
          ) : (
            <span className="avatar-initial bg-primary text-white">{row.name.charAt(0)}</span>
          )}
        </span>
        <div>
          {row.name}
          <span className="text-textmuted fs-12 block">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'position',
    header: 'Position',
    render: (row) => <div className="badge bg-light text-default">{row.position}</div>,
  },
  {
    key: 'appliedOn',
    header: 'Applied On',
    render: (row) => formatAppliedOn(row.appliedOn),
  },
  {
    key: 'experience',
    header: 'Experience',
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <span className={STATUS_BADGE[row.status]}>{row.status}</span>,
  },
]

export function UserListing() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const filteredApplicants = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return DEMO_APPLICANTS
    return DEMO_APPLICANTS.filter((row) =>
      [row.code, row.name, row.email, row.position, row.experience, row.status]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [search])

  return (
    <div className="2xl:col-span-8 col-span-12">
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ti-dropdown hs-dropdown inline-flex">
              <a
                href="javascript:void(0);"
                className="ti-btn ti-btn-primary ti-btn-sm"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Sort By
                <i className="ri-arrow-down-s-line align-middle ms-1! inline-block leading-none"></i>
              </a>
              <ul className="hs-dropdown-menu ti-dropdown-menu hidden" role="menu">
                <li>
                  <a className="ti-dropdown-item inline-flex" href="javascript:void(0);">
                    New
                  </a>
                </li>
                <li>
                  <a className="ti-dropdown-item inline-flex" href="javascript:void(0);">
                    Popular
                  </a>
                </li>
                <li>
                  <a className="ti-dropdown-item inline-flex" href="javascript:void(0);">
                    Relevant
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="box-body p-0!">
          <DataTable
            columns={columns}
            data={filteredApplicants}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onView={(row) => console.log('call', row.id)}
            onEdit={(row) => console.log('edit', row.id)}
            onDelete={(row) => console.log('delete', row.id)}
            actionsHeader="Action"
            emptyMessage="No applicants found."
          />
        </div>
        <div className="box-footer border-top-0">
          <div className="flex gap-2 flex-wrap items-center">
            <div>
              Showing {filteredApplicants.length} Entries{' '}
              <i className="bi bi-arrow-right ms-2 font-semibold"></i>
            </div>
            <div className="ms-auto">
              <nav aria-label="Page navigation" className="pagination-style-5">
                <ul className="ti-pagination mb-0!">
                  <li className="page-item disabled rtl:rotate-180">
                    <a aria-label="Previous page" className="page-link" href="javascript:void(0);">
                      prev
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="javascript:void(0);">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link active" href="javascript:void(0);">
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a aria-label="More pages" className="page-link" href="javascript:void(0);">
                      <i className="bi bi-three-dots"></i>
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="javascript:void(0);">
                      17
                    </a>
                  </li>
                  <li className="page-item">
                    <a aria-label="Next page" className="page-link" href="javascript:void(0);">
                      next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
