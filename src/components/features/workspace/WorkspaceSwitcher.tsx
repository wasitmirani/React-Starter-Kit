import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'

/** Topbar dropdown: shows the current workspace and switches between memberships. */
export function WorkspaceSwitcher() {
  const { memberships, currentMembership, switchTenant } = useAuth()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <div className="dropdown">
        <button
          className="btn btn-light btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="mgc_building_2_line" />
          <span className="text-truncate" style={{ maxWidth: 180 }}>
            {currentMembership?.tenant.name ?? 'No workspace'}
          </span>
          <i className="mgc_down_line fs-sm" />
        </button>
        <div className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: 260 }}>
          <span className="dropdown-header">Workspaces</span>
          {memberships.map((m) => (
            <button
              key={m.tenant.id}
              type="button"
              className={`dropdown-item d-flex justify-content-between align-items-center${
                m.tenant.id === currentMembership?.tenant.id ? ' active' : ''
              }`}
              onClick={() => {
                if (m.tenant.id === currentMembership?.tenant.id) return
                switchTenant(m.tenant.id)
                navigate(ROUTES.DASHBOARD)
              }}
            >
              <span className="text-truncate">{m.tenant.name}</span>
              <span className="badge bg-body-secondary text-body ms-2">{m.role.name}</span>
            </button>
          ))}
          <div className="dropdown-divider" />
          <button type="button" className="dropdown-item" onClick={() => setCreating(true)}>
            <i className="mgc_add_line me-2" />
            Create workspace
          </button>
        </div>
      </div>
      <CreateWorkspaceModal open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
