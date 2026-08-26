import type {
  DataTableAction,
  DataTableActionVariant,
  DataTableAlign,
  DataTableColumn,
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

function buildCrudActions<T>(
  onView?: DataTableProps<T>['onView'],
  onEdit?: DataTableProps<T>['onEdit'],
  onDelete?: DataTableProps<T>['onDelete'],
  actions?: DataTableAction<T>[],
): DataTableAction<T>[] {
  const list: DataTableAction<T>[] = []
  if (onView) {
    list.push({ key: 'view', label: 'Call', icon: 'ri-phone-line', variant: 'view', onClick: onView })
  }
  if (onEdit) {
    list.push({ key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit', onClick: onEdit })
  }
  if (onDelete) {
    list.push({
      key: 'delete',
      label: 'Delete',
      icon: 'ri-delete-bin-line',
      variant: 'delete',
      onClick: onDelete,
    })
  }
  return [...list, ...(actions ?? [])]
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  className = '',
  tableClassName = '',
  theadClassName = s.thead,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  actions,
  actionsHeader = 'Actions',
  onRowClick,
  getRowClassName,
  isLoading = false,
  emptyMessage = 'No records found.',
  loadingMessage = 'Loading…',
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hidden)
  const allActions = buildCrudActions(onView, onEdit, onDelete, actions)
  const hasActions = allActions.length > 0
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)

  const rowIds = data.map((row, i) => resolveRowId(row, i, getRowId))
  const selected = new Set(selectedIds ?? [])
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id))
  const someSelected = !allSelected && rowIds.some((id) => selected.has(id))

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

  return (
    <div className={`${s.wrapper} ${className}`.trim()}>
      <table className={`${s.table} ${tableClassName}`.trim()}>
        <thead className={theadClassName}>
          <tr className={s.row}>
            {selectable ? (
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
              >
                {column.header}
              </th>
            ))}

            {hasActions ? <th scope="col">{actionsHeader}</th> : null}
          </tr>
        </thead>

        <tbody>
          {isLoading || data.length === 0 ? (
            <tr>
              <td colSpan={Math.max(colSpan, 1)} className={s.empty}>
                {isLoading ? loadingMessage : emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const id = rowIds[index]
              const rowClass = [s.row, getRowClassName?.(row, index), onRowClick ? 'cursor-pointer' : '']
                .filter(Boolean)
                .join(' ')

              return (
                <tr
                  key={id}
                  className={rowClass}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {selectable ? (
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
                        {allActions.map((action) => {
                          if (action.hidden?.(row)) return null
                          return (
                            <ActionBtn
                              key={action.key}
                              label={action.label}
                              icon={action.icon ?? 'ri-more-line'}
                              variant={action.variant}
                              className={action.className}
                              onClick={() => action.onClick(row, index)}
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
    </div>
  )
}
