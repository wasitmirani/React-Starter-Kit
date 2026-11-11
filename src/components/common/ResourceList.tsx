import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '@/api/errors'
import { DataTable, type DataTableAction, type DataTableBulkAction, type DataTableColumn, type DataTableHandle } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { QueryError } from '@/components/common/Misc'
import { Dropdown } from '@/components/ui/Dropdown'
import { useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast } from '@/hooks/useToast'
import type { ListQuery, Option, Page } from '@/types/common.types'
import { downloadCsv } from '@/utils/helpers/csv'

export interface ListFilter {
  key: string
  allLabel: string
  options: Option[]
}

interface ResourceListProps<T extends { id: string }> {
  /** Cache key, e.g. `orders`. Also namespaces saved views and column choices. */
  resource: string
  list: (q: ListQuery) => Promise<Page<T>>
  columns: DataTableColumn<T>[]
  itemsLabel: string
  filters?: ListFilter[]
  /** Always-applied filters that are not user controls (e.g. `{ type: 'putaway' }`). */
  scope?: Record<string, string>
  searchPlaceholder?: string
  perPage?: number
  rowLink?: (row: T) => string
  actions?: DataTableAction<T>[]
  onRowAction?: (action: string, row: T) => void
  bulkActions?: DataTableBulkAction[]
  onBulkAction?: (action: string, rows: T[]) => void
  /** File name for "Export CSV" (exports every row matching the current filters). */
  exportName?: string
  emptyMessage?: string
  emptyDescription?: ReactNode
  toolbar?: ReactNode
}

const EMPTY: Page<never> = { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }

function exportValue(value: unknown) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.every((v) => typeof v !== 'object') ? value.join('; ') : value.length
  return typeof value === 'object' ? '' : value
}

/**
 * Standard list screen body (plan §7.5): server-side paging, sort, search and
 * filters kept in the URL, column selection, saved views, bulk actions, CSV export
 * of the current filter, and loading / empty / error states.
 */
