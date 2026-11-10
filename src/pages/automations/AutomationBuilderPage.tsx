import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { workflowsApi, type WorkflowDraft } from '@/api/endpoints/automation.api'
import { listsApi } from '@/api/endpoints/crm.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryError } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { FlowCanvas } from '@/components/features/automation/FlowCanvas'
import { PublishModal, TestRunModal, VersionsPanel } from '@/components/features/automation/Publishing'
import { RunsTable } from '@/components/features/automation/Runs'
import { StepInspector } from '@/components/features/automation/StepInspector'
import { StepLibrary } from '@/components/features/automation/StepLibrary'
import { Dropdown } from '@/components/ui/Dropdown'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { STEP_TYPES, TRIGGERS } from '@/constants/automation.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useHistory } from '@/hooks/useHistory'
import { useToast } from '@/hooks/useToast'
import type { RunLogStatus, StepType, Workflow, WorkflowExecution, WorkflowStep } from '@/types/automation.types'
import {
  channelsOf,
  cloneStep,
  countSteps,
  createStep,
  defaultSettings,
  normalizeSteps,
  stepTitle,
  duplicateStep,
  findStep,
  insertStep,
  moveStep,
  newCondition,
  newPath,
  removeStep,
  updateStep,
  validateWorkflow,
  variablesFor,
  type InsertPoint,
  definitionKey,
  defaultTriggerConfig,
} from '@/utils/helpers/workflow'

type Editable = WorkflowDraft
type View = 'builder' | 'runs' | 'versions'

const editable = (w: Workflow): Editable => ({ name: w.name, description: w.description, trigger: w.trigger, steps: w.steps, variables: w.variables, allowReentry: w.allowReentry, settings: w.settings })

/** Where a new step goes when picked from the library: after the selected step, else at the end of the flow. */
function insertionPoint(steps: WorkflowStep[], selectedId: string | null): InsertPoint {
  const endOfFirstPath = (s: WorkflowStep): InsertPoint => ({ parentId: s.id, pathId: s.paths![0].id, index: s.paths![0].steps.length })
  const locate = (list: WorkflowStep[], parentId: string | null, pathId: string | null): InsertPoint | null => {
    for (let i = 0; i < list.length; i++) {
      const s = list[i]
      if (s.id === selectedId) return s.paths?.length ? endOfFirstPath(s) : { parentId, pathId, index: i + 1 }
      for (const p of s.paths ?? []) {
        const found = locate(p.steps, s.id, p.id)
        if (found) return found
      }
    }
    return null
  }
  const found = selectedId && selectedId !== 'trigger' ? locate(steps, null, null) : null
  if (found) return found
  const last = steps[steps.length - 1]
  return last?.paths?.length ? endOfFirstPath(last) : { parentId: null, pathId: null, index: steps.length }
}

const issueMeta = {
  triggerField: (t: Workflow['trigger']['type']) => TRIGGERS[t].field,
  stepFields: (t: StepType) => STEP_TYPES[t].fields,
  stepLabel: (t: StepType) => STEP_TYPES[t].label,
}

const CLIPBOARD_KEY = 'birdcrm.workflow-clipboard'
const AUTOSAVE_KEY = 'birdcrm.workflow-autosave'
const PANELS_KEY = 'birdcrm.workflow-panels'

/** Every step with its depth, in canvas order (for Find). */
function flatten(steps: WorkflowStep[], out: WorkflowStep[] = []): WorkflowStep[] {
  for (const s of steps) {
    out.push(s)
    s.paths?.forEach((p) => flatten(p.steps, out))
  }
  return out
}

/** Ids of the branch steps that contain `id`. */
function ancestorsOf(steps: WorkflowStep[], id: string, trail: string[] = []): string[] {
  for (const s of steps) {
    if (s.id === id) return trail
    for (const p of s.paths ?? []) {
      const found = ancestorsOf(p.steps, id, [...trail, s.id])
      if (found.length || p.steps.some((x) => x.id === id)) return found.length ? found : [...trail, s.id]
    }
  }
  return []
}

