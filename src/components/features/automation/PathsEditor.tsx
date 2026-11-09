import { CONDITION_OPERATORS } from '@/constants/automation.constants'
import type { WorkflowPath, WorkflowStep } from '@/types/automation.types'
import { newCondition, newPath, type VariableOption } from '@/utils/helpers/workflow'
import { VariableInput, VariablePicker } from './VariableInput'

interface PathsEditorProps {
  step: WorkflowStep
  options: VariableOption[]
  onChange: (paths: WorkflowPath[]) => void
}

const pathHasSteps = (p: WorkflowPath) => p.steps.length > 0

/** Edits the paths of a Branch (conditions) or A/B split (percentages) step. */
export function PathsEditor({ step, options, onChange }: PathsEditorProps) {
  const paths = step.paths ?? []
  const isSplit = step.type === 'ab_split'
  const named = paths.filter((p) => !p.isElse)
  const elsePath = paths.find((p) => p.isElse)
  const set = (id: string, patch: Partial<WorkflowPath>) => onChange(paths.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const removePath = (id: string) => {
    const p = paths.find((x) => x.id === id)
    if (p && pathHasSteps(p) && !window.confirm(`Delete “${p.label}” and the ${p.steps.length} step(s) on it?`)) return
    onChange(paths.filter((x) => x.id !== id))
  }
  const movePath = (id: string, dir: -1 | 1) => {
    const list = [...named]
    const i = list.findIndex((p) => p.id === id)
    const j = i + dir
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    onChange([...list, ...(elsePath ? [elsePath] : [])])
  }
  const addPath = () => {
    if (isSplit) {
      onChange([...paths, newPath(String.fromCharCode(65 + paths.length), { weight: 0 })])
    } else {
      onChange([...named, newPath(`Path ${named.length + 1}`, { conditions: [newCondition()] }), ...(elsePath ? [elsePath] : [])])
    }
  }
  const evenSplit = () => {
    const base = Math.floor(100 / paths.length)
    onChange(paths.map((p, i) => ({ ...p, weight: i === 0 ? 100 - base * (paths.length - 1) : base })))
  }
  const total = paths.reduce((n, p) => n + (p.weight ?? 0), 0)

  if (isSplit) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="form-label mb-0">Paths</span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={evenSplit}>Split evenly</button>
        </div>
        {paths.map((p) => (
          <div key={p.id} className="path-card d-flex align-items-center gap-2">
            <input className="form-control form-control-sm" value={p.label} onChange={(e) => set(p.id, { label: e.target.value })} aria-label="Path name" />
            <div className="input-group input-group-sm" style={{ width: 96 }}>
              <input type="number" min={0} max={100} className="form-control" value={p.weight ?? 0} onChange={(e) => set(p.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} aria-label={`${p.label} percentage`} />
              <span className="input-group-text">%</span>
            </div>
            <button type="button" className="btn btn-sm btn-light btn-icon text-danger" disabled={paths.length <= 2} onClick={() => removePath(p.id)} aria-label={`Remove ${p.label}`}><i className="ri-close-line" /></button>
          </div>
        ))}
        <div className={`fs-sm mb-3 ${total === 100 ? 'text-muted' : 'text-danger'}`}>Total {total}%{total !== 100 && ' — must be 100%'}</div>
        <button type="button" className="btn btn-sm btn-light w-100" disabled={paths.length >= 6} onClick={addPath}><i className="ri-add-line me-1" />Add path</button>
      </div>
    )
  }

  return (
    <div>
      <span className="form-label d-block mb-2">Paths, checked from top to bottom</span>
      {named.map((p, pi) => (
        <div key={p.id} className="path-card">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="path-index">{pi + 1}</span>
            <input className="form-control form-control-sm fw-medium" value={p.label} onChange={(e) => set(p.id, { label: e.target.value })} aria-label="Path name" />
            <button type="button" className="btn btn-sm btn-light btn-icon" disabled={pi === 0} onClick={() => movePath(p.id, -1)} aria-label="Move path up"><i className="ri-arrow-up-line" /></button>
            <button type="button" className="btn btn-sm btn-light btn-icon" disabled={pi === named.length - 1} onClick={() => movePath(p.id, 1)} aria-label="Move path down"><i className="ri-arrow-down-line" /></button>
            <button type="button" className="btn btn-sm btn-light btn-icon text-danger" disabled={named.length <= 1} onClick={() => removePath(p.id)} aria-label="Delete path"><i className="ri-delete-bin-6-line" /></button>
          </div>
          {p.conditions.length > 1 && (
            <div className="d-flex align-items-center gap-2 fs-sm mb-2">
              <span className="text-muted">Match</span>
              <select className="form-select form-select-sm w-auto" value={p.match} onChange={(e) => set(p.id, { match: e.target.value as 'all' | 'any' })} aria-label="Match">
                <option value="all">all conditions</option>
                <option value="any">any condition</option>
              </select>
            </div>
          )}
          {p.conditions.map((c, ci) => {
            const op = CONDITION_OPERATORS.find((o) => o.value === c.operator)
            const update = (patch: Partial<typeof c>) => set(p.id, { conditions: p.conditions.map((x) => (x.id === c.id ? { ...x, ...patch } : x)) })
            return (
              <div key={c.id} className="condition-row">
                {ci > 0 && <div className="condition-join">{p.match === 'all' ? 'and' : 'or'}</div>}
                {p.conditions.length > 1 && (
                  <button type="button" className="condition-remove" onClick={() => set(p.id, { conditions: p.conditions.filter((x) => x.id !== c.id) })} aria-label="Remove condition" title="Remove condition"><i className="ri-close-line" /></button>
                )}
                <div className="var-input">
                  <input className="form-control form-control-sm font-monospace" value={c.variable} placeholder="contact.country" onChange={(e) => update({ variable: e.target.value.replace(/[{}\s]/g, '') })} aria-label="Variable" list={`vars-${step.id}`} />
                  <VariablePicker options={options} onPick={(ref) => update({ variable: ref })} />
                </div>
                <div className="condition-grid mt-1">
                  <select className="form-select form-select-sm" value={c.operator} onChange={(e) => update({ operator: e.target.value as typeof c.operator })} aria-label="Operator">
                    {CONDITION_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {op?.needsValue && <VariableInput id={`cv-${c.id}`} value={c.value} onChange={(value) => update({ value })} options={options} placeholder="Value" />}
                </div>
              </div>
            )
          })}
          <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={() => set(p.id, { conditions: [...p.conditions, newCondition()] })}><i className="ri-add-line" /> Condition</button>
        </div>
      ))}
      <datalist id={`vars-${step.id}`}>{options.map((o) => <option key={o.ref} value={o.ref}>{o.label}</option>)}</datalist>
      {elsePath && (
        <div className="path-card path-else">
          <div className="d-flex align-items-center gap-2">
            <span className="path-index">—</span>
            <input className="form-control form-control-sm" value={elsePath.label} onChange={(e) => set(elsePath.id, { label: e.target.value })} aria-label="Else path name" />
          </div>
          <div className="text-muted fs-xs mt-1">Everyone who matches no path above.</div>
        </div>
      )}
      <button type="button" className="btn btn-sm btn-light w-100 mt-1" disabled={named.length >= 8} onClick={addPath}><i className="ri-add-line me-1" />Add path</button>
    </div>
  )
}
