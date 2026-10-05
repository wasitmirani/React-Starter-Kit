import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useDebounce } from '@/hooks/useDebounce'
import { searchService } from '@/services/search.service'

interface SearchBoxProps {
  /** Input placeholder text */
  placeholder?: string
  /** API endpoint to call, e.g. `/users` or `/api/users` */
  apiUrl: string
  /** Sync `search` query param to the URL (default: true) */
  syncUrl?: boolean
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number
  /** Minimum characters before searching (default: 3) */
  minLength?: number
  onLoading?: (loading: boolean) => void
  onFilterData?: (data: unknown) => void
  onQuery?: (query: string) => void
  onReload?: () => void
}

export function SearchBox({
  placeholder = 'Search...',
  apiUrl,
  syncUrl = true,
  debounceMs = 500,
  minLength = 3,
  onLoading,
  onFilterData,
  onQuery,
  onReload,
}: SearchBoxProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() =>
    syncUrl ? (searchParams.get('search') ?? '') : '',
  )
  const debouncedQuery = useDebounce(query, debounceMs)
  const controllerRef = useRef<AbortController | null>(null)
  const skipEmptyReload = useRef(true)

  // Keep latest callbacks / URL helpers without re-triggering the search effect
  const callbacksRef = useRef({ onLoading, onFilterData, onQuery, onReload, syncUrl, apiUrl, minLength })
  callbacksRef.current = { onLoading, onFilterData, onQuery, onReload, syncUrl, apiUrl, minLength }

  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  useEffect(() => {
    const {
      onLoading: emitLoading,
      onFilterData: emitFilterData,
      onQuery: emitQuery,
      onReload: emitReload,
      syncUrl: shouldSyncUrl,
      apiUrl: path,
      minLength: min,
    } = callbacksRef.current

    const value = debouncedQuery

    if (!value.trim()) {
      if (skipEmptyReload.current) {
        skipEmptyReload.current = false
        return
      }

      controllerRef.current?.abort()
      emitQuery?.('')
      emitReload?.()

      if (shouldSyncUrl) {
        const next = new URLSearchParams(searchParamsRef.current)
        if (next.has('search')) {
          next.delete('search')
          setSearchParams(next, { replace: true })
        }
      }
      return
    }

    skipEmptyReload.current = false

    if (value.length < min) return

    const run = async () => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      emitLoading?.(true)

      try {
        const data = await searchService.search(path, value, controller.signal)

        emitFilterData?.(data)
        emitQuery?.(value)

        if (shouldSyncUrl) {
          const next = new URLSearchParams(searchParamsRef.current)
          next.set('search', value)
          setSearchParams(next, { replace: true })
        }
      } catch (error) {
        if (isAxiosError(error) && error.code === 'ERR_CANCELED') return
        console.error(error)
      } finally {
        emitLoading?.(false)
      }
    }

    void run()

    return () => {
      controllerRef.current?.abort()
    }
  }, [debouncedQuery, setSearchParams])

  return (
    <div className="flex-shrink-0">
      <div className="position-relative">
        <input
          type="search"
          className="form-control bg-light-subtle border-0 pe-9"
          placeholder={placeholder}
          title="Search characters should be greater than two."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <i className="mgc_search_line position-absolute top-50 end-0 me-3 translate-middle-y text-muted" />
      </div>
    </div>
  )
}
