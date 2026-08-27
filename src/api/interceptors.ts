import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios'
import axios from 'axios'
import { storageService } from '@/services/storage.service'
import { HTTP_STATUS, API_ENDPOINTS } from '@/constants/api.constants'
import { API_BASE_URL } from '@/config/env.config'
import type { ApiResponse } from '@/types/api.types'
import { ROUTES } from '@/constants/routes.constants'
import { isDemoToken } from '@/constants/auth.constants'
import { useOrganizationStore } from '@/store/organization.store'
import { apiErrorMessageForStatus, emitApiErrorToast } from '@/lib/api-toast'

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = storageService.getRefreshToken()
  if (!refreshToken) return null

  if (isDemoToken(refreshToken)) {
    return storageService.getAccessToken()
  }

  try {
    const { data } = await axios.post<
      ApiResponse<{ access_token: string; refresh_token: string }>
    >(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    if (!data.success || !data.data) return null
    storageService.setTokens(data.data.access_token, data.data.refresh_token)
    return data.data.access_token
  } catch {
    return null
  }
}

function forceLogout() {
  storageService.clearAuth()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign(ROUTES.LOGIN)
  }
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storageService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      const orgId = useOrganizationStore.getState().currentOrganizationId
      if (orgId) {
        config.headers['X-Organization-Id'] = orgId
      }

      return config
    },
    (error: AxiosError) => Promise.reject(error),
  )

  client.interceptors.response.use(
    (response) => {
      const payload = response.data as ApiResponse<unknown> | undefined
      if (
        payload &&
        typeof payload === 'object' &&
        'success' in payload &&
        payload.success === false
      ) {
        return Promise.reject({
          message: payload.message ?? 'Request failed',
          statusCode: response.status,
          errors: payload.errors ?? undefined,
          success: false as const,
          response,
          isAxiosError: true,
          config: response.config,
          toJSON: () => ({}),
          name: 'ApiError',
        })
      }
      return response
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const status = error.response?.status
      const body = error.response?.data
      const original = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      if (
        status === HTTP_STATUS.UNAUTHORIZED &&
        original &&
        !original._retry &&
        !original.url?.includes(API_ENDPOINTS.AUTH.REFRESH) &&
        !original.url?.includes(API_ENDPOINTS.AUTH.LOGIN)
      ) {
        original._retry = true
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newToken = await refreshPromise
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`
          return client.request(original) as Promise<AxiosResponse>
        }
        forceLogout()
      } else if (status === HTTP_STATUS.UNAUTHORIZED) {
        forceLogout()
      }

      const message = body?.message ?? error.message ?? 'Request failed'
      const toastMessage = apiErrorMessageForStatus(status, message)
      if (toastMessage) {
        emitApiErrorToast(toastMessage)
      }

      return Promise.reject({
        ...error,
        message,
        statusCode: status ?? HTTP_STATUS.SERVER_ERROR,
        errors: body?.errors ?? undefined,
        success: false as const,
      })
    },
  )
}
