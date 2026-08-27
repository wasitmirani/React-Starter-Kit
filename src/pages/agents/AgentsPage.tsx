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
import { agentsService } from '@/services/agents.service'
import { toDataTableRows } from '@/lib/mock'
import type { Agent } from '@/types/agent.types'
import { Can } from '@/components/common/Can'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES, agentDetailPath, agentEditPath } from '@/constants/routes.constants'

const STATUS_BADGE: Record<Agent['status'], string> = {
  draft: 'badge bg-secondary-transparent',
  active: 'badge bg-success-transparent',
  paused: 'badge bg-warning-transparent',
  archived: 'badge bg-danger-transparent',
}

export function AgentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['agents', page, search],
    queryFn: () => agentsService.list({ page, per_page: 10, search: search || undefined }),
  })

  const rows = useMemo(() => {
    if (!data?.success || !data.data) {
      return toDataTableRows<Agent>([], {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
      })
    }
    return toDataTableRows(data.data, data.meta ?? {
      page,
      per_page: 10,
      total: data.data.length,
      total_pages: 1,
    })
  }, [data, page])

  const columns: DataTableColumn<Agent>[] = [
    {
      key: 'name',
      header: 'Agent',
      render: (row) => (
        <div>
          <Link to={agentDetailPath(row.id)} className="font-medium text-primary">
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
    { key: 'voice', header: 'Voice', render: (row) => `${row.voiceProvider} · ${row.voice}` },
    { key: 'model', header: 'Model', render: (row) => `${row.modelProvider} · ${row.model}` },
    {
      key: 'callsHandled',
      header: 'Calls',
      align: 'end',
      render: (row) => row.callsHandled.toLocaleString(),
    },
    {
      key: 'successRate',
      header: 'Success',
      align: 'end',
      render: (row) => `${row.successRate}%`,
    },
  ]

  const actions: DataTableAction<Agent>[] = [
    {
      key: 'call',
      label: 'Call',
      icon: 'ri-phone-fill',
      variant: 'view',
      condition: (row) => row.status === 'active',
    },
    { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
    { key: 'edit', label: 'Edit', icon: 'ri-pencil-line', variant: 'edit' },
  ]

  const onAction = (payload: DataTableActionPayload<Agent>) => {
    if ('row' in payload) {
      if (payload.action === 'call') {
        navigate(`${agentDetailPath(payload.row.id)}?call=1`)
      }
      if (payload.action === 'view') navigate(agentDetailPath(payload.row.id))
      if (payload.action === 'edit') navigate(agentEditPath(payload.row.id))
    }
  }

  return (
    <>
      <BreadCrumb
        activePage="AI Agents"
        breadcrumbs={[{ label: 'Voice AI', href: ROUTES.AGENTS }]}
      />

      <div className="box">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div className="box-title">All Agents</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="Search agents…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ minWidth: 200 }}
            />
            <Can permission={PERMISSIONS.AGENTS_CREATE}>
              <Link to={ROUTES.AGENT_CREATE} className="ti-btn ti-btn-primary ti-btn-sm">
                <i className="ri-add-line me-1" />
                Create Agent
              </Link>
            </Can>
          </div>
        </div>
        <div className="box-body">
          {isError ? (
            <p className="text-danger mb-0">Failed to load agents.</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              actions={actions}
              onAction={onAction}
              fetchData={(p) => setPage(p ?? 1)}
              itemsLabel="agents"
              emptyMessage="No agents yet"
              emptyDescription="Create your first AI voice agent to get started."
            />
          )}
        </div>
      </div>
    </>
  )
}
