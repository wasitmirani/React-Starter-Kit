/** Every stored record has these. Ids are UUIDs from the API. */
export interface Entity {
  id: string
  createdAt: string
  updatedAt: string
}

/** Fields the server sets; never sent on create/update. */
export type EntityInput<T extends Entity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

/** Offset page with totals, used by list tables. Mirrors `PaginatedRows` in DataTable. */
export interface Page<T> {
  data: T[]
  current_page: number
  last_page: number
  from: number | null
  to: number | null
  total: number
}

/** Query for any list endpoint. Unknown filter keys are matched by equality. */
export interface ListQuery {
  page?: number
  perPage?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, string | undefined>
}

export type Tone = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'orange' | 'pink'

export interface Option<V extends string = string> {
  value: V
  label: string
}

export interface TimePoint {
  date: string
  value: number
}
