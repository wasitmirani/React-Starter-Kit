import { useState, type MouseEvent } from 'react'
import { ChartLegend } from './ChartParts'
import { compact, niceTicks, useElementWidth, type Series } from './chart.utils'

interface LineChartProps {
  labels: string[]
  series: Series[]
  height?: number
  /** Fill under a single series. */
  area?: boolean
  format?: (value: number) => string
  ariaLabel: string
}

const PAD = { top: 12, right: 12, bottom: 26, left: 44 }

/** Multi-series line chart with a crosshair tooltip. One y-axis only. */
export function LineChart({ labels, series, height = 260, area = false, format = compact, ariaLabel }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const n = labels.length
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 72))))

  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')

  const onMove = (e: MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = e.clientX - rect.left
    setHover(Math.min(n - 1, Math.max(0, Math.round((rel / rect.width) * (n - 1)))))
  }

  return (
    <div>
      <div ref={ref} className="chart-root" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel}>
            <g className="chart-grid">
              {ticks.map((t) => (
                <line key={t} x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
              ))}
            </g>
            <g className="chart-axis">
              {ticks.map((t) => (
                <text key={t} x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
                  {compact(t)}
                </text>
              ))}
              {labels.map((label, i) =>
                i % labelEvery === 0 ? (
                  <text key={label} x={x(i)} y={height - 6} textAnchor="middle">
                    {label}
                  </text>
                ) : null,
              )}
            </g>
            {area && series.length === 1 && (
              <path
                d={`${path(series[0].values)}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`}
                fill={series[0].color}
                opacity={0.12}
              />
            )}
            {series.map((s) => (
              <path key={s.key} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--dx-secondary-color)" strokeDasharray="3 3" />
                {series.map((s) => (
                  <circle key={s.key} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={4.5} fill={s.color} stroke="var(--dx-secondary-bg)" strokeWidth={2} />
                ))}
              </g>
            )}
            <rect
              x={PAD.left}
              y={PAD.top}
              width={innerW}
              height={innerH}
              fill="transparent"
              onMouseMove={onMove}
              onMouseLeave={() => setHover(null)}
            />
          </svg>
        )}
        {hover !== null && (
          <div className="chart-tooltip" style={{ left: x(hover), top: PAD.top + 4 }}>
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
