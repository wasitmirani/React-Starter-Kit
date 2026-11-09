import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api.constants'
import { offlineAdapter, offlineDemo } from '@/api/mock/offline-demo'
import { SESSION_ENDED_CODES } from '@/constants/auth.constants'
import { storageService } from '@/services/storage.service'
import type { ApiErrorBody, ApiResponse } from '@/types/api.types'
import type { AuthTokens } from '@/types/auth.types'

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let sessionEndedHandler: () => void = () => {}

/** Called once when the session cannot be recovered (the app signs the user out). */
export function onSessionEnded(handler: () => void): void {
  sessionEndedHandler = handler
}

let refreshInFlight: Promise<string> | null = null

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Exchanges the refresh token for a new pair. Concurrent callers share one request
 * because refresh tokens are single-use (reuse revokes the session server-side).
 */
function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= (async () => {
    const refreshToken = storageService.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')
    try {
      const { data } = await axios.post<ApiResponse<AuthTokens>>(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
      )
      storageService.setTokens(data.data.accessToken, data.data.refreshToken)
      return data.data.accessToken
    } catch (error) {
      // Another tab rotated the same token a moment ago: wait for it to store the new pair.
      if ((error as AxiosError<ApiErrorBody>).response?.data?.code === 'REFRESH_TOKEN_ALREADY_USED') {
        for (let i = 0; i < 10; i++) {
          await sleep(200)
          if (storageService.getRefreshToken() !== refreshToken) {
            return storageService.getAccessToken() as string
          }
        }
      }
      throw error
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Offline demo session: answer locally, never contact the server.
    if (offlineDemo.isActive()) {
      config.adapter = offlineAdapter
      return config
    }
    const token = storageService.getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    const tenantId = storageService.getTenantId()
    if (tenantId && !config.headers.has('X-Tenant-Id')) config.headers.set('X-Tenant-Id', tenantId)
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const original = error.config as RetriableConfig | undefined
      const code = error.response?.data?.code

      if (error.response?.status === 401 && code === 'INVALID_TOKEN' && original && !original._retried) {
        original._retried = true
        try {
          const accessToken = await refreshAccessToken()
          original.headers.Authorization = `Bearer ${accessToken}`
          return client(original)
        } catch {
          storageService.clearAuth()
          sessionEndedHandler()
          return Promise.reject(error)
        }
      }

      if (error.response?.status === 401 && SESSION_ENDED_CODES.includes(code as (typeof SESSION_ENDED_CODES)[number])) {
        storageService.clearAuth()
        sessionEndedHandler()
      }
      return Promise.reject(error)
    },
  )
}
