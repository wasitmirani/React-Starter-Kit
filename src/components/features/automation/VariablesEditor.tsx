import type { WorkflowVariable } from '@/types/automation.types'
import { isVariableKey } from '@/utils/helpers/workflow'

interface VariablesEditorProps {
  value: WorkflowVariable[]
  onChange: (value: WorkflowVariable[]) => void
}

/** Workflow-level variables: a key and a default value, used anywhere as `{{vars.key}}`. */
export function VariablesEditor({ value, onChange }: VariablesEditorProps) {
  const set = (id: string, patch: Partial<WorkflowVariable>) => onChange(value.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  const keys = value.map((v) => v.key)
  return (
    <div>
      {value.length === 0 && <p className="text-muted fs-sm">No variables yet. Add one for values you reuse, such as an API base URL or a discount code.</p>}
      {value.map((v) => {
        const invalid = !isVariableKey(v.key) || keys.indexOf(v.key) !== keys.lastIndexOf(v.key)
        return (
          <div key={v.id} className="path-card">
            <div className="d-flex gap-2 mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text font-monospace">vars.</span>
                <input className={`form-control font-monospace${v.key && invalid ? ' is-invalid' : ''}`} placeholder="api_base_url" value={v.key} onChange={(e) => set(v.id, { key: e.target.value.toLowerCase() })} aria-label="Variable key" />
              </div>
              <button type="button" className="btn btn-sm btn-light btn-icon text-danger flex-shrink-0" onClick={() => onChange(value.filter((x) => x.id !== v.id))} aria-label="Remove variable"><i className="ri-close-line" /></button>
            </div>
            <input className="form-control form-control-sm mb-2" placeholder="Default value" value={v.value} onChange={(e) => set(v.id, { value: e.target.value })} aria-label="Default value" />
            <input className="form-control form-control-sm" placeholder="Description (optional)" value={v.description} onChange={(e) => set(v.id, { description: e.target.value })} aria-label="Description" />
          </div>
        )
      })}
      <button type="button" className="btn btn-sm btn-light w-100" onClick={() => onChange([...value, { id: crypto.randomUUID(), key: '', value: '', description: '' }])}>
        <i className="ri-add-line me-1" />Add variable
      </button>
      <div className="form-text">Steps can overwrite a variable while a contact goes through the flow (HTTP responses, Set variable).</div>
    </div>
  )
}
