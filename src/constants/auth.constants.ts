import type { AuthTokens, AuthUser, LoginCredentials } from '@/types/auth.types'

/** Local demo login — used when the API backend is unavailable. */
export const DEMO_CREDENTIALS: LoginCredentials = {
  email: 'admin@demo.com',
  password: 'admin123',
}

export const DEMO_USER: AuthUser = {
  id: 'demo-1',
  name: 'Demo Admin',
  email: DEMO_CREDENTIALS.email,
  role: 'owner',
}

export const DEMO_TOKENS: AuthTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
}

export const AUTH_USER_STORAGE_KEY = 'auth_user'

export function isDemoToken(token: string | null): boolean {
  return Boolean(token?.startsWith('demo-'))
}
