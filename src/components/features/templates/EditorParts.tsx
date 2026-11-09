import type { ReactNode } from 'react'
import type { TemplateCheck } from '@/utils/helpers/template-checks'

/** Colour swatch + hex input, with an optional reset to the design default. */
export function ColorField({ id, label, value, onChange, onReset }: { id: string; label: string; value: string; onChange: (v: string) => void; onReset?: () => void }) {
  return (
    <div className="color-field">
      <label htmlFor={id} className="form-label mb-1">{label}</label>
      <div className="d-flex align-items-center gap-2">
        <input type="color" className="color-swatch" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={`${label} colour`} />
        <input id={id} className="form-control form-control-sm font-monospace" value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} />
        {onReset && <button type="button" className="btn btn-sm btn-icon btn-light" title="Use the design default" aria-label={`Reset ${label}`} onClick={onReset}><i className="ri-refresh-line" /></button>}
      </div>
    </div>
  )
}

/** Labelled range slider with the value shown. */
export function RangeField({ id, label, value, min, max, step = 1, unit = '', onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between">
        <label htmlFor={id} className="form-label mb-1">{label}</label>
        <span className="fs-xs text-muted tabular-nums">{value}{unit}</span>
      </div>
      <input id={id} type="range" className="form-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

/** Titled group inside an editor panel. */
export function EditorSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="tpl-section">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="tpl-section-title">{title}</h6>
        {action}
      </div>
      {children}
    </section>
  )
}

const LEVEL_META = {
  error: { icon: 'ri-close-circle-fill', cls: 'text-danger', label: 'Must fix' },
  warning: { icon: 'ri-alert-fill', cls: 'text-warning', label: 'Should fix' },
  tip: { icon: 'ri-lightbulb-flash-line', cls: 'text-info', label: 'Tip' },
} as const

/** Circular quality score. */
export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const tone = score >= 85 ? 'var(--dx-success)' : score >= 60 ? 'var(--dx-warning)' : 'var(--dx-danger)'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-ring" role="img" aria-label={`Quality score ${score} of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dx-border-color)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.3} fontWeight="700" fill="currentColor">{score}</text>
    </svg>
  )
}

/** "Ready to send" list; clicking an item jumps to what it is about. */
export function ChecksList({ checks, onFocus }: { checks: TemplateCheck[]; onFocus: (target: string) => void }) {
  if (!checks.length) {
    return (
      <div className="checks-ok">
        <i className="ri-checkbox-circle-fill" />
        <div><strong>Ready to send</strong><span className="d-block text-muted fs-sm">No problems found for this channel.</span></div>
      </div>
    )
  }
  const order = { error: 0, warning: 1, tip: 2 }
  return (
    <ul className="checks-list">
      {[...checks].sort((a, b) => order[a.level] - order[b.level]).map((c) => {
        const m = LEVEL_META[c.level]
        return (
          <li key={c.key}>
            <button type="button" disabled={!c.target} onClick={() => c.target && onFocus(c.target)}>
              <i className={`${m.icon} ${m.cls}`} aria-label={m.label} />
              <span className="flex-1">{c.message}</span>
              {c.target && <i className="ri-arrow-right-s-line text-muted" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
