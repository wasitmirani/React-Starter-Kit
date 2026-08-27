import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type { LoginCredentials } from '@/types/auth.types'
import type {
  BackendMe,
  BackendRegisterData,
  BackendTokenPair,
} from '@/types/backend.types'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<ApiResponse<BackendTokenPair>>(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    }),

  register: (payload: {
    email: string
    password: string
    full_name?: string
    organization_name?: string
  }) =>
    httpClient.post<ApiResponse<BackendRegisterData>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    ),

  logout: (refreshToken: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh_token: refreshToken,
    }),

  refresh: (refreshToken: string) =>
    httpClient.post<ApiResponse<BackendTokenPair>>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    }),

  me: () => httpClient.get<ApiResponse<BackendMe>>(API_ENDPOINTS.AUTH.ME),

  forgotPassword: (email: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, password: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  verifyEmail: (token: string) =>
    httpClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
}
