export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationName?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type AuthRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'agent_manager'
  | 'analyst'
  | 'viewer'
  | 'user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
}
