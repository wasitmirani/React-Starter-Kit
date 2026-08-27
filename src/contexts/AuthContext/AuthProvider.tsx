import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth.service'
import type { AuthUser, LoginCredentials, RegisterPayload } from '@/types/auth.types'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBootstrapped, setIsBootstrapped] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const restored = await authService.restoreSession()
        if (!cancelled) setUser(restored)
      } finally {
        if (!cancelled) setIsBootstrapped(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const nextUser = await authService.login(credentials)
      setUser(nextUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      const nextUser = await authService.register(payload)
      setUser(nextUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: isLoading || !isBootstrapped,
      isBootstrapped,
      login,
      register,
      logout,
    }),
    [user, isLoading, isBootstrapped, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
