import { apiClient } from '@/api/http-client'
import type { MockCollection } from '@/api/mock/collection'
import { env } from '@/config/env.config'
import type { ApiResponse } from '@/types/api.types'
import type { Entity, EntityInput, ListQuery, Page } from '@/types/common.types'

/** Thin typed wrappers that unwrap the `{ data }` envelope. */
export const http = {
  get: async <T>(url: string, params?: object) => (await apiClient.get<ApiResponse<T>>(url, { params })).data.data,
  post: async <T>(url: string, body?: unknown) => (await apiClient.post<ApiResponse<T>>(url, body)).data.data,
  patch: async <T>(url: string, body?: unknown) => (await apiClient.patch<ApiResponse<T>>(url, body)).data.data,
  put: async <T>(url: string, body?: unknown) => (await apiClient.put<ApiResponse<T>>(url, body)).data.data,
  delete: async (url: string) => {
    await apiClient.delete(url)
  },
}

/** Runs the mock implementation while the backend module is not built yet. */
export function call<T>(mock: () => Promise<T>, real: () => Promise<T>): Promise<T> {
  return env.useMocks ? mock() : real()
}

/** Query-string form of a list query: `?page=2&per_page=20&search=…&sort=name&order=asc&status=active`. */
export function toParams(q: ListQuery = {}) {
  return {
    page: q.page,
    per_page: q.perPage,
    search: q.search || undefined,
    sort: q.sort,
    order: q.order,
    ...q.filters,
  }
}

export interface ResourceApi<T extends Entity, In = EntityInput<T>> {
  list: (q?: ListQuery) => Promise<Page<T>>
  get: (id: string) => Promise<T>
  create: (input: In) => Promise<T>
  update: (id: string, patch: Partial<In>) => Promise<T>
  remove: (id: string) => Promise<void>
}

interface ResourceOptions<T> {
  /** Adds derived fields (counts, joins) to mock rows; the real API returns them computed. */
  decorate?: (row: T) => T
}

/**
 * Standard REST resource: `GET /path`, `GET /path/:id`, `POST /path`,
 * `PATCH /path/:id`, `DELETE /path/:id`. Tenant comes from the `X-Tenant-Id` header.
 */
export function createResourceApi<T extends Entity>(
  path: string,
  mock: MockCollection<T>,
  { decorate = (row) => row }: ResourceOptions<T> = {},
): ResourceApi<T> {
  return {
    list: (q) =>
      call(
        async () => {
          const page = await mock.list(q)
          return { ...page, data: page.data.map(decorate) }
        },
        () => http.get<Page<T>>(path, toParams(q)),
      ),
    get: (id) => call(async () => decorate(await mock.get(id)), () => http.get<T>(`${path}/${id}`)),
    create: (input) => call(() => mock.create(input), () => http.post<T>(path, input)),
    update: (id, patch) => call(() => mock.update(id, patch), () => http.patch<T>(`${path}/${id}`, patch)),
    remove: (id) => call(() => mock.remove(id), () => http.delete(`${path}/${id}`)),
  }
}
