import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { errorMessage } from '@/api/errors'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/auth.store'
import type { ListQuery, Page } from '@/types/common.types'

/** Cache key scoped to the current workspace: `['tenant', id, resource, ...rest]`. */
export function useTenantKey() {
  const tenantId = useAuthStore((s) => s.currentTenantId) ?? 'none'
  return (resource: string, ...rest: unknown[]) => ['tenant', tenantId, resource, ...rest] as const
}

type QueryExtras<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** Paged list; keeps the previous page on screen while the next one loads. */
export function useList<T>(resource: string, list: (q: ListQuery) => Promise<Page<T>>, query: ListQuery = {}, options: QueryExtras<Page<T>> = {}) {
  const key = useTenantKey()
  return useQuery({
    queryKey: key(resource, 'list', query),
    queryFn: () => list(query),
    placeholderData: keepPreviousData,
    ...options,
  })
}

/** Every row (first 500) — for pickers and small reference lists. */
export function useAll<T>(resource: string, list: (q: ListQuery) => Promise<Page<T>>, filters: ListQuery['filters'] = {}) {
  return useList(resource, list, { perPage: 500, filters }, { staleTime: 5 * 60_000 })
}

export function useOne<T>(resource: string, get: (id: string) => Promise<T>, id: string | undefined) {
  const key = useTenantKey()
  return useQuery({
    queryKey: key(resource, 'one', id),
    queryFn: () => get(id!),
    enabled: Boolean(id),
  })
}

/** Any tenant-scoped read that is not a plain list (counts, previews, reports). */
export function useTenantQuery<T>(resource: string, params: unknown, fn: () => Promise<T>, options: QueryExtras<T> = {}) {
  const key = useTenantKey()
  return useQuery({ queryKey: key(resource, 'custom', params), queryFn: fn, ...options })
}

interface ActionOptions<R> {
  /** Toast shown on success; a function receives the result. */
  success?: string | ((result: R) => string)
  /** Extra resources whose cache must be refreshed (the main one always is). */
  invalidates?: string[]
  onSuccess?: (result: R) => void
}

/**
 * Mutation that refreshes the resource's cache, toasts the outcome and surfaces
 * server errors. Use for every create/update/delete/action button.
 */
export function useAction<V, R>(resource: string, fn: (vars: V) => Promise<R>, options: ActionOptions<R> = {}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const key = useTenantKey()
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result) => {
      await Promise.all(
        [resource, ...(options.invalidates ?? [])].map((r) => queryClient.invalidateQueries({ queryKey: key(r) })),
      )
      const message = typeof options.success === 'function' ? options.success(result) : options.success
      if (message) toast.success(message)
      options.onSuccess?.(result)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}
