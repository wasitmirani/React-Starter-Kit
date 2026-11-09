import { useId } from 'react'

interface SparklineProps {
  values: number[]
  color?: string
  width?: number
  height?: number
  /** Soft gradient fill under the line. */
  area?: boolean
  /** Stretch to the container width (the SVG scales; strokes keep their width). */
  fluid?: boolean
}

/** Decorative trend line for stat cards; the number next to it carries the meaning. */
export function Sparkline({ values, color = 'var(--series-1)', width = 120, height = 36, area = false, fluid = false }: SparklineProps) {
  const gradient = useId()
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 2 - ((v - min) / span) * (height - 6)] as const)
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width={fluid ? '100%' : width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" preserveAspectRatio="none" className="sparkline">
      {area && (
        <>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${height} ${line} ${width},${height}`} fill={`url(#${gradient})`} />
        </>
      )}
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {area && <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} vectorEffect="non-scaling-stroke" />}
    </svg>
  )
}
