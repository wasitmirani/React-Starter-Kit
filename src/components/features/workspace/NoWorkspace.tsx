import { useState } from 'react'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'

/** Shown when the user belongs to no workspace (e.g. after leaving their last one). */
export function NoWorkspace() {
  const [creating, setCreating] = useState(false)
  return (
    <div className="card mt-6">
      <div className="card-body text-center py-12">
        <i className="mgc_building_2_line fs-1 text-muted d-block mb-3" />
        <h6>You&apos;re not in any workspace yet</h6>
        <p className="text-muted">Create a workspace, or ask a teammate to invite you to theirs.</p>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          Create workspace
        </button>
      </div>
      <CreateWorkspaceModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
