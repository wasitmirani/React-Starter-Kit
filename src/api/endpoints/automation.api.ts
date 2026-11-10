import { AppError } from '@/api/errors'
import { latency, paginate } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { execute, setConnectionCheck } from '@/api/mock/workflow-engine'
import { definitionOf } from '@/api/mock/workflow-seed'
import { callFor, createResourceApi, http, toParams } from '@/api/resource'
import { STEP_TYPES, TRIGGERS } from '@/constants/automation.constants'
import { useAuthStore } from '@/store/auth.store'
import type { StepType, Workflow, WorkflowExecution, WorkflowRunStats } from '@/types/automation.types'
import type { ListQuery, Page } from '@/types/common.types'
import { defaultSettings, flattenPayload, normalizeSteps, parseSample, validateWorkflow } from '@/utils/helpers/workflow'

const call = callFor('automation')

type Legacy = Parameters<typeof normalizeSteps>[0]

/** Rows stored before variables, paths and versions existed are upgraded on read. */
const upgrade = (w: Workflow): Workflow => ({
  ...w,
  variables: w.variables ?? [],
  versions: w.versions ?? [],
  settings: { ...defaultSettings(), ...w.settings },
  steps: normalizeSteps(w.steps as Legacy),
})

const workflows = createResourceApi('/workflows', db.workflows, { decorate: upgrade })

export type WorkflowDraft = Pick<Workflow, 'name' | 'description' | 'trigger' | 'steps' | 'variables' | 'allowReentry' | 'settings'>

export interface WorkflowOverview extends WorkflowRunStats {
  lastRunAt: string | null
  /** Runs started per day, oldest first (last 14 days). */
  daily: number[]
  /** Finished runs that did not fail, or null before any finished. */
  successRate: number | null
}

export interface WebhookTestResult {
  status: number
  requestId: string
  receivedAt: string
  /** Value of the contact field in the body. */
  identifier: string
  contact: { id: string; name: string } | null
  /** No contact matched and the trigger creates one. */
  wouldCreate: boolean
  /** The workflow is live, so a real request would enrol the contact. */
  live: boolean
  fields: number
}

export interface WebhookRequest {
  id: string
  receivedAt: string
  status: number
  contactName: string | null
  runId: string
}

export interface RunQuery extends ListQuery {
  /** Undefined = all workflows. */
  workflowId?: string
}

const issueMeta = {
  triggerField: (t: Workflow['trigger']['type']) => TRIGGERS[t].field,
  stepFields: (t: StepType) => STEP_TYPES[t].fields,
  stepLabel: (t: StepType) => STEP_TYPES[t].label,
}

const actor = () => useAuthStore.getState().user?.name ?? 'You'

// Integration steps fail in the mock engine when their app is not connected.
setConnectionCheck((app) => db.integrations.rows().some((i) => i.app === app && i.status === 'connected'))

/**
 * Mock scheduler tick: resumes waiting runs whose time has come, exactly as the
 * backend's durable-delay poller would. Paused workflows hold their runs.
 */
function tick() {
  const now = Date.now()
  const contacts = new Map(db.contacts.rows().map((c) => [c.id, c]))
  const wfs = new Map(db.workflows.rows().map((w) => [w.id, w]))
  let changed = false
  const rows = db.executions.rows().map((run) => {
    if (run.status !== 'waiting' || run.test || !run.resumeAt || Date.parse(run.resumeAt) > now) return run
    const wf = wfs.get(run.workflowId)
    const def = wf?.versions?.find((v) => v.version === run.version)?.definition
    if (!wf || wf.status !== 'active' || !def) return run
    const contact = contacts.get(run.contactId ?? '') ?? null
    // `at` = the step itself must run again (a send window opened); `after` = a finished wait.
    const resumeOf = (r: Pick<WorkflowExecution, 'currentStepId' | 'resumeMode'>) => ({ stepId: r.currentStepId!, inclusive: r.resumeMode === 'at' })
    let state = execute(def, run, contact, { test: false, now: Date.parse(run.resumeAt), resume: resumeOf(run) })
    while (state.status === 'waiting' && state.resumeAt && Date.parse(state.resumeAt) <= now) {
      state = execute(def, state, contact, { test: false, now: Date.parse(state.resumeAt), resume: resumeOf(state) })
    }
    changed = true
    return { ...run, ...state, updatedAt: new Date().toISOString() }
  })
  if (changed) db.executions.replaceAll(rows)
}

function queryRuns(q: RunQuery) {
  tick()
  const { test, ...filters } = q.filters ?? {}
  let rows = db.executions.query({ ...q, sort: 'startedAt', order: 'desc', filters: { ...filters, workflowId: q.workflowId } })
  if (test === 'only') rows = rows.filter((r) => r.test)
  else if (test !== 'include') rows = rows.filter((r) => !r.test)
  return rows
}

