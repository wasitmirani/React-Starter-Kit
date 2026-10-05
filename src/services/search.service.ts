import { apiClient } from '@/api/http-client'

export const searchService = {
  async search(url: string, query: string, signal?: AbortSignal) {
    try {
      const response = await apiClient .get(url, {
      params: { query },
      signal,
      })
      return response?.data ?? []
    } catch (error) {
      console.error(error)
      return []
    }
  },
}
