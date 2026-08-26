import { useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import type { DataTableColumn } from '@/components/common/DataTable'
import type { User } from '@/types/user.types'

const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatarUrl: '/assets/images/faces/4.jpg',
    role: 'admin',
    createdAt: '2024-07-24T16:45:00Z',
    updatedAt: '2024-07-24T16:45:00Z',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: '/assets/images/faces/5.jpg',
    role: 'user',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'user',
    createdAt: '2024-08-12T09:30:00Z',
    updatedAt: '2024-08-12T09:30:00Z',
  },
]

const columns: DataTableColumn<User>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (user) => (
      <div className="flex items-center gap-2">
        <span className="avatar avatar-rounded avatar-sm">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <span className="avatar-initial bg-primary text-white">{user.name.charAt(0)}</span>
          )}
        </span>
        <div>
          <span className="block font-medium">{user.name}</span>
          <span className="block text-textmuted text-[11px]">{user.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (user) => (
      <span className="badge bg-primary-transparent capitalize">{user.role}</span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (user) =>
      new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
]

export function UserListing() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className="2xl:col-span-5 xl:col-span-7 col-span-12">
    <div className="box overflow-hidden">
        <div className="box-header justify-between">
            <div className="box-title">
                Top Selling Products
            </div>
            <div className="flex gap-2">
                <button className="ti-btn ti-btn-outline-light ti-btn-sm"><i className="ri-upload-2-line"></i>
                    Export</button>
                <div className="ti-dropdown hs-dropdown inline-flex">
                    <a href="#" className="ti-btn ti-btn-light ti-btn-sm hs-dropdown-toggle" aria-expanded="false">
                        Sort By<i className="ri-arrow-down-s-line align-middle ms-1 inline-block"></i>
                    </a>
                    <ul className="ti-dropdown-menu hs-dropdown-menu hidden" role="menu" data-placement="bottom-end" style={{transform: 'translate3d(801px, 406.5px, 0px)'}}>
                        <li>
                            <a className="ti-dropdown-item" href="#">Last Week</a>
                        </li>
                        <li>
                            <a className="ti-dropdown-item" href="#">Last Month</a>
                        </li>
                        <li>
                            <a className="ti-dropdown-item" href="#">Last Year</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="box-body p-0!">
        <DataTable
          columns={columns}
          data={DEMO_USERS}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onView={(user) => console.log('view', user.id)}
          onEdit={(user) => console.log('edit', user.id)}
          onDelete={(user) => console.log('delete', user.id)}
          emptyMessage="No users found."
        />
        </div>
        </div>
        </div>

  )
}
