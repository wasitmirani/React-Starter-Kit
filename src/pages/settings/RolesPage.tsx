import { Fragment, useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accessApi } from '@/api/endpoints/access.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { PermissionPicker } from '@/components/features/access/PermissionPicker'
import { Meter } from '@/components/ui/Controls'
import { MoreMenu, type DropdownItem } from '@/components/ui/Dropdown'
import { Segmented } from '@/components/ui/Segmented'
import { PERMISSION_CATEGORIES, ROLE_PRESETS, SENSITIVE_PERMISSIONS } from '@/constants/permissions.constants'
import { queryKeys, useMembers, usePermissions, useRoles, useTenantId } from '@/hooks/queries/workspace.queries'
import { useCan } from '@/hooks/useCan'
import { useToast } from '@/hooks/useToast'
import { roleSchema, type RoleSchema } from '@/lib/validation/schemas'
import { useRolePreview } from '@/store/rolePreview.store'
import type { Permission, Role } from '@/types/workspace.types'
import { plural } from '@/utils/formatters/number.formatter'
import { areaAccess, groupPermissions } from '@/utils/helpers/permissions'

type Editing = { role: Role | null; copyFrom?: Role } | undefined
type View = 'roles' | 'matrix'

const iconOf = (key: string) => ROLE_PRESETS.find((p) => p.key === key)?.icon ?? 'ri-user-settings-line'

