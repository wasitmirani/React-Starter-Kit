import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { AuthTokens, AuthUser, LoginCredentials, RegisterPayload } from '@/types/auth.types'

/** Auth endpoints: login, register, logout, and password recovery. */
export const authApi = {
  /** Sign in with email/password. Returns the user and auth tokens. */
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    ),

  /** Create a new account. Returns the user and auth tokens. */
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    ),

  /** End the current session on the server. */
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  /** Request a password-reset email for the given address. */
  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /** Set a new password using a reset token from the recovery email. */
  resetPassword: (token: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
}
