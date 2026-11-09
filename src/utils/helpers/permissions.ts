import { CATEGORY_ORDER } from '@/constants/permissions.constants'
import type { Permission } from '@/types/workspace.types'

/** Permissions grouped by catalogue category, in the product's order. */
export function groupPermissions(permissions: Permission[]): [string, Permission[]][] {
  const by = new Map<string, Permission[]>()
  for (const p of permissions) by.set(p.category, [...(by.get(p.category) ?? []), p])
  return [...by.entries()].sort(([a], [b]) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99))
}

/** full = every permission of the area, some = at least one, none = no access. */
export function areaAccess(granted: Set<string>, items: Permission[]): 'full' | 'some' | 'none' {
  const n = items.filter((p) => granted.has(p.key)).length
  return n === 0 ? 'none' : n === items.length ? 'full' : 'some'
}
