import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accessApi } from '@/api/endpoints/access.api'
import { errorMessage } from '@/api/errors'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { allRows } from '@/components/common/DataTable/rows'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { Modal } from '@/components/common/Modal'
import { PermissionPicker } from '@/components/features/access/PermissionPicker'
import { API_BASE_URL } from '@/constants/api.constants'
import { queryKeys, useApiKeys, usePermissions, useTenantId } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { apiKeySchema, type ApiKeySchema } from '@/lib/validation/schemas'
import type { ApiKey, ApiKeySecret } from '@/types/workspace.types'
import { formatDate, formatRelativeTime } from '@/utils/formatters/date.formatter'

function CreateKeyModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (s: ApiKeySecret) => void }) {
  const permissions = usePermissions()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApiKeySchema>({ resolver: zodResolver(apiKeySchema), defaultValues: { name: '', scopes: [] } })
  const toast = useToast()

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(async ({ name, scopes, expiresAt }) => {
    try {
      const { data } = await accessApi.createApiKey({
        name,
        scopes,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      })
      reset()
      onCreated(data.data)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Create API key"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={close}>
            Cancel
          </button>
          <button type="submit" form="api-key-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create key'}
          </button>
        </>
      }
    >
      <form id="api-key-form" onSubmit={onSubmit} noValidate className="row g-5">
        <FormField id="key-name" label="Name" hint="Where the key is used, e.g. “Website signup form”." error={errors.name?.message} className="col-md-6">
          <input id="key-name" className={`form-control${errors.name ? ' is-invalid' : ''}`} {...register('name')} />
        </FormField>
        <FormField id="key-expires" label="Expires (optional)" error={errors.expiresAt?.message} className="col-md-6">
          <input id="key-expires" type="date" className={`form-control${errors.expiresAt ? ' is-invalid' : ''}`} {...register('expiresAt')} />
        </FormField>
        <div className="col-12">
          <label className="form-label">Scopes</label>
          <p className="text-muted fs-sm">Grant only what the integration needs. A key can never exceed your own permissions.</p>
          {errors.scopes && <div className="invalid-feedback d-block mb-2">{errors.scopes.message}</div>}
          {permissions.isLoading ? (
            <Loader size="sm" />
          ) : (
            <Controller
              control={control}
              name="scopes"
              render={({ field }) => (
                <PermissionPicker idPrefix="scope" permissions={permissions.data ?? []} value={field.value} onChange={field.onChange} />
              )}
            />
          )}
        </div>
      </form>
    </Modal>
  )
}

/** Shows a newly issued key exactly once. */
function KeySecretModal({ secret, onClose }: { secret: ApiKeySecret | null; onClose: () => void }) {
  const toast = useToast()
  const tenantId = useTenantId()
  const copy = async () => {
    await navigator.clipboard.writeText(secret!.key)
    toast.success('API key copied')
  }
  return (
    <Modal
      open={secret !== null}
      onClose={onClose}
      title={`API key — ${secret?.apiKey.name ?? ''}`}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          I&apos;ve saved it
        </button>
      }
    >
      <div className="alert alert-warning">Copy this key now. For your security it will not be shown again.</div>
      <div className="input-group mb-4">
        <input className="form-control font-monospace" readOnly value={secret?.key ?? ''} onFocus={(e) => e.target.select()} />
        <button type="button" className="btn btn-outline-primary" onClick={copy}>
          <i className="ri-file-copy-line" /> Copy
        </button>
      </div>
      <p className="fs-sm text-muted mb-1">Example request:</p>
      <pre className="bg-body-secondary p-3 rounded fs-xs mb-0">
        {`curl ${API_BASE_URL}/tenants/${tenantId} \\\n  -H "X-Api-Key: <your key>"`}
      </pre>
    </Modal>
  )
}

