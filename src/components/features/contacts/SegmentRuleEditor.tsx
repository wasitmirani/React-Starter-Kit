import { SEGMENT_FIELDS, SEGMENT_OPERATORS } from '@/constants/crm.constants'
import type { Option } from '@/types/common.types'
import type { SegmentRule, SegmentRuleGroup } from '@/types/crm.types'

interface SegmentRuleEditorProps {
  value: SegmentRuleGroup
  onChange: (value: SegmentRuleGroup) => void
  /** Custom attributes appended to the field list. */
  extraFields?: Option[]
}

const newRule = (): SegmentRule => ({ id: crypto.randomUUID(), field: 'country', operator: 'equals', value: '' })

/** “Match all/any of these conditions” editor producing a JSON rule group. */
export function SegmentRuleEditor({ value, onChange, extraFields = [] }: SegmentRuleEditorProps) {
  const fields = [...SEGMENT_FIELDS, ...extraFields]
  const update = (id: string, patch: Partial<SegmentRule>) =>
    onChange({ ...value, rules: value.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <span>Contacts that match</span>
        <select className="form-select form-select-sm w-auto" value={value.match} onChange={(e) => onChange({ ...value, match: e.target.value as 'all' | 'any' })} aria-label="Match">
          <option value="all">all</option>
          <option value="any">any</option>
        </select>
        <span>of these conditions:</span>
      </div>

      {value.rules.length === 0 && <p className="text-muted">No conditions: every contact matches.</p>}

      <div className="d-flex flex-column gap-2">
        {value.rules.map((rule, i) => {
          const op = SEGMENT_OPERATORS.find((o) => o.value === rule.operator)
          return (
            <div key={rule.id} className="d-flex flex-wrap align-items-center gap-2 p-3 border rounded-3 bg-light-subtle">
              <span className="text-muted fs-sm" style={{ width: 40 }}>{i === 0 ? 'Where' : value.match === 'all' ? 'and' : 'or'}</span>
              <select className="form-select form-select-sm" style={{ maxWidth: 200 }} value={rule.field} onChange={(e) => update(rule.id, { field: e.target.value })} aria-label="Field">
                {fields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <select className="form-select form-select-sm" style={{ maxWidth: 230 }} value={rule.operator} onChange={(e) => update(rule.id, { operator: e.target.value as SegmentRule['operator'] })} aria-label="Operator">
                {SEGMENT_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {op?.needsValue && (
                <input className="form-control form-control-sm flex-1" style={{ minWidth: 160 }} value={rule.value} placeholder="Value" onChange={(e) => update(rule.id, { value: e.target.value })} aria-label="Value" />
              )}
              <button type="button" className="btn btn-sm btn-light text-danger ms-auto" aria-label="Remove condition" onClick={() => onChange({ ...value, rules: value.rules.filter((r) => r.id !== rule.id) })}>
                <i className="ri-close-line" />
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn btn-sm btn-light mt-3" onClick={() => onChange({ ...value, rules: [...value.rules, newRule()] })}>
        <i className="ri-add-line me-1" /> Add condition
      </button>
    </div>
  )
}
