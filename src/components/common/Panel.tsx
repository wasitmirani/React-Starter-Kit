import { useState, type ReactNode } from 'react'
import { ChartTable, type Series } from '@/components/charts'

interface PanelProps {
  title?: ReactNode
  /** Remix icon class shown before the title. */
  icon?: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  /** Remove body padding (tables that go edge to edge). */
  flush?: boolean
  className?: string
  bodyClassName?: string
}

/** Card with an optional title row. The standard container for every section. */
export function Panel({ title, icon, description, actions, children, flush = false, className = '', bodyClassName = '' }: PanelProps) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 min-w-0">
            {icon && <span className="panel-icon"><i className={icon} /></span>}
            <div className="min-w-0">
              {title && <h6 className="card-title mb-0">{title}</h6>}
              {description && <p className="text-muted fs-sm mb-0 mt-1">{description}</p>}
            </div>
          </div>
          {actions && <div className="d-flex flex-wrap align-items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`${flush ? 'card-body p-0' : 'card-body'} ${bodyClassName}`}>{children}</div>
    </div>
  )
}

interface ChartPanelProps extends Omit<PanelProps, 'children'> {
  children: ReactNode
  /** Enables the "Table" toggle with the same data. */
  table?: { labels: string[]; series: Series[]; format: (v: number) => string }
}

/** Panel for a chart with a chart/table switch (the accessible view of the same data). */
export function ChartPanel({ table, actions, children, ...rest }: ChartPanelProps) {
  const [asTable, setAsTable] = useState(false)
  return (
    <Panel
      {...rest}
      actions={
        <>
          {actions}
          {table && (
            <div className="btn-group btn-group-sm" role="group" aria-label="View">
              <button type="button" className={`btn ${asTable ? 'btn-light' : 'btn-primary'}`} onClick={() => setAsTable(false)} aria-pressed={!asTable}>
                <i className="ri-line-chart-line" />
              </button>
              <button type="button" className={`btn ${asTable ? 'btn-primary' : 'btn-light'}`} onClick={() => setAsTable(true)} aria-pressed={asTable}>
                <i className="ri-table-line" />
              </button>
            </div>
          )}
        </>
      }
    >
      {asTable && table ? <ChartTable {...table} /> : children}
    </Panel>
  )
}
