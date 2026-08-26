import type { ReactNode } from 'react'

export type DataTableAlign = 'start' | 'center' | 'end'

/** Column definition — `key` is the field name and React key. */
export interface DataTableColumn<T> {
  key: keyof T & string
  header: ReactNode
  /** Custom cell. Defaults to `row[key]`. */
  render?: (row: T, index: number) => ReactNode
  align?: DataTableAlign
  className?: string
  hidden?: boolean
}

export type DataTableActionVariant = 'view' | 'edit' | 'delete' | 'default'

/** Optional custom action button. Prefer `onView` / `onEdit` / `onDelete` for CRUD. */
export interface DataTableAction<T> {
  key: string
  label: string
  icon?: string
  variant?: DataTableActionVariant
  className?: string
  onClick: (row: T, index: number) => void
  hidden?: (row: T) => boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Defaults to `row.id` when present. */
  getRowId?: (row: T, index: number) => string

  className?: string
  tableClassName?: string
  theadClassName?: string

  /** Enable row checkboxes. */
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void

  /** Built-in CRUD actions — shown when provided. */
  onView?: (row: T, index: number) => void
  onEdit?: (row: T, index: number) => void
  onDelete?: (row: T, index: number) => void
  /** Extra actions beyond view / edit / delete. */
  actions?: DataTableAction<T>[]
  actionsHeader?: ReactNode

  onRowClick?: (row: T, index: number) => void
  getRowClassName?: (row: T, index: number) => string | undefined

  isLoading?: boolean
  emptyMessage?: ReactNode
  loadingMessage?: ReactNode
}
