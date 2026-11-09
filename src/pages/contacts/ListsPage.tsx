import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { listsApi } from '@/api/endpoints/crm.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, SearchInput } from '@/components/common/FilterBar'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import { listSchema, type ListSchema } from '@/lib/validation/crm.schemas'
import type { ContactList } from '@/types/crm.types'
import { formatDate } from '@/utils/formatters/date.formatter'

function ListModal({ list, open, onClose }: { list: ContactList | null; open: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ListSchema>({ resolver: zodResolver(listSchema) })
  useEffect(() => {
    if (open) reset({ name: list?.name ?? '', description: list?.description ?? '', folder: list?.folder ?? 'Marketing' })
  }, [open, list, reset])
  const save = useAction(
    'lists',
    (v: ListSchema) => (list ? listsApi.update(list.id, v) : listsApi.create({ ...v, contactCount: 0 })),
    { success: list ? 'List updated' : 'List created', onSuccess: onClose },
  )
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={list ? 'Edit list' : 'New list'}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" form="list-form" className="btn btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <form id="list-form" className="row g-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <FormField id="list-name" label="Name" error={errors.name?.message} className="col-12">
          <input id="list-name" autoFocus className={`form-control${errors.name ? ' is-invalid' : ''}`} {...register('name')} />
        </FormField>
        <FormField id="list-folder" label="Folder" className="col-12">
          <input id="list-folder" className="form-control" {...register('folder')} />
        </FormField>
        <FormField id="list-description" label="Description" className="col-12">
          <textarea id="list-description" rows={3} className="form-control" {...register('description')} />
        </FormField>
      </form>
    </Modal>
  )
}

export function ListsPage() {
  const navigate = useNavigate()
  const { query, setSearch, setPage } = useListParams()
  const lists = useList('lists', listsApi.list, query)
  const [editing, setEditing] = useState<ContactList | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<ContactList | null>(null)
  const remove = useAction('lists', (id: string) => listsApi.remove(id), { success: 'List deleted', onSuccess: () => setDeleting(null) })

  const columns: DataTableColumn<ContactList>[] = [
    {
      key: 'name',
      label: 'List',
      render: (l) => (
        <div>
          <div className="fw-medium">{l.name}</div>
          <div className="text-muted fs-sm text-truncate" style={{ maxWidth: 420 }}>{l.description}</div>
        </div>
      ),
    },
    { key: 'folder', label: 'Folder', render: (l) => <span className="badge bg-light text-body border fw-normal"><i className="ri-folder-line me-1" />{l.folder}</span> },
    { key: 'contactCount', label: 'Contacts', align: 'end', render: (l) => <span className="fw-medium tabular-nums">{l.contactCount.toLocaleString()}</span> },
    { key: 'createdAt', label: 'Created', render: (l) => formatDate(l.createdAt) },
  ]

  return (
    <>
      <PageHeader
        title="Lists"
        description="Static groups of contacts. Contacts can be in many lists."
        actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />New list</button>}
      />
      <div className="card">
        <div className="card-body pb-0">
          <FilterBar>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search lists…" />
          </FilterBar>
        </div>
        <DataTable<ContactList>
          columns={columns}
          rows={lists.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={lists.isLoading}
          itemsLabel="lists"
          emptyMessage="No lists yet"
          emptyDescription="Create a list, then add contacts to it from the contacts table or an import."
          onRowClick={(l) => navigate(`${ROUTES.CONTACTS}?listId=${l.id}`)}
          fetchData={(page) => page && setPage(page)}
          actions={[
            { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
            { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
          ]}
          onAction={(p) => {
            if (!('row' in p)) return
            if (p.action === 'edit') setEditing(p.row)
            if (p.action === 'delete') setDeleting(p.row)
          }}
        />
      </div>
      <ListModal open={creating || editing !== null} list={editing} onClose={() => { setCreating(false); setEditing(null) }} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete list?"
        message={<>The list <strong>{deleting?.name}</strong> is deleted. Its contacts are kept.</>}
        confirmLabel="Delete list"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
