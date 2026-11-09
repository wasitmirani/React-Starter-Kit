import { create } from 'zustand'

export interface PreviewRole {
  key: string
  name: string
  permissions: string[]
}

interface RolePreviewState {
  role: PreviewRole | null
  start: (role: PreviewRole) => void
  stop: () => void
}

const KEY = 'birdcrm.role-preview'

const read = (): PreviewRole | null => {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PreviewRole) : null
  } catch {
    return null
  }
}

/**
 * "Preview as role": the UI behaves as if the signed-in user had only this role's
 * permissions (intersected with their real ones, so it can never grant more).
 * Kept per tab in sessionStorage. The API still enforces the real role.
 */
export const useRolePreview = create<RolePreviewState>((set) => ({
  role: read(),
  start: (role) => {
    sessionStorage.setItem(KEY, JSON.stringify(role))
    set({ role })
  },
  stop: () => {
    sessionStorage.removeItem(KEY)
    set({ role: null })
  },
}))