function stats(workflowId: string): WorkflowRunStats {
  const runs = db.executions.rows().filter((r) => r.workflowId === workflowId && !r.test)
  const onStep: Record<string, number> = {}
  const passed: Record<string, number> = {}
  const failedAt: Record<string, number> = {}
  for (const r of runs) {
    if ((r.status === 'waiting' || r.status === 'running') && r.currentStepId) onStep[r.currentStepId] = (onStep[r.currentStepId] ?? 0) + 1
    if (r.status === 'failed' && r.currentStepId) failedAt[r.currentStepId] = (failedAt[r.currentStepId] ?? 0) + 1
    for (const id of new Set(r.log.filter((l) => l.status !== 'waiting').map((l) => l.stepId))) passed[id] = (passed[id] ?? 0) + 1
  }
  const count = (s: WorkflowExecution['status']) => runs.filter((r) => r.status === s).length
  return { running: count('running'), waiting: count('waiting'), completed: count('completed') + count('goal_reached') + count('exited'), failed: count('failed'), onStep, passed, failedAt }
}

export const workflowsApi = {
  ...workflows,

  /** Saves the draft only. Nothing changes for contacts until you publish. */
  save: (id: string, patch: WorkflowDraft) =>
    call<Workflow>(async () => upgrade(await db.workflows.update(id, patch)), () => http.put(`/workflows/${id}`, patch)),

  /**
   * Publishes the draft as the next immutable version and makes it live.
   * New enrolments use it; contacts already in a run finish on their version.
   */
  publish: (id: string, note: string) =>
    call<Workflow>(
      async () => {
        await latency(300, 600)
        const w = upgrade(db.workflows.find(id))
        const issues = validateWorkflow(w, issueMeta)
        if (issues.length) throw new AppError(422, 'WORKFLOW_INVALID', `Fix ${issues.length} issue(s) before publishing: ${issues[0].message}`)
        const version = w.version + 1
        return upgrade(
          await db.workflows.update(id, {
            status: 'active',
            version,
            versions: [...w.versions, { version, publishedAt: new Date().toISOString(), publishedBy: actor(), note: note.trim() || `Version ${version}`, definition: definitionOf(w) }],
          }),
        )
      },
      () => http.post(`/workflows/${id}/publish`, { note }),
    ),

  pause: (id: string) => call(async () => upgrade(await db.workflows.update(id, { status: 'paused' })), () => http.post<Workflow>(`/workflows/${id}/pause`)),

  resume: (id: string) =>
    call(
      async () => {
        const w = db.workflows.find(id)
        if (!w.version) throw new AppError(409, 'NOT_PUBLISHED', 'Publish the workflow before resuming it.')
        return upgrade(await db.workflows.update(id, { status: 'active' }))
      },
      () => http.post<Workflow>(`/workflows/${id}/resume`),
    ),

  /** Copies a published version into the draft (the live version is untouched until you publish). */
  restoreVersion: (id: string, version: number) =>
    call<Workflow>(
      async () => {
        const w = upgrade(db.workflows.find(id))
        const v = w.versions.find((x) => x.version === version)
        if (!v) throw new AppError(404, 'NOT_FOUND', 'Version not found')
        return upgrade(await db.workflows.update(id, structuredClone(v.definition)))
      },
      () => http.post(`/workflows/${id}/versions/${version}/restore`),
    ),

  runs: (q: RunQuery = {}) =>
    call<Page<WorkflowExecution>>(
      async () => {
        await latency(80, 200)
        return paginate(queryRuns(q), q.page, q.perPage)
      },
      () => http.get(q.workflowId ? `/workflows/${q.workflowId}/runs` : '/workflow-runs', toParams(q)),
    ),

  run: (runId: string) =>
    call<WorkflowExecution>(
      async () => {
        await latency(60, 150)
        tick()
        return db.executions.find(runId)
      },
      () => http.get(`/workflow-runs/${runId}`),
    ),

  runStats: (workflowId: string) =>
    call<WorkflowRunStats>(
      async () => {
        await latency(60, 150)
        tick()
        return stats(workflowId)
      },
      () => http.get(`/workflows/${workflowId}/run-stats`),
    ),

  /** Run counts for every workflow, for the overview page. */
  overview: () =>
    call<Record<string, WorkflowOverview>>(
      async () => {
        await latency(80, 200)
        tick()
        const out: Record<string, WorkflowOverview> = {}
        const dayMs = 86_400_000
        const today = Math.floor(Date.now() / dayMs)
        for (const w of db.workflows.rows()) {
          const runs = db.executions.rows().filter((r) => r.workflowId === w.id && !r.test)
          const last = [...runs].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
          const daily = Array.from({ length: 14 }, () => 0)
          for (const r of runs) {
            const ago = today - Math.floor(Date.parse(r.startedAt) / dayMs)
            if (ago >= 0 && ago < 14) daily[13 - ago]++
          }
          const s = stats(w.id)
          const finished = s.completed + s.failed
          out[w.id] = { ...s, lastRunAt: last?.startedAt ?? null, daily, successRate: finished ? s.completed / finished : null }
        }
        return out
      },
      () => http.get('/workflows/run-overview'),
    ),

  /**
   * Sends the sample body to the workflow's incoming-webhook URL as a test:
   * checks the payload, finds the contact it identifies and reports what would happen.
   */
  testWebhook: (workflowId: string, config: Record<string, string>) =>
    call<WebhookTestResult>(
      async () => {
        await latency(350, 700)
        const w = db.workflows.find(workflowId)
        const body = parseSample(config.samplePayload)
        if (body.error || !body.value) throw new AppError(400, 'INVALID_BODY', body.error ?? 'Send a JSON object in the request body.')
        const fields = Object.fromEntries(flattenPayload(body.value))
        const identifier = (fields[config.contactPath ?? ''] ?? '').trim()
        if (!identifier) throw new AppError(422, 'CONTACT_FIELD_MISSING', `The body has no “${config.contactPath}” field to identify the contact.`)
        const by = config.matchBy ?? 'email'
        const contact = db.contacts.rows().find((c) => (by === 'phone' ? c.phone === identifier : by === 'id' ? c.id === identifier : c.email?.toLowerCase() === identifier.toLowerCase()))
        return {
          status: 202,
          requestId: `req_${crypto.randomUUID().slice(0, 12)}`,
          receivedAt: new Date().toISOString(),
          identifier,
          contact: contact ? { id: contact.id, name: `${contact.firstName} ${contact.lastName}` } : null,
          wouldCreate: !contact && config.createContact === 'true',
          live: w.status === 'active',
          fields: Object.keys(fields).length,
        }
      },
      () => http.post(`/workflows/${workflowId}/webhook/test`, { config }),
    ),

  /** Latest requests received on the workflow's incoming webhook (live runs only). */
  webhookRequests: (workflowId: string) =>
    call<WebhookRequest[]>(
      async () => {
        await latency(80, 200)
        return db.executions
          .rows()
          .filter((r) => r.workflowId === workflowId && !r.test)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
          .slice(0, 8)
          .map((r) => ({ id: `req_${r.id.replace(/-/g, '').slice(0, 12)}`, receivedAt: r.startedAt, status: 202, contactName: r.contactName, runId: r.id }))
      },
      () => http.get(`/workflows/${workflowId}/webhook/requests`),
    ),

  /** Runs the current draft for one contact: full log, nothing sent, waits skipped. */
  testRun: (workflowId: string, contactId: string, draft: WorkflowDraft) =>
    call<WorkflowExecution>(
      async () => {
        await latency(400, 800)
        const contact = db.contacts.find(contactId)
        const w = db.workflows.find(workflowId)
        const state = execute(definitionOf(draft), { variables: {}, pathChoices: {}, log: [] }, contact, { test: true, now: Date.now() })
        return db.executions.create({
          workflowId,
          version: w.version,
          contactId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          startedAt: new Date().toISOString(),
          test: true,
          ...state,
        })
      },
      () => http.post(`/workflows/${workflowId}/test-runs`, { contactId, draft }),
    ),

  /** Re-runs a failed run from the step that failed. */
  retryRun: (runId: string) =>
    call<WorkflowExecution>(
      async () => {
        await latency(300, 600)
        const run = db.executions.find(runId)
        if (run.status !== 'failed' || !run.currentStepId) throw new AppError(409, 'INVALID_STATE', 'Only failed runs can be retried.')
        const def = db.workflows.find(run.workflowId).versions?.find((v) => v.version === run.version)?.definition
        if (!def) throw new AppError(409, 'VERSION_MISSING', 'The version this run used no longer exists.')
        const attempt = run.log.filter((l) => l.message.startsWith('Retrying')).length + 2
        const contact = run.contactId ? db.contacts.rows().find((c) => c.id === run.contactId) ?? null : null
        const state = execute(def, run, contact, { test: run.test, now: Date.now(), resume: { stepId: run.currentStepId, inclusive: true } }, attempt)
        return db.executions.update(runId, state)
      },
      () => http.post(`/workflow-runs/${runId}/retry`),
    ),

  cancelRun: (runId: string) =>
    call<WorkflowExecution>(
      async () => {
        const run = db.executions.find(runId)
        if (!['running', 'waiting'].includes(run.status)) throw new AppError(409, 'INVALID_STATE', 'This run has already finished.')
        const at = new Date().toISOString()
        return db.executions.update(runId, {
          status: 'cancelled',
          finishedAt: at,
          resumeAt: null,
          log: [...run.log, { id: crypto.randomUUID(), stepId: 'system', stepType: 'system', label: 'Cancelled', status: 'info', at, durationMs: 0, message: `Cancelled by ${actor()}` }],
        })
      },
      () => http.post(`/workflow-runs/${runId}/cancel`),
    ),
}
