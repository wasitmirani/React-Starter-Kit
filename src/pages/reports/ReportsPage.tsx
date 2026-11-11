import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { REPORT_CATALOG, reportsApi } from '@/api/endpoints/platform.api'
import { errorMessage } from '@/api/errors'
import { BarChart, LineChart, compact, seriesColor } from '@/components/charts'
import { FormAlert } from '@/components/common/FormAlert'
import { QueryError } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ROUTES } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast } from '@/hooks/useToast'
import type { Report, ReportFormat } from '@/types/platform.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatPercent } from '@/utils/formatters/number.formatter'
import { downloadCsv } from '@/utils/helpers/csv'

const fmt = (v: number, f: ReportFormat) => (f === 'currency' ? formatMoney(v, 'PKR') : f === 'percent' ? formatPercent(v) : v.toLocaleString())
const fmtCompact = (v: number, f: ReportFormat) => (f === 'currency' ? `PKR ${compact(v)}` : f === 'percent' ? formatPercent(v) : compact(v))

const GROUP_ICONS: Record<string, string> = { Commerce: 'ri-shopping-bag-3-line', Inventory: 'ri-stack-line', Warehouse: 'ri-building-4-line', Shipping: 'ri-truck-line', Procurement: 'ri-file-list-3-line', '3PL': 'ri-group-line', Finance: 'ri-money-dollar-circle-line' }
const GROUP_TONES: Record<string, string> = { Commerce: 'primary', Inventory: 'success', Warehouse: 'info', Shipping: 'warning', Procurement: 'orange', '3PL': 'pink', Finance: 'success' }

interface Schedule { id: string; report: string; title: string; frequency: 'daily' | 'weekly' | 'monthly'; time: string; recipients: string; format: 'csv' | 'xlsx'; days: number }

