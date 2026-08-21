import { authApi } from '@/api/endpoints/auth.api'
import type { LoginCredentials, RegisterPayload } from '@/types/auth.types'
import { storageService } from './storage.service'

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await authApi.login(credentials)
    const { user, tokens } = data.data
    storageService.setTokens(tokens.accessToken, tokens.refreshToken)
    return user
  },

  async register(payload: RegisterPayload) {
    const { data } = await authApi.register(payload)
    const { user, tokens } = data.data
    storageService.setTokens(tokens.accessToken, tokens.refreshToken)
    return user
  },

  async logout() {
    try {
      await authApi.logout()
    } finally {
      storageService.clearAuth()
    }
  },

  async forgotPassword(email: string) {
    await authApi.forgotPassword(email)
  },

  isAuthenticated(): boolean {
    return Boolean(storageService.getAccessToken())
  },
}
