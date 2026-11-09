import { useEffect, useMemo, useRef, useState } from 'react'
import type { VariableOption } from '@/utils/helpers/workflow'

interface VariablePickerProps {
  options: VariableOption[]
  onPick: (ref: string) => void
  /** Show as a compact icon button (inside inputs). */
  compact?: boolean
}

/** "{x}" button with a searchable, grouped list of variables. */
export function VariablePicker({ options, onPick, compact = true }: VariablePickerProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const map = new Map<string, VariableOption[]>()
    for (const o of options) {
      if (term && !`${o.ref} ${o.label}`.toLowerCase().includes(term)) continue
      map.set(o.group, [...(map.get(o.group) ?? []), o])
    }
    return [...map.entries()]
  }, [options, q])

  return (
    <div className="var-picker" ref={ref}>
      <button type="button" className={compact ? 'var-picker-btn' : 'btn btn-sm btn-light'} onClick={() => setOpen((o) => !o)} title="Insert a variable" aria-label="Insert a variable" aria-expanded={open}>
        <i className="ri-braces-line" />
        {!compact && <span className="ms-1">Insert variable</span>}
      </button>
      {open && (
        <div className="var-picker-menu" role="listbox">
          <input className="form-control form-control-sm mb-2" autoFocus placeholder="Search variables…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search variables" />
          <div className="var-picker-list">
            {groups.length === 0 && <div className="text-muted fs-sm p-2">No variables match.</div>}
            {groups.map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="var-picker-group">{group}</div>
                {items.map((o) => (
                  <button
                    key={o.ref}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="var-picker-item"
                    onClick={() => {
                      onPick(o.ref)
                      setOpen(false)
                      setQ('')
                    }}
                  >
                    <span className="text-truncate">{o.label}</span>
                    <code className="text-truncate">{o.ref}</code>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface VariableInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: VariableOption[]
  placeholder?: string
  multiline?: boolean
  rows?: number
  invalid?: boolean
  monospace?: boolean
}

/** Text input or textarea with a variable picker that inserts `{{ref}}` at the cursor. */
export function VariableInput({ id, value, onChange, options, placeholder, multiline = false, rows = 4, invalid = false, monospace = false }: VariableInputProps) {
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const caret = useRef<number | null>(null)

  const insert = (ref: string) => {
    const token = `{{${ref}}}`
    const at = caret.current ?? value.length
    const next = value.slice(0, at) + token + value.slice(at)
    onChange(next)
    requestAnimationFrame(() => {
      const el = field.current
      if (!el) return
      el.focus()
      el.setSelectionRange(at + token.length, at + token.length)
    })
  }

  const common = {
    id,
    ref: field,
    value,
    placeholder,
    className: `form-control${invalid ? ' is-invalid' : ''}${monospace ? ' font-monospace fs-sm' : ''}`,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onSelect: (e: { currentTarget: { selectionStart: number | null } }) => {
      caret.current = e.currentTarget.selectionStart
    },
    onBlur: (e: { currentTarget: { selectionStart: number | null } }) => {
      caret.current = e.currentTarget.selectionStart
    },
  }

  return (
    <div className={`var-input${multiline ? ' multiline' : ''}`}>
      {multiline ? <textarea rows={rows} spellCheck={false} {...common} /> : <input type="text" {...common} />}
      <VariablePicker options={options} onPick={insert} />
    </div>
  )
}