export function ApiKeysPage() {
  const tenantId = useTenantId()
  const { can } = useAuth()
  const canManage = can('api_keys.manage')
  const toast = useToast()
  const queryClient = useQueryClient()
  const apiKeys = useApiKeys()
  const [creating, setCreating] = useState(false)
  const [secret, setSecret] = useState<ApiKeySecret | null>(null)
  const [revoking, setRevoking] = useState<ApiKey | null>(null)
  const [rotating, setRotating] = useState<ApiKey | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys(tenantId) })

  const revoke = useMutation({
    mutationFn: (id: string) => accessApi.revokeApiKey(id),
    onSuccess: async () => {
      await refresh()
      toast.success('API key revoked')
      setRevoking(null)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  const rotate = useMutation({
    mutationFn: (id: string) => accessApi.rotateApiKey(id),
    onSuccess: async ({ data }) => {
      await refresh()
      setRotating(null)
      setSecret(data.data)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  const columns: DataTableColumn<ApiKey>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (k) => (
        <div>
          <div className="fw-medium">{k.name}</div>
          <code className="fs-xs text-muted">bk_{k.prefix}_…</code>
        </div>
      ),
    },
    { key: 'scopes', label: 'Scopes', render: (k) => <span className="fs-sm">{k.scopes.join(', ')}</span> },
    {
      key: 'revokedAt',
      label: 'Status',
      render: (k) =>
        k.revokedAt ? (
          <span className="badge bg-danger-subtle text-danger">Revoked</span>
        ) : k.expiresAt && new Date(k.expiresAt) <= new Date() ? (
          <span className="badge bg-warning-subtle text-warning">Expired</span>
        ) : (
          <span className="badge bg-success-subtle text-success">Active</span>
        ),
    },
    { key: 'lastUsedAt', label: 'Last used', render: (k) => (k.lastUsedAt ? formatRelativeTime(k.lastUsedAt) : 'Never') },
    { key: 'expiresAt', label: 'Expires', render: (k) => (k.expiresAt ? formatDate(k.expiresAt) : 'Never') },
  ]

  return (
    <>
      <PageHeader title="API keys" description="Keys for server-to-server access to this workspace. Each key has its own scopes." />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title mb-0">API keys</h6>
            <p className="text-muted mb-0 fs-sm">
              Keys authenticate server-to-server calls with the <code>X-Api-Key</code> header and are bound to this workspace.
            </p>
          </div>
          {canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
              <i className="ri-add-line me-1" /> Create key
            </button>
          )}
        </div>
        <div className="card-body">
          {apiKeys.isError ? (
            <div className="alert alert-danger">{errorMessage(apiKeys.error)}</div>
          ) : (
            <DataTable<ApiKey>
              columns={columns}
              rows={allRows(apiKeys.data)}
              isLoading={apiKeys.isLoading}
              itemsLabel="keys"
              emptyMessage="No API keys yet"
              emptyDescription={canManage ? 'Create a key to connect your systems.' : ''}
              actions={
                canManage
                  ? [
                      { key: 'rotate', label: 'Rotate', icon: 'ri-refresh-line', condition: (k) => !k.revokedAt },
                      { key: 'revoke', label: 'Revoke', icon: 'ri-delete-bin-line', variant: 'delete', condition: (k) => !k.revokedAt },
                    ]
                  : []
              }
              onAction={(payload) => {
                if (!('row' in payload)) return
                if (payload.action === 'revoke') setRevoking(payload.row)
                if (payload.action === 'rotate') setRotating(payload.row)
              }}
            />
          )}
        </div>
      </div>

      <CreateKeyModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={async (s) => {
          setCreating(false)
          setSecret(s)
          await refresh()
        }}
      />
      <KeySecretModal secret={secret} onClose={() => setSecret(null)} />
      <ConfirmDialog
        open={revoking !== null}
        title="Revoke API key"
        message={<>Requests using <strong>{revoking?.name}</strong> will be rejected immediately. This cannot be undone.</>}
        confirmLabel="Revoke key"
        danger
        busy={revoke.isPending}
        onClose={() => setRevoking(null)}
        onConfirm={() => revoke.mutate(revoking!.id)}
      />
      <ConfirmDialog
        open={rotating !== null}
        title="Rotate API key"
        message={<>A new secret is issued for <strong>{rotating?.name}</strong> and the current one stops working immediately.</>}
        confirmLabel="Rotate key"
        busy={rotate.isPending}
        onClose={() => setRotating(null)}
        onConfirm={() => rotate.mutate(rotating!.id)}
      />
    </>
  )
}
