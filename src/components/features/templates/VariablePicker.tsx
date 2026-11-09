import { useEffect, useRef, useState } from 'react'
import { PLACEHOLDERS } from '@/constants/email-builder.constants'

interface VariablePickerProps {
  /** Called with the placeholder text to insert, e.g. `{{first_name}}`. */
  onInsert: (token: string) => void
  /** WhatsApp: offer the next numbered variable instead of named fields. */
  numbered?: number
  label?: string
}

/** Small "{ }" menu that inserts a personalisation placeholder. */
export function VariablePicker({ onInsert, numbered, label = 'Insert variable' }: VariablePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  if (numbered) {
    return (
      <button type="button" className="var-insert" onMouseDown={(e) => e.preventDefault()} onClick={() => onInsert(`{{${numbered}}}`)} title={`Insert {{${numbered}}}`}>
        <i className="ri-braces-line" /> Add variable {`{{${numbered}}}`}
      </button>
    )
  }
  return (
    <div className="position-relative d-inline-block" ref={ref}>
      <button type="button" className="var-insert" aria-expanded={open} aria-haspopup="menu" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen((o) => !o)}>
        <i className="ri-braces-line" /> {label}
      </button>
      {open && (
        <div className="var-menu" role="menu">
          {PLACEHOLDERS.map((p) => (
            <button key={p.key} type="button" role="menuitem" onMouseDown={(e) => e.preventDefault()} onClick={() => { onInsert(`{{${p.key}}}`); setOpen(false) }}>
              <span>{p.label}</span>
              <code>{`{{${p.key}}}`}</code>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
