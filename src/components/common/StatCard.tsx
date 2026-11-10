import type { ReactNode } from 'react'
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
  /** Kept for callers; the Material widget shows the number and change instead of a sparkline. */
  trend?: number[]
  loading?: boolean
}

const SOLID: Record<string, string> = { primary: 'primary', success: 'success', info: 'info', warning: 'warning', danger: 'danger', orange: 'warning', light: 'secondary', secondary: 'secondary', dark: 'dark', pink: 'danger' }

/**
 * KPI widget in the Alloce Material style (`hrm-widget-card`): a coloured icon
 * badge notched into the top-left corner, decorative squares top-right, the
 * number with a change pill, and a one-line hint.
 */
export function StatCard({ label, value, icon, tone = 'primary', delta, lowerIsBetter = false, hint, loading }: StatCardProps) {
  const color = SOLID[tone] ?? 'primary'
  const good = delta == null ? null : lowerIsBetter ? delta <= 0 : delta >= 0
  const pill = good ? 'success' : 'danger'
  return (
    <div className="card hrm-widget-card material-stat position-relative rounded-4 h-100 mb-0">
      <div className={`size-8 bg-${color} position-absolute top-0 square-1`} aria-hidden="true" />
      <div className={`size-8 bg-gradient-t-${color} bg-opacity-75 position-absolute square-2`} aria-hidden="true" />
      <div className="hrm-widget-curve" aria-hidden="true">
        <div className={`size-10 bg-${color} avatar text-white`}>
          <i className={`${icon} fs-lg`} />
        </div>
      </div>
      <div className="card-body">
        <h6 className="material-stat-label mb-7 ps-10 mt-n1">{label}</h6>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-5 rounded" style={{ height: 28 }} />
            <span className="placeholder col-7 rounded d-block mt-3" style={{ height: 12 }} />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-end gap-2 mb-3">
              <h3 className="mb-0 tabular-nums material-stat-value">{value}</h3>
              {delta != null && (
                <span
                  className={`badge bg-${pill}-subtle text-${pill} border border-${pill}-subtle`}
                  title={`${delta >= 0 ? 'Up' : 'Down'} ${Math.abs(delta * 100).toFixed(1)}% vs the previous period`}
                >
                  <i className={delta >= 0 ? 'ri-arrow-right-up-line me-1' : 'ri-arrow-right-down-line me-1'} />
                  {Math.abs(delta * 100).toFixed(1)}%
                </span>
              )}
            </div>
            {hint && <span className="text-muted material-stat-hint">{hint}</span>}
          </>
        )}
      </div>
    </div>
  )
}
