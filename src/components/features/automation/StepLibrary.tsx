import { useMemo, useState } from 'react'
import { integrationsApi } from '@/api/endpoints/platform.api'
import { INTEGRATION_APPS, STEP_DESCRIPTIONS, STEP_TYPES, TRIGGERS } from '@/constants/automation.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import type { StepType, TriggerType } from '@/types/automation.types'

export const STEP_DRAG_TYPE = 'application/x-birdcrm-step'

const GROUP_ORDER = ['Messages', 'Flow', 'Contact', 'Data & team', 'Integrations']

/** Triggers offered as one-click shortcuts at the top of the library. */
const TRIGGER_SHORTCUTS: TriggerType[] = ['incoming_webhook', 'webhook', 'form_submitted', 'contact_created']

interface StepLibraryProps {
  /** Click: add after the selected step (or at the end). */
  onPick: (type: StepType) => void
  onDragChange: (dragging: boolean) => void
  /** Compact grid for the quick-add dialog. */
  variant?: 'panel' | 'grid'
  autoFocus?: boolean
  /** Panel only: the current trigger, with shortcuts to change it (null = open the full picker). */
  trigger?: TriggerType
  onPickTrigger?: (type: TriggerType | null) => void
}

/** Searchable, grouped list of steps. Items can be dragged onto the canvas or clicked. */
export function StepLibrary({ onPick, onDragChange, variant = 'panel', autoFocus = false, trigger, onPickTrigger }: StepLibraryProps) {
  const [q, setQ] = useState('')
  const integrations = useAll('integrations', integrationsApi.list)
  const connected = (type: StepType) => {
    const app = STEP_TYPES[type].app
    return app ? integrations.data?.data.some((i) => i.app === app && i.status === 'connected') : undefined
  }
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const out = new Map<string, StepType[]>()
    for (const [type, meta] of Object.entries(STEP_TYPES) as [StepType, (typeof STEP_TYPES)[StepType]][]) {
      const app = meta.app ? INTEGRATION_APPS[meta.app].label : ''
      if (term && !`${meta.label} ${STEP_DESCRIPTIONS[type]} ${meta.group} ${app}`.toLowerCase().includes(term)) continue
      out.set(meta.group, [...(out.get(meta.group) ?? []), type])
    }
    return [...out.entries()].sort(([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
  }, [q])

  const current = trigger ? TRIGGERS[trigger] : null

  return (
    <div className={`wf-library wf-library-${variant}`}>
      {variant === 'panel' && current && onPickTrigger && !q && (
        <section className="mb-3">
          <h6 className="wf-library-group">Starts when</h6>
          <button type="button" className="wf-trigger-card" onClick={() => onPickTrigger(null)} title="Change the trigger">
            <span className="icon-tile icon-tile-sm bg-primary text-white"><i className={current.icon} /></span>
            <span className="min-w-0 flex-1">
              <span className="d-block fw-semibold text-body lh-sm">{current.label}</span>
              <span className="d-block text-muted fs-xs">Click to change the trigger</span>
            </span>
            <i className="ri-arrow-right-s-line text-muted" />
          </button>
          <div className="wf-trigger-chips" role="group" aria-label="Quick triggers">
            {TRIGGER_SHORTCUTS.map((t) => (
              <button key={t} type="button" className={trigger === t ? 'on' : ''} aria-pressed={trigger === t} onClick={() => onPickTrigger(t)}>
                <i className={TRIGGERS[t].icon} />{TRIGGERS[t].label}
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="position-relative mb-3">
        <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        <input className="form-control form-control-sm ps-9" placeholder="Search steps and apps…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus} aria-label="Search steps" />
      </div>
      {groups.length === 0 && <p className="text-muted fs-sm text-center my-4">No step matches “{q}”.</p>}
      {groups.map(([group, types]) => (
        <section key={group} className="mb-3">
          <h6 className="wf-library-group">{group}</h6>
          <div className={variant === 'grid' ? 'row g-2' : 'd-flex flex-column gap-1'}>
            {types.map((type) => {
              const meta = STEP_TYPES[type]
              const isOn = connected(type)
              return (
                <div key={type} className={variant === 'grid' ? 'col-sm-6' : ''}>
                  <button
                    type="button"
                    className="wf-library-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(STEP_DRAG_TYPE, type)
                      e.dataTransfer.effectAllowed = 'copy'
                      onDragChange(true)
                    }}
                    onDragEnd={() => onDragChange(false)}
                    onClick={() => onPick(type)}
                    title={variant === 'panel' ? 'Drag onto the canvas, or click to add' : undefined}
                  >
                    <span className={`icon-tile icon-tile-sm bg-${meta.tone}-subtle text-${meta.tone}`}><i className={meta.icon} /></span>
                    <span className="min-w-0 text-start">
                      <span className="d-block fw-medium text-body">{meta.label}</span>
                      <span className="d-block text-muted fs-xs text-truncate">{STEP_DESCRIPTIONS[type]}</span>
                    </span>
                    {isOn !== undefined && <span className={`conn-dot${isOn ? ' on' : ''}`} title={isOn ? 'Connected' : 'Not connected yet'} aria-label={isOn ? 'Connected' : 'Not connected'} />}
                    {variant === 'panel' && isOn === undefined && <i className="ri-draggable ms-auto text-muted wf-drag-handle" />}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
