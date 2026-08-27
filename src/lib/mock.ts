import type { ApiResponse, PaginatedMeta, PaginationParams } from '@/types/api.types'

export function ok<T>(data: T, message: string | null = null): ApiResponse<T> {
  return { success: true, data, message, meta: null }
}

export function okPage<T>(
  data: T[],
  meta: PaginatedMeta,
  message: string | null = null,
): ApiResponse<T[]> {
  return { success: true, data, message, meta }
}

export function fail<T = null>(
  message: string,
  errors: Record<string, string[]> | null = null,
): ApiResponse<T> {
  return { success: false, data: null as T, message, errors, meta: null }
}

export function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function paginate<T>(
  items: T[],
  params: PaginationParams = {},
): { data: T[]; meta: PaginatedMeta } {
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.max(1, params.per_page ?? params.pageSize ?? 10)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = items.slice(start, start + perPage)

  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
  }
}

export function toDataTableRows<T>(
  data: T[],
  meta: PaginatedMeta,
): {
  data: T[]
  current_page: number
  last_page: number
  from: number | null
  to: number | null
  total: number
} {
  const from = meta.total === 0 ? null : (meta.page - 1) * meta.per_page + 1
  const to =
    meta.total === 0 ? null : Math.min(meta.page * meta.per_page, meta.total)

  return {
    data,
    current_page: meta.page,
    last_page: meta.total_pages,
    from,
    to,
    total: meta.total,
  }
}
