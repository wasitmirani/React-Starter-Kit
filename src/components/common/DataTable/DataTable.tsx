import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  type ChangeEvent,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  DataTableAction,
  DataTableActionVariant,
  DataTableAlign,
  DataTableColumn,
  DataTableHandle,
  DataTableProps,
} from './DataTable.types'
import { dataTableStyles as s } from './DataTable.styles'

function resolveRowId<T>(row: T, index: number, getRowId?: DataTableProps<T>['getRowId']): string {
  if (getRowId) return getRowId(row, index)
  if (row && typeof row === 'object' && 'id' in row && (row as { id: unknown }).id != null) {
    return String((row as { id: unknown }).id)
  }
  return String(index)
}

function alignClass(align?: DataTableAlign) {
  if (align === 'center') return 'text-center'
  if (align === 'end') return 'text-end'
  return ''
}

function actionClass(variant: DataTableActionVariant = 'default', extra?: string) {
  return [s.actionBase, s.actionVariants[variant], extra].filter(Boolean).join(' ')
}

function buildPaginationRange(current: number, last: number, delta = 2): (number | '...')[] {
  const range: (number | '...')[] = []
  for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
    range.push(i)
  }
  if (current > delta + 2) {
    range.unshift('...')
  }
  if (current < last - delta - 1) {
    range.push('...')
  }
  return range
}

function itemsLabelText(total: number, label: string) {
  if (total === 1) {
    return label.replace(/s$/i, '') || label
  }
  return label
}

function ActionBtn({
  label,
  icon,
  variant,
  className,
  onClick,
}: {
  label: string
  icon: string
  variant?: DataTableActionVariant
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={actionClass(variant, className)}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <i className={icon} />
    </button>
  )
}

