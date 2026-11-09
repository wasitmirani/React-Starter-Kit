import type { Contact, SegmentRule, SegmentRuleGroup } from '@/types/crm.types'

/** Reads `country`, `consents.email`, `attributes.plan`… from a contact. */
function read(contact: Contact, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown> | null)?.[key], contact)
}

function test(contact: Contact, rule: SegmentRule): boolean {
  const value = read(contact, rule.field)
  const text = Array.isArray(value) ? value.join(',') : String(value ?? '')
  const expected = rule.value.trim()
  switch (rule.operator) {
    case 'equals':
      return text.toLowerCase() === expected.toLowerCase()
    case 'not_equals':
      return text.toLowerCase() !== expected.toLowerCase()
    case 'contains':
      return text.toLowerCase().includes(expected.toLowerCase())
    case 'not_contains':
      return !text.toLowerCase().includes(expected.toLowerCase())
    case 'is_set':
      return value !== null && value !== undefined && text !== ''
    case 'is_not_set':
      return value === null || value === undefined || text === ''
    case 'greater_than':
      return Number(value) > Number(expected)
    case 'less_than':
      return Number(value) < Number(expected)
    case 'in_list':
      return expected.split(',').map((s) => s.trim().toLowerCase()).includes(text.toLowerCase())
    case 'not_in_list':
      return !expected.split(',').map((s) => s.trim().toLowerCase()).includes(text.toLowerCase())
    case 'has_tag':
      return Array.isArray(value) && value.includes(expected)
    case 'within_days':
      return typeof value === 'string' && Date.now() - Date.parse(value) <= Number(expected) * 86_400_000
    default:
      return false
  }
}

/** Empty groups match everyone, like an unfiltered audience. */
export function matchesSegment(contact: Contact, group: SegmentRuleGroup): boolean {
  const rules = group.rules.filter((r) => r.field)
  if (rules.length === 0) return true
  return group.match === 'all' ? rules.every((r) => test(contact, r)) : rules.some((r) => test(contact, r))
}
