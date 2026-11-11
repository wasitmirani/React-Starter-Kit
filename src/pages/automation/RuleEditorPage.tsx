import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { rulesApi } from '@/api/endpoints/integrations.api'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { FlowPreview } from '@/components/features/automation/FlowPreview'
import { Panel } from '@/components/common/Panel'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS, RULE_FIELDS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import type { AutomationRule, RuleAction, RuleCondition } from '@/types/integration.types'

type Draft = Pick<AutomationRule, 'name' | 'description' | 'trigger' | 'conditions' | 'actions' | 'status'>
const EMPTY: Draft = { name: '', description: '', trigger: 'order_imported', conditions: [{ field: 'payment_method', operator: 'equals', value: 'cod' }], actions: [{ type: 'add_tag', value: '' }], status: 'draft' }

function validate(d: Draft): string | null {
  if (d.name.trim().length < 3) return 'Give the rule a name.'
  if (!d.actions.length) return 'Add at least one action.'
  if (d.conditions.some((c) => !c.value.trim())) return 'Every condition needs a value.'
  if (d.actions.some((a) => !a.value.trim())) return 'Every action needs a value.'
  if (d.conditions.some((c) => ['greater_than', 'less_than'].includes(c.operator) && Number.isNaN(Number(c.value)))) return 'Greater / less than compare numbers.'
  return null
}

