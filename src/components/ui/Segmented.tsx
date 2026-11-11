import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string | number> {
  value: T
  label: ReactNode
  icon?: string
  /** Accessible name when the label is icon-only. */
  title?: string
}

interface SegmentedProps<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  ariaLabel: string
  size?: 'sm' | 'md'
  /** Stretch to the container width with equal segments. */
  block?: boolean
}

/** Small pill switch for a handful of mutually exclusive views (range, metric, layout). */
export function Segmented<T extends string | number>({ value, onChange, options, ariaLabel, size = 'sm', block = false }: SegmentedProps<T>) {
  return (
    <div className={`segmented${size === 'sm' ? ' segmented-sm' : ''}${block ? ' segmented-block' : ''}`} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" className={value === o.value ? 'active' : ''} aria-pressed={value === o.value} title={o.title} aria-label={o.label ? undefined : o.title} onClick={() => onChange(o.value)}>
          {o.icon && <i className={o.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