function DataTableInner<T>(
  {
    columns,
    rows,
    getRowId,
    className = '',
    tableClassName = '',
    theadClassName = s.thead,
    selectable = false,
    selectedIds,
    onSelectionChange,
    enableBulkActions = false,
    bulkActions,
    actions,
    actionsHeader = 'Actions',
    onAction,
    fetchData,
    syncUrl = false,
    itemsLabel = 'items',
    onRowClick,
    getRowClassName,
    isLoading = false,
    emptyMessage = 'No records found',
    emptyDescription = 'Try adjusting your search or filters to find what you need.',
    loadingMessage = 'Loading records…',
  }: DataTableProps<T>,
  ref: ForwardedRef<DataTableHandle>,
) {
  const [searchParams, setSearchParams] = useSearchParams()

  const visibleColumns = columns.filter((col) => !col.hidden)
  const selectionEnabled = enableBulkActions || selectable
  const hasActions = (actions?.length ?? 0) > 0
  const colSpan = visibleColumns.length + (selectionEnabled ? 1 : 0) + (hasActions ? 1 : 0)

  const rowIds = rows.data.map((row, i) => resolveRowId(row, i, getRowId))
  const selected = useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id))
  const someSelected = !allSelected && rowIds.some((id) => selected.has(id))

  const clearSelection = useCallback(() => {
    onSelectionChange?.([])
  }, [onSelectionChange])

  useImperativeHandle(ref, () => ({ clearSelection }), [clearSelection])

  const updateUrlWithParams = useCallback(
    (page?: number, perPage?: number) => {
      if (!syncUrl) return
      const next = new URLSearchParams(searchParams)
      if (page !== undefined) {
        if (page === 1) next.delete('page')
        else next.set('page', String(page))
      }
      if (perPage !== undefined) {
        next.set('per_page', String(perPage))
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams, syncUrl],
  )

  const fetchDataWithUrlUpdate = useCallback(
    (page?: number, perPage?: number) => {
      updateUrlWithParams(page, perPage)
      fetchData?.(page, perPage)
    },
    [fetchData, updateUrlWithParams],
  )

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? [] : [...rowIds])
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange?.([...next])
  }

  const cellValue = (column: DataTableColumn<T>, row: T, index: number) => {
    if (column.render) return column.render(row, index)
    const value = row[column.key]
    return value == null ? null : String(value)
  }

  const isActionVisible = (action: DataTableAction<T>, row: T) => {
    if (action.condition && !action.condition(row)) return false
    return true
  }

  const handleBulkAction = (event: ChangeEvent<HTMLSelectElement>) => {
    const actionKey = event.target.value
    if (!actionKey || selected.size === 0) return
    onAction?.({
      action: actionKey,
      selected: [...selected],
      rows: rows.data,
    })
    event.target.value = ''
    clearSelection()
  }

  const handleRowClick = (row: T, index: number, event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('a, button, input, select, textarea, label')) return
    onRowClick?.(row, index)
  }

  const paginationRange = useMemo(
    () => buildPaginationRange(rows.current_page, rows.last_page),
    [rows.current_page, rows.last_page],
  )

  const labelText = itemsLabelText(rows.total || 0, itemsLabel)

  return (
    <div className={`${s.wrapper} ${className}`.trim()}>
      {enableBulkActions && bulkActions && bulkActions.length > 0 ? (
        <div className={s.bulkBar}>
          <select
            className={s.bulkSelect}
            defaultValue=""
            aria-label="Bulk actions"
            disabled={selected.size === 0}
            onChange={handleBulkAction}
          >
            <option value="" disabled>
              Bulk actions
            </option>
            {bulkActions.map((item) => (
              <option key={item.action} value={item.action}>
                {item.label}
              </option>
            ))}
          </select>
          {selected.size > 0 ? (
            <span className="text-sm text-textmuted">{selected.size} selected</span>
          ) : null}
        </div>
      ) : null}

      <table className={`${s.table} ${tableClassName}`.trim()}>
        <thead className={theadClassName}>
          <tr className={s.row}>
            {selectionEnabled ? (
              <th scope="col">
                <input
                  className={s.checkbox}
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
            ) : null}

            {visibleColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[alignClass(column.align), column.className].filter(Boolean).join(' ')}
                data-column={column.key}
              >
                <div className={s.thInner}>
                  <span>{column.header}</span>
                  {column.sortable ? (
                    <span className={s.sort}>
                      <button
                        type="button"
                        className={s.sortBtn}
                        title="Sort ascending"
                        onClick={() =>
                          onAction?.({ action: 'sort', column: column.key, direction: 'asc' })
                        }
                      >
                        <i className="ri-arrow-up-s-line" />
                      </button>
                      <button
                        type="button"
                        className={s.sortBtn}
                        title="Sort descending"
                        onClick={() =>
                          onAction?.({ action: 'sort', column: column.key, direction: 'desc' })
                        }
                      >
                        <i className="ri-arrow-down-s-line" />
                      </button>
                    </span>
                  ) : null}
                </div>
              </th>
            ))}

            {hasActions ? <th scope="col">{actionsHeader}</th> : null}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={Math.max(colSpan, 1)} className={s.empty}>
                {loadingMessage}
              </td>
            </tr>
          ) : rows.data.length === 0 ? (
            <tr>
              <td colSpan={Math.max(colSpan, 1)} className={s.empty}>
                <div className={s.emptyInner}>
                  <p className={s.emptyTitle}>{emptyMessage}</p>
                  {emptyDescription ? <p className={s.emptyDesc}>{emptyDescription}</p> : null}
                </div>
              </td>
            </tr>
          ) : (
            rows.data.map((row, index) => {
              const id = rowIds[index]
              const rowClass = [
                s.row,
                getRowClassName?.(row, index),
                onRowClick ? 'cursor-pointer' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <tr
                  key={id}
                  className={rowClass}
                  onClick={onRowClick ? (e) => handleRowClick(row, index, e) : undefined}
                >
                  {selectionEnabled ? (
                    <th scope="row" onClick={(e) => e.stopPropagation()}>
                      <input
                        className={s.checkbox}
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() => toggleOne(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </th>
                  ) : null}

                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={[alignClass(column.align), column.className].filter(Boolean).join(' ')}
                    >
                      {cellValue(column, row, index)}
                    </td>
                  ))}

                  {hasActions ? (
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={s.actions}>
                        {actions!.map((action) => {
                          if (!isActionVisible(action, row)) return null
                          return (
                            <ActionBtn
                              key={action.key}
                              label={action.label}
                              icon={action.icon ?? 'ri-more-line'}
                              variant={action.variant}
                              className={action.className}
                              onClick={() => onAction?.({ action: action.key, row })}
                            />
                          )
                        })}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      <div className={s.footer}>
        <p className={s.summary}>
          Showing <strong>{rows.from || 0}</strong> to <strong>{rows.to || 0}</strong> of{' '}
          <strong>{rows.total || 0}</strong> {labelText}
        </p>

        {rows.last_page > 1 ? (
          <nav aria-label="Table pagination" className="pagination-style-5 ms-auto">
            <ul className={s.pagination}>
              <li className={`${s.pageItem}${rows.current_page === 1 ? ' disabled' : ''} rtl:rotate-180`}>
                <button
                  type="button"
                  className={s.pageLink}
                  aria-label="Previous page"
                  disabled={rows.current_page === 1}
                  onClick={() =>
                    rows.current_page > 1 && fetchDataWithUrlUpdate(rows.current_page - 1)
                  }
                >
                  prev
                </button>
              </li>

              {paginationRange.map((page, i) =>
                page === '...' ? (
                  <li key={`ellipsis-${i}`} className={s.pageItem}>
                    <span className={s.pageEllipsis} aria-hidden>
                      <i className="bi bi-three-dots" />
                    </span>
                  </li>
                ) : (
                  <li key={page} className={s.pageItem}>
                    <button
                      type="button"
                      className={page === rows.current_page ? s.pageLinkActive : s.pageLink}
                      aria-current={page === rows.current_page ? 'page' : undefined}
                      onClick={() => fetchDataWithUrlUpdate(page)}
                    >
                      {page}
                    </button>
                  </li>
                ),
              )}

              <li
                className={`${s.pageItem}${rows.current_page === rows.last_page ? ' disabled' : ''} rtl:rotate-180`}
              >
                <button
                  type="button"
                  className={s.pageLink}
                  aria-label="Next page"
                  disabled={rows.current_page === rows.last_page}
                  onClick={() =>
                    rows.current_page < rows.last_page &&
                    fetchDataWithUrlUpdate(rows.current_page + 1)
                  }
                >
                  next
                </button>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  )
}

export const DataTable = forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: Ref<DataTableHandle> },
) => ReactElement | null
