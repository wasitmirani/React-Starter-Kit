import type { Series } from './chart.utils'

export function ChartLegend({ series, values }: { series: Pick<Series, 'key' | 'label' | 'color'>[]; values?: Record<string, string> }) {
  if (series.length < 2) return null
  return (
    <div className="d-flex flex-wrap gap-4 fs-sm mt-3" role="list" aria-label="Legend">
      {series.map((s) => (
        <span key={s.key} className="d-inline-flex align-items-center gap-2" role="listitem">
          <span className="legend-dot" style={{ background: s.color }} />
          <span className="text-muted">{s.label}</span>
          {values?.[s.key] && <span className="fw-medium">{values[s.key]}</span>}
        </span>
      ))}
    </div>
  )
}

/** Accessible table alternative to a chart. */
export function ChartTable({ labels, series, format }: { labels: string[]; series: Series[]; format: (v: number) => string }) {
  return (
    <div className="table-responsive" style={{ maxHeight: 320 }}>
      <table className="table table-sm mb-0 fs-sm">
        <thead>
          <tr>
            <th scope="col">Date</th>
            {series.map((s) => (
              <th scope="col" key={s.key} className="text-end">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <td>{label}</td>
              {series.map((s) => (
                <td key={s.key} className="text-end tabular-nums">
                  {format(s.values[i] ?? 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
