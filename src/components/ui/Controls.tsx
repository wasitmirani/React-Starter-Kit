import type { ReactNode } from 'react'
import type { Tone } from '@/types/common.types'

interface SwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
}

/** Toggle with label and helper text. Self-contained styles (`.bc-switch` in app.css). */
export function Switch({ id, checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <label htmlFor={id} className={`bc-switch${disabled ? ' disabled' : ''}`}>
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="bc-switch-track" aria-hidden="true">
        <span className="bc-switch-thumb" />
      </span>
      {(label || description) && (
        <span className="bc-switch-text">
          {label && <span className="d-block fw-medium">{label}</span>}
          {description && <span className="d-block text-muted fs-sm">{description}</span>}
        </span>
      )}
    </label>
  )
}

/** Thin usage bar. `value` and `max` are raw numbers. */
export function Meter({ value, max, tone = 'primary', className = '' }: { value: number; max: number; tone?: Tone; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`meter ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span className={`bg-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

interface StepperProps {
  steps: string[]
  current: number
  /** Allows clicking back to completed steps. */
  onStep?: (index: number) => void
}

export function Stepper({ steps, current, onStep }: StepperProps) {
  return (
    <div className="stepper" role="list">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : ''
        return (
          <button
            key={label}
            type="button"
            role="listitem"
            className={`stepper-item ${state}`}
            disabled={!onStep || i > current}
            onClick={() => onStep?.(i)}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className="stepper-index">{i < current ? <i className="ri-check-line" /> : i + 1}</span>
            <span className="text-nowrap">{label}</span>
            {i < steps.length - 1 && <span className="stepper-line" />}
          </button>
        )
      })}
    </div>
  )
}

interface OptionCardProps {
  selected: boolean
  onSelect: () => void
  icon?: string
  tone?: Tone
  title: ReactNode
  description?: ReactNode
  disabled?: boolean
  badge?: ReactNode
  /** Smaller padding with the check pinned to the corner, for dense grids. */
  compact?: boolean
}

/** Big selectable card for choosing a channel, plan, form type… */
export function OptionCard({ selected, onSelect, icon, tone = 'primary', title, description, disabled, badge, compact = false }: OptionCardProps) {
  return (
    <button type="button" className={`option-card${selected ? ' selected' : ''}${compact ? ' compact' : ''}`} onClick={onSelect} disabled={disabled} aria-pressed={selected}>
      <div className="d-flex align-items-start gap-3">
        {icon && (
          <span className={`icon-tile bg-${tone}-subtle text-${tone}`}>
            <i className={icon} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="d-flex align-items-center gap-2 fw-medium">
            {title}
            {badge}
          </div>
          {description && <div className="text-muted fs-sm mt-1">{description}</div>}
        </div>
        {selected && <i className="ri-checkbox-circle-fill text-primary fs-5 option-card-check" />}
      </div>
    </button>
  )
}

/** Label/value rows for detail panels. */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="row mb-0 g-0">
      {items.map((item) => (
        <div key={item.label} className="col-12 d-flex justify-content-between gap-3 py-2 border-bottom border-dashed">
          <dt className="text-muted fw-normal">{item.label}</dt>
          <dd className="mb-0 text-end min-w-0 text-break">{item.value ?? <span className="text-muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}
