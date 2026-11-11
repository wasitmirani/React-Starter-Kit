import { useState, type ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accessApi } from '@/api/endpoints/access.api'
import { tenantsApi } from '@/api/endpoints/tenants.api'
import { errorMessage, toApiError } from '@/api/errors'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableAction, type DataTableColumn } from '@/components/common/DataTable'
import { allRows } from '@/components/common/DataTable/rows'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { queryKeys, useInvitations, useMembers, useRoles, useTenantId } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { inviteSchema, type InviteSchema } from '@/lib/validation/schemas'
import type { Invitation, Member, Role } from '@/types/workspace.types'
import { formatDate } from '@/utils/formatters/date.formatter'

function RoleSelect({ roles, id, ...rest }: { roles: Role[]; id: string } & ComponentProps<'select'>) {
  const { can, currentMembership } = useAuth()
  const isOwner = currentMembership?.role.key === 'owner'
  return (
    <select id={id} className="form-select" {...rest}>
      <option value="">Choose a role…</option>
      {roles.map((role) => {
        const grantable = role.permissions.every(can) && (role.key !== 'owner' || isOwner)
        return (
          <option key={role.id} value={role.id} disabled={!grantable}>
            {role.name}
            {grantable ? '' : ' (not allowed)'}
          </option>
        )
      })}
    </select>
  )
}

function InviteModal({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: Role[] }) {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteSchema>({ resolver: zodResolver(inviteSchema) })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await accessApi.invite(values)
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations(tenantId) })
      toast.success(`Invitation sent to ${values.email}`)
      close()
    } catch (err) {
      const apiError = toApiError(err)
      if (['ALREADY_MEMBER', 'INVITATION_PENDING'].includes(apiError.code)) setError('email', { message: apiError.message })
      else toast.error(apiError.message)
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite a teammate"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={close}>
            Cancel
          </button>
          <button type="submit" form="invite-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send invitation'}
          </button>
        </>
      }
    >
      <form id="invite-form" onSubmit={onSubmit} noValidate className="row g-5">
        <FormField id="invite-email" label="Email address" error={errors.email?.message} className="col-12">
          <input id="invite-email" type="email" autoFocus className={`form-control${errors.email ? ' is-invalid' : ''}`} {...register('email')} />
        </FormField>
        <FormField id="invite-role" label="Role" error={errors.roleId?.message} className="col-12"
          hint="You can only grant roles whose permissions you hold yourself.">
          <RoleSelect id="invite-role" roles={roles} {...register('roleId')} />
        </FormField>
      </form>
    </Modal>
  )
}

