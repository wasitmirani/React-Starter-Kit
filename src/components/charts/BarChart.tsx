import { useState } from 'react'
import { ChartLegend } from './ChartParts'
import { compact, niceTicks, useElementWidth, type Series } from './chart.utils'

interface BarChartProps {
  labels: string[]
  /** One series = simple bars; several = stacked bars (2px gap between segments). */
  series: Series[]
  height?: number
  format?: (value: number) => string
  ariaLabel: string
}

const PAD = { top: 12, right: 8, bottom: 26, left: 44 }
const GAP = 2

export function BarChart({ labels, series, height = 240, format = compact, ariaLabel }: BarChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0))
  const ticks = niceTicks(Math.max(1, ...totals))
  const top = ticks[ticks.length - 1]
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const slot = labels.length ? innerW / labels.length : 0
  const barW = Math.max(4, Math.min(36, slot * 0.6))
  const y = (v: number) => (v / top) * innerH
  const labelEvery = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(innerW / 56))))

  return (
    <div>
      <div ref={ref} className="chart-root" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel}>
            <g className="chart-grid">
              {ticks.map((t) => (
                <line key={t} x1={PAD.left} x2={width - PAD.right} y1={PAD.top + innerH - y(t)} y2={PAD.top + innerH - y(t)} />
              ))}
            </g>
            <g className="chart-axis">
              {ticks.map((t) => (
                <text key={t} x={PAD.left - 8} y={PAD.top + innerH - y(t) + 4} textAnchor="end">
                  {compact(t)}
                </text>
              ))}
              {labels.map((label, i) =>
                i % labelEvery === 0 ? (
                  <text key={label} x={PAD.left + slot * i + slot / 2} y={height - 6} textAnchor="middle">
                    {label}
                  </text>
                ) : null,
              )}
            </g>
            {labels.map((label, i) => {
              const cx = PAD.left + slot * i + slot / 2
              let base = PAD.top + innerH
              return (
                <g key={label} opacity={hover === null || hover === i ? 1 : 0.55}>
                  {series.map((s, si) => {
                    const h = y(s.values[i] ?? 0)
                    if (h <= 0) return null
                    const isTop = si === series.length - 1 || series.slice(si + 1).every((n) => !(n.values[i] > 0))
                    const segH = Math.max(1, h - (si > 0 ? GAP : 0))
                    const rect = (
                      <path
                        key={s.key}
                        d={roundedTop(cx - barW / 2, base - segH, barW, segH, isTop ? 4 : 0)}
                        fill={s.color}
                      />
                    )
                    base -= h
                    return rect
                  })}
                  <rect x={cx - slot / 2} y={PAD.top} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                </g>
              )
            })}
          </svg>
        )}
        {hover !== null && (
          <div className="chart-tooltip" style={{ left: PAD.left + slot * hover + slot / 2, top: PAD.top + innerH - y(totals[hover]) - 6 }}>
            <div className="fw-medium mb-1">{labels[hover]}</div>
            {series.map((s) => (
              <div key={s.key} className="d-flex align-items-center gap-2">
                <span className="legend-dot" style={{ background: s.color }} />
                <span className="text-muted">{s.label}</span>
                <span className="ms-auto fw-medium tabular-nums">{format(s.values[hover] ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChartLegend series={series} />
    </div>
  )
}

/** Bar with only its top corners rounded, anchored flat on the baseline. */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}
