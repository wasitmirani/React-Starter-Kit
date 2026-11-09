import { createContext } from 'react'
import type { AuthStatus } from '@/store/auth.store'
import type { AuthUser, LoginCredentials, Membership, RegisterPayload } from '@/types/auth.types'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  memberships: Membership[]
  currentMembership: Membership | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  /** Re-fetch the user and memberships (after accepting an invite, role change, …). */
  refreshProfile: () => Promise<void>
  switchTenant: (tenantId: string) => void
  /** Whether the user holds `permission` in the current workspace. */
  can: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
