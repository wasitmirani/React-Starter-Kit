import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { storageService } from '@/services/storage.service'

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storageService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error),
  )

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        storageService.clearAuth()
      }
      return Promise.reject(error)
    },
  )
}
