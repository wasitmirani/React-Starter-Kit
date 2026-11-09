import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { Option } from '@/types/common.types'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Debounce before `onChange` fires. */
  delay?: number
  className?: string
}

/** Search box that keeps typing responsive and reports the debounced value. */
export function SearchInput({ value, onChange, placeholder = 'Search…', delay = 300, className = '' }: SearchInputProps) {
  const [text, setText] = useState(value)
  const debounced = useDebounce(text, delay)

  // Latest props without re-running the effect when the parent re-renders.
  const latest = useRef({ value, onChange })
  latest.current = { value, onChange }

  useEffect(() => {
    setText(value)
  }, [value])
  useEffect(() => {
    if (debounced !== latest.current.value) latest.current.onChange(debounced)
  }, [debounced])

  return (
    <div className={`position-relative search-input ${className}`}>
      <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
      <input
        type="search"
        className="form-control ps-9"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  )
}

interface FilterSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: Option[]
  /** Label of the "no filter" option, e.g. "All statuses". */
  allLabel: string
  ariaLabel?: string
}

export function FilterSelect({ value, onChange, options, allLabel, ariaLabel }: FilterSelectProps) {
  return (
    <select className="form-select" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} aria-label={ariaLabel ?? allLabel}>
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

interface FilterBarProps {
  children: ReactNode
  /** Shown when at least one filter is active. */
  onClear?: () => void
  activeCount?: number
  end?: ReactNode
}

/** One row of filters above a list. */
export function FilterBar({ children, onClear, activeCount = 0, end }: FilterBarProps) {
  return (
    <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
      <div className="filter-bar flex-1">
        {children}
        {onClear && activeCount > 0 && (
          <button type="button" className="btn btn-link btn-sm text-muted" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
      {end && <div className="d-flex align-items-center gap-2">{end}</div>}
    </div>
  )
}
