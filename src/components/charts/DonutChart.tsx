import { useState } from 'react'
import { compact } from './chart.utils'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  slices: DonutSlice[]
  size?: number
  centerLabel: string
  format?: (value: number) => string
  ariaLabel: string
}

/** Share-of-total donut with a value legend (identity is never colour alone). */
export function DonutChart({ slices, size = 180, centerLabel, format = compact, ariaLabel }: DonutChartProps) {
  const [hover, setHover] = useState<string | null>(null)
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = size / 2 - 10
  const circumference = 2 * Math.PI * r
  const gap = slices.filter((s) => s.value > 0).length > 1 ? 3 : 0
  let offset = 0
  const active = slices.find((s) => s.key === hover)

  return (
    <div className="d-flex flex-wrap align-items-center gap-5">
      <div className="position-relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dx-tertiary-bg)" strokeWidth={16} />
          {total > 0 &&
            slices.map((s) => {
              const len = (s.value / total) * circumference
              const dash = Math.max(0, len - gap)
              const el = (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.key ? 20 : 16}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                  style={{ transition: 'stroke-width .15s' }}
                />
              )
              offset += len
              return el
            })}
        </svg>
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <div className="fs-5 fw-semibold tabular-nums">{format(active ? active.value : total)}</div>
          <div className="text-muted fs-xs">{active ? active.label : centerLabel}</div>
        </div>
      </div>
      <ul className="list-unstyled mb-0 flex-1 fs-sm" style={{ minWidth: 160 }}>
        {slices.map((s) => (
          <li
            key={s.key}
            className={`d-flex align-items-center gap-2 py-1${hover && hover !== s.key ? ' opacity-50' : ''}`}
            onMouseEnter={() => setHover(s.key)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
            <span className="ms-auto fw-medium tabular-nums">{format(s.value)}</span>
            <span className="text-muted tabular-nums" style={{ width: 44, textAlign: 'right' }}>
              {total ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