function ChangeRoleModal({ member, roles, onClose }: { member: Member | null; roles: Role[]; onClose: () => void }) {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { refreshProfile, user } = useAuth()
  const [roleId, setRoleId] = useState('')

  const save = useMutation({
    mutationFn: () => tenantsApi.updateMember(tenantId, member!.id, { roleId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members(tenantId) })
      if (member?.user.id === user?.id) await refreshProfile()
      toast.success('Role updated')
      onClose()
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title={`Change role — ${member?.user.name ?? ''}`}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!roleId || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormField id="member-role" label="Role">
        <RoleSelect id="member-role" roles={roles} value={roleId || member?.role.id || ''} onChange={(e) => setRoleId(e.target.value)} />
      </FormField>
    </Modal>
  )
}

const statusBadge = (status: string) =>
  status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'

export function TeamPage() {
  const tenantId = useTenantId()
  const { can, currentMembership } = useAuth()
  const canManage = can('members.manage')
  const toast = useToast()
  const queryClient = useQueryClient()
  const members = useMembers()
  const invitations = useInvitations()
  const roles = useRoles(can('roles.read') || canManage)
  const [inviting, setInviting] = useState(false)
  const [changingRole, setChangingRole] = useState<Member | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [revoking, setRevoking] = useState<Invitation | null>(null)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.members(tenantId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(tenantId) }),
    ])

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (err) => toast.error(errorMessage(err)),
  })

  const memberColumns: DataTableColumn<Member>[] = [
    {
      key: 'user',
      label: 'Member',
      render: (m) => (
        <div>
          <div className="fw-medium">
            {m.user.name}
            {m.id === currentMembership?.memberId && <span className="text-muted ms-1">(you)</span>}
          </div>
          <div className="text-muted fs-sm">{m.user.email}</div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (m) => <span className="badge bg-primary-subtle text-primary">{m.role.name}</span> },
    { key: 'status', label: 'Status', render: (m) => <span className={`badge ${statusBadge(m.status)} text-capitalize`}>{m.status}</span> },
    { key: 'joinedAt', label: 'Joined', render: (m) => formatDate(m.joinedAt) },
  ]

  const memberActions: DataTableAction<Member>[] = canManage
    ? [
        { key: 'role', label: 'Change role', icon: 'ri-shield-user-line', variant: 'edit' },
        { key: 'suspend', label: 'Suspend', icon: 'ri-pause-circle-line', condition: (m) => m.status === 'active' && m.id !== currentMembership?.memberId },
        { key: 'activate', label: 'Reactivate', icon: 'ri-play-circle-line', condition: (m) => m.status === 'suspended' },
        { key: 'remove', label: 'Remove', icon: 'ri-delete-bin-line', variant: 'delete', condition: (m) => m.id !== currentMembership?.memberId },
      ]
    : []

  const invitationColumns: DataTableColumn<Invitation>[] = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (i) => i.role.name },
    { key: 'invitedBy', label: 'Invited by', render: (i) => i.invitedBy?.name ?? 'API key' },
    { key: 'expiresAt', label: 'Expires', render: (i) => formatDate(i.expiresAt) },
  ]

  return (
    <>
      <PageHeader title="Team" description="People who can access this workspace, and pending invitations." />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title mb-0">Members</h6>
            <p className="text-muted mb-0 fs-sm">People who can access this workspace.</p>
          </div>
          {canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setInviting(true)}>
              <i className="ri-user-add-line me-1" /> Invite
            </button>
          )}
        </div>
        <div className="card-body">
          {members.isError ? (
            <div className="alert alert-danger">{errorMessage(members.error)}</div>
          ) : (
            <DataTable<Member>
              columns={memberColumns}
              rows={allRows(members.data)}
              actions={memberActions}
              isLoading={members.isLoading}
              itemsLabel="members"
              onAction={(payload) => {
                if (!('row' in payload)) return
                const m = payload.row
                if (payload.action === 'role') setChangingRole(m)
                if (payload.action === 'remove') setRemoving(m)
                if (payload.action === 'suspend') act.mutate(() => tenantsApi.updateMember(tenantId, m.id, { status: 'suspended' }))
                if (payload.action === 'activate') act.mutate(() => tenantsApi.updateMember(tenantId, m.id, { status: 'active' }))
              }}
            />
          )}
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <h6 className="card-title mb-0">Pending invitations</h6>
        </div>
        <div className="card-body">
          <DataTable<Invitation>
            columns={invitationColumns}
            rows={allRows(invitations.data)}
            isLoading={invitations.isLoading}
            itemsLabel="invitations"
            emptyMessage="No pending invitations"
            emptyDescription={canManage ? 'Invite teammates with the Invite button.' : ''}
            actions={
              canManage
                ? [
                    { key: 'resend', label: 'Resend', icon: 'ri-mail-send-line' },
                    { key: 'revoke', label: 'Revoke', icon: 'ri-close-circle-line', variant: 'delete' },
                  ]
                : []
            }
            onAction={(payload) => {
              if (!('row' in payload)) return
              if (payload.action === 'revoke') setRevoking(payload.row)
              if (payload.action === 'resend') {
                act.mutate(() => accessApi.resendInvitation(payload.row.id), {
                  onSuccess: () => toast.success(`Invitation resent to ${payload.row.email}`),
                })
              }
            }}
          />
        </div>
      </div>

      <InviteModal open={inviting} onClose={() => setInviting(false)} roles={roles.data ?? []} />
      <ChangeRoleModal member={changingRole} roles={roles.data ?? []} onClose={() => setChangingRole(null)} />
      <ConfirmDialog
        open={removing !== null}
        title="Remove member"
        message={<>Remove <strong>{removing?.user.name}</strong> from this workspace? They lose access immediately.</>}
        confirmLabel="Remove"
        danger
        busy={act.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() =>
          act.mutate(() => tenantsApi.removeMember(tenantId, removing!.id), {
            onSuccess: () => {
              toast.success('Member removed')
              setRemoving(null)
            },
          })
        }
      />
      <ConfirmDialog
        open={revoking !== null}
        title="Revoke invitation"
        message={<>The invitation link sent to <strong>{revoking?.email}</strong> will stop working.</>}
        confirmLabel="Revoke"
        danger
        busy={act.isPending}
        onClose={() => setRevoking(null)}
        onConfirm={() =>
          act.mutate(() => accessApi.revokeInvitation(revoking!.id), {
            onSuccess: () => {
              toast.success('Invitation revoked')
              setRevoking(null)
            },
          })
        }
      />
    </>
  )
}
