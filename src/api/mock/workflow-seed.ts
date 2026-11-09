import type { Workflow, WorkflowDefinition, WorkflowExecution, WorkflowVersion } from '@/types/automation.types'
import type { Contact } from '@/types/crm.types'
import { defaultSettings } from '@/utils/helpers/workflow'
import { createFaker, TEAM } from './faker'
import { execute } from './workflow-engine'

const NOTES = ['First version', 'Tightened the audience', 'Added a follow-up path', 'Updated templates', 'Fixed the delay before the reminder', 'Changed branch conditions']

export const definitionOf = (w: Pick<Workflow, 'trigger' | 'steps' | 'variables' | 'allowReentry'> & { settings?: Workflow['settings'] }): WorkflowDefinition =>
  structuredClone({ trigger: w.trigger, steps: w.steps, variables: w.variables ?? [], allowReentry: w.allowReentry, settings: { ...defaultSettings(), ...w.settings } })

/** Adds a published history to seeded workflows. One workflow keeps an unpublished draft change to show the state. */
export function withVersions(workflows: Workflow[]): Workflow[] {
  const f = createFaker(41)
  return workflows.map((w, wi) => {
    if (w.status === 'draft') return { ...w, version: 0, versions: [] }
    const created = Date.parse(w.createdAt)
    const versions: WorkflowVersion[] = Array.from({ length: Math.max(1, w.version) }, (_, i) => ({
      version: i + 1,
      publishedAt: new Date(created + (i + 1) * 4 * 86_400_000).toISOString(),
      publishedBy: f.pick(TEAM),
      note: i === 0 ? NOTES[0] : NOTES[1 + ((i + wi) % (NOTES.length - 1))],
      definition: definitionOf(w),
    }))
    // Welcome series: the draft has one extra step that is not live yet.
    const steps =
      wi === 0
        ? [{ id: 's0', type: 'add_tag' as const, config: { tag: 'welcome-series' } }, ...w.steps]
        : w.steps
    return { ...w, steps, versions }
  })
}

/** Realistic runs: each one is produced by executing the live version for a seeded contact. */
export function seedRuns(workflows: Workflow[], contacts: Contact[]): WorkflowExecution[] {
  const f = createFaker(42)
  const now = Date.now()
  const runs: WorkflowExecution[] = []
  const counts = [34, 26, 16, 12]
  workflows.forEach((w, wi) => {
    const live = w.versions[w.versions.length - 1]
    if (!live) return
    const n = counts[wi] ?? 8
    for (let i = 0; i < n; i++) {
      const contact = contacts[(wi * 53 + i * 17) % contacts.length]
      const liveSoon = w.status === 'active' && i < 3
      let start = now - f.rand() * 6 * 86_400_000
      if (liveSoon) {
        // Time the start so the first wait ends 20–90 s from now: visible live progress.
        const probe = execute(live.definition, { variables: {}, pathChoices: {}, log: [] }, contact, { test: false, now: 0 })
        if (probe.status === 'waiting' && probe.resumeAt) start = now - Date.parse(probe.resumeAt) + 20_000 + i * 30_000
      }
      let state = execute(live.definition, { variables: {}, pathChoices: {}, log: [] }, contact, { test: false, now: start })
      // Advance through waits that have already elapsed.
      while (state.status === 'waiting' && state.resumeAt && Date.parse(state.resumeAt) <= now && w.status === 'active') {
        state = execute(live.definition, state, contact, { test: false, now: Date.parse(state.resumeAt), resume: { stepId: state.currentStepId!, inclusive: state.resumeMode === 'at' } })
      }
      const at = new Date(start).toISOString()
      runs.push({
        id: `run-${wi + 1}-${String(i + 1).padStart(3, '0')}`,
        workflowId: w.id,
        version: live.version,
        contactId: contact.id,
        contactName: `${contact.firstName} ${contact.lastName}`,
        startedAt: at,
        test: false,
        createdAt: at,
        updatedAt: state.finishedAt ?? at,
        ...state,
      })
    }
  })
  return runs
}

