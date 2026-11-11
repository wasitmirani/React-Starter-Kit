import type { PaginatedRows } from './DataTable.types'

/** Wraps a complete (unpaginated) list in the DataTable row shape. */
export function allRows<T>(items: T[] | undefined): PaginatedRows<T> {
  const data = items ?? []
  return {
    data,
    current_page: 1,
    last_page: 1,
    from: data.length > 0 ? 1 : null,
    to: data.length > 0 ? data.length : null,
    total: data.length,
  }
}
