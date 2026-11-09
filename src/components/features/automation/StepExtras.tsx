import { useState } from 'react'
import { integrationsApi } from '@/api/endpoints/platform.api'
import { FormField } from '@/components/common/FormField'
import { INTEGRATION_APPS, STEP_TYPES, type IntegrationApp } from '@/constants/automation.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { WorkflowStep } from '@/types/automation.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { flattenSteps, stepTitle, type VariableOption } from '@/utils/helpers/workflow'
import { ConditionGroupEditor } from './ConditionGroupEditor'

interface ExtrasProps {
  step: WorkflowStep
  allSteps: WorkflowStep[]
  options: VariableOption[]
  onPatch: (patch: Partial<WorkflowStep>) => void
  onFocusStep: (id: string) => void
}

/** If / else: the Yes path's conditions; No needs none. */
function IfElseEditor({ step, options, onPatch }: Pick<ExtrasProps, 'step' | 'options' | 'onPatch'>) {
  const [yes, no] = step.paths ?? []
  if (!yes || !no) return null
  return (
    <div className="mb-4">
      <div className="if-else-card">
        <div className="if-else-head yes"><i className="ri-check-line" />If the contact matches → <strong>{yes.label}</strong></div>
        <div className="p-3">
          <ConditionGroupEditor
            id={`if-${step.id}`}
            value={{ match: yes.match, conditions: yes.conditions }}
            onChange={(g) => onPatch({ paths: [{ ...yes, match: g.match, conditions: g.conditions }, no] })}
            options={options}
            emptyText="Add at least one condition."
            addLabel="Add condition"
          />
        </div>
        <div className="if-else-head no"><i className="ri-close-line" />Otherwise → <strong>{no.label}</strong></div>
      </div>
    </div>
  )
}

/** Go to step: pick the destination and a loop limit. */
function JumpEditor({ step, allSteps, onPatch, onFocusStep }: Omit<ExtrasProps, 'options'>) {
  const targets = flattenSteps(allSteps).filter((s) => s.id !== step.id && s.type !== 'jump')
  const target = targets.find((s) => s.id === step.config.target)
  const set = (k: string, v: string) => onPatch({ config: { ...step.config, [k]: v } })
  return (
    <>
      <FormField id={`jump-${step.id}`} label="Go to" error={!target ? 'Choose a step' : undefined} hint="Contacts continue from that step. Branches on the way are checked again." className="mb-3">
        <select id={`jump-${step.id}`} className="form-select" value={step.config.target ?? ''} onChange={(e) => set('target', e.target.value)}>
          <option value="">Choose a step…</option>
          {targets.map((s, i) => (
            <option key={s.id} value={s.id}>{`${i + 1}. ${stepTitle(s, STEP_TYPES[s.type].label)}`}</option>
          ))}
        </select>
      </FormField>
      {target && (
        <button type="button" className="btn btn-link btn-sm p-0 mb-3" onClick={() => onFocusStep(target.id)}>
          <i className="ri-focus-3-line me-1" />Show “{stepTitle(target, STEP_TYPES[target.type].label)}” on the canvas
        </button>
      )}
      <FormField id={`loops-${step.id}`} label="Loop limit" hint="After this many jumps for the same contact, the run ends instead of looping forever." className="mb-4">
        <div className="input-group">
          <input id={`loops-${step.id}`} type="number" min={1} max={20} className="form-control" value={step.config.maxLoops ?? '3'} onChange={(e) => set('maxLoops', e.target.value)} />
          <span className="input-group-text">times</span>
        </div>
      </FormField>
    </>
  )
}

/** Connection status for steps that call a third-party app, with connect / disconnect. */
function ConnectionCard({ app }: { app: IntegrationApp }) {
  const list = useAll('integrations', integrationsApi.list)
  const conn = list.data?.data.find((i) => i.app === app)
  const meta = INTEGRATION_APPS[app]
  const [account, setAccount] = useState('')
  const connect = useAction('integrations', (id: string) => integrationsApi.connect(id, account.trim() || `${meta.label} workspace`), { success: `${meta.label} connected` })
  const disconnect = useAction('integrations', integrationsApi.disconnect, { success: `${meta.label} disconnected` })
  if (!conn) return null
  const on = conn.status === 'connected'
  return (
    <div className={`conn-card${on ? ' on' : ''}`}>
      <span className="icon-tile icon-tile-sm"><i className={meta.icon} /></span>
      <div className="min-w-0 flex-1">
        <div className="fw-semibold fs-sm d-flex align-items-center gap-2">{meta.label}<span className={`conn-dot${on ? ' on' : ''}`} />{on ? 'Connected' : 'Not connected'}</div>
        {on ? (
          <div className="text-muted fs-xs text-truncate">{conn.account} · by {conn.connectedBy} {conn.connectedAt && formatRelativeTime(conn.connectedAt)}</div>
        ) : (
          <div className="d-flex gap-2 mt-2">
            <input className="form-control form-control-sm" placeholder="Account or workspace name" value={account} onChange={(e) => setAccount(e.target.value)} aria-label={`${meta.label} account`} />
            <button type="button" className="btn btn-sm btn-primary text-nowrap" disabled={connect.isPending} onClick={() => connect.mutate(conn.id)}>{connect.isPending ? 'Connecting…' : 'Connect'}</button>
          </div>
        )}
        {!on && <div className="text-warning-emphasis fs-xs mt-1"><i className="ri-alert-line me-1" />Runs fail at this step until {meta.label} is connected.</div>}
      </div>
      {on && <button type="button" className="btn btn-sm btn-link text-muted p-0" disabled={disconnect.isPending} onClick={() => disconnect.mutate(conn.id)}>Disconnect</button>}
    </div>
  )
}

/** Inspector sections specific to If / else, Go to step and integration steps. */
export function StepExtras(props: ExtrasProps) {
  const { step } = props
  const app = STEP_TYPES[step.type].app
  if (step.type === 'if_else') return <IfElseEditor step={step} options={props.options} onPatch={props.onPatch} />
  if (step.type === 'jump') return <JumpEditor {...props} />
  if (app) return <div className="mb-4"><ConnectionCard app={app} /></div>
  return null
}
