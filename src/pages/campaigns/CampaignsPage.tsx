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
import { campaignsService } from '@/services/campaigns.service'
import { toDataTableRows } from '@/lib/mock'
import type { Campaign } from '@/types/campaign.types'
import { Can } from '@/components/common/Can'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES, campaignDetailPath } from '@/constants/routes.constants'

const STATUS_BADGE: Record<Campaign['status'], string> = {
  draft: 'badge bg-secondary-transparent',
  scheduled: 'badge bg-info-transparent',
  running: 'badge bg-success-transparent',
  paused: 'badge bg-warning-transparent',
  completed: 'badge bg-primary-transparent',
  stopped: 'badge bg-danger-transparent',
}

export function CampaignsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaigns', page, search],
    queryFn: () =>
      campaignsService.list({ page, per_page: 10, search: search || undefined }),
  })

  const rows = useMemo(() => {
    if (!data?.success || !data.data) {
      return toDataTableRows<Campaign>([], {
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

  const columns: DataTableColumn<Campaign>[] = [
    {
      key: 'name',
      header: 'Campaign',
      render: (row) => (
        <div>
          <Link to={campaignDetailPath(row.id)} className="font-medium text-primary">
            {row.name}
          </Link>
          <div className="text-textmuted fs-12">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className={STATUS_BADGE[row.status]}>{row.status}</span>,
    },
    { key: 'agentName', header: 'Agent' },
    { key: 'phoneNumber', header: 'Number' },
    {
      key: 'stats',
      header: 'Progress',
      render: (row) =>
        `${row.stats.completed}/${row.stats.totalContacts} · ${row.stats.successful} ok`,
    },
  ]

  const actions: DataTableAction<Campaign>[] = [
    { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  ]

  const onAction = (payload: DataTableActionPayload<Campaign>) => {
    if ('row' in payload && payload.action === 'view') {
      navigate(campaignDetailPath(payload.row.id))
    }
  }

  return (
    <>
      <BreadCrumb
        activePage="Campaigns"
        breadcrumbs={[{ label: 'Calling', href: ROUTES.CAMPAIGNS }]}
      />
      <div className="box">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div className="box-title">All Campaigns</div>
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
            <Can permission={PERMISSIONS.CAMPAIGNS_CREATE}>
              <Link to={ROUTES.CAMPAIGN_CREATE} className="ti-btn ti-btn-primary ti-btn-sm">
                Create Campaign
              </Link>
            </Can>
          </div>
        </div>
        <div className="box-body">
          {isError ? (
            <p className="text-danger mb-0">Failed to load campaigns.</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              actions={actions}
              onAction={onAction}
              fetchData={(p) => setPage(p ?? 1)}
              itemsLabel="campaigns"
              emptyMessage="No campaigns"
            />
          )}
        </div>
      </div>
    </>
  )
}
