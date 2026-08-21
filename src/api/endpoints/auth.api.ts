import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { AuthTokens, AuthUser, LoginCredentials, RegisterPayload } from '@/types/auth.types'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    ),

  register: (payload: RegisterPayload) =>
    httpClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    ),

  logout: () => httpClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  forgotPassword: (email: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, password: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
}
