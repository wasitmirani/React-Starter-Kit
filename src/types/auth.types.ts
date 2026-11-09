export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  workspaceName: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  /** Access-token lifetime in seconds. */
  expiresIn: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  isPlatformAdmin: boolean
  mfaEnabled: boolean
  avatarUrl: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface Membership {
  memberId: string
  tenant: { id: string; name: string; slug: string; status: 'active' | 'suspended' }
  role: { id: string; key: string; name: string }
  permissions: string[]
}

export interface Profile {
  user: AuthUser
  memberships: Membership[]
}

export type AuthResult = AuthTokens & Profile

export interface UserSession {
  id: string
  userAgent: string | null
  ip: string | null
  createdAt: string
  lastUsedAt: string
  expiresAt: string
  current: boolean
}
