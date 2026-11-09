import { useState } from 'react'
import { Link } from 'react-router-dom'
import { workflowsApi } from '@/api/endpoints/automation.api'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { DetailList } from '@/components/ui/Controls'
import { Drawer } from '@/components/ui/Drawer'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import { countdown, useNow } from '@/hooks/useNow'
import type { WorkflowExecution } from '@/types/automation.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'
import { formatDuration } from '@/utils/formatters/number.formatter'
import { RunLog } from './RunLog'

const RUN_STATUSES = [
  { value: 'running', label: 'Running' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
  { value: 'goal_reached', label: 'Goal reached' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const isLive = (r: Pick<WorkflowExecution, 'status'>) => r.status === 'running' || r.status === 'waiting'

/** Live dot + "Updated 3s ago" for auto-refreshing views. */
export function LiveIndicator({ updatedAt, active }: { updatedAt: number; active: boolean }) {
  const now = useNow(1000, active)
  return (
    <span className="d-inline-flex align-items-center gap-2 fs-sm text-muted">
      <span className={`live-dot${active ? ' on' : ''}`} aria-hidden="true" />
      {active ? `Live · updated ${Math.max(0, Math.round((now - updatedAt) / 1000))}s ago` : 'Paused updates'}
    </span>
  )
}

/** Run status with the resume countdown for waiting runs. */
export function RunStatus({ run }: { run: WorkflowExecution }) {
  const now = useNow(1000, run.status === 'waiting')
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <StatusBadge status={run.status} />
      {run.status === 'waiting' && run.resumeAt && <span className="text-muted fs-xs text-nowrap">resumes {countdown(Date.parse(run.resumeAt), now)}</span>}
    </span>
  )
}

interface RunDrawerProps {
  runId: string | null
  onClose: () => void
  workflowName?: string
  /** Lets the builder jump to a step from the log. */
  onStepClick?: (stepId: string) => void
}

export function RunDrawer({ runId, onClose, workflowName, onStepClick }: RunDrawerProps) {
  const run = useTenantQuery('executions', { run: runId }, () => workflowsApi.run(runId!), {
    enabled: Boolean(runId),
    refetchInterval: (q) => (q.state.data && isLive(q.state.data) ? 3000 : false),
  })
  const retry = useAction('executions', workflowsApi.retryRun, { success: (r) => (r.status === 'failed' ? 'Retry failed again; see the log' : 'Run retried') })
  const cancel = useAction('executions', workflowsApi.cancelRun, { success: 'Run cancelled' })
  const r = run.data
  const duration = r ? ((r.finishedAt ? Date.parse(r.finishedAt) : Date.parse(r.updatedAt)) - Date.parse(r.startedAt)) / 1000 : 0

  return (
    <Drawer
      open={runId !== null}
      onClose={onClose}
      size="lg"
      title={r ? r.contactName : 'Run'}
      subtitle={r && <span className="d-inline-flex align-items-center gap-2 flex-wrap"><RunStatus run={r} />{r.test && <ToneBadge tone="warning">Test run</ToneBadge>}<span>{workflowName ?? ''} · version {r.version || 'draft'}</span></span>}
      footer={
        r && (
          <>
            {r.contactId && <Link to={to(ROUTES.CONTACT, { id: r.contactId })} className="btn btn-light me-auto">Open contact</Link>}
            {isLive(r) && <button type="button" className="btn btn-light text-danger" disabled={cancel.isPending} onClick={() => cancel.mutate(r.id)}><i className="ri-stop-circle-line me-1" />Cancel run</button>}
            {r.status === 'failed' && <button type="button" className="btn btn-primary" disabled={retry.isPending} onClick={() => retry.mutate(r.id)}><i className="ri-refresh-line me-1" />{retry.isPending ? 'Retrying…' : 'Retry from failed step'}</button>}
          </>
        )
      }
    >
      {!r ? (
        <SkeletonLines lines={8} />
      ) : (
        <>
          {r.error && <div className="alert alert-danger py-2"><i className="ri-error-warning-line me-1" />{r.error}</div>}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <DetailList
                items={[
                  { label: 'Started', value: formatDateTime(r.startedAt) },
                  { label: r.finishedAt ? 'Finished' : 'Last activity', value: formatDateTime(r.finishedAt ?? r.updatedAt) },
                  { label: 'Duration', value: formatDuration(Math.max(0, duration)) },
                ]}
              />
            </div>
            <div className="col-md-6">
              <DetailList
                items={[
                  { label: isLive(r) ? 'Current step' : 'Ended at', value: r.currentStep },
                  { label: 'Steps logged', value: r.log.length },
                  { label: 'Run ID', value: <code className="fs-xs">{r.id}</code> },
                ]}
              />
            </div>
          </div>
          {Object.keys(r.variables).length > 0 && (
            <div className="mb-4">
              <h6 className="wf-library-group">Variables</h6>
              <div className="d-flex flex-wrap gap-1">
                {Object.entries(r.variables).map(([k, v]) => <code key={k} className="var-chip">vars.{k} = {v || '(empty)'}</code>)}
              </div>
            </div>
          )}
          <h6 className="wf-library-group">Log</h6>
          <RunLog log={r.log} onStepClick={onStepClick} />
        </>
      )}
    </Drawer>
  )
}

interface RunsTableProps {
  /** Omit for runs across every workflow. */
  workflowId?: string
  onStepClick?: (stepId: string) => void
}

/** Filterable, live-refreshing list of runs with a log drawer. */
export function RunsTable({ workflowId, onStepClick }: RunsTableProps) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [test, setTest] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [live, setLive] = useState(true)
  const [openRun, setOpenRun] = useState<string | null>(null)
  const workflows = useAll('workflows', workflowsApi.list)
  const names = new Map((workflows.data?.data ?? []).map((w) => [w.id, w.name]))
  const query = { workflowId, page, perPage: 15, search, filters: { status, test } }
  const runs = useTenantQuery('executions', query, () => workflowsApi.runs(query), {
    placeholderData: (p) => p,
    refetchInterval: live ? 4000 : false,
  })

  const columns: DataTableColumn<WorkflowExecution>[] = [
    {
      key: 'contactName',
      label: 'Contact',
      render: (r) => (
        <div className="min-w-0">
          <div className="fw-medium text-truncate">{r.contactName}{r.test && <ToneBadge tone="warning" className="ms-2">Test</ToneBadge>}</div>
          {!workflowId && <div className="text-muted fs-xs text-truncate">{names.get(r.workflowId) ?? 'Workflow'}</div>}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => <RunStatus run={r} /> },
    { key: 'currentStep', label: 'Step', render: (r) => <span className={r.status === 'failed' ? 'text-danger' : ''}>{r.currentStep}</span> },
    { key: 'version', label: 'Version', render: (r) => (r.version ? `v${r.version}` : 'draft') },
    { key: 'startedAt', label: 'Started', render: (r) => <span className="text-nowrap" title={formatDateTime(r.startedAt)}>{formatRelativeTime(r.startedAt)}</span> },
    { key: 'error', label: 'Last event', render: (r) => <span className={`fs-sm text-truncate d-inline-block ${r.error ? 'text-danger' : 'text-muted'}`} style={{ maxWidth: 280 }}>{r.error ?? r.log[r.log.length - 1]?.message}</span> },
  ]

  return (
    <div className="card m-0">
      <div className="card-body pb-0">
        <FilterBar end={<><LiveIndicator updatedAt={runs.dataUpdatedAt} active={live} /><button type="button" className="btn btn-sm btn-light" onClick={() => setLive((l) => !l)}>{live ? 'Pause' : 'Resume'}</button></>}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search contact…" />
          <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1) }} allLabel="All statuses" options={RUN_STATUSES} />
          <FilterSelect value={test} onChange={(v) => { setTest(v); setPage(1) }} allLabel="Live runs" options={[{ value: 'include', label: 'Live + test runs' }, { value: 'only', label: 'Test runs only' }]} />
        </FilterBar>
      </div>
      <DataTable<WorkflowExecution>
        columns={columns}
        rows={runs.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
        isLoading={runs.isLoading}
        itemsLabel="runs"
        emptyMessage="No runs match"
        emptyDescription={workflowId ? 'Contacts appear here when the published workflow enrols them, or when you start a test run.' : 'Runs appear here once a published workflow enrols contacts.'}
        onRowClick={(r) => setOpenRun(r.id)}
        fetchData={(p) => p && setPage(p)}
      />
      <RunDrawer runId={openRun} onClose={() => setOpenRun(null)} workflowName={openRun ? names.get(runs.data?.data.find((r) => r.id === openRun)?.workflowId ?? '') : undefined} onStepClick={onStepClick && ((id) => { setOpenRun(null); onStepClick(id) })} />
    </div>
  )
}
