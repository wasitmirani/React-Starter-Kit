import { create } from 'zustand'
import { storageService } from '@/services/storage.service'
import type { AuthUser, Membership, Profile } from '@/types/auth.types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  memberships: Membership[]
  /** Workspace every tenant-scoped request is sent for (X-Tenant-Id). */
  currentTenantId: string | null
  setProfile: (profile: Profile) => void
  setUser: (user: AuthUser) => void
  setCurrentTenant: (tenantId: string) => void
  clear: () => void
}

/** Keeps the last used workspace if the user is still a member, otherwise the first one. */
function pickTenant(memberships: Membership[], preferred: string | null): string | null {
  if (preferred && memberships.some((m) => m.tenant.id === preferred)) return preferred
  return memberships[0]?.tenant.id ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: storageService.getAccessToken() ? 'loading' : 'anonymous',
  user: null,
  memberships: [],
  currentTenantId: null,
  setProfile: ({ user, memberships }) => {
    const currentTenantId = pickTenant(memberships, get().currentTenantId ?? storageService.getTenantId())
    storageService.setTenantId(currentTenantId)
    set({ status: 'authenticated', user, memberships, currentTenantId })
  },
  setUser: (user) => set({ user }),
  setCurrentTenant: (tenantId) => {
    storageService.setTenantId(tenantId)
    set({ currentTenantId: tenantId })
  },
  clear: () => set({ status: 'anonymous', user: null, memberships: [], currentTenantId: null }),
}))

/** Membership (role + permissions) in the current workspace. */
export const selectCurrentMembership = (state: AuthState): Membership | null =>
  state.memberships.find((m) => m.tenant.id === state.currentTenantId) ?? null
