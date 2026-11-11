import { CURRENT_TENANT_STORAGE_KEY } from '@/constants/auth.constants'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const storageService = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    storageService.setAccessToken(accessToken)
    storageService.setRefreshToken(refreshToken)
  },

  clearAuth: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  getTenantId: (): string | null => localStorage.getItem(CURRENT_TENANT_STORAGE_KEY),

  setTenantId: (tenantId: string | null): void => {
    if (tenantId) localStorage.setItem(CURRENT_TENANT_STORAGE_KEY, tenantId)
    else localStorage.removeItem(CURRENT_TENANT_STORAGE_KEY)
  },

  getItem: <T>(key: string): T | null => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  setItem: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}
