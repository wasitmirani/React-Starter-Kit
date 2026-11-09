import { Fragment, useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { STEP_TYPES, TRIGGERS } from '@/constants/automation.constants'
import type { RunLogStatus, StepType, Workflow, WorkflowPath, WorkflowRunStats, WorkflowStep } from '@/types/automation.types'
import { countSteps, findStep, hasFixedPaths, isTerminal, siblingInfo, stepTitle, type InsertPoint } from '@/utils/helpers/workflow'
import { STEP_DRAG_TYPE } from './StepLibrary'

interface FlowCanvasProps {
  workflow: Pick<Workflow, 'trigger' | 'steps'>
  selectedId: string | null
  /** Step ids (or 'trigger') with at least one validation issue. */
  issueTargets: Set<string>
  triggerSummary: string
  /** True while a step is dragged from the library: drop zones light up. */
  dragActive: boolean
  onSelect: (id: string | null) => void
  /** `type` set = dropped from the library; unset = "+" clicked (open quick add). */
  onInsert: (point: InsertPoint, type?: StepType) => void
  onMove: (id: string, dir: -1 | 1) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onAddPath: (stepId: string) => void
  readOnly?: boolean
  /** Live counts from runs: contacts on each step now, and how many passed it. */
  overlay?: Pick<WorkflowRunStats, 'onStep' | 'passed'>
  /** Steps a test run went through, with their outcome; everything else is dimmed. */
  trace?: Map<string, RunLogStatus>
  /** Steps whose paths are folded away. */
  collapsed?: Set<string>
  onToggleCollapse?: (stepId: string) => void
  onCopy?: (stepId: string) => void
}

const ZOOMS = [0.5, 0.67, 0.8, 1, 1.15, 1.3]

function pathChip(step: WorkflowStep, path: WorkflowPath) {
  if (step.type === 'wait_for_event') return path.isElse ? { cls: 'timeout', text: path.label || 'Timed out' } : { cls: 'event', text: path.label || 'Event happened' }
  if (step.type === 'if_else') return path.isElse ? { cls: 'no', text: path.label || 'No' } : { cls: 'yes', text: path.label || 'Yes' }
  if (path.isElse) return { cls: 'else', text: path.label || 'Else' }
  if (step.type === 'ab_split') return { cls: 'split', text: `${path.label} · ${path.weight ?? 0}%` }
  return { cls: 'cond', text: path.label }
}

/** Vertical flow chart: trigger → steps, with condition or split paths side by side. */
export function FlowCanvas(props: FlowCanvasProps) {
  const { workflow, selectedId, issueTargets, triggerSummary, dragActive, onSelect, onInsert, onMove, onDuplicate, onDelete, onAddPath, readOnly = false, overlay, trace, collapsed, onToggleCollapse, onCopy } = props
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [over, setOver] = useState<string | null>(null)
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const trigger = TRIGGERS[workflow.trigger.type]
  const selectedStep = selectedId && selectedId !== 'trigger' ? findStep(workflow.steps, selectedId) : null
  const jumpTarget = selectedStep?.type === 'jump' ? selectedStep.config.target : null
  const titleOf = (id: string | undefined) => {
    const t = id ? findStep(workflow.steps, id) : null
    return t ? stepTitle(t, STEP_TYPES[t.type].label) : null
  }

  const fit = useCallback(() => {
    const vp = viewport.current
    const el = content.current
    if (!vp || !el) return
    const scale = Math.min(1, (vp.clientWidth - 48) / (el.scrollWidth / zoom), (vp.clientHeight - 48) / (el.scrollHeight / zoom))
    setZoom(Math.max(0.5, Math.round(scale * 100) / 100))
  }, [zoom])

  // On open, zoom out if the flow is wider than the canvas so every path is visible.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const vp = viewport.current
      const el = content.current
      if (vp && el && el.scrollWidth > vp.clientWidth) {
        setZoom(Math.max(0.67, Math.floor(((vp.clientWidth - 48) / el.scrollWidth) * 100) / 100))
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // Bring the selected step into view (Find, issue links, paste).
  useEffect(() => {
    if (!selectedId || selectedId === 'trigger') return
    const frame = requestAnimationFrame(() => {
      viewport.current?.querySelector(`[data-step-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedId])

  // Keep the flow centred horizontally when the zoom changes.
  useEffect(() => {
    const vp = viewport.current
    if (vp) vp.scrollLeft = (vp.scrollWidth - vp.clientWidth) / 2
  }, [zoom])

  const stepZoom = (dir: 1 | -1) => {
    const i = ZOOMS.findIndex((z) => z >= zoom - 0.001)
    setZoom(ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? ZOOMS.length - 1 : i) + dir))])
  }

  // Drag the empty canvas to pan.
  const onMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea') || !viewport.current) return
    pan.current = { x: e.clientX, y: e.clientY, left: viewport.current.scrollLeft, top: viewport.current.scrollTop }
    viewport.current.classList.add('panning')
  }
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!pan.current || !viewport.current) return
      viewport.current.scrollLeft = pan.current.left - (e.clientX - pan.current.x)
      viewport.current.scrollTop = pan.current.top - (e.clientY - pan.current.y)
    }
    const up = () => {
      pan.current = null
      viewport.current?.classList.remove('panning')
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  const dropZone = (point: InsertPoint, compact = false) => {
    if (readOnly) return <div className="flow-connector" />
    const key = `${point.parentId ?? 'root'}-${point.pathId ?? ''}-${point.index}`
    const accept = (e: DragEvent) => {
      if (!e.dataTransfer.types.includes(STEP_DRAG_TYPE)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      setOver(key)
    }
    return (
      <>
        {!compact && <div className="flow-connector" />}
        <div
          className={`flow-drop${dragActive ? ' armed' : ''}${over === key ? ' over' : ''}`}
          onDragOver={accept}
          onDragEnter={accept}
          onDragLeave={() => setOver((o) => (o === key ? null : o))}
          onDrop={(e) => {
            const type = e.dataTransfer.getData(STEP_DRAG_TYPE) as StepType
            setOver(null)
            if (type) {
              e.preventDefault()
              onInsert(point, type)
            }
          }}
        >
          {dragActive ? (
            <span className="flow-drop-label"><i className="ri-add-line" /> Drop here</span>
          ) : (
            <button type="button" className="flow-add" aria-label="Add a step here" title="Add step" onClick={() => onInsert(point)}>
              <i className="ri-add-line" />
            </button>
          )}
        </div>
        <div className="flow-connector" />
      </>
    )
  }

  const node = (s: WorkflowStep) => {
    const meta = STEP_TYPES[s.type]
    const pos = siblingInfo(workflow.steps, s.id)
    const hasIssue = issueTargets.has(s.id)
    const summary = s.type === 'jump' && titleOf(s.config.target) ? `Go to “${titleOf(s.config.target)}” · max ${s.config.maxLoops || 3}×` : meta.summary(s)
    const traced = trace?.get(s.id)
    const here = overlay?.onStep[s.id] ?? 0
    const passed = overlay?.passed[s.id] ?? 0
    const title = stepTitle(s, meta.label)
    const renamed = title !== meta.label
    return (
      <div className={`flow-node tone-${meta.tone}${selectedId === s.id ? ' selected' : ''}${hasIssue ? ' has-issue' : ''}${s.disabled ? ' is-off' : ''}${jumpTarget === s.id ? ' jump-target' : ''}${isTerminal(s) ? ` terminal-${s.type}` : ''}${trace ? (traced ? ` traced trace-${traced}` : ' untraced') : ''}`} data-step-id={s.id}>
        {(s.disabled || s.note) && (
          <div className="flow-node-flags">
            {s.disabled && <span className="off" title="Turned off: contacts skip this step"><i className="ri-forbid-line" /> Off</span>}
            {s.note && <span title={s.note}><i className="ri-sticky-note-line" /> Note</span>}
          </div>
        )}
        {overlay && (here > 0 || passed > 0) && (
          <div className="flow-node-stats" aria-label={`${here} contacts here, ${passed} passed`}>
            {here > 0 && <span className="here" title="Contacts on this step now"><span className="live-dot on" />{here} here</span>}
            {passed > 0 && <span title="Contacts that passed this step">{passed.toLocaleString()} passed</span>}
          </div>
        )}
        {traced && <span className={`flow-trace-badge ${traced}`} title={`Test run: ${traced}`}><i className={traced === 'failed' ? 'ri-close-line' : traced === 'skipped' ? 'ri-skip-forward-line' : traced === 'waiting' ? 'ri-time-line' : 'ri-check-line'} /></span>}
        <button type="button" className="flow-node-body" onClick={() => onSelect(s.id)} aria-label={`${title}: ${summary}`}>
          <span className={`icon-tile icon-tile-sm bg-${meta.tone}-subtle text-${meta.tone}`}><i className={meta.icon} /></span>
          <span className="min-w-0 flex-1 text-start">
            <span className="flow-node-kind">{renamed ? meta.label : meta.group === 'Messages' ? 'Message' : meta.group === 'Flow' ? 'Flow' : meta.group === 'Integrations' ? 'Integration' : meta.group === 'Data & team' ? 'Data' : 'Action'}</span>
            <span className="d-block fw-semibold text-body text-truncate">{title}</span>
            <span className={`d-block fs-sm text-truncate ${hasIssue ? 'text-warning-emphasis' : 'text-muted'}`}>{summary}</span>
          </span>
          {hasIssue && <i className="ri-error-warning-fill text-warning fs-5" title="Needs setup" />}
        </button>
        {!readOnly && (
          <div className="flow-node-tools" role="toolbar" aria-label="Step actions">
            <button type="button" title="Move up" aria-label="Move up" disabled={!pos || pos.index === 0} onClick={() => onMove(s.id, -1)}><i className="ri-arrow-up-line" /></button>
            <button type="button" title="Move down" aria-label="Move down" disabled={!pos || pos.index >= pos.count - 1} onClick={() => onMove(s.id, 1)}><i className="ri-arrow-down-line" /></button>
            <button type="button" title={s.paths ? 'Duplicate with all paths' : 'Duplicate'} aria-label="Duplicate" onClick={() => onDuplicate(s.id)}><i className="ri-file-copy-line" /></button>
            <button type="button" title="Copy (Ctrl+C), paste anywhere with Ctrl+V" aria-label="Copy" onClick={() => onCopy?.(s.id)}><i className="ri-clipboard-line" /></button>
            {s.paths && <button type="button" title={collapsed?.has(s.id) ? 'Expand paths' : 'Collapse paths'} aria-label={collapsed?.has(s.id) ? 'Expand paths' : 'Collapse paths'} onClick={() => onToggleCollapse?.(s.id)}><i className={collapsed?.has(s.id) ? 'ri-expand-up-down-line' : 'ri-collapse-vertical-line'} /></button>}
            <button type="button" title="Delete" aria-label="Delete" className="danger" onClick={() => onDelete(s.id)}><i className="ri-delete-bin-6-line" /></button>
          </div>
        )}
      </div>
    )
  }

  /**
   * Steps after a branch in the same list run once the contact finishes whichever
   * path it took (paths rejoin). `continues` tells nested paths whether that happens.
   */
  const renderSteps = (steps: WorkflowStep[], parentId: string | null, pathId: string | null, continuesAfter: boolean) =>
    steps.map((s, i) => {
      const hasNext = i < steps.length - 1
      const rejoins = hasNext || continuesAfter
      return (
        <Fragment key={s.id}>
          {node(s)}
          {s.paths && collapsed?.has(s.id) ? (
            <>
              <div className="flow-connector" />
              <button type="button" className="flow-collapsed" onClick={() => onToggleCollapse?.(s.id)} title="Expand paths">
                <i className="ri-git-branch-line" /> {s.paths.length} paths · {s.paths.reduce((n, p) => n + countSteps(p.steps), 0)} steps hidden <span className="text-primary">Expand</span>
              </button>
              {hasNext ? dropZone({ parentId, pathId, index: i + 1 }) : null}
            </>
          ) : s.paths ? (
            <>
              <div className="flow-connector" />
              <div className="flow-branches-wrap">
                <div className={`flow-branches${hasNext ? ' merges' : ''}`}>
                  {s.paths.map((p) => {
                    const chip = pathChip(s, p)
                    return (
                      <div key={p.id} className="flow-branch">
                        <button type="button" className={`flow-branch-label ${chip.cls}`} onClick={() => onSelect(s.id)} title={chip.text}>{chip.text}</button>
                        <div className="flow-connector short" />
                        {dropZone({ parentId: s.id, pathId: p.id, index: 0 }, true)}
                        {renderSteps(p.steps, s.id, p.id, rejoins)}
                        {p.steps.length > 0 && (p.steps[p.steps.length - 1].paths || isTerminal(p.steps[p.steps.length - 1])) ? null : (
                          <span className={`flow-end${rejoins ? ' continues' : ''}`}>{rejoins ? 'Continues below' : p.steps.length ? 'Exit' : 'Exit · empty path'}</span>
                        )}
                        {hasNext && <div className="flow-merge-stem" />}
                      </div>
                    )
                  })}
                </div>
                {!readOnly && !hasFixedPaths(s) && (
                  <button type="button" className="flow-add-path" onClick={() => onAddPath(s.id)} title="Add a path">
                    <i className="ri-add-line" /> Path
                  </button>
                )}
                {hasNext && <div className="flow-merge" aria-hidden="true" />}
              </div>
              {hasNext && <span className="flow-merge-label">Paths join</span>}
              {hasNext ? dropZone({ parentId, pathId, index: i + 1 }) : null}
            </>
          ) : isTerminal(s) ? (
            <>
              <div className="flow-connector short" />
              {s.type === 'jump' ? (
                <button type="button" className="flow-end jump" onClick={() => s.config.target && onSelect(s.config.target)} title="Show the step it goes to">
                  <i className="ri-corner-up-left-double-line" /> {titleOf(s.config.target) ? `Goes to “${titleOf(s.config.target)}”` : 'Choose where to go'}
                </button>
              ) : (
                <span className="flow-end terminal"><i className="ri-stop-circle-line" /> Workflow ends</span>
              )}
              {hasNext && <div className="flow-connector" />}
            </>
          ) : (
            dropZone({ parentId, pathId, index: i + 1 })
          )}
        </Fragment>
      )
    })

  const last = workflow.steps[workflow.steps.length - 1]

  return (
    <div className="flow-wrap">
      <div ref={viewport} className="flow-canvas" onMouseDown={onMouseDown} onClick={(e) => e.target === e.currentTarget && onSelect(null)}>
        <div ref={content} className={`flow-column${overlay && Object.values(overlay.onStep).some((n) => n > 0) ? ' live' : ''}`} style={{ zoom }} onClick={(e) => e.target === e.currentTarget && onSelect(null)}>
          <div className={`flow-node trigger${selectedId === 'trigger' ? ' selected' : ''}${issueTargets.has('trigger') ? ' has-issue' : ''}`}>
            <button type="button" className="flow-node-body" onClick={() => onSelect('trigger')}>
              <span className="icon-tile icon-tile-sm bg-primary text-white"><i className={trigger.icon} /></span>
              <span className="min-w-0 flex-1 text-start">
                <span className="flow-node-kind text-primary">Trigger</span>
                <span className="d-block fw-semibold text-body">{trigger.label}</span>
                <span className="d-block fs-sm text-muted text-truncate">{triggerSummary}</span>
              </span>
              {issueTargets.has('trigger') && <i className="ri-error-warning-fill text-warning fs-5" title="Needs setup" />}
            </button>
          </div>
          {dropZone({ parentId: null, pathId: null, index: 0 })}
          {renderSteps(workflow.steps, null, null, false)}
          {!last?.paths && !(last && isTerminal(last)) && <span className="flow-end">Exit</span>}
        </div>
      </div>
      <div className="flow-zoom" role="group" aria-label="Zoom">
        <button type="button" onClick={() => stepZoom(-1)} aria-label="Zoom out" disabled={zoom <= ZOOMS[0]}><i className="ri-subtract-line" /></button>
        <button type="button" className="flow-zoom-value" onClick={() => setZoom(1)} title="Reset to 100%">{Math.round(zoom * 100)}%</button>
        <button type="button" onClick={() => stepZoom(1)} aria-label="Zoom in" disabled={zoom >= ZOOMS[ZOOMS.length - 1]}><i className="ri-add-line" /></button>
        <span className="flow-zoom-sep" />
        <button type="button" onClick={fit} aria-label="Fit to screen" title="Fit to screen"><i className="ri-fullscreen-exit-line" /></button>
      </div>
    </div>
  )
}