const SHORTCUTS: [string, string][] = [
  ['Ctrl + S', 'Save draft'],
  ['Ctrl + Z / Ctrl + Y', 'Undo / redo'],
  ['Ctrl + C / Ctrl + V', 'Copy the selected step / paste after the selected step'],
  ['Ctrl + D', 'Duplicate the selected step'],
  ['Ctrl + F', 'Find a step'],
  ['Delete', 'Delete the selected step'],
  ['Esc', 'Deselect, clear the test-run trace'],
  ['?', 'Show these shortcuts'],
]

/** Ctrl+F: jump to any step by name, type or summary. */
function FindStepModal({ open, steps, onClose, onPick }: { open: boolean; steps: WorkflowStep[]; onClose: () => void; onPick: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const all = flatten(steps)
  const term = q.trim().toLowerCase()
  const results = all.filter((s) => !term || `${stepTitle(s, STEP_TYPES[s.type].label)} ${STEP_TYPES[s.type].label} ${STEP_TYPES[s.type].summary(s)} ${s.note ?? ''}`.toLowerCase().includes(term)).slice(0, 30)
  const pick = (id: string) => {
    setQ('')
    setActive(0)
    onPick(id)
  }
  return (
    <Modal open={open} onClose={onClose} title="Find a step">
      <input
        autoFocus
        className="form-control mb-3"
        placeholder={`Search ${all.length} steps by name, type or content…`}
        value={q}
        onChange={(e) => { setQ(e.target.value); setActive(0) }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
          if (e.key === 'Enter' && results[active]) pick(results[active].id)
        }}
        aria-label="Search steps"
      />
      <div className="list-group" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {results.length === 0 && <p className="text-muted text-center py-4 mb-0">No step matches “{q}”.</p>}
        {results.map((s, i) => {
          const meta = STEP_TYPES[s.type]
          return (
            <button key={s.id} type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-3${i === active ? ' active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => pick(s.id)}>
              <span className={`icon-tile icon-tile-sm bg-${meta.tone}-subtle text-${meta.tone}`}><i className={meta.icon} /></span>
              <span className="min-w-0 flex-1 text-start">
                <span className="d-block fw-medium text-truncate">{stepTitle(s, meta.label)}{s.disabled && <span className="text-muted fw-normal"> · off</span>}</span>
                <span className={`d-block fs-xs text-truncate ${i === active ? '' : 'text-muted'}`}>{meta.label} · {meta.summary(s)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

/** Last outcome per step in a run's log (for tracing a test run on the canvas). */
function traceOf(run: WorkflowExecution | null): Map<string, RunLogStatus> | undefined {
  if (!run) return undefined
  const map = new Map<string, RunLogStatus>()
  for (const entry of run.log) if (entry.stepId !== 'system') map.set(entry.stepId, entry.status)
  return map
}

function Builder({ workflow: w }: { workflow: Workflow }) {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  // A live automation opens on its runs (what is happening now); drafts and paused ones on the builder.
  const defaultView: View = w.status === 'active' ? 'runs' : 'builder'
  const view = (params.get('view') as View) || defaultView
  const setView = (v: View) => setParams(v === defaultView ? {} : { view: v }, { replace: true })
  const history = useHistory<Editable>(editable(w))
  const draft = history.value
  const [saved, setSaved] = useState<Editable>(() => editable(w))
  // A brand-new, empty workflow opens on the trigger picker.
  const fresh = w.version === 0 && w.steps.length === 0
  const [selected, setSelected] = useState<string | null>(fresh ? 'trigger' : null)
  /** Which side panels are open; remembered per browser so the canvas can stay wide. */
  const [panels, setPanelsState] = useState<{ library: boolean; inspector: boolean }>(() => {
    try {
      return { library: true, inspector: true, ...JSON.parse(localStorage.getItem(PANELS_KEY) ?? '{}') }
    } catch {
      return { library: true, inspector: true }
    }
  })
  /** Updates from the latest state (several toggles in a row must not undo each other). */
  const updatePanels = useCallback((change: (prev: { library: boolean; inspector: boolean }) => { library: boolean; inspector: boolean }) => {
    setPanelsState((prev) => {
      const next = change(prev)
      try {
        localStorage.setItem(PANELS_KEY, JSON.stringify(next))
      } catch {
        /* private mode: the choice lasts for this page only */
      }
      return next
    })
  }, [])
  const setPanels = (next: { library: boolean; inspector: boolean }) => updatePanels(() => next)
  const togglePanel = (p: 'library' | 'inspector') => updatePanels((prev) => ({ ...prev, [p]: !prev[p] }))
  // Picking a step means editing it: bring the details panel back if it was hidden.
  const selectStep = useCallback(
    (id: string | null) => {
      setSelected(id)
      if (id) updatePanels((prev) => (prev.inspector ? prev : { ...prev, inspector: true }))
    },
    [updatePanels],
  )
  /** Bumped to reopen the trigger inspector with the picker showing. */
  const [pickNonce, setPickNonce] = useState(fresh ? 1 : 0)
  const [quickAdd, setQuickAdd] = useState<InsertPoint | null>(null)
  const [dragging, setDragging] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testRun, setTestRun] = useState<WorkflowExecution | null>(null)
  const [showLive, setShowLive] = useState(true)
  const [preview, setPreview] = useState<number | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [finding, setFinding] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem(AUTOSAVE_KEY) === 'true')
  const importInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const lists = useAll('lists', listsApi.list)
  const runStats = useTenantQuery('executions', { stats: w.id }, () => workflowsApi.runStats(w.id), { refetchInterval: w.status === 'active' ? 5000 : false })

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const live = w.versions[w.versions.length - 1]
  const unpublished = !live || definitionKey(draft) !== definitionKey(live.definition)
  const issues = useMemo(() => validateWorkflow(draft, issueMeta), [draft])
  const issueTargets = useMemo(() => new Set(issues.map((i) => i.target)), [issues])
  const step = selected && selected !== 'trigger' ? findStep(draft.steps, selected) : null
  const variableOptions = useMemo(() => variablesFor(draft, step ? step.id : null), [draft, step])
  const trace = useMemo(() => traceOf(testRun), [testRun])

  const edit = useCallback((patch: Partial<Editable>) => history.set((d) => ({ ...d, ...patch })), [history])
  const setSteps = useCallback((fn: (steps: WorkflowStep[]) => WorkflowStep[]) => history.set((d) => ({ ...d, steps: fn(d.steps) })), [history])

  const save = useAction('workflows', (body: Editable) => workflowsApi.save(w.id, body), { success: 'Draft saved', onSuccess: (r) => setSaved(editable(r)) })
  const publish = useAction(
    'workflows',
    async (note: string) => {
      if (dirty) setSaved(editable(await workflowsApi.save(w.id, draft)))
      return workflowsApi.publish(w.id, note)
    },
    { success: (r) => `Version ${r.version} is live`, invalidates: ['executions'], onSuccess: () => setPublishing(false) },
  )
  const pause = useAction('workflows', () => workflowsApi.pause(w.id), { success: 'Paused: no new contacts enter, and waiting contacts hold' })
  const resume = useAction('workflows', () => workflowsApi.resume(w.id), { success: 'Resumed', invalidates: ['executions'] })
  const restore = useAction('workflows', (version: number) => workflowsApi.restoreVersion(w.id, version), {
    success: (r) => `Version ${restoring ?? ''} restored to the draft${r.version ? ` (v${r.version} stays live until you publish)` : ''}`,
    onSuccess: (r) => {
      const e = editable(r)
      history.reset(e)
      setSaved(e)
      setRestoring(null)
      setView('builder')
    },
  })

  const insert = (point: InsertPoint, type?: StepType) => {
    if (!type) return setQuickAdd(point)
    const created = createStep(type)
    setSteps((s) => insertStep(s, point, created))
    setQuickAdd(null)
    setSelected(created.id)
  }
  const remove = (id: string) => {
    setSteps((s) => removeStep(s, id))
    setSelected(null)
  }
  const duplicate = (id: string) => {
    const result = duplicateStep(draft.steps, id)
    history.set((d) => ({ ...d, steps: result.steps }))
    setSelected(result.newId)
  }
  const addPath = (stepId: string) => {
    setSteps((list) =>
      updateStep(list, stepId, {
        paths: (() => {
          const owner = findStep(list, stepId)!
          const paths = owner.paths ?? []
          if (owner.type === 'ab_split') return [...paths, newPath(String.fromCharCode(65 + paths.length), { weight: 0 })]
          const named = paths.filter((p) => !p.isElse)
          return [...named, newPath(`Path ${named.length + 1}`, { conditions: [newCondition()] }), ...paths.filter((p) => p.isElse)]
        })(),
      }),
    )
    setSelected(stepId)
  }
  const focusTarget = (target: string) => {
    setView('builder')
    const id = target === 'variables' || target === 'settings' ? null : target
    // Make sure the step is visible: unfold any collapsed branch above it.
    if (id) {
      const above = ancestorsOf(draft.steps, id)
      setCollapsed((c) => new Set([...c].filter((x) => !above.includes(x))))
    }
    setSelected(id)
  }

  const copyStep = (id: string) => {
    const s = findStep(draft.steps, id)
    if (!s) return
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(s))
    toast.success(`Copied “${stepTitle(s, STEP_TYPES[s.type].label)}”. Paste with Ctrl+V, here or in another workflow.`)
  }
  const pasteStep = () => {
    const raw = localStorage.getItem(CLIPBOARD_KEY)
    if (!raw) return toast.info('Nothing to paste. Copy a step first (Ctrl+C).')
    try {
      const [normalized] = normalizeSteps([JSON.parse(raw)])
      const copy = cloneStep(normalized)
      setSteps((list) => insertStep(list, insertionPoint(list, selected), copy))
      setSelected(copy.id)
    } catch {
      toast.error('The clipboard does not contain a workflow step.')
    }
  }
  const toggleCollapse = (id: string) => setCollapsed((c) => {
    const next = new Set(c)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const exportJson = () => {
    const payload = { schema: 'birdcrm.workflow/v1', exportedAt: new Date().toISOString(), name: draft.name, description: draft.description, trigger: draft.trigger, steps: draft.steps, variables: draft.variables, settings: draft.settings, allowReentry: draft.allowReentry }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workflow'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const importJson = async (file: File | undefined) => {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object' || !Array.isArray(data.steps) || !data.trigger?.type || !(data.trigger.type in TRIGGERS)) throw new Error('shape')
      history.set((d) => ({
        ...d,
        trigger: data.trigger,
        steps: normalizeSteps(data.steps).map(cloneStep),
        variables: Array.isArray(data.variables) ? data.variables : d.variables,
        settings: { ...defaultSettings(), ...data.settings },
        allowReentry: Boolean(data.allowReentry),
      }))
      setSelected(null)
      toast.success(`Imported “${data.name ?? file.name}” into the draft. Review it, then save or undo (Ctrl+Z).`)
    } catch {
      toast.error('That file is not a BirdCRM workflow export.')
    }
  }
  const duplicateWorkflow = useAction(
    'workflows',
    () => workflowsApi.create({ ...draft, name: `${draft.name} (copy)`, steps: draft.steps.map(cloneStep), status: 'draft', version: 0, versions: [], stats: { enrolled: 0, active: 0, completed: 0, goalReached: 0 } }),
    { success: 'Workflow duplicated as a new draft', onSuccess: (copy) => navigate(to(ROUTES.AUTOMATION, { id: copy.id })) },
  )

  // Optional auto-save: drafts only, never publishes.
  const autoSaveRun = useAction('workflows', (body: Editable) => workflowsApi.save(w.id, body), { onSuccess: (r) => setSaved(editable(r)) })
  const autoSaveMutate = autoSaveRun.mutate
  useEffect(() => {
    if (!autoSave || !dirty) return
    const t = setTimeout(() => autoSaveMutate(draft), 1500)
    return () => clearTimeout(t)
  }, [autoSave, dirty, draft, autoSaveMutate])
  const openPublish = () => {
    if (issues.length) toast.error(`Fix ${issues.length} issue${issues.length > 1 ? 's' : ''} before publishing.`)
    setPublishing(true)
  }

  // Keyboard: undo/redo, save, delete, escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== 'builder') return
      const typing = (e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (dirty) save.mutate(draft)
      } else if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setFinding(true)
      } else if (typing) {
        return
      } else if (mod && e.key.toLowerCase() === 'c' && step && !window.getSelection()?.toString()) {
        e.preventDefault()
        copyStep(step.id)
      } else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteStep()
      } else if (mod && e.key.toLowerCase() === 'd' && step) {
        e.preventDefault()
        duplicate(step.id)
      } else if (e.key === '?') {
        setShowShortcuts(true)
      } else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        history.undo()
      } else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        history.redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && step) {
        e.preventDefault()
        remove(step.id)
      } else if (e.key === 'Escape') {
        setSelected(null)
        setTestRun(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Guard against losing work: in-app navigation and tab close.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [dirty])

  const triggerMeta = TRIGGERS[draft.trigger.type]
  const triggerValue = triggerMeta.field ? draft.trigger.config[triggerMeta.field.key] : ''
  const triggerSummary = draft.trigger.type === 'incoming_webhook'
    ? draft.trigger.config.token
      ? `POST …/hooks/workflows/${draft.trigger.config.token.slice(0, 6)}… · ${draft.trigger.config.auth === 'none' ? 'unverified' : 'signed'}`
      : 'Generate a webhook URL'
    : !triggerMeta.field
    ? triggerMeta.description
    : triggerValue
      ? triggerMeta.field.type === 'list'
        ? lists.data?.data.find((l) => l.id === triggerValue)?.name ?? 'List'
        : triggerValue
      : `Choose ${triggerMeta.field.label.toLowerCase()}`
  const previewVersion = w.versions.find((v) => v.version === preview)
  const s = runStats.data

  return (
    <div className="wf-shell">
      <header className="wf-toolbar">
        <div className="wf-toolbar-row wf-toolbar-main">
          <Link to={ROUTES.AUTOMATIONS} className="btn btn-light btn-icon" aria-label="Back to automations"><i className="ri-arrow-left-line" /></Link>
          <div className="min-w-0 flex-1 d-flex align-items-center gap-2">
            <input className="wf-name" value={draft.name} onChange={(e) => edit({ name: e.target.value })} aria-label="Automation name" size={Math.max(12, draft.name.length)} />
            <StatusBadge status={w.status === 'active' ? 'live' : w.status} label={w.status === 'active' ? `Live · v${w.version}` : w.status === 'paused' ? `Paused · v${w.version}` : 'Draft · not published'} />
            <span className="text-muted fs-sm text-nowrap d-none d-xl-inline wf-save-state">
              <span className={`wf-save-dot${save.isPending ? ' saving' : dirty ? ' dirty' : ''}`} />
              {save.isPending ? 'Saving…' : dirty ? 'Unsaved changes' : unpublished && w.version ? 'Draft differs from live' : 'All changes saved'}
            </span>
          </div>
          <div className="wf-toolbar-actions">
            <button type="button" className="btn btn-sm btn-light" onClick={() => setTesting(true)} title="Run the draft for one contact"><i className="ri-flask-line me-1" />Test</button>
            <Guard permission="automations.manage">
              <button type="button" className="btn btn-sm btn-light" disabled={!dirty || save.isPending} onClick={() => save.mutate(draft)} title="Save draft (Ctrl+S)"><i className="ri-save-3-line me-1" />Save</button>
            </Guard>
            {w.status === 'active' && <Guard permission="automations.publish"><button type="button" className="btn btn-sm btn-light text-warning" disabled={pause.isPending} onClick={() => pause.mutate(undefined)}><i className="ri-pause-line me-1" />Pause</button></Guard>}
            {w.status === 'paused' && !unpublished && <Guard permission="automations.publish"><button type="button" className="btn btn-sm btn-success" disabled={resume.isPending} onClick={() => resume.mutate(undefined)}><i className="ri-play-line me-1" />Resume</button></Guard>}
            {(unpublished || w.status === 'draft') && (
              <Guard permission="automations.publish">
                <button type="button" className="btn btn-sm btn-primary" disabled={publish.isPending} onClick={openPublish}>
                  <i className="ri-rocket-2-line me-1" />Publish{w.version ? ` v${w.version + 1}` : ''}
                </button>
              </Guard>
            )}
          </div>
        </div>

        <div className="wf-toolbar-row wf-toolbar-sub">
          <div className="wf-view-tabs" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'runs'} className={`btn${view === 'runs' ? ' active' : ''}`} onClick={() => setView('runs')}>
              <i className="ri-pulse-line me-1" />Runs{s && s.running + s.waiting > 0 && <span className="badge rounded-pill bg-info ms-1">{s.running + s.waiting}</span>}
            </button>
            <button type="button" role="tab" aria-selected={view === 'builder'} className={`btn${view === 'builder' ? ' active' : ''}`} onClick={() => setView('builder')}><i className="ri-git-branch-line me-1" />Builder</button>
            <button type="button" role="tab" aria-selected={view === 'versions'} className={`btn${view === 'versions' ? ' active' : ''}`} onClick={() => setView('versions')}><i className="ri-git-commit-line me-1" />Versions</button>
          </div>
          {view === 'builder' && (
            <div className="btn-group btn-group-sm" role="group" aria-label="History">
              <button type="button" className="btn btn-light btn-icon" disabled={!history.canUndo} onClick={history.undo} title="Undo (Ctrl+Z)" aria-label="Undo"><i className="ri-arrow-go-back-line" /></button>
              <button type="button" className="btn btn-light btn-icon" disabled={!history.canRedo} onClick={history.redo} title="Redo (Ctrl+Y)" aria-label="Redo"><i className="ri-arrow-go-forward-line" /></button>
            </div>
          )}
          {view === 'builder' && (
            <div className="btn-group btn-group-sm wf-panel-toggles" role="group" aria-label="Panels">
              <button type="button" className="btn btn-light" aria-pressed={panels.library} onClick={() => togglePanel('library')} title="Show or hide the step library">
                <i className="ri-layout-left-2-line" /><span className="d-none d-lg-inline">Steps</span>
              </button>
              <button type="button" className="btn btn-light" aria-pressed={panels.inspector} onClick={() => togglePanel('inspector')} title="Show or hide the details panel">
                <i className="ri-layout-right-2-line" /><span className="d-none d-lg-inline">Details</span>
              </button>
            </div>
          )}
          <span className="text-muted fs-xs d-none d-xxl-inline ms-1">{countSteps(draft.steps)} steps{channelsOf(draft.steps).length ? ` · ${channelsOf(draft.steps).length} channels` : ''}</span>
          <div className="wf-toolbar-actions">
            {issues.length > 0 && (
              <Dropdown
                label={<><i className="ri-error-warning-line me-1" />{issues.length} to fix</>}
                buttonClassName="btn btn-sm btn-warning-subtle wf-issues-btn"
                items={issues.map((issue, i) => ({ key: String(i), label: issue.message, icon: 'ri-arrow-right-line', onSelect: () => focusTarget(issue.target) }))}
              />
            )}
            {view === 'builder' && (
              <button type="button" className="btn btn-sm btn-light btn-icon" onClick={() => setFinding(true)} title="Find a step (Ctrl+F)" aria-label="Find a step"><i className="ri-search-line" /></button>
            )}
            <Dropdown
              label={<i className="ri-more-2-fill" />}
              ariaLabel="More actions"
              buttonClassName="btn btn-sm btn-light btn-icon"
              items={[
                { key: 'autosave', label: autoSave ? 'Auto-save draft: on' : 'Auto-save draft: off', icon: autoSave ? 'ri-toggle-fill' : 'ri-toggle-line', onSelect: () => setAutoSave((a) => { localStorage.setItem(AUTOSAVE_KEY, String(!a)); return !a }) },
                { key: 'paste', label: 'Paste step', icon: 'ri-clipboard-line', onSelect: pasteStep },
                'divider',
                { key: 'export', label: 'Export as JSON', icon: 'ri-download-2-line', onSelect: exportJson },
                { key: 'import', label: 'Import JSON into draft…', icon: 'ri-upload-2-line', onSelect: () => importInput.current?.click() },
                { key: 'dup', label: 'Duplicate workflow', icon: 'ri-file-copy-2-line', onSelect: () => duplicateWorkflow.mutate(undefined) },
                'divider',
                { key: 'keys', label: 'Keyboard shortcuts', icon: 'ri-keyboard-line', onSelect: () => setShowShortcuts(true) },
              ]}
            />
          </div>
          <input ref={importInput} type="file" accept="application/json,.json" className="d-none" onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      </header>

      {view === 'builder' && w.status === 'paused' && <div className="wf-banner warn"><i className="ri-pause-circle-line" /> Paused: nobody new enters and waiting contacts hold their place. Resume to continue.</div>}
      {view === 'builder' && testRun && (
        <div className="wf-banner trace">
          <i className="ri-flask-line" /> Showing the test run for <strong>{testRun.contactName}</strong>: <StatusBadge status={testRun.status} />
          <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => setTesting(true)}>Open log</button>
          <button type="button" className="btn btn-link btn-sm p-0 ms-auto" onClick={() => setTestRun(null)}>Clear</button>
        </div>
      )}

      {view === 'runs' && (
        <div className="wf-executions">
          {s && (
            <div className="row g-3 mb-3">
              {[['Running', s.running, 'primary', 'ri-loader-4-line'], ['Waiting', s.waiting, 'info', 'ri-time-line'], ['Finished', s.completed, 'success', 'ri-checkbox-circle-line'], ['Failed', s.failed, 'danger', 'ri-error-warning-line']].map(([label, n, tone, icon]) => (
                <div key={label as string} className="col-6 col-lg-3">
                  <div className="card m-0"><div className="card-body py-3 d-flex align-items-center gap-3">
                    <span className={`icon-tile icon-tile-sm bg-${tone}-subtle text-${tone}`}><i className={icon as string} /></span>
                    <div><div className="fs-5 fw-semibold tabular-nums">{n as number}</div><div className="text-muted fs-sm">{label}</div></div>
                  </div></div>
                </div>
              ))}
            </div>
          )}
          <RunsTable workflowId={w.id} onStepClick={focusTarget} />
        </div>
      )}

      {view === 'versions' && (
        <div className="wf-executions">
          <VersionsPanel workflow={w} draftDiffers={unpublished && w.version > 0} busy={restore.isPending} onPreview={setPreview} onRestore={setRestoring} />
        </div>
      )}

      {view === 'builder' && (
        <div className={`wf-body${panels.library ? '' : ' no-library'}${panels.inspector ? '' : ' no-inspector'}`}>
          {!panels.library && !panels.inspector && (
            <div className="wf-focus-pill">
              <i className="ri-fullscreen-line" /> Canvas only
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setPanels({ library: true, inspector: true })}>Show panels</button>
            </div>
          )}
          <aside className="wf-panel wf-panel-left" aria-label="Steps" hidden={!panels.library}>
            <div className="wf-panel-title">Add steps</div>
            <p className="text-muted fs-xs mb-3">Drag onto the flow, or click to add after the selected step.</p>
            <StepLibrary
              onPick={(type) => insert(insertionPoint(draft.steps, selected), type)}
              onDragChange={setDragging}
              trigger={draft.trigger.type}
              onPickTrigger={(type) => {
                if (type && type !== draft.trigger.type) edit({ trigger: { type, config: defaultTriggerConfig(type) } })
                setSelected('trigger')
                setPickNonce((n) => (type ? 0 : n + 1))
              }}
            />
          </aside>
          <main className="wf-main">
            {w.version > 0 && (
              <div className="flow-overlay-toggle">
                <label className="d-inline-flex align-items-center gap-2 fs-xs mb-0">
                  <input type="checkbox" className="form-check-input m-0" checked={showLive} onChange={(e) => setShowLive(e.target.checked)} />
                  Live counts
                </label>
              </div>
            )}
            <FlowCanvas
              workflow={draft}
              selectedId={selected}
              issueTargets={issueTargets}
              triggerSummary={triggerSummary}
              dragActive={dragging}
              onSelect={selectStep}
              onInsert={insert}
              onMove={(id, dir) => setSteps((list) => moveStep(list, id, dir))}
              onDuplicate={duplicate}
              onDelete={remove}
              onAddPath={addPath}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              onCopy={copyStep}
              overlay={showLive && !trace ? s : undefined}
              trace={trace}
            />
          </main>
          <aside className="wf-panel wf-panel-right" aria-label="Inspector" hidden={!panels.inspector}>
            <StepInspector
              key={`${selected ?? 'settings'}-${selected === 'trigger' ? pickNonce : 0}`}
              startPicking={selected === 'trigger' && pickNonce > 0}
              workflowId={w.id}
              draft={draft}
              selectedId={selected}
              step={step}
              issues={issues}
              stats={w.stats}
              onChange={edit}
              variableOptions={variableOptions}
              onStepPatch={(id, patch) => setSteps((list) => updateStep(list, id, patch))}
              onDeleteStep={remove}
              onSelectIssue={focusTarget}
              runStats={w.version ? s : undefined}
              onViewRuns={() => setView('runs')}
            />
          </aside>
        </div>
      )}

      <Modal open={quickAdd !== null} onClose={() => setQuickAdd(null)} title="Add a step" size="lg">
        <StepLibrary variant="grid" autoFocus onPick={(type) => quickAdd && insert(quickAdd, type)} onDragChange={() => undefined} />
      </Modal>

      <FindStepModal open={finding} steps={draft.steps} onClose={() => setFinding(false)} onPick={(id) => { setFinding(false); focusTarget(id) }} />

      <Modal open={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard shortcuts" size="sm">
        <dl className="shortcut-list mb-0">
          {SHORTCUTS.map(([keys, what]) => (
            <div key={keys}>
              <dt>{keys.split(' / ').map((k, i) => <span key={k}>{i > 0 && ' / '}{k.split(' + ').map((part, j) => <span key={part}>{j > 0 && '+'}<kbd className="kbd">{part}</kbd></span>)}</span>)}</dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      </Modal>

      <PublishModal open={publishing} workflow={w} draft={draft} issues={issues} busy={publish.isPending} onClose={() => setPublishing(false)} onPublish={(note) => publish.mutate(note)} onFixIssue={(t) => { setPublishing(false); focusTarget(t) }} />
      <TestRunModal open={testing} workflowId={w.id} draft={draft} onClose={() => setTesting(false)} onResult={setTestRun} onStepClick={focusTarget} />

      <Modal open={previewVersion !== undefined} onClose={() => setPreview(null)} size="lg" title={previewVersion ? `Version ${previewVersion.version} · ${previewVersion.note}` : ''}
        footer={previewVersion && <><button type="button" className="btn btn-light" onClick={() => setPreview(null)}>Close</button><button type="button" className="btn btn-primary" onClick={() => { setRestoring(previewVersion.version); setPreview(null) }}>Restore to draft</button></>}>
        {previewVersion && (
          <div className="version-preview">
            <FlowCanvas
              workflow={previewVersion.definition}
              selectedId={null}
              issueTargets={new Set()}
              triggerSummary={TRIGGERS[previewVersion.definition.trigger.type].description}
              dragActive={false}
              onSelect={() => undefined}
              onInsert={() => undefined}
              onMove={() => undefined}
              onDuplicate={() => undefined}
              onDelete={() => undefined}
              onAddPath={() => undefined}
              readOnly
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={restoring !== null}
        title={`Restore version ${restoring} to the draft?`}
        message={dirty || unpublished ? 'Your current draft changes are replaced. The live version keeps running until you publish.' : 'The draft is replaced with this version. The live version keeps running until you publish.'}
        confirmLabel="Restore"
        busy={restore.isPending}
        onClose={() => setRestoring(null)}
        onConfirm={() => restoring !== null && restore.mutate(restoring)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message="Your unsaved changes to this automation will be lost."
        confirmLabel="Leave"
        danger
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  )
}

/**
 * The builder is a full-width workspace: collapse the app sidebar to its icon rail
 * while it is open (desktop only) and restore the previous size on leave.
 * The stored preference is not touched, and the sidebar toggle still works.
 */
function useFocusedWorkspace() {
  useEffect(() => {
    const html = document.documentElement
    if (window.innerWidth < 1200) return
    const previous = html.getAttribute('data-sidebar')
    if (previous && previous !== 'large') return
    html.setAttribute('data-sidebar', 'small')
    return () => {
      if (html.getAttribute('data-sidebar') === 'small') {
        if (previous) html.setAttribute('data-sidebar', previous)
        else html.removeAttribute('data-sidebar')
      }
    }
  }, [])
}

export function AutomationBuilderPage() {
  const { id } = useParams<{ id: string }>()
  useFocusedWorkspace()
  const workflow = useOne('workflows', workflowsApi.get, id)
  if (workflow.isError) return <QueryError message={errorMessage(workflow.error)} onRetry={() => workflow.refetch()} />
  if (!workflow.data) return <SkeletonLines lines={10} />
  // Keyed by id: switching workflows starts a fresh editor and history.
  return <Builder key={workflow.data.id} workflow={workflow.data} />
}