export function ResourceList<T extends { id: string }>({
  resource, list, columns, itemsLabel, filters = [], scope, searchPlaceholder = 'Search…', perPage = 25, rowLink, actions, onRowAction, bulkActions, onBulkAction, exportName, emptyMessage, emptyDescription, toolbar,
}: ResourceListProps<T>) {
  const navigate = useNavigate()
  const toast = useToast()
  const table = useRef<DataTableHandle>(null)
  const [params] = useSearchParams()
  const { query, setSearch, setFilter, setPage, setSort, clear, activeFilters } = useListParams({ perPage, filterKeys: filters.map((f) => f.key) })
  const scoped: ListQuery = scope ? { ...query, filters: { ...query.filters, ...scope } } : query
  const rows = useList(resource, list, scoped)
  const [hidden, setHidden] = useLocalStorage<string[]>(`cols.${resource}`, columns.filter((c) => c.hidden).map((c) => c.key))
  const [views, setViews] = useLocalStorage<{ name: string; search: string }[]>(`views.${resource}`, [])
  const [exporting, setExporting] = useState(false)

  // Selections never survive a page, filter or data change.
  useEffect(() => table.current?.clearSelection(), [rows.data])

  const visible = columns.map((c) => ({ ...c, hidden: hidden.includes(c.key) }))

  const exportCsv = async () => {
    setExporting(true)
    try {
      const all = await list({ ...scoped, page: 1, perPage: 5000 })
      downloadCsv(`${exportName}.csv`, visible.filter((c) => !c.hidden).map((c) => ({ label: c.label ?? c.key, value: (row: T) => exportValue((row as Record<string, unknown>)[c.key]) })), all.data)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  const saveView = () => {
    const name = window.prompt('Name this view (current search, filters and sort)')?.trim()
    if (name) setViews([...views.filter((v) => v.name !== name), { name, search: params.toString() }])
  }

  return (
    <div className="card">
      <div className="card-body pb-0">
        <FilterBar
          onClear={clear}
          activeCount={activeFilters + (query.search ? 1 : 0)}
          end={
            <>
              {toolbar}
              <Dropdown
                label={<><i className="ri-bookmark-line" /> <span className="d-none d-xl-inline">Views</span></>}
                buttonClassName="btn btn-light btn-sm"
                items={[
                  ...views.map((v) => ({ key: v.name, label: v.name, icon: 'ri-filter-3-line', onSelect: () => navigate({ search: v.search }) })),
                  ...(views.length ? (['divider'] as const) : []),
                  { key: '__save', label: 'Save current view…', icon: 'ri-save-line', onSelect: saveView },
                  ...(views.length ? [{ key: '__clear', label: 'Delete saved views', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setViews([]) }] : []),
                ]}
              />
              <ColumnPicker columns={visible} onToggle={(key) => setHidden(hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key])} />
              {exportName && (
                <button type="button" className="btn btn-light btn-sm" onClick={exportCsv} disabled={exporting}>
                  <i className="ri-download-2-line" /> <span className="d-none d-xl-inline">{exporting ? 'Exporting…' : 'Export'}</span>
                </button>
              )}
            </>
          }
        >
          <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder={searchPlaceholder} />
          {filters.map((f) => (
            <FilterSelect key={f.key} value={query.filters?.[f.key]} onChange={(v) => setFilter(f.key, v)} options={f.options} allLabel={f.allLabel} />
          ))}
        </FilterBar>
        {(query.search || filters.some((f) => query.filters?.[f.key])) && (
          <div className="filter-chips" aria-label="Active filters">
            <span className="text-muted fs-xs me-1"><i className="ri-filter-3-line" /> {rows.data ? `${rows.data.total.toLocaleString()} ${itemsLabel}` : 'Filtering…'}</span>
            {query.search && (
              <span className="filter-chip"><span className="chip-key">Search:</span> “{query.search}”<button type="button" aria-label="Clear search" onClick={() => setSearch('')}><i className="ri-close-line" /></button></span>
            )}
            {filters.filter((f) => query.filters?.[f.key]).map((f) => (
              <span key={f.key} className="filter-chip">
                <span className="chip-key">{f.allLabel.replace(/^(All|Any)\s+/i, '').replace(/^\w/, (c) => c.toUpperCase())}:</span>
                {f.options.find((o) => o.value === query.filters?.[f.key])?.label ?? query.filters?.[f.key]}
                <button type="button" aria-label={`Remove ${f.allLabel} filter`} onClick={() => setFilter(f.key, undefined)}><i className="ri-close-line" /></button>
              </span>
            ))}
          </div>
        )}
        {rows.isError && (
          <div className="mb-4">
            <QueryError message={errorMessage(rows.error)} onRetry={() => rows.refetch()} />
          </div>
        )}
      </div>
      <DataTable<T>
        ref={table}
        columns={visible}
        rows={rows.data ?? EMPTY}
        isLoading={rows.isLoading}
        itemsLabel={itemsLabel}
        fetchData={(page) => page && setPage(page)}
        onRowClick={rowLink ? (row) => navigate(rowLink(row)) : undefined}
        actions={actions}
        enableBulkActions={!!bulkActions?.length}
        bulkActions={bulkActions}
        emptyMessage={emptyMessage ?? (activeFilters || query.search ? `No ${itemsLabel} match these filters` : `No ${itemsLabel} yet`)}
        emptyDescription={emptyDescription}
        onAction={(p) => {
          if ('direction' in p) return setSort(p.column, p.direction)
          if ('row' in p) return onRowAction?.(p.action, p.row)
          if ('rows' in p) onBulkAction?.(p.action, p.rows)
        }}
      />
    </div>
  )
}

/** Column visibility menu; stays open while toggling. */
function ColumnPicker<T>({ columns, onToggle }: { columns: DataTableColumn<T>[]; onToggle: (key: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])
  return (
    <div className="dropdown position-relative" ref={ref}>
      <button type="button" className="btn btn-light btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i className="ri-layout-column-line" /> <span className="d-none d-xl-inline">Columns</span>
      </button>
      {open && (
        <div className="dropdown-menu dropdown-menu-end end-0 show shadow-sm p-2" style={{ top: '100%', minWidth: '12rem' }}>
          {columns.filter((c) => c.label).map((c) => (
            <label key={c.key} className="dropdown-item d-flex align-items-center gap-2 rounded">
              <input type="checkbox" className="form-check-input m-0" checked={!c.hidden} onChange={() => onToggle(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
