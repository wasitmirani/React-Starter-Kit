import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  AuthResult,
  LoginCredentials,
  Profile,
  RegisterPayload,
  UserSession,
} from '@/types/auth.types'

/** Auth endpoints: sessions, password recovery and email verification. */
export const authApi = {
  /** Sign in with email/password. Returns tokens, the user and their workspaces. */
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  /** Create an account and its first workspace. Returns tokens like login. */
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.REGISTER, payload),

  /** End the current session on the server. */
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  /** Current user and workspace memberships (with permissions). */
  me: () => apiClient.get<ApiResponse<Profile>>(API_ENDPOINTS.AUTH.ME),

  /** Active sessions of the current user. */
  sessions: () => apiClient.get<ApiResponse<UserSession[]>>(API_ENDPOINTS.AUTH.SESSIONS),

  /** Sign out another device. */
  revokeSession: (id: string) => apiClient.delete(`${API_ENDPOINTS.AUTH.SESSIONS}/${id}`),

  /** Request a password-reset email. Always succeeds (no account enumeration). */
  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /** Set a new password using the token from the reset email. */
  resetPassword: (token: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  /** Change password; other sessions are signed out. */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword }),

  verifyEmail: (token: string) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  resendVerification: () => apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION),
}
