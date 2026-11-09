import type { WorkflowDraft } from '@/api/endpoints/automation.api'
import { FormField } from '@/components/common/FormField'
import { Switch } from '@/components/ui/Controls'
import { STEP_DESCRIPTIONS, STEP_TYPES, WEEKDAYS, dayNames } from '@/constants/automation.constants'
import type { Workflow, WorkflowRunStats, WorkflowStep } from '@/types/automation.types'
import { hasFixedPaths, stepKey, type VariableOption, type WorkflowIssue } from '@/utils/helpers/workflow'
import { ConditionGroupEditor } from './ConditionGroupEditor'
import { HttpRequestEditor } from './HttpRequestEditor'
import { PathsEditor } from './PathsEditor'
import { ConfigInput, Section } from './InspectorParts'
import { StepExtras } from './StepExtras'
import { TriggerInspector } from './TriggerInspector'
import { VariablesEditor } from './VariablesEditor'

interface StepInspectorProps {
  draft: WorkflowDraft
  selectedId: string | null
  step: WorkflowStep | null
  issues: WorkflowIssue[]
  /** Variables in scope for the selected step. */
  variableOptions: VariableOption[]
  onChange: (patch: Partial<WorkflowDraft>) => void
  onStepPatch: (id: string, patch: Partial<WorkflowStep>) => void
  onDeleteStep: (id: string) => void
  onSelectIssue: (target: string) => void
  stats: Workflow['stats']
  /** Live counts for step insights. */
  runStats?: WorkflowRunStats
  onViewRuns?: () => void
  /** Open the trigger inspector with the trigger picker showing. */
  startPicking?: boolean
  /** Saved workflow id, for webhook tests. */
  workflowId?: string
}

/** Days + from/to editor used by the Time window step and the send window. */
function TimeWindowEditor({ value, onChange }: { value: Record<string, string>; onChange: (v: Partial<Record<'days' | 'from' | 'to', string>>) => void }) {
  const days = (value.days ?? '').split(',').filter(Boolean).map(Number)
  const toggle = (d: number) => onChange({ days: (days.includes(d) ? days.filter((x) => x !== d) : [...days, d]).sort().join(',') })
  return (
    <div className="mb-3">
      <div className="d-flex flex-wrap gap-1 mb-2" role="group" aria-label="Days">
        {WEEKDAYS.map((label, d) => (
          <button key={label} type="button" className={`day-chip${days.includes(d) ? ' on' : ''}`} aria-pressed={days.includes(d)} onClick={() => toggle(d)}>{label}</button>
        ))}
      </div>
      <div className="d-flex align-items-center gap-2 fs-sm">
        <input type="time" className="form-control form-control-sm" style={{ width: 110 }} value={value.from ?? ''} onChange={(e) => onChange({ from: e.target.value })} aria-label="From" />
        <span className="text-muted">to</span>
        <input type="time" className="form-control form-control-sm" style={{ width: 110 }} value={value.to ?? ''} onChange={(e) => onChange({ to: e.target.value })} aria-label="To" />
      </div>
      <div className="form-text">{dayNames(value.days)} · workspace time zone</div>
    </div>
  )
}

