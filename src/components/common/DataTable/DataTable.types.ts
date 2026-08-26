import type { ReactNode } from 'react'

export type DataTableAlign = 'start' | 'center' | 'end'

export type DataTableActionVariant = 'view' | 'edit' | 'delete' | 'default'

/** Laravel-style paginated payload. */
export interface PaginatedRows<T> {
  data: T[]
  current_page: number
  last_page: number
  from: number | null
  to: number | null
  total: number
}

/** Column definition — `key` is the field name and React key. */
export interface DataTableColumn<T> {
  key: keyof T & string
  header: ReactNode
  /** Custom cell. Defaults to `row[key]`. */
  render?: (row: T, index: number) => ReactNode
  align?: DataTableAlign
  className?: string
  /** CSS width for th/td (e.g. "8%", "7rem", "110px"). */
  width?: string
  hidden?: boolean
  sortable?: boolean
}

/** Declarative row action — emit via `onAction`. */
export interface DataTableAction<T> {
  key: string
  label: string
  icon?: string
  variant?: DataTableActionVariant
  className?: string
  /** Hide action for a specific row when false. */
  condition?: (row: T) => boolean
}

export interface DataTableBulkAction {
  label: string
  action: string
}

export type DataTableActionPayload<T> =
  | { action: string; row: T }
  | { action: 'sort'; column: string; direction: 'asc' | 'desc' }
  | { action: string; selected: string[]; rows: T[] }

export interface DataTableHandle {
  clearSelection: () => void
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: PaginatedRows<T>
  /** Defaults to `row.id` when present. */
  getRowId?: (row: T, index: number) => string

  className?: string
  tableClassName?: string
  theadClassName?: string

  /** Enable row checkboxes. Also enabled when `enableBulkActions` is true. */
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void

  enableBulkActions?: boolean
  bulkActions?: DataTableBulkAction[]

  actions?: DataTableAction<T>[]
  actionsHeader?: ReactNode
  onAction?: (payload: DataTableActionPayload<T>) => void

  /** Called when page / per-page changes (after optional URL sync). */
  fetchData?: (page?: number, perPage?: number) => void
  /** Sync `page` / `per_page` into the URL search params. */
  syncUrl?: boolean
  /** Label in footer summary, e.g. "members". Plural form; singularized when total === 1. */
  itemsLabel?: string

  onRowClick?: (row: T, index: number) => void
  getRowClassName?: (row: T, index: number) => string | undefined

  isLoading?: boolean
  emptyMessage?: ReactNode
  emptyDescription?: ReactNode
  loadingMessage?: ReactNode
}
