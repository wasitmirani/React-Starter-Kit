import { apiClient } from '@/api/http-client'
import type { MockCollection } from '@/api/mock/collection'
import { offlineDemo } from '@/api/mock/offline-demo'
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

/** Product modules, one per `src/api/endpoints/*.api.ts` file. */
export type ApiModule = 'crm' | 'inbox' | 'messaging' | 'automation' | 'channels' | 'platform'

/**
 * Whether a module calls the real backend. The offline demo (no backend reachable)
 * always uses the in-browser mock; otherwise `VITE_USE_MOCKS` decides (env.config.ts).
 */
export function isLive(module: ApiModule): boolean {
  return !offlineDemo.isActive() && !env.mockedModules.has(module)
}

/** `call(mock, real)` bound to one module: runs the mock until that module is live. */
export function callFor(module: ApiModule) {
  return <T>(mock: () => Promise<T>, real: () => Promise<T>): Promise<T> => (isLive(module) ? real() : mock())
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
  /** Defaults to the module that owns the path. */
  module?: ApiModule
}

const MODULE_PATHS: [ApiModule, string[]][] = [
  ['crm', ['/contacts', '/lists', '/segments', '/contact-attributes', '/companies', '/pipelines', '/deals', '/tasks']],
  ['inbox', ['/conversations', '/canned-replies']],
  ['messaging', ['/campaigns', '/templates', '/messages', '/brand-kit']],
  ['automation', ['/workflows', '/workflow-runs']],
  ['channels', ['/channel-accounts', '/sender-domains', '/email-senders', '/phone-numbers', '/calls', '/ivr-menus', '/livechat-widgets']],
  ['platform', ['/forms', '/webhook-endpoints', '/webhook-deliveries', '/billing', '/integrations', '/notifications', '/analytics']],
]

function moduleOf(path: string): ApiModule {
  const found = MODULE_PATHS.find(([, prefixes]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`)))
  if (!found) throw new Error(`No API module owns ${path}; add it to MODULE_PATHS`)
  return found[0]
}

/**
 * Standard REST resource: `GET /path`, `GET /path/:id`, `POST /path`,
 * `PATCH /path/:id`, `DELETE /path/:id`. Tenant comes from the `X-Tenant-Id` header.
 */
export function createResourceApi<T extends Entity>(
  path: string,
  mock: MockCollection<T>,
  { decorate = (row) => row, module = moduleOf(path) }: ResourceOptions<T> = {},
): ResourceApi<T> {
  const call = callFor(module)
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