/** Right-hand panel: settings for the selected node, or the workflow when nothing is selected. */
export function StepInspector({ startPicking = false, workflowId, draft, selectedId, step, issues, variableOptions, onChange, onStepPatch, onDeleteStep, onSelectIssue, stats, runStats, onViewRuns }: StepInspectorProps) {
  const setSettings = (patch: Partial<WorkflowDraft['settings']>) => onChange({ settings: { ...draft.settings, ...patch } })
  const targetHasIssue = (target: string) => issues.some((i) => i.target === target)
  const isMissing = (target: string, value: string | undefined, optional?: boolean) => !optional && !value?.trim() && targetHasIssue(target)

  if (selectedId === 'trigger') return <TriggerInspector startPicking={startPicking} workflowId={workflowId} draft={draft} variableOptions={variableOptions} onChange={onChange} missing={(v) => isMissing('trigger', v)} />

  if (step) {
    const meta = STEP_TYPES[step.type]
    const here = runStats?.onStep[step.id] ?? 0
    const passed = runStats?.passed[step.id] ?? 0
    const failed = runStats?.failedAt[step.id] ?? 0
    return (
      <div className="wf-inspector-body">
        <header className="wf-inspector-head">
          <span className={`icon-tile bg-${meta.tone}-subtle text-${meta.tone}`}><i className={meta.icon} /></span>
          <div className="min-w-0 flex-1">
            <div className="flow-node-kind">{meta.label}</div>
            <input className="wf-step-name" value={step.name ?? ''} placeholder={meta.label} onChange={(e) => onStepPatch(step.id, { name: e.target.value })} aria-label="Step name" />
          </div>
        </header>
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <p className="text-muted fs-sm mb-0">{STEP_DESCRIPTIONS[step.type]}</p>
          <Switch id={`on-${step.id}`} checked={!step.disabled} onChange={(on) => onStepPatch(step.id, { disabled: !on })} label={step.disabled ? 'Off' : 'On'} />
        </div>
        {step.disabled && <div className="alert alert-light border py-2 fs-sm"><i className="ri-forbid-line me-1" />Turned off: contacts skip this step{step.paths ? ' and all of its paths' : ''}. Its settings are kept.</div>}
        {runStats && (here > 0 || passed > 0 || failed > 0) && (
          <div className="step-insights mb-4">
            <div><span className="fw-semibold tabular-nums">{here}</span><span className="text-muted fs-xs">on this step now</span></div>
            <div><span className="fw-semibold tabular-nums">{passed.toLocaleString()}</span><span className="text-muted fs-xs">passed</span></div>
            <div><span className={`fw-semibold tabular-nums${failed ? ' text-danger' : ''}`}>{failed}</span><span className="text-muted fs-xs">failed here</span></div>
            {onViewRuns && <button type="button" className="btn btn-link btn-sm p-0" onClick={onViewRuns}>View runs <i className="ri-arrow-right-line" /></button>}
          </div>
        )}
        <StepExtras step={step} allSteps={draft.steps} options={variableOptions} onPatch={(patch) => onStepPatch(step.id, patch)} onFocusStep={onSelectIssue} />
        {step.type === 'wait_until' && <TimeWindowEditor value={step.config} onChange={(config) => onStepPatch(step.id, { config: { ...step.config, ...config } })} />}
        {meta.fields.map((f) => (
          <ConfigInput
            key={f.key}
            field={f}
            options={variableOptions}
            value={step.config[f.key] ?? ''}
            invalid={isMissing(step.id, step.config[f.key], f.optional)}
            onChange={(v) => onStepPatch(step.id, { config: { ...step.config, [f.key]: f.key === 'variable' ? v.toLowerCase() : v } })}
          />
        ))}
        {step.paths && !hasFixedPaths(step) && <div className="mb-4"><PathsEditor step={step} options={variableOptions} onChange={(paths) => onStepPatch(step.id, { paths })} /></div>}
        {step.type === 'wait_for_event' && <p className="text-muted fs-sm"><i className="ri-git-branch-line me-1" />Contacts who do it go down <strong>{step.paths?.[0]?.label}</strong> right away; the rest go down <strong>{step.paths?.[1]?.label}</strong> when the time runs out.</p>}
        {step.http && <div className="mb-4"><HttpRequestEditor value={step.http} onChange={(http) => onStepPatch(step.id, { http })} options={variableOptions} variables={draft.variables} stepRef={stepKey(step.id)} /></div>}
        {targetHasIssue(step.id) && (
          <ul className="list-unstyled fs-sm mb-3">
            {issues.filter((i) => i.target === step.id).map((i) => <li key={i.message} className="text-warning-emphasis"><i className="ri-error-warning-line me-1" />{i.message}</li>)}
          </ul>
        )}
        <FormField id={`note-${step.id}`} label={<>Note <span className="text-muted fw-normal">(team only)</span></>} className="mb-4">
          <textarea id={`note-${step.id}`} rows={2} className="form-control" value={step.note ?? ''} placeholder="Why this step exists, who owns it…" onChange={(e) => onStepPatch(step.id, { note: e.target.value })} />
        </FormField>
        <button type="button" className="btn btn-light text-danger w-100" onClick={() => onDeleteStep(step.id)}>
          <i className="ri-delete-bin-6-line me-1" /> Delete step{step.paths ? ' and its paths' : ''}
        </button>
      </div>
    )
  }

  return (
    <div className="wf-inspector-body">
      <header className="wf-inspector-head">
        <span className="icon-tile bg-light text-muted"><i className="ri-settings-3-line" /></span>
        <div>
          <div className="flow-node-kind">Automation</div>
          <h6 className="mb-0">Settings</h6>
        </div>
      </header>
      <FormField id="wf-desc" label="Description" className="mb-4">
        <textarea id="wf-desc" rows={2} className="form-control" value={draft.description} placeholder="What is this automation for?" onChange={(e) => onChange({ description: e.target.value })} />
      </FormField>
      <Section title="Enrolment">
        <div className="mb-3">
          <div className="form-label mb-1">Entry conditions</div>
          <ConditionGroupEditor
            id="entry"
            value={draft.settings.entry}
            onChange={(entry) => setSettings({ entry })}
            options={variableOptions}
            emptyText="Everyone the trigger fires for enters."
            addLabel="Only enrol contacts who…"
          />
        </div>
        <div className="mb-3">
          <div className="form-label mb-1">Exit conditions</div>
          <ConditionGroupEditor
            id="exit"
            value={draft.settings.exit}
            onChange={(exit) => setSettings({ exit })}
            options={variableOptions}
            emptyText="Contacts stay until they finish or reach the goal."
            addLabel="Remove contacts when…"
          />
          <div className="form-text">Checked before every step, e.g. stop once a contact becomes a customer.</div>
        </div>
        <div className="mb-3">
          <Switch id="wf-reentry" checked={draft.allowReentry} onChange={(allowReentry) => onChange({ allowReentry })} label="Allow re-entry" description="A contact can go through again after finishing." />
          {draft.allowReentry && (
            <div className="d-flex align-items-center gap-2 mt-2 ms-5 fs-sm">
              <span className="text-muted">Wait at least</span>
              <input type="number" min={0} max={365} className="form-control form-control-sm" style={{ width: 72 }} value={draft.settings.reentryCooldownDays} onChange={(e) => setSettings({ reentryCooldownDays: Math.max(0, Number(e.target.value) || 0) })} aria-label="Cooldown days" />
              <span className="text-muted">days before entering again</span>
            </div>
          )}
        </div>
        <Switch
          id="wf-window"
          checked={draft.settings.sendWindow.enabled}
          onChange={(enabled) => setSettings({ sendWindow: { ...draft.settings.sendWindow, enabled } })}
          label="Send window"
          description="Messages outside these hours wait until the window opens."
        />
        {draft.settings.sendWindow.enabled && (
          <div className="mt-2 ms-5">
            <TimeWindowEditor
              value={{ days: draft.settings.sendWindow.days.join(','), from: draft.settings.sendWindow.from, to: draft.settings.sendWindow.to }}
              onChange={(v) => setSettings({ sendWindow: { ...draft.settings.sendWindow, ...(v.days !== undefined && { days: v.days.split(',').filter(Boolean).map(Number) }), ...(v.from && { from: v.from }), ...(v.to && { to: v.to }) } })}
            />
          </div>
        )}
      </Section>
      <Section title="Workflow variables">
        <VariablesEditor value={draft.variables} onChange={(variables) => onChange({ variables })} />
      </Section>
      <Section title="Performance">
        <div className="wf-stats">
          {[['Enrolled', stats.enrolled], ['In progress', stats.active], ['Completed', stats.completed], ['Reached goal', stats.goalReached]].map(([label, n]) => (
            <div key={label as string}>
              <div className="fw-semibold tabular-nums">{(n as number).toLocaleString()}</div>
              <div className="text-muted fs-xs">{label}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Checklist">
        {issues.length === 0 ? (
          <p className="text-success fs-sm mb-0"><i className="ri-checkbox-circle-fill me-1" />Ready to activate.</p>
        ) : (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
            {issues.map((issue, i) => (
              <li key={i}>
                <button type="button" className="wf-issue" onClick={() => onSelectIssue(issue.target)}>
                  <i className="ri-error-warning-line text-warning" /> {issue.message}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
