import { env } from '@/config/env.config'
import { authApi } from '@/api/endpoints/auth.api'
import { OFFLINE_TOKEN, offlineDemo } from '@/api/mock/offline-demo'
import type { AuthResult, LoginCredentials, Profile, RegisterPayload } from '@/types/auth.types'
import { storageService } from './storage.service'

function persistTokens(result: AuthResult): Profile {
  storageService.setTokens(result.accessToken, result.refreshToken)
  return { user: result.user, memberships: result.memberships }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<Profile> {
    try {
      const { data } = await authApi.login(credentials)
      return persistTokens(data.data)
    } catch (err) {
      // The demo account always works: if the backend or its database is unavailable
      // (or the demo user was never seeded), continue with a local offline session.
      const demo = env.demoAccount
      if (demo && credentials.email.trim().toLowerCase() === demo.email.toLowerCase() && credentials.password === demo.password) {
        storageService.setTokens(OFFLINE_TOKEN, OFFLINE_TOKEN)
        return offlineDemo.start(demo.email)
      }
      throw err
    }
  },

  isOfflineDemo: () => offlineDemo.isActive(),

  async register(payload: RegisterPayload): Promise<Profile> {
    const { data } = await authApi.register(payload)
    return persistTokens(data.data)
  },

  async loadProfile(): Promise<Profile> {
    const { data } = await authApi.me()
    return data.data
  },

  async logout(): Promise<void> {
    try {
      if (storageService.getAccessToken()) await authApi.logout()
    } finally {
      storageService.clearAuth()
    }
  },

  hasStoredSession(): boolean {
    return Boolean(storageService.getAccessToken())
  },
}
