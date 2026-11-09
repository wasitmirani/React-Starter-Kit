import { AppError } from '@/api/errors'
import { useAuthStore } from '@/store/auth.store'
import type { Entity, EntityInput, ListQuery, Page } from '@/types/common.types'

const STORAGE_PREFIX = 'birdcrm.mock.v5'

/** Simulated network latency so loading states are visible during development. */
export function latency(min = 120, max = 380): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
}

export function uid(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Copy of a row without the server-owned fields, ready for `create` (duplicate actions). */
export function stripMeta<T extends Entity>(row: T): EntityInput<T> {
  const copy: Partial<T> = structuredClone(row)
  delete copy.id
  delete copy.createdAt
  delete copy.updatedAt
  return copy as EntityInput<T>
}

const currentTenant = () => useAuthStore.getState().currentTenantId ?? 'anonymous'

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function matchesFilter(value: unknown, expected: string): boolean {
  if (Array.isArray(value)) return value.map(String).includes(expected)
  if (typeof value === 'boolean') return String(value) === expected
  return String(value ?? '') === expected
}

export function paginate<T>(rows: T[], page = 1, perPage = 20): Page<T> {
  const total = rows.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), lastPage)
  const start = (current - 1) * perPage
  const data = rows.slice(start, start + perPage)
  return {
    data,
    current_page: current,
    last_page: lastPage,
    from: data.length ? start + 1 : null,
    to: data.length ? start + data.length : null,
    total,
  }
}

interface CollectionOptions<T> {
  /** Fields matched by the free-text `search` param. */
  searchFields: (keyof T)[]
  /** Default sort field (newest first when it is a date). */
  defaultSort?: keyof T & string
  /** Seed rows for a workspace the first time it is opened. */
  seed: () => T[]
}

/**
 * In-browser stand-in for one REST resource. Rows are stored per workspace in
 * localStorage, so tenants never see each other's data and edits survive a reload.
 * Behaviour mirrors the planned API: search, equality filters, sort, offset pages, 404s.
 */
export class MockCollection<T extends Entity> {
  private readonly cache = new Map<string, T[]>()
  private readonly name: string
  private readonly options: CollectionOptions<T>

  constructor(name: string, options: CollectionOptions<T>) {
    this.name = name
    this.options = options
  }

  private storageKey(tenant: string) {
    return `${STORAGE_PREFIX}.${tenant}.${this.name}`
  }

  /** Synchronous access for derived data (counts, joins). */
  rows(): T[] {
    const tenant = currentTenant()
    const cached = this.cache.get(tenant)
    if (cached) return cached
    let rows: T[]
    try {
      const stored = localStorage.getItem(this.storageKey(tenant))
      rows = stored ? (JSON.parse(stored) as T[]) : this.options.seed()
    } catch {
      rows = this.options.seed()
    }
    this.cache.set(tenant, rows)
    this.persist(rows)
    return rows
  }

  private persist(rows: T[]) {
    const tenant = currentTenant()
    this.cache.set(tenant, rows)
    try {
      localStorage.setItem(this.storageKey(tenant), JSON.stringify(rows))
    } catch {
      // Storage full or disabled: keep working from memory.
    }
  }

  find(id: string): T {
    const row = this.rows().find((r) => r.id === id)
    if (!row) throw new AppError(404, 'NOT_FOUND', `${this.name} not found`)
    return row
  }

  query(q: ListQuery = {}): T[] {
    let rows = [...this.rows()]
    const search = q.search?.trim().toLowerCase()
    if (search) {
      rows = rows.filter((row) =>
        this.options.searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(search)),
      )
    }
    for (const [key, expected] of Object.entries(q.filters ?? {})) {
      if (expected === undefined || expected === '') continue
      rows = rows.filter((row) => matchesFilter((row as Record<string, unknown>)[key], expected))
    }
    const sort = q.sort ?? this.options.defaultSort ?? 'createdAt'
    const order = q.order ?? (q.sort ? 'asc' : 'desc')
    rows.sort((a, b) => {
      const result = compare((a as Record<string, unknown>)[sort], (b as Record<string, unknown>)[sort])
      return order === 'asc' ? result : -result
    })
    return rows
  }

  async list(q: ListQuery = {}): Promise<Page<T>> {
    await latency()
    return paginate(this.query(q), q.page, q.perPage)
  }

  async get(id: string): Promise<T> {
    await latency(80, 200)
    return structuredClone(this.find(id))
  }

  async create(input: EntityInput<T>): Promise<T> {
    await latency()
    const at = nowIso()
    const row = { ...input, id: uid(), createdAt: at, updatedAt: at } as T
    this.persist([row, ...this.rows()])
    return row
  }

  async update(id: string, patch: Partial<EntityInput<T>>): Promise<T> {
    await latency()
    const existing = this.find(id)
    const row = { ...existing, ...patch, id, updatedAt: nowIso() } as T
    this.persist(this.rows().map((r) => (r.id === id ? row : r)))
    return row
  }

  async remove(id: string): Promise<void> {
    await latency()
    this.find(id)
    this.persist(this.rows().filter((r) => r.id !== id))
  }

  /** Bulk write used by derived operations (imports, bulk tag). */
  replaceAll(rows: T[]) {
    this.persist(rows)
  }
}

/** Removes every mock collection of the current workspace (Settings → reset demo data). */
export function resetMockData() {
  const prefix = `${STORAGE_PREFIX}.${currentTenant()}.`
  Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => localStorage.removeItem(key))
  window.location.reload()
}
