import { authApi } from '@/api/endpoints/auth.api'
import { shouldMockModule } from '@/config/env.config'
import {
  AUTH_USER_STORAGE_KEY,
  DEMO_CREDENTIALS,
  DEMO_TOKENS,
  DEMO_USER,
  isDemoToken,
} from '@/constants/auth.constants'
import { mapMeToAuthUser, mapMeToOrganization } from '@/lib/api-mappers'
import type { AuthUser, LoginCredentials, RegisterPayload } from '@/types/auth.types'
import type { BackendTokenPair } from '@/types/backend.types'
import { useOrganizationStore } from '@/store/organization.store'
import { storageService } from './storage.service'

function persistSession(user: AuthUser, accessToken: string, refreshToken: string) {
  storageService.setTokens(accessToken, refreshToken)
  storageService.setItem(AUTH_USER_STORAGE_KEY, user)
}

function clearSession() {
  storageService.clearAuth()
  storageService.removeItem(AUTH_USER_STORAGE_KEY)
}

function allowDemoAuth() {
  return shouldMockModule('auth')
}

function applyOrgFromMe(user: AuthUser, org: ReturnType<typeof mapMeToOrganization>) {
  useOrganizationStore.getState().setOrganizations([org])
  useOrganizationStore.getState().setCurrentOrganization(org.id)
  void user
}

function tokensFromPair(pair: BackendTokenPair) {
  return {
    accessToken: pair.access_token,
    refreshToken: pair.refresh_token,
  }
}

async function hydrateFromMe(): Promise<AuthUser> {
  const { data } = await authApi.me()
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load profile')
  const user = mapMeToAuthUser(data.data)
  applyOrgFromMe(user, mapMeToOrganization(data.data))
  storageService.setItem(AUTH_USER_STORAGE_KEY, user)
  return user
}

export const authService = {
  /** Restore session on app boot; clears invalid/demo tokens when using the real API. */
  async restoreSession(): Promise<AuthUser | null> {
    const token = storageService.getAccessToken()
    if (!token) {
      clearSession()
      return null
    }

    if (isDemoToken(token)) {
      if (allowDemoAuth()) {
        return DEMO_USER
      }
      clearSession()
      return null
    }

    if (allowDemoAuth()) {
      return authService.getStoredUser()
    }

    try {
      return await hydrateFromMe()
    } catch {
      clearSession()
      return null
    }
  },

  async login(credentials: LoginCredentials) {
    if (
      allowDemoAuth() &&
      credentials.email === DEMO_CREDENTIALS.email &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      persistSession(DEMO_USER, DEMO_TOKENS.accessToken, DEMO_TOKENS.refreshToken)
      return DEMO_USER
    }

    const { data } = await authApi.login(credentials)
    if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed')
    const tokens = tokensFromPair(data.data)
    storageService.setTokens(tokens.accessToken, tokens.refreshToken)
    const user = await hydrateFromMe()
    persistSession(user, tokens.accessToken, tokens.refreshToken)
    return user
  },

  async register(payload: RegisterPayload) {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (allowDemoAuth()) {
      const user: AuthUser = {
        id: `usr_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: 'owner',
      }
      persistSession(user, DEMO_TOKENS.accessToken, DEMO_TOKENS.refreshToken)
      return user
    }

    const { data } = await authApi.register({
      email: payload.email,
      password: payload.password,
      full_name: payload.name,
      organization_name: payload.organizationName || undefined,
    })
    if (!data.success || !data.data) throw new Error(data.message ?? 'Registration failed')

    const tokens = tokensFromPair(data.data)
    storageService.setTokens(tokens.accessToken, tokens.refreshToken)
    const user = await hydrateFromMe()
    persistSession(user, tokens.accessToken, tokens.refreshToken)
    return user
  },

  async logout() {
    const refreshToken = storageService.getRefreshToken()
    try {
      if (refreshToken && !isDemoToken(refreshToken)) {
        await authApi.logout(refreshToken)
      }
    } finally {
      clearSession()
    }
  },

  async refreshSession() {
    const refreshToken = storageService.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')

    if (isDemoToken(refreshToken)) {
      storageService.setAccessToken(DEMO_TOKENS.accessToken)
      return DEMO_TOKENS
    }

    const { data } = await authApi.refresh(refreshToken)
    if (!data.success || !data.data) throw new Error(data.message ?? 'Refresh failed')
    const tokens = tokensFromPair(data.data)
    storageService.setTokens(tokens.accessToken, tokens.refreshToken)
    return tokens
  },

  async forgotPassword(email: string) {
    if (allowDemoAuth()) return
    await authApi.forgotPassword(email)
  },

  async resetPassword(token: string, password: string) {
    if (allowDemoAuth()) return
    await authApi.resetPassword(token, password)
  },

  async verifyEmail(token: string) {
    if (allowDemoAuth()) return
    await authApi.verifyEmail(token)
  },

  getStoredUser(): AuthUser | null {
    return storageService.getItem<AuthUser>(AUTH_USER_STORAGE_KEY)
  },

  isAuthenticated(): boolean {
    return Boolean(storageService.getAccessToken())
  },
}
