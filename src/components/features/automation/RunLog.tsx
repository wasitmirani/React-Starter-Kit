import { useState } from 'react'
import { STEP_TYPES } from '@/constants/automation.constants'
import type { RunLogEntry, RunLogStatus } from '@/types/automation.types'

const STATUS_ICON: Record<RunLogStatus, [string, string]> = {
  success: ['ri-check-line', 'success'],
  failed: ['ri-close-line', 'danger'],
  skipped: ['ri-skip-forward-line', 'secondary'],
  waiting: ['ri-time-line', 'info'],
  info: ['ri-information-line', 'primary'],
}

const time = (iso: string) => new Date(iso).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })

function Detail({ entry }: { entry: RunLogEntry }) {
  const d = entry.detail
  if (!d) return null
  return (
    <div className="run-log-detail">
      {d.evaluated && d.evaluated.length > 0 && (
        <table className="table table-sm mb-2 fs-xs">
          <thead><tr><th>Condition</th><th>Actual value</th><th className="text-end">Result</th></tr></thead>
          <tbody>
            {d.evaluated.map((e, i) => (
              <tr key={i}>
                <td className="font-monospace">{e.condition}</td>
                <td className="font-monospace text-break">{e.actual}</td>
                <td className="text-end">{e.result ? <span className="text-success fw-medium">true</span> : <span className="text-muted">false</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {d.request && (
        <>
          <div className="run-log-label">Request</div>
          <pre className="code-block mb-2">{`${d.request.method} ${d.request.url}\n${Object.entries(d.request.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}${d.request.body ? `\n\n${d.request.body}` : ''}`}</pre>
        </>
      )}
      {d.response && (
        <>
          <div className="run-log-label">Response · HTTP {d.response.status}</div>
          <pre className="code-block mb-2">{d.response.body}</pre>
        </>
      )}
      {d.variables && Object.keys(d.variables).length > 0 && (
        <>
          <div className="run-log-label">{entry.stepType === 'trigger' ? 'Trigger data' : 'Variables written'}</div>
          <div className="d-flex flex-wrap gap-1">
            {Object.entries(d.variables).map(([k, v]) => (
              <code key={k} className="var-chip">{entry.stepType === 'trigger' ? 'trigger' : 'vars'}.{k} = {v || '(empty)'}</code>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface RunLogProps {
  log: RunLogEntry[]
  /** Highlight entries for this step (e.g. the one selected on the canvas). */
  focusStepId?: string | null
  onStepClick?: (stepId: string) => void
}

/** Chronological, expandable run log. */
export function RunLog({ log, focusStepId, onStepClick }: RunLogProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(log.filter((l) => l.status === 'failed').map((l) => l.id)))
  const toggle = (id: string) => setOpen((s) => {
    const next = new Set(s)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  return (
    <ol className="run-log">
      {log.map((entry) => {
        const [icon, tone] = STATUS_ICON[entry.status]
        const meta = entry.stepType in STEP_TYPES ? STEP_TYPES[entry.stepType as keyof typeof STEP_TYPES] : null
        const expandable = Boolean(entry.detail && (entry.detail.evaluated?.length || entry.detail.request || entry.detail.response || (entry.detail.variables && Object.keys(entry.detail.variables).length)))
        return (
          <li key={entry.id} className={`run-log-item status-${entry.status}${focusStepId && focusStepId === entry.stepId ? ' focus' : ''}`}>
            <span className={`run-log-dot bg-${tone}-subtle text-${tone}`}><i className={icon} /></span>
            <div className="min-w-0 flex-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {meta && <i className={`${meta.icon} text-muted`} />}
                <button type="button" className="run-log-step" onClick={() => onStepClick && entry.stepId !== 'system' && onStepClick(entry.stepId)} disabled={!onStepClick || entry.stepId === 'system'}>
                  {entry.label}
                </button>
                <span className="text-muted fs-xs ms-auto text-nowrap tabular-nums">{time(entry.at)}{entry.durationMs > 10 && ` · ${entry.durationMs} ms`}</span>
              </div>
              <div className={`fs-sm ${entry.status === 'failed' ? 'text-danger' : 'text-body'}`}>{entry.message}</div>
              {expandable && (
                <button type="button" className="btn btn-link btn-sm p-0 fs-xs" onClick={() => toggle(entry.id)}>
                  {open.has(entry.id) ? 'Hide details' : 'Show details'}
                </button>
              )}
              {expandable && open.has(entry.id) && <Detail entry={entry} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
