import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import type {
  DataTableAction,
  DataTableActionPayload,
  DataTableColumn,
  PaginatedRows,
} from '@/components/common/DataTable'










const actions: DataTableAction<UserRow>[] = [
  { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
  { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
]


export function UserListing() {

  return (

    <>
    </>
  )
}