export function RuleEditorPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const rule = useOne('rules', rulesApi.get, isNew ? undefined : id)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState<Awaited<ReturnType<typeof rulesApi.dryRun>> | null>(null)
  const save = useAction('rules', (d: Draft) => (isNew ? rulesApi.create({ ...d, version: 1, runs30d: 0, lastRunAt: null }) : rulesApi.update(id!, d)), { success: (r) => `${r.name} saved (v${r.version})`, onSuccess: (r) => isNew && navigate(to(ROUTES.AUTOMATION_RULE, { id: r.id }), { replace: true }) })
  const test = useAction('automation-runs', rulesApi.dryRun, { onSuccess: setDryRun })

  useEffect(() => {
    if (rule.data) setDraft(rule.data)
  }, [rule.data])

  if (!isNew && rule.isLoading) return <Loader label="Loading rule…" />
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch })
  const setCondition = (i: number, patch: Partial<RuleCondition>) => set({ conditions: draft.conditions.map((c, j) => (j === i ? { ...c, ...patch } : c)) })
  const setAction = (i: number, patch: Partial<RuleAction>) => set({ actions: draft.actions.map((a, j) => (j === i ? { ...a, ...patch } : a)) })
  const submit = (status: Draft['status']) => {
    const problem = validate(draft)
    setError(problem)
    if (!problem) save.mutate({ ...draft, status })
  }

  return (
    <>
      <PageHeader
        back={{ label: 'Automation rules', to: ROUTES.AUTOMATION_RULES }}
        title={isNew ? 'New rule' : draft.name || 'Rule'}
        meta={!isNew && rule.data && <><StatusBadge status={rule.data.status} /><ToneBadge tone="light">v{rule.data.version}</ToneBadge></>}
        description="Rules run on the trigger, check every condition (AND), then apply actions in order. Saving a published rule creates a new version."
        actions={
          <>
            {!isNew && <button type="button" className="btn btn-light" disabled={test.isPending} onClick={() => test.mutate(id!)}><i className="ri-flask-line me-1" />{test.isPending ? 'Running…' : 'Dry run'}</button>}
            <button type="button" className="btn btn-light" disabled={save.isPending} onClick={() => submit(draft.status === 'active' ? 'active' : 'draft')}>Save</button>
            {draft.status !== 'active' && <button type="button" className="btn btn-primary" disabled={save.isPending} onClick={() => submit('active')}>Publish</button>}
          </>
        }
      />
      <FormAlert message={error} onClose={() => setError(null)} />
      <div className="row g-4">
        <div className="col-xl-4">
          <Panel title="Rule" icon="ri-information-line" className="mb-4">
            <FormField id="r-name" label="Name" required className="mb-4"><input id="r-name" className="form-control" value={draft.name} onChange={(e) => set({ name: e.target.value })} /></FormField>
            <FormField id="r-desc" label="Description"><textarea id="r-desc" rows={3} className="form-control" value={draft.description} onChange={(e) => set({ description: e.target.value })} /></FormField>
          </Panel>
          <Panel title="Flow" icon="ri-flow-chart" description="Live preview of what this rule does.">
            <FlowPreview rule={draft} />
          </Panel>
        </div>
        <div className="col-xl-8 d-flex flex-column gap-4">
          <Panel title="When" icon="ri-flashlight-line">
            <select className="form-select" value={draft.trigger} aria-label="Trigger" onChange={(e) => set({ trigger: e.target.value as Draft['trigger'] })}>{OPTIONS.ruleTrigger.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </Panel>
          <Panel title="If all conditions match" icon="ri-filter-3-line" actions={<button type="button" className="btn btn-sm btn-light" onClick={() => set({ conditions: [...draft.conditions, { field: 'channel', operator: 'equals', value: '' }] })}><i className="ri-add-line" /> Condition</button>}>
            {!draft.conditions.length && <p className="text-muted mb-0">No conditions: the rule applies to every trigger.</p>}
            {draft.conditions.map((c, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <select className="form-select" aria-label="Field" value={c.field} onChange={(e) => setCondition(i, { field: e.target.value })}>{RULE_FIELDS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <select className="form-select" aria-label="Operator" value={c.operator} onChange={(e) => setCondition(i, { operator: e.target.value as RuleCondition['operator'] })}>{OPTIONS.ruleOperator.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <input className="form-control" aria-label="Value" placeholder={c.operator === 'in' ? 'a, b, c' : 'Value'} value={c.value} onChange={(e) => setCondition(i, { value: e.target.value })} />
                <button type="button" className="btn btn-light btn-icon" aria-label="Remove condition" onClick={() => set({ conditions: draft.conditions.filter((_, j) => j !== i) })}><i className="ri-delete-bin-line" /></button>
              </div>
            ))}
          </Panel>
          <Panel title="Then" icon="ri-play-list-add-line" actions={<button type="button" className="btn btn-sm btn-light" onClick={() => set({ actions: [...draft.actions, { type: 'notify_user', value: '' }] })}><i className="ri-add-line" /> Action</button>}>
            {draft.actions.map((a, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <span className="badge bg-light text-muted align-self-center">{i + 1}</span>
                <select className="form-select" aria-label="Action" value={a.type} onChange={(e) => setAction(i, { type: e.target.value as RuleAction['type'] })}>{OPTIONS.ruleAction.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <input className="form-control" aria-label="Action value" placeholder="Tag, warehouse code, user, service…" value={a.value} onChange={(e) => setAction(i, { value: e.target.value })} />
                <button type="button" className="btn btn-light btn-icon" aria-label="Remove action" disabled={draft.actions.length === 1} onClick={() => set({ actions: draft.actions.filter((_, j) => j !== i) })}><i className="ri-delete-bin-line" /></button>
              </div>
            ))}
          </Panel>
        </div>
      </div>
      <Modal open={dryRun !== null} onClose={() => setDryRun(null)} title="Dry run result" footer={<button type="button" className="btn btn-primary" onClick={() => setDryRun(null)}>Close</button>}>
        <p className="text-muted">Evaluated against {dryRun?.evaluated} recent orders. No actions were applied.</p>
        {dryRun?.matched.length ? (
          <ul className="list-group list-group-flush">{dryRun.matched.map((m) => <li key={m.subject} className="list-group-item px-0"><strong>{m.subject}</strong><div className="text-muted fs-sm">{m.actions.join(' → ')}</div></li>)}</ul>
        ) : <p className="mb-0">No orders matched the conditions.</p>}
      </Modal>
    </>
  )
}