/** Create, edit or duplicate a role. */
function RoleModal({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const permissions = usePermissions()
  const role = editing?.role ?? null
  const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<RoleSchema>({ resolver: zodResolver(roleSchema) })

  useEffect(() => {
    if (!editing) return
    const src = editing.role ?? editing.copyFrom
    reset({ name: editing.role ? editing.role.name : src ? `${src.name} (copy)` : '', description: src?.description ?? '', permissions: src?.permissions ?? [] })
  }, [editing, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (role) await accessApi.updateRole(role.id, values)
      else await accessApi.createRole(values)
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(tenantId) })
      toast.success(role ? 'Role updated' : 'Role created')
      onClose()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  const known = new Set((permissions.data ?? []).map((p) => p.key))
  const selected = useWatch({ control, name: 'permissions' }) ?? []
  const sensitive = selected.filter((k) => SENSITIVE_PERMISSIONS.has(k))

  return (
    <Modal
      open={editing !== undefined}
      onClose={onClose}
      size="lg"
      title={role ? `Edit role — ${role.name}` : editing?.copyFrom ? `Duplicate ${editing.copyFrom.name}` : 'Create role'}
      footer={
        <>
          {sensitive.length > 0 && <span className="me-auto text-warning-emphasis fs-sm"><i className="ri-alert-line me-1" />{plural(sensitive.length, 'sensitive permission')} included</span>}
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" form="role-form" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : role ? 'Save role' : 'Create role'}</button>
        </>
      }
    >
      <form id="role-form" onSubmit={onSubmit} noValidate className="row g-4">
        <FormField id="role-name" label="Name" error={errors.name?.message} className="col-md-5" required>
          <input id="role-name" className="form-control" placeholder="e.g. Campaign reviewer" {...register('name')} />
        </FormField>
        <FormField id="role-description" label="Description" optional error={errors.description?.message} className="col-md-7">
          <input id="role-description" className="form-control" placeholder="What people with this role do" {...register('description')} />
        </FormField>
        {!role && (
          <div className="col-12">
            <div className="form-label">Start from a preset</div>
            <div className="preset-chips">
              {ROLE_PRESETS.filter((p) => p.key !== 'owner').map((p) => (
                <button key={p.key} type="button" className="preset-chip" onClick={() => setValue('permissions', p.permissions.filter((k) => known.has(k)), { shouldDirty: true })}>
                  <i className={p.icon} />{p.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="col-12">
          <div className="form-label required">Permissions</div>
          {errors.permissions && <div className="invalid-feedback d-block mb-2"><i className="ri-error-warning-fill" /> {errors.permissions.message}</div>}
          {permissions.isLoading ? (
            <Loader size="sm" />
          ) : (
            <Controller control={control} name="permissions" render={({ field }) => <PermissionPicker idPrefix="role" permissions={permissions.data ?? []} value={field.value ?? []} onChange={field.onChange} />} />
          )}
        </div>
      </form>
    </Modal>
  )
}

/** Grid of every permission against every role. */
function Matrix({ roles, permissions }: { roles: Role[]; permissions: Permission[] }) {
  const groups = groupPermissions(permissions)
  const sets = roles.map((r) => new Set(r.permissions))
  return (
    <div className="card">
      <div className="table-responsive perm-matrix">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th className="perm-matrix-first">Permission</th>
              {roles.map((r) => (
                <th key={r.id} className="text-center">
                  <span className="d-inline-flex flex-column align-items-center gap-1">
                    <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={iconOf(r.key)} /></span>
                    <span className="text-nowrap">{r.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([cat, items]) => (
              <Fragment key={cat}>
                <tr className="perm-matrix-group">
                  <td colSpan={roles.length + 1}><i className={`${PERMISSION_CATEGORIES[cat]?.icon ?? 'ri-folder-line'} me-2`} />{PERMISSION_CATEGORIES[cat]?.label ?? cat}</td>
                </tr>
                {items.map((p) => (
                  <tr key={p.key}>
                    <td className="perm-matrix-first">
                      <span className="d-block">{p.description}</span>
                      <code className="fs-xs text-muted">{p.key}</code>
                      {SENSITIVE_PERMISSIONS.has(p.key) && <span className="perm-sensitive ms-2">Sensitive</span>}
                    </td>
                    {sets.map((s, i) => (
                      <td key={roles[i].id} className="text-center">
                        {s.has(p.key) ? <i className="ri-checkbox-circle-fill text-success fs-5" aria-label="Granted" /> : <i className="ri-subtract-line text-muted opacity-50" aria-label="Not granted" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RolesPage() {
  const tenantId = useTenantId()
  const can = useCan()
  const canManage = can('roles.manage')
  const toast = useToast()
  const queryClient = useQueryClient()
  const roles = useRoles()
  const permissions = usePermissions()
  const members = useMembers()
  const [view, setView] = useState<View>('roles')
  const preview = useRolePreview()
  const [editing, setEditing] = useState<Editing>(undefined)
  const [deleting, setDeleting] = useState<Role | null>(null)

  const catalog = useMemo(() => permissions.data ?? [], [permissions.data])
  const groups = useMemo(() => groupPermissions(catalog), [catalog])
  const memberCount = (role: Role) => (members.data ?? []).filter((m) => m.role.id === role.id).length

  const remove = useMutation({
    mutationFn: (id: string) => accessApi.deleteRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(tenantId) })
      toast.success('Role deleted')
      setDeleting(null)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  const menu = (role: Role) => {
    const items: (DropdownItem | 'divider')[] = []
    if (!role.isSystem) items.push({ key: 'edit', label: 'Edit role', icon: 'ri-edit-line', disabled: !canManage, onSelect: () => setEditing({ role }) })
    items.push({ key: 'preview', label: 'Preview the app as this role', icon: 'ri-eye-line', onSelect: () => preview.start({ key: role.key, name: role.name, permissions: role.permissions }) })
    items.push({ key: 'copy', label: 'Duplicate as custom role', icon: 'ri-file-copy-line', disabled: !canManage, onSelect: () => setEditing({ role: null, copyFrom: role }) })
    if (!role.isSystem) items.push('divider', { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, disabled: !canManage || memberCount(role) > 0, onSelect: () => setDeleting(role) })
    return <MoreMenu items={items} />
  }

  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="Decide who can see and do what. System roles cover common teams; duplicate one to make it your own."
        actions={
          <Guard permission="roles.manage">
            <button type="button" className="btn btn-primary" onClick={() => setEditing({ role: null })}><i className="ri-add-line" /> Create role</button>
          </Guard>
        }
      />

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <Segmented<View> size="md" ariaLabel="View" value={view} onChange={setView} options={[{ value: 'roles', label: 'Roles', icon: 'ri-shield-user-line' }, { value: 'matrix', label: 'Permission matrix', icon: 'ri-grid-line' }]} />
        <span className="text-muted fs-sm"><i className="ri-information-line me-1" />{plural(catalog.length, 'permission')} across {groups.length} areas · sensitive ones are flagged</span>
      </div>

      {roles.isLoading ? (
        <Loader />
      ) : roles.isError ? (
        <div className="alert alert-danger">{errorMessage(roles.error)}</div>
      ) : view === 'matrix' ? (
        <Matrix roles={roles.data ?? []} permissions={catalog} />
      ) : (
        <div className="role-grid">
          {roles.data?.map((role) => {
            const granted = new Set(role.permissions)
            const count = memberCount(role)
            return (
              <article key={role.id} className="role-card">
                <header>
                  <span className="icon-tile bg-primary-subtle text-primary"><i className={iconOf(role.key)} /></span>
                  <div className="min-w-0 flex-1">
                    <h6 className="mb-0 text-truncate">{role.name}</h6>
                    <span className="text-muted fs-xs">{role.isSystem ? 'System role' : 'Custom role'} · {plural(count, 'member')}</span>
                  </div>
                  {menu(role)}
                </header>
                {role.description && <p className="text-muted fs-sm mb-3">{role.description}</p>}
                <div className="d-flex justify-content-between fs-xs text-muted mb-1">
                  <span>Access</span>
                  <span className="tabular-nums">{role.permissions.length} / {catalog.length || role.permissions.length}</span>
                </div>
                <Meter value={role.permissions.length} max={catalog.length || role.permissions.length} tone={role.permissions.length === catalog.length ? 'success' : 'primary'} className="mb-3" />
                <ul className="role-areas">
                  {groups.map(([cat, items]) => {
                    const level = areaAccess(granted, items)
                    return (
                      <li key={cat} className={level} title={`${PERMISSION_CATEGORIES[cat]?.label ?? cat}: ${level === 'full' ? 'full access' : level === 'some' ? `${items.filter((p) => granted.has(p.key)).length} of ${items.length}` : 'no access'}`}>
                        <i className={PERMISSION_CATEGORIES[cat]?.icon ?? 'ri-folder-line'} />
                        <span>{PERMISSION_CATEGORIES[cat]?.label ?? cat}</span>
                      </li>
                    )
                  })}
                </ul>
                <footer>
                  {role.isSystem ? (
                    <Guard permission="roles.manage"><button type="button" className="btn btn-sm btn-light" onClick={() => setEditing({ role: null, copyFrom: role })}><i className="ri-file-copy-line" /> Duplicate</button></Guard>
                  ) : (
                    <Guard permission="roles.manage"><button type="button" className="btn btn-sm btn-light" onClick={() => setEditing({ role })}><i className="ri-edit-line" /> Edit permissions</button></Guard>
                  )}
                  <button type="button" className={`btn btn-sm ${preview.role?.key === role.key ? 'btn-primary' : 'btn-link'}`} onClick={() => (preview.role?.key === role.key ? preview.stop() : preview.start({ key: role.key, name: role.name, permissions: role.permissions }))}>
                    <i className="ri-eye-line" /> {preview.role?.key === role.key ? 'Previewing' : 'Preview'}
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      <RoleModal editing={editing} onClose={() => setEditing(undefined)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete role?"
        message={<>Delete <strong>{deleting?.name}</strong>? This cannot be undone. Roles assigned to members or invitations cannot be deleted.</>}
        confirmLabel="Delete role"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
