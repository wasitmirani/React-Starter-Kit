import { STEP_TYPES } from '@/constants/automation.constants'
import type { WorkflowStep } from '@/types/automation.types'
import { flattenSteps } from '@/utils/helpers/workflow'

/** A compact icon preview of a workflow's steps, for lists and cards. */
export function StepChain({ steps, max = 8 }: { steps: WorkflowStep[]; max?: number }) {
  const all = flattenSteps(steps)
  if (!all.length) return <span className="text-muted fs-xs">No steps yet</span>
  const shown = all.slice(0, max)
  return (
    <span className="step-chain" aria-label={`${all.length} steps: ${all.map((s) => STEP_TYPES[s.type].label).join(', ')}`}>
      {shown.map((s) => {
        const meta = STEP_TYPES[s.type]
        return <i key={s.id} className={`${meta.icon} tone-${meta.tone}`} title={s.name?.trim() || meta.label} aria-hidden />
      })}
      {all.length > max && <span className="more">+{all.length - max}</span>}
    </span>
  )
}
