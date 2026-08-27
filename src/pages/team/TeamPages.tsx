import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { teamService } from '@/services/team.service'
import type { Role } from '@/config/permissions'
import { ROUTES } from '@/constants/routes.constants'

export function TeamMembersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['team', 'members'],
    queryFn: () => teamService.members(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Team Members"
        breadcrumbs={[{ label: 'Workspace', href: ROUTES.TEAM_MEMBERS }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Members</div>
        </div>
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last active</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      <span className="badge bg-primary-transparent">{m.role}</span>
                    </td>
                    <td>{m.status}</td>
                    <td>
                      {m.lastActiveAt ? new Date(m.lastActiveAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function TeamRolesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['team', 'roles'],
    queryFn: () => teamService.roles(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Roles & Permissions"
        breadcrumbs={[{ label: 'Team', href: ROUTES.TEAM_MEMBERS }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {isLoading && <p className="text-textmuted">Loading…</p>}
        {(data?.data ?? []).map((role) => (
          <div key={role.id} className="xl:col-span-4 md:col-span-6 col-span-12">
            <div className="box h-full">
              <div className="box-body">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-semibold capitalize mb-0">{role.name}</h6>
                  <span className="badge bg-secondary-transparent">
                    {role.memberCount} members
                  </span>
                </div>
                <p className="text-textmuted fs-12 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 6).map((p) => (
                    <span key={p} className="badge bg-light text-default">
                      {p}
                    </span>
                  ))}
                  {role.permissions.length > 6 && (
                    <span className="badge bg-light">+{role.permissions.length - 6}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function TeamInvitationsPage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('viewer')
  const { data, isLoading } = useQuery({
    queryKey: ['team', 'invitations'],
    queryFn: () => teamService.invitations(),
  })
  const invite = useMutation({
    mutationFn: () => teamService.invite(email, role),
    onSuccess: () => {
      setEmail('')
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] })
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="Invitations"
        breadcrumbs={[{ label: 'Team', href: ROUTES.TEAM_MEMBERS }]}
      />
      <div className="box mb-3">
        <div className="box-header">
          <div className="box-title">Invite teammate</div>
        </div>
        <div className="box-body flex flex-wrap gap-3 items-end">
          <div className="grow" style={{ minWidth: 220 }}>
            <label className="form-label">Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="agent_manager">Agent Manager</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button
            type="button"
            className="ti-btn ti-btn-primary"
            disabled={!email || invite.isPending}
            onClick={() => invite.mutate()}
          >
            Send invite
          </button>
        </div>
      </div>
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Invited</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>{inv.role}</td>
                    <td>
                      <span className="badge bg-warning-transparent">{inv.status}</span>
                    </td>
                    <td>{new Date(inv.invitedAt).toLocaleDateString()}</td>
                    <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function TeamActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['team', 'activity'],
    queryFn: () => teamService.activity(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Activity Logs"
        breadcrumbs={[{ label: 'Team', href: ROUTES.TEAM_MEMBERS }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Recent activity</div>
        </div>
        <div className="box-body">
          {isLoading && <p className="text-textmuted">Loading…</p>}
          <ul className="list-none mb-0 space-y-3">
            {(data?.data ?? []).map((log) => (
              <li key={log.id} className="flex justify-between gap-3 border-b border-defaultborder pb-3">
                <div>
                  <span className="font-medium">{log.actor}</span>{' '}
                  <span className="text-textmuted">{log.action}</span>{' '}
                  <span className="font-medium">{log.target}</span>
                </div>
                <div className="fs-12 text-textmuted whitespace-nowrap">
                  {new Date(log.at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
