import { useRef, type ReactNode } from 'react'
import { insertAtCaret } from '@/utils/helpers/template'
import { VariablePicker } from './VariablePicker'

interface TokenFieldProps {
  id: string
  label: ReactNode
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
  hint?: ReactNode
  /** Character limit shown as a counter (and enforced). */
  max?: number
  /** Soft limit: the counter turns amber past it. */
  soft?: number
  /** `false` hides the variable menu; a number offers `{{n}}` (WhatsApp). */
  variables?: boolean | number
  invalid?: boolean
  mono?: boolean
  className?: string
}

/** Text field with a variable menu that inserts at the caret, and a live character counter. */
export function TokenField({ id, label, value, onChange, multiline, rows = 4, placeholder, hint, max, soft, variables = true, invalid, mono, className = 'mb-3' }: TokenFieldProps) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const insert = (token: string) => {
    const { next, caret } = insertAtCaret(ref.current, value, token)
    onChange(max ? next.slice(0, max) : next)
    requestAnimationFrame(() => {
      ref.current?.focus()
      ref.current?.setSelectionRange(caret, caret)
    })
  }
  const over = soft !== undefined && value.length > soft
  const props = {
    id,
    ref,
    value,
    placeholder,
    maxLength: max,
    className: `form-control${invalid ? ' is-invalid' : ''}${mono ? ' font-monospace' : ''}`,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  }
  return (
    <div className={`token-field ${className}`}>
      <div className="d-flex align-items-end justify-content-between gap-2 mb-1">
        <label htmlFor={id} className="form-label mb-0">{label}</label>
        {variables !== false && <VariablePicker onInsert={insert} numbered={typeof variables === 'number' ? variables : undefined} />}
      </div>
      {multiline ? <textarea rows={rows} {...props} /> : <input {...props} />}
      <div className="d-flex justify-content-between gap-2">
        <span className="form-text mt-1">{hint}</span>
        {(max || soft) && <span className={`form-text mt-1 tabular-nums text-nowrap${over ? ' text-warning-emphasis fw-semibold' : ''}`}>{value.length}{max ? ` / ${max}` : ''}</span>}
      </div>
    </div>
  )
}
