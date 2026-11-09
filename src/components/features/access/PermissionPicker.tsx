import { useMemo, useState } from 'react'
import { PERMISSION_CATEGORIES, SENSITIVE_PERMISSIONS } from '@/constants/permissions.constants'
import { groupPermissions } from '@/utils/helpers/permissions'
import { useAuth } from '@/hooks/useAuth'
import type { Permission } from '@/types/workspace.types'

interface PermissionPickerProps {
  permissions: Permission[]
  value: string[]
  onChange: (value: string[]) => void
  idPrefix: string
}

/**
 * Grouped permission editor: one card per area with "select all", a search, and
 * sensitive actions flagged. Permissions the current user does not hold are locked:
 * the API rejects granting them (PERMISSION_ESCALATION).
 */
export function PermissionPicker({ permissions, value, onChange, idPrefix }: PermissionPickerProps) {
  const { can } = useAuth()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const groups = useMemo(
    () => groupPermissions(permissions).map(([cat, items]) => [cat, items.filter((p) => !term || `${p.key} ${p.description} ${cat}`.toLowerCase().includes(term))] as const).filter(([, items]) => items.length),
    [permissions, term],
  )
  const set = new Set(value)
  const toggle = (key: string, on: boolean) => onChange(on ? [...new Set([...value, key])] : value.filter((k) => k !== key))
  const toggleAll = (items: Permission[], on: boolean) => {
    const grantable = items.filter((p) => can(p.key)).map((p) => p.key)
    onChange(on ? [...new Set([...value, ...grantable])] : value.filter((k) => !grantable.includes(k)))
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="position-relative flex-1" style={{ minWidth: 220 }}>
          <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input className="form-control form-control-sm ps-9" placeholder="Search permissions…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search permissions" />
        </div>
        <span className="text-muted fs-sm tabular-nums">{value.length} of {permissions.length} selected</span>
        <button type="button" className="btn btn-sm btn-light" onClick={() => onChange(permissions.filter((p) => can(p.key)).map((p) => p.key))}>Select all</button>
        <button type="button" className="btn btn-sm btn-light" onClick={() => onChange([])} disabled={!value.length}>Clear</button>
      </div>
      <div className="perm-groups">
        {groups.map(([cat, items]) => {
          const meta = PERMISSION_CATEGORIES[cat] ?? { label: cat, icon: 'ri-folder-line', description: '' }
          const on = items.filter((p) => set.has(p.key)).length
          const allOn = on === items.length
          return (
            <section key={cat} className={`perm-group${on ? ' active' : ''}`}>
              <header>
                <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={meta.icon} /></span>
                <div className="min-w-0 flex-1">
                  <strong>{meta.label}</strong>
                  <span className="d-block text-muted fs-xs text-truncate">{meta.description}</span>
                </div>
                <span className={`perm-count${allOn ? ' full' : on ? ' some' : ''}`}>{on}/{items.length}</span>
                <input type="checkbox" className="form-check-input m-0" checked={allOn} ref={(el) => { if (el) el.indeterminate = on > 0 && !allOn }} onChange={(e) => toggleAll(items, e.target.checked)} aria-label={`All ${meta.label} permissions`} />
              </header>
              <ul>
                {items.map((p) => {
                  const id = `${idPrefix}-${p.key}`
                  const grantable = can(p.key)
                  return (
                    <li key={p.key} className={grantable ? '' : 'locked'} title={grantable ? undefined : 'You do not hold this permission, so you cannot grant it'}>
                      <input id={id} type="checkbox" className="form-check-input m-0" checked={set.has(p.key)} disabled={!grantable} onChange={(e) => toggle(p.key, e.target.checked)} />
                      <label htmlFor={id} className="min-w-0 flex-1">
                        <span className="d-block">{p.description}</span>
                        <code>{p.key}</code>
                      </label>
                      {SENSITIVE_PERMISSIONS.has(p.key) && <span className="perm-sensitive" title="Customer-facing or hard to undo">Sensitive</span>}
                      {!grantable && <i className="ri-lock-2-line text-muted" aria-label="Locked" />}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        {groups.length === 0 && <p className="text-muted fs-sm text-center py-4 mb-0">No permission matches “{q}”.</p>}
      </div>
    </div>
  )
}
