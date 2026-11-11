import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useToast } from '@/hooks/useToast'

export function CopyButton({ value, label = 'Copy', className = 'btn btn-sm btn-light' }: { value: string; label?: string; className?: string }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.error('Copy failed. Select the text and copy it manually.')
        }
      }}
    >
      <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} /> {copied ? 'Copied' : label}
    </button>
  )
}

interface TagInputProps {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

/** Type and press Enter or comma to add; Backspace removes the last tag. */
export function TagInput({ id, value, onChange, placeholder = 'Add tag…', suggestions = [] }: TagInputProps) {
  const [text, setText] = useState('')
  const add = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setText('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(text)
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }
  return (
    <div className="form-control d-flex flex-wrap align-items-center gap-1 py-1" style={{ minHeight: 38 }}>
      {value.map((tag) => (
        <span key={tag} className="badge bg-primary-subtle text-primary d-inline-flex align-items-center gap-1">
          {tag}
          <button type="button" className="btn-close" style={{ fontSize: 8 }} aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} />
        </span>
      ))}
      <input
        id={id}
        list={`${id}-suggestions`}
        className="border-0 flex-1 bg-transparent"
        style={{ outline: 'none', minWidth: 80 }}
        value={text}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => text && add(text)}
      />
      {suggestions.length > 0 && (
        <datalist id={`${id}-suggestions`}>
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  )
}

export interface TimelineEntry {
  id: string
  icon: string
  tone: string
  title: ReactNode
  description?: ReactNode
  at: ReactNode
}

export function Timeline({ items }: { items: TimelineEntry[] }) {
  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.id} className="timeline-item">
          <span className={`timeline-icon icon-tile icon-tile-sm bg-${item.tone}-subtle text-${item.tone}`}>
            <i className={item.icon} />
          </span>
          <div className="d-flex justify-content-between gap-3">
            <div className="min-w-0">
              <div>{item.title}</div>
              {item.description && <div className="text-muted fs-sm">{item.description}</div>}
            </div>
            <span className="text-muted fs-sm text-nowrap">{item.at}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Inline error box with retry, for failed queries. */
export function QueryError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3 mb-0">
      <span>
        <i className="ri-error-warning-line me-1" />
        {message}
      </span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
