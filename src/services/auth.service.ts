import { authApi } from '@/api/endpoints/auth.api'
import {
  AUTH_USER_STORAGE_KEY,
  DEMO_CREDENTIALS,
  DEMO_TOKENS,
  DEMO_USER,
  isDemoToken,
} from '@/constants/auth.constants'
import type { AuthUser, LoginCredentials, RegisterPayload } from '@/types/auth.types'
import { storageService } from './storage.service'

function persistSession(user: AuthUser, accessToken: string, refreshToken: string) {
  storageService.setTokens(accessToken, refreshToken)
  storageService.setItem(AUTH_USER_STORAGE_KEY, user)
}

function clearSession() {
  storageService.clearAuth()
  storageService.removeItem(AUTH_USER_STORAGE_KEY)
}

export const authService = {
  async login(credentials: LoginCredentials) {
    if (
      credentials.email === DEMO_CREDENTIALS.email &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      persistSession(DEMO_USER, DEMO_TOKENS.accessToken, DEMO_TOKENS.refreshToken)
      return DEMO_USER
    }

    const { data } = await authApi.login(credentials)
    const { user, tokens } = data.data
    persistSession(user, tokens.accessToken, tokens.refreshToken)
    return user
  },

  async register(payload: RegisterPayload) {
    const { data } = await authApi.register(payload)
    const { user, tokens } = data.data
    persistSession(user, tokens.accessToken, tokens.refreshToken)
    return user
  },

  async logout() {
    const token = storageService.getAccessToken()
    try {
      if (token && !isDemoToken(token)) {
        await authApi.logout()
      }
    } finally {
      clearSession()
    }
  },

  async forgotPassword(email: string) {
    await authApi.forgotPassword(email)
  },

  getStoredUser(): AuthUser | null {
    return storageService.getItem<AuthUser>(AUTH_USER_STORAGE_KEY)
  },

  isAuthenticated(): boolean {
    return Boolean(storageService.getAccessToken())
  },
}