export function ReportsPage() {
  const [params, setParams] = useSearchParams()
  const key = params.get('report') ?? REPORT_CATALOG[0].key
  const days = Number(params.get('days')) || 30
  const report = useTenantQuery('reports', [key, days], () => reportsApi.get(key, days))
  const r = report.data
  const [search, setSearch] = useState('')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' } | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const { currentMembership } = useAuth()
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>(`report-schedules.${currentMembership?.tenant.id ?? 'anon'}`, [])
  const groups = [...new Set(REPORT_CATALOG.map((c) => c.group))]
  const set = (patch: Record<string, string>) => setParams({ report: key, days: String(days), ...patch }, { replace: true })
  const meta = REPORT_CATALOG.find((c) => c.key === key) ?? REPORT_CATALOG[0]
  const mySchedules = schedules.filter((s) => s.report === key)

  const rows = useMemo(() => {
    if (!r) return []
    if (!sort) return r.rows
    return [...r.rows].sort((a, b) => {
      const av = sort.col === '__label' ? a.label : a.values[sort.col] ?? 0
      const bv = sort.col === '__label' ? b.label : b.values[sort.col] ?? 0
      const d = typeof av === 'string' ? av.localeCompare(String(bv)) : av - (bv as number)
      return sort.dir === 'asc' ? d : -d
    })
  }, [r, sort])
  const toggleSort = (col: string) => setSort(sort?.col === col ? (sort.dir === 'desc' ? { col, dir: 'asc' } : null) : { col, dir: 'desc' })
  const exportCsv = (x: Report) => downloadCsv(`${x.key}-${days}d.csv`, [{ label: 'label', value: (row) => row.label }, ...x.columns.map((c) => ({ label: c.label, value: (row: (typeof x.rows)[number]) => row.values[c.key] }))], x.rows)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Each report shows its definition, period and currency. Sort any column, switch chart types, export to CSV or schedule delivery by email."
        actions={
          <>
            <Link to={ROUTES.DASH_GLOBAL_SALES} className="btn btn-light btn-sm"><i className="ri-global-line me-1" />Global sales</Link>
            <Segmented ariaLabel="Period" value={days} onChange={(v) => set({ days: String(v) })} options={[7, 30, 90, 365].map((v) => ({ value: v, label: v === 365 ? '1y' : `${v}d` }))} />
          </>
        }
      />
      <div className="row g-4">
        <div className="col-xl-3">
          <div className="card mb-0 report-catalog">
            <div className="card-body pb-2">
              <div className="position-relative">
                <i className="ri-search-line position-absolute top-50 translate-middle-y text-muted" style={{ insetInlineStart: 12 }} />
                <input className="form-control ps-5" placeholder="Find a report…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Find a report" />
              </div>
            </div>
            {groups.map((g) => {
              const items = REPORT_CATALOG.filter((c) => c.group === g && c.title.toLowerCase().includes(search.toLowerCase()))
              if (!items.length) return null
              return (
                <div key={g} className="pb-2">
                  <div className="report-group"><span className={`report-group-icon bg-${GROUP_TONES[g]}-subtle text-${GROUP_TONES[g]}`}><i className={GROUP_ICONS[g]} /></span>{g}</div>
                  {items.map((c) => (
                    <button key={c.key} type="button" className={`report-link ${c.key === key ? 'active' : ''}`} onClick={() => { setSort(null); set({ report: c.key }) }}>
                      <span className="text-truncate">{c.title}</span>
                      {schedules.some((s) => s.report === c.key) && <i className="ri-mail-send-line" title="Scheduled" />}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
        <div className="col-xl-9 d-flex flex-column gap-4">
          {report.isError && <QueryError message={errorMessage(report.error)} onRetry={() => report.refetch()} />}
          {!r ? <div className="card card-body"><SkeletonLines lines={10} /></div> : (
            <>
              <div className="report-hero fade-up">
                <span className={`report-hero-icon bg-${GROUP_TONES[meta.group]}-subtle text-${GROUP_TONES[meta.group]}`}><i className={GROUP_ICONS[meta.group]} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-muted fs-xs text-uppercase fw-semibold">{meta.group} · last {days === 365 ? '12 months' : `${days} days`}</div>
                  <h5 className="mb-1">{r.title}</h5>
                  <p className="text-muted mb-0 fs-sm">{r.definition}</p>
                </div>
                <div className="d-flex flex-wrap gap-2 align-self-start">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setScheduling(true)}><i className="ri-calendar-schedule-line me-1" />Schedule</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => exportCsv(r)}><i className="ri-download-2-line me-1" />Export CSV</button>
                </div>
              </div>

              {mySchedules.length > 0 && (
                <div className="filter-chips m-0">
                  <span className="text-muted fs-xs me-1"><i className="ri-mail-send-line" /> Scheduled:</span>
                  {mySchedules.map((s) => <span key={s.id} className="filter-chip">{s.frequency} at {s.time} → {s.recipients.split(',').length} recipient{s.recipients.split(',').length > 1 ? 's' : ''} ({s.format.toUpperCase()})<button type="button" aria-label="Remove schedule" onClick={() => setSchedules(schedules.filter((x) => x.id !== s.id))}><i className="ri-close-line" /></button></span>)}
                </div>
              )}

              <div className="row g-3 fade-up d1">
                {r.columns.slice(0, 4).map((c, i) => {
                  const values = r.rows.map((row) => row.values[c.key] ?? 0)
                  const total = c.format === 'percent' ? values.reduce((a, b) => a + b, 0) / Math.max(1, values.length) : values.reduce((a, b) => a + b, 0)
                  const top = r.rows.reduce<(typeof r.rows)[number] | null>((best, row) => (!best || (row.values[c.key] ?? 0) > (best.values[c.key] ?? 0) ? row : best), null)
                  return (
                    <div key={c.key} className="col-sm-6 col-xxl-3">
                      <div className="report-kpi" style={{ ['--kpi' as string]: seriesColor(i + 1) }}>
                        <div className="text-muted fs-xs">{c.format === 'percent' ? 'Average ' : 'Total '}{c.label.toLowerCase()}</div>
                        <div className="report-kpi-value tabular-nums">{fmtCompact(total, c.format)}</div>
                        {top && <div className="text-muted fs-xs text-truncate">Top: {top.label}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {r.chart && (
                <Panel title="Trend" icon="ri-bar-chart-box-line" className="fade-up d2" actions={<Segmented size="sm" ariaLabel="Chart type" value={chartType} onChange={setChartType} options={[{ value: 'bar', label: 'Bar' }, { value: 'line', label: 'Line' }]} />}>
                  {chartType === 'bar'
                    ? <BarChart labels={r.chart.labels} series={r.chart.series.map((s, i) => ({ ...s, color: seriesColor(i + 1) }))} format={compact} ariaLabel={r.title} />
                    : <LineChart area labels={r.chart.labels} series={r.chart.series.map((s, i) => ({ ...s, color: seriesColor(i + 1) }))} format={compact} ariaLabel={r.title} />}
                </Panel>
              )}

              <Panel flush title={`${r.rows.length} rows`} icon="ri-table-line" className="fade-up d3">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 report-table">
                    <thead>
                      <tr>
                        <th><button type="button" className="th-sort" onClick={() => toggleSort('__label')}>Name {sort?.col === '__label' && <i className={sort.dir === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />}</button></th>
                        {r.columns.map((c) => <th key={c.key} className="text-end"><button type="button" className="th-sort ms-auto" onClick={() => toggleSort(c.key)}>{c.label} {sort?.col === c.key && <i className={sort.dir === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />}</button></th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const first = r.columns[0]
                        const max = Math.max(1, ...r.rows.map((x) => x.values[first?.key] ?? 0))
                        return (
                          <tr key={row.label}>
                            <td className="fw-medium">{row.label}</td>
                            {r.columns.map((c, ci) => (
                              <td key={c.key} className="text-end tabular-nums">
                                {ci === 0 && c.format !== 'percent' ? (
                                  <div className="cell-bar"><span style={{ width: `${((row.values[c.key] ?? 0) / max) * 100}%` }} /><b>{fmt(row.values[c.key] ?? 0, c.format)}</b></div>
                                ) : fmt(row.values[c.key] ?? 0, c.format)}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                      {!r.rows.length && <tr><td colSpan={r.columns.length + 1} className="text-center text-muted py-5"><i className="ri-inbox-line fs-3 d-block mb-1" />No data for this period.</td></tr>}
                    </tbody>
                    {r.rows.length > 1 && (
                      <tfoot>
                        <tr className="report-total">
                          <td>Total</td>
                          {r.columns.map((c) => {
                            const values = r.rows.map((row) => row.values[c.key] ?? 0)
                            const v = c.format === 'percent' ? values.reduce((a, b) => a + b, 0) / values.length : values.reduce((a, b) => a + b, 0)
                            return <td key={c.key} className="text-end tabular-nums">{fmt(v, c.format)}{c.format === 'percent' && <span className="text-muted fs-xs"> avg</span>}</td>
                          })}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
      <ScheduleModal open={scheduling} onClose={() => setScheduling(false)} title={meta.title} onSave={(s) => { setSchedules([...schedules, { ...s, id: crypto.randomUUID(), report: key, title: meta.title, days }]); setScheduling(false) }} />
    </>
  )
}

function ScheduleModal({ open, onClose, title, onSave }: { open: boolean; onClose: () => void; title: string; onSave: (s: Pick<Schedule, 'frequency' | 'time' | 'recipients' | 'format'>) => void }) {
  const toast = useToast()
  const [frequency, setFrequency] = useState<Schedule['frequency']>('weekly')
  const [time, setTime] = useState('08:00')
  const [recipients, setRecipients] = useState('')
  const [format, setFormat] = useState<Schedule['format']>('csv')
  const [error, setError] = useState<string | null>(null)
  const submit = () => {
    const list = recipients.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
    if (!list.length) return setError('Add at least one email address.')
    const bad = list.find((x) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))
    if (bad) return setError(`"${bad}" is not a valid email address.`)
    setError(null)
    onSave({ frequency, time, recipients: list.join(','), format })
    toast.success(`${title} scheduled ${frequency}`)
    setRecipients('')
  }
  return (
    <Modal open={open} onClose={onClose} title="Schedule report delivery" footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}><i className="ri-calendar-check-line me-1" />Save schedule</button></>}>
      <p className="text-muted fs-sm">Email <strong>{title}</strong> automatically with the current period and filters.</p>
      <FormAlert message={error} onClose={() => setError(null)} />
      <label className="form-label">Frequency</label>
      <div className="row g-2 mb-3">
        {(['daily', 'weekly', 'monthly'] as const).map((f) => <div key={f} className="col-4"><button type="button" className={`choice-card w-100 text-center text-capitalize ${frequency === f ? 'selected' : ''}`} onClick={() => setFrequency(f)}>{f}</button></div>)}
      </div>
      <div className="row g-3 mb-3">
        <div className="col-6"><label className="form-label" htmlFor="sch-time">Send at</label><input id="sch-time" type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div className="col-6"><label className="form-label" htmlFor="sch-format">Format</label><select id="sch-format" className="form-select" value={format} onChange={(e) => setFormat(e.target.value as Schedule['format'])}><option value="csv">CSV</option><option value="xlsx">Excel (XLSX)</option></select></div>
      </div>
      <label className="form-label" htmlFor="sch-to">Recipients</label>
      <textarea id="sch-to" rows={2} className="form-control" placeholder="finance@brand.com, ops@brand.com" value={recipients} onChange={(e) => setRecipients(e.target.value)} />
      <div className="form-text">Separate addresses with commas. Saved for this workspace in this browser until email delivery is connected to the reports API.</div>
    </Modal>
  )
}
