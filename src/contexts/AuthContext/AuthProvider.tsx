import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useRolePreview } from '@/store/rolePreview.store'
import { useQueryClient } from '@tanstack/react-query'
import { onSessionEnded } from '@/api/interceptors'
import { authService } from '@/services/auth.service'
import { selectCurrentMembership, useAuthStore } from '@/store/auth.store'
import type { LoginCredentials, RegisterPayload } from '@/types/auth.types'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const { status, user, memberships, setProfile, setCurrentTenant, clear } = useAuthStore()
  const currentMembership = useAuthStore(selectCurrentMembership)

  const signOutLocally = useCallback(() => {
    clear()
    queryClient.clear()
  }, [clear, queryClient])

  // Restore the session from stored tokens on first load.
  useEffect(() => {
    onSessionEnded(signOutLocally)
    if (!authService.hasStoredSession()) return
    authService
      .loadProfile()
      .then(setProfile)
      .catch(signOutLocally)
  }, [setProfile, signOutLocally])

  const login = useCallback(
    async (credentials: LoginCredentials) => setProfile(await authService.login(credentials)),
    [setProfile],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => setProfile(await authService.register(payload)),
    [setProfile],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      signOutLocally()
    }
  }, [signOutLocally])

  const refreshProfile = useCallback(async () => {
    setProfile(await authService.loadProfile())
  }, [setProfile])

  const switchTenant = useCallback(
    (tenantId: string) => {
      setCurrentTenant(tenantId)
      // Cached data belongs to the previous workspace.
      queryClient.clear()
    },
    [setCurrentTenant, queryClient],
  )

  // "Preview as role" narrows what the UI allows; it never adds permissions.
  const preview = useRolePreview((x) => x.role)
  const can = useCallback(
    (permission: string) => Boolean(currentMembership?.permissions.includes(permission)) && (!preview || preview.permissions.includes(permission)),
    [currentMembership, preview],
  )

  const value = useMemo(
    () => ({
      status,
      user,
      memberships,
      currentMembership,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      refreshProfile,
      switchTenant,
      can,
    }),
    [status, user, memberships, currentMembership, login, register, logout, refreshProfile, switchTenant, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
