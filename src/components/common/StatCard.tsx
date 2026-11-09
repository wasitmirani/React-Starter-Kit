import type { ReactNode } from 'react'
import { Sparkline } from '@/components/charts'
import type { Tone } from '@/types/common.types'

interface StatCardProps {
  label: string
  value: ReactNode
  icon: string
  tone?: Tone
  /** Change versus the previous period, as a fraction (0.12 = +12%). */
  delta?: number | null
  /** Treat a decrease as good (bounce rate, failures, response time). */
  lowerIsBetter?: boolean
  hint?: ReactNode
  trend?: number[]
  loading?: boolean
}

/** KPI widget: label and icon, big number, change pill, and an optional trend area. */
export function StatCard({ label, value, icon, tone = 'primary', delta, lowerIsBetter = false, hint, trend, loading }: StatCardProps) {
  const good = delta == null ? null : lowerIsBetter ? delta <= 0 : delta >= 0
  const color = `var(--dx-${tone === 'light' ? 'secondary' : tone})`
  return (
    <div className={`card stat-card tone-${tone} h-100 mb-0`}>
      <div className="card-body">
        <div className="stat-head">
          <span className={`stat-icon bg-${tone}-subtle text-${tone}`}><i className={icon} /></span>
          <span className="stat-label">{label}</span>
          {!loading && delta != null && (
            <span className={`stat-delta ${good ? 'up' : 'down'}`} title={`${delta >= 0 ? 'Up' : 'Down'} ${Math.abs(delta * 100).toFixed(1)}% vs the previous period`}>
              <i className={delta >= 0 ? 'ri-arrow-right-up-line' : 'ri-arrow-right-down-line'} />
              {Math.abs(delta * 100).toFixed(1)}%
            </span>
          )}
        </div>
        {loading ? (
          <div className="placeholder-glow mt-2">
            <span className="placeholder col-6 rounded" style={{ height: 30 }} />
            <span className="placeholder col-4 rounded d-block mt-2" style={{ height: 12 }} />
          </div>
        ) : (
          <>
            <div className="stat-value tabular-nums">{value}</div>
            {hint && <div className="stat-hint">{hint}</div>}
          </>
        )}
      </div>
      {trend && !loading && trend.length > 1 && (
        <div className="stat-trend">
          <Sparkline values={trend} color={color} width={240} height={44} area fluid />
        </div>
      )}
    </div>
  )
}
