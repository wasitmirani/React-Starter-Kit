export interface PaginatedMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string | null
  meta?: PaginatedMeta | null
  errors?: Record<string, string[]> | null
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
  success?: false
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}

/** @deprecated Prefer PaginatedMeta — kept for existing consumers. */
export interface LegacyPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  per_page?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export function normalizeApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: ApiResponse<unknown> | { message?: string; errors?: Record<string, string[]> } }
      message?: string
    }
    const status = axiosError.response?.status ?? 500
    const body = axiosError.response?.data
    if (body && typeof body === 'object') {
      return {
        message:
          ('message' in body && body.message) ||
          axiosError.message ||
          'Request failed',
        statusCode: status,
        errors: 'errors' in body ? body.errors ?? undefined : undefined,
        success: false,
      }
    }
    return {
      message: axiosError.message ?? 'Request failed',
      statusCode: status,
      success: false,
    }
  }

  if (error instanceof Error) {
    return { message: error.message, statusCode: 500, success: false }
  }

  return { message: 'Unexpected error', statusCode: 500, success: false }
}
