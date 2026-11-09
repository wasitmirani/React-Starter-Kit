import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { attributesApi } from '@/api/endpoints/crm.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ToneBadge } from '@/components/ui/StatusBadge'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import { attributeSchema, type AttributeSchema } from '@/lib/validation/crm.schemas'
import type { ContactAttribute } from '@/types/crm.types'

const TYPE_LABEL: Record<ContactAttribute['type'], string> = { text: 'Text', number: 'Number', date: 'Date', boolean: 'Yes / no', select: 'Dropdown' }
const slug = (label: string) => label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^(\d)/, 'a_$1')

function AttributeModal({ attribute, open, onClose }: { attribute: ContactAttribute | null; open: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, dirtyFields } } = useForm<AttributeSchema>({ resolver: zodResolver(attributeSchema) })
  useEffect(() => {
    if (open) reset({ label: attribute?.label ?? '', key: attribute?.key ?? '', type: attribute?.type ?? 'text', options: attribute?.options.join(', ') ?? '' })
  }, [open, attribute, reset])
  const type = watch('type')
  const save = useAction(
    'attributes',
    (v: AttributeSchema) => {
      const body = { label: v.label, key: v.key, type: v.type, options: v.type === 'select' ? v.options.split(',').map((o) => o.trim()).filter(Boolean) : [] }
      return attribute ? attributesApi.update(attribute.id, body) : attributesApi.create({ ...body, system: false })
    },
    { success: 'Attribute saved', onSuccess: onClose },
  )
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={attribute ? 'Edit attribute' : 'New attribute'}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" form="attr-form" className="btn btn-primary" disabled={save.isPending}>Save</button>
        </>
      }
    >
      <form id="attr-form" className="row g-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <FormField id="attr-label" label="Label" error={errors.label?.message} className="col-12">
          <input
            id="attr-label"
            autoFocus
            className={`form-control${errors.label ? ' is-invalid' : ''}`}
            {...register('label', { onChange: (e) => !attribute && !dirtyFields.key && setValue('key', slug(e.target.value)) })}
          />
        </FormField>
        <FormField id="attr-key" label="Key" hint="Used in templates as {{key}} and in the API. Cannot change after creation." error={errors.key?.message} className="col-md-6">
          <input id="attr-key" className={`form-control font-monospace${errors.key ? ' is-invalid' : ''}`} disabled={Boolean(attribute)} {...register('key')} />
        </FormField>
        <FormField id="attr-type" label="Type" className="col-md-6">
          <select id="attr-type" className="form-select" disabled={Boolean(attribute)} {...register('type')}>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        {type === 'select' && (
          <FormField id="attr-options" label="Options" hint="Comma separated" className="col-12">
            <input id="attr-options" className="form-control" {...register('options')} />
          </FormField>
        )}
      </form>
    </Modal>
  )
}

export function AttributesPage() {
  const attributes = useAll('attributes', attributesApi.list)
  const [editing, setEditing] = useState<ContactAttribute | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<ContactAttribute | null>(null)
  const remove = useAction('attributes', (id: string) => attributesApi.remove(id), { success: 'Attribute deleted', onSuccess: () => setDeleting(null) })
  const rows = [...(attributes.data?.data ?? [])].sort((a, b) => Number(b.system) - Number(a.system) || a.label.localeCompare(b.label))

  const columns: DataTableColumn<ContactAttribute>[] = [
    { key: 'label', label: 'Attribute', render: (a) => <span className="fw-medium">{a.label}</span> },
    { key: 'key', label: 'Key', render: (a) => <code>{`{{${a.key}}}`}</code> },
    { key: 'type', label: 'Type', render: (a) => TYPE_LABEL[a.type] + (a.options.length ? ` · ${a.options.length} options` : '') },
    { key: 'system', label: '', render: (a) => (a.system ? <ToneBadge tone="secondary">System</ToneBadge> : <ToneBadge tone="primary">Custom</ToneBadge>) },
  ]

  return (
    <>
      <PageHeader
        title="Contact attributes"
        description="Fields stored on every contact. Use them in segments and as personalisation in messages."
        actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><i className="ri-add-line me-1" />New attribute</button>}
      />
      <div className="card">
        <DataTable<ContactAttribute>
          columns={columns}
          rows={{ data: rows, current_page: 1, last_page: 1, from: rows.length ? 1 : null, to: rows.length || null, total: rows.length }}
          isLoading={attributes.isLoading}
          itemsLabel="attributes"
          actions={[
            { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit', condition: (a) => !a.system },
            { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete', condition: (a) => !a.system },
          ]}
          onAction={(p) => {
            if (!('row' in p)) return
            if (p.action === 'edit') setEditing(p.row)
            if (p.action === 'delete') setDeleting(p.row)
          }}
        />
      </div>
      <AttributeModal open={creating || editing !== null} attribute={editing} onClose={() => { setCreating(false); setEditing(null) }} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete attribute?"
        message={<>The values of <strong>{deleting?.label}</strong> are removed from every contact, and segments or templates that use <code>{`{{${deleting?.key}}}`}</code> stop matching.</>}
        confirmLabel="Delete attribute"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting!.id)}
      />
    </>
  )
}
