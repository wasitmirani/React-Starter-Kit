import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ListQuery } from '@/types/common.types'

const RESERVED = new Set(['page', 'q', 'sort', 'order'])

/**
 * List state (search, filters, sort, page) kept in the URL, so it survives
 * reloads and can be shared as a link. Changing any filter returns to page 1.
 */
export function useListParams({ perPage = 20, filterKeys = [] as string[] } = {}) {
  const [params, setParams] = useSearchParams()
  const filterSig = filterKeys.join(',')

  const query = useMemo<ListQuery>(() => {
    const filters: Record<string, string> = {}
    for (const key of filterSig.split(',').filter(Boolean)) {
      const value = params.get(key)
      if (value) filters[key] = value
    }
    return {
      page: Number(params.get('page')) || 1,
      perPage,
      search: params.get('q') ?? '',
      sort: params.get('sort') ?? undefined,
      order: (params.get('order') as 'asc' | 'desc' | null) ?? undefined,
      filters,
    }
  }, [params, perPage, filterSig])

  const update = useCallback(
    (changes: Record<string, string | number | undefined>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '' || (key === 'page' && value === 1)) next.delete(key)
            else next.set(key, String(value))
          }
          if (resetPage && !('page' in changes)) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const activeFilters = Object.keys(query.filters ?? {}).filter((k) => !RESERVED.has(k)).length

  return {
    query,
    filters: query.filters as Record<string, string>,
    activeFilters,
    setSearch: (q: string) => update({ q }),
    setFilter: (key: string, value: string | undefined) => update({ [key]: value }),
    setPage: (page: number) => update({ page }, false),
    setSort: (sort: string, order: 'asc' | 'desc') => update({ sort, order }),
    clear: () => update(Object.fromEntries([...filterKeys, 'q', 'sort', 'order'].map((k) => [k, undefined]))),
  }
}
