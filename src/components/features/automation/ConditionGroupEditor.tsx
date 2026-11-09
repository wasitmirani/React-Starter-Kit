import { CONDITION_OPERATORS } from '@/constants/automation.constants'
import type { ConditionGroup, PathCondition } from '@/types/automation.types'
import { newCondition, type VariableOption } from '@/utils/helpers/workflow'
import { VariableInput, VariablePicker } from './VariableInput'

interface ConditionGroupEditorProps {
  id: string
  value: ConditionGroup
  onChange: (value: ConditionGroup) => void
  options: VariableOption[]
  /** Shown when there are no conditions. */
  emptyText: string
  addLabel?: string
}

/** All/any list of `{{variable}} operator value` conditions. */
export function ConditionGroupEditor({ id, value, onChange, options, emptyText, addLabel = 'Add condition' }: ConditionGroupEditorProps) {
  const update = (cid: string, patch: Partial<PathCondition>) => onChange({ ...value, conditions: value.conditions.map((c) => (c.id === cid ? { ...c, ...patch } : c)) })
  return (
    <div>
      {value.conditions.length === 0 ? (
        <p className="text-muted fs-sm mb-2">{emptyText}</p>
      ) : (
        value.conditions.length > 1 && (
          <div className="d-flex align-items-center gap-2 fs-sm mb-2">
            <span className="text-muted">Match</span>
            <select className="form-select form-select-sm w-auto" value={value.match} onChange={(e) => onChange({ ...value, match: e.target.value as 'all' | 'any' })} aria-label="Match">
              <option value="all">all conditions</option>
              <option value="any">any condition</option>
            </select>
          </div>
        )
      )}
      {value.conditions.map((c, i) => {
        const op = CONDITION_OPERATORS.find((o) => o.value === c.operator)
        return (
          <div key={c.id} className="condition-row">
            {i > 0 && <div className="condition-join">{value.match === 'all' ? 'and' : 'or'}</div>}
            <button type="button" className="condition-remove" onClick={() => onChange({ ...value, conditions: value.conditions.filter((x) => x.id !== c.id) })} aria-label="Remove condition" title="Remove condition"><i className="ri-close-line" /></button>
            <div className="var-input" style={{ marginRight: '1.75rem' }}>
              <input className="form-control form-control-sm font-monospace" value={c.variable} placeholder="contact.country" list={`${id}-vars`} onChange={(e) => update(c.id, { variable: e.target.value.replace(/[{}\s]/g, '') })} aria-label="Variable" />
              <VariablePicker options={options} onPick={(ref) => update(c.id, { variable: ref })} />
            </div>
            <div className="condition-grid mt-1">
              <select className="form-select form-select-sm" value={c.operator} onChange={(e) => update(c.id, { operator: e.target.value as PathCondition['operator'] })} aria-label="Operator">
                {CONDITION_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {op?.needsValue && <VariableInput id={`${id}-${c.id}`} value={c.value} onChange={(v) => update(c.id, { value: v })} options={options} placeholder="Value" />}
            </div>
          </div>
        )
      })}
      <datalist id={`${id}-vars`}>{options.map((o) => <option key={o.ref} value={o.ref}>{o.label}</option>)}</datalist>
      <button type="button" className="btn btn-link btn-sm p-0" onClick={() => onChange({ ...value, conditions: [...value.conditions, newCondition()] })}>
        <i className="ri-add-line" /> {addLabel}
      </button>
    </div>
  )
}
