import { SEGMENT_FIELDS, SEGMENT_OPERATORS } from '@/constants/crm.constants'
import type { Segment } from '@/types/crm.types'

/** "Country is any of UK, Germany and Stage is lead" */
export function describeRules(segment: Pick<Segment, 'rules'>): string {
  const joiner = segment.rules.match === 'all' ? ' and ' : ' or '
  return (
    segment.rules.rules
      .map((r) => {
        const field = SEGMENT_FIELDS.find((f) => f.value === r.field)?.label ?? r.field.replace('attributes.', '')
        const op = SEGMENT_OPERATORS.find((o) => o.value === r.operator)
        return `${field} ${op?.label.replace(' (comma separated)', '') ?? r.operator}${op?.needsValue ? ` ${r.value}` : ''}`
      })
      .join(joiner) || 'All contacts'
  )
}
