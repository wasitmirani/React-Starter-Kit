import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { executionsApi, rulesApi } from '@/api/endpoints/integrations.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { Switch } from '@/components/ui/Controls'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import type { AutomationRule, RuleExecution } from '@/types/integration.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

export function RulesPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const toggle = useAction('rules', (r: AutomationRule) => rulesApi.update(r.id, { status: r.status === 'active' ? 'paused' : 'active' }), { success: (r) => `${r.name} ${r.status}`, onSuccess: () => setBusy(null) })
  const columns: DataTableColumn<AutomationRule>[] = [
    { key: 'name', label: 'Rule', sortable: true, render: (r) => <div><Link to={to(ROUTES.AUTOMATION_RULE, { id: r.id })} className="fw-medium" onClick={(e) => e.stopPropagation()}>{r.name}</Link><div className="text-muted fs-sm">{r.description}</div></div> },
    { key: 'trigger', label: 'When', render: (r) => <ToneBadge tone="info" icon="ri-flashlight-line">{humanize(r.trigger)}</ToneBadge> },
    { key: 'actions', label: 'Then', render: (r) => <span className="fs-sm">{r.actions.map((a) => humanize(a.type)).join(', ')}</span> },
    { key: 'version', label: 'Version', align: 'end', render: (r) => `v${r.version}` },
    { key: 'runs30d', label: 'Runs (30d)', align: 'end', sortable: true },
    { key: 'lastRunAt', label: 'Last run', render: (r) => (r.lastRunAt ? formatRelativeTime(r.lastRunAt) : '—') },
    { key: 'status', label: 'Active', render: (r) => (r.status === 'draft' ? <StatusBadge status="draft" /> : <span onClick={(e) => e.stopPropagation()}><Switch id={`rule-${r.id}`} checked={r.status === 'active'} disabled={busy === r.id} onChange={() => { setBusy(r.id); toggle.mutate(r) }} /></span>) },
  ]
  return (
    <>
      <PageHeader title="Automation rules" description="Controlled if-this-then-that rules (no custom code). Rules are versioned, can be dry-run on recent orders, and log every execution." actions={<><Link to={ROUTES.AUTOMATION_TEMPLATES} className="btn btn-light"><i className="ri-magic-line me-1" />Templates</Link><button type="button" className="btn btn-primary" onClick={() => navigate(to(ROUTES.AUTOMATION_RULE, { id: 'new' }))}><i className="ri-add-line me-1" />New rule</button></>} />
      <ResourceList<AutomationRule> resource="rules" list={rulesApi.list} columns={columns} itemsLabel="rules" searchPlaceholder="Rule name or description…" rowLink={(r) => to(ROUTES.AUTOMATION_RULE, { id: r.id })} filters={[{ key: 'status', allLabel: 'All statuses', options: OPTIONS.ruleStatus }, { key: 'trigger', allLabel: 'Any trigger', options: OPTIONS.ruleTrigger }]} />
    </>
  )
}

export function ExecutionsPage() {
  const columns: DataTableColumn<RuleExecution>[] = [
    { key: 'createdAt', label: 'When', sortable: true, render: (e) => formatDateTime(e.createdAt) },
    { key: 'ruleName', label: 'Rule', render: (e) => <Link to={to(ROUTES.AUTOMATION_RULE, { id: e.ruleId })}>{e.ruleName}</Link> },
    { key: 'subject', label: 'Subject', render: (e) => <span className="font-monospace">{e.subject}</span> },
    { key: 'result', label: 'Result', render: (e) => <StatusBadge status={e.result} /> },
    { key: 'actionsApplied', label: 'Actions applied', render: (e) => (e.error ? <span className="text-danger fs-sm">{e.error}</span> : <span className="fs-sm">{e.actionsApplied.join('; ') || '—'}</span>) },
    { key: 'durationMs', label: 'Duration', align: 'end', render: (e) => `${e.durationMs} ms` },
  ]
  return (
    <>
      <PageHeader title="Execution history" description="Every rule evaluation with its outcome. Loop prevention skips actions a rule already applied to the same record." />
      <ResourceList<RuleExecution> resource="automation-runs" list={executionsApi.list} columns={columns} itemsLabel="executions" perPage={30} searchPlaceholder="Rule or subject…" filters={[{ key: 'result', allLabel: 'All results', options: OPTIONS.executionResult }, { key: 'trigger', allLabel: 'Any trigger', options: OPTIONS.ruleTrigger }]} />
    </>
  )
}
