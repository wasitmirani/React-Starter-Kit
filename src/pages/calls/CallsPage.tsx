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
import { callsService } from '@/services/calls.service'
import { toDataTableRows } from '@/lib/mock'
import type { CallRecord } from '@/types/call.types'
import { ROUTES, callDetailPath } from '@/constants/routes.constants'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CallsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['calls', page, search],
    queryFn: () => callsService.list({ page, per_page: 10, search: search || undefined }),
  })

  const rows = useMemo(() => {
    if (!data?.success || !data.data) {
      return toDataTableRows<CallRecord>([], {
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

  const columns: DataTableColumn<CallRecord>[] = [
    {
      key: 'contactName',
      header: 'Contact',
      render: (row) => (
        <div>
          <Link to={callDetailPath(row.id)} className="font-medium text-primary">
            {row.contactName}
          </Link>
          <div className="text-textmuted fs-12">{row.contactPhone}</div>
        </div>
      ),
    },
    { key: 'agentName', header: 'Agent' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'direction', header: 'Direction' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className="badge bg-primary-transparent">{row.status}</span>,
    },
    {
      key: 'durationSec',
      header: 'Duration',
      render: (row) => formatDuration(row.durationSec),
    },
    { key: 'outcome', header: 'Outcome' },
    {
      key: 'startedAt',
      header: 'Started',
      render: (row) => new Date(row.startedAt).toLocaleString(),
    },
  ]

  const actions: DataTableAction<CallRecord>[] = [
    { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  ]

  const onAction = (payload: DataTableActionPayload<CallRecord>) => {
    if ('row' in payload && payload.action === 'view') {
      navigate(callDetailPath(payload.row.id))
    }
  }

  return (
    <>
      <BreadCrumb
        activePage="Calls"
        breadcrumbs={[{ label: 'Calling', href: ROUTES.CALLS }]}
      />
      <div className="box">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div className="box-title">Call History</div>
          <div className="flex gap-2">
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
            <Link to={ROUTES.CALLS_LIVE} className="ti-btn ti-btn-outline-primary ti-btn-sm">
              Live Calls
            </Link>
          </div>
        </div>
        <div className="box-body">
          {isError ? (
            <p className="text-danger mb-0">Failed to load calls.</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              actions={actions}
              onAction={onAction}
              fetchData={(p) => setPage(p ?? 1)}
              itemsLabel="calls"
              emptyMessage="No calls yet"
            />
          )}
        </div>
      </div>
    </>
  )
}
