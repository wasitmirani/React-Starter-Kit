import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { tenantsApi } from '@/api/endpoints/tenants.api'
import { errorMessage } from '@/api/errors'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { workspaceSchema, type WorkspaceSchema } from '@/lib/validation/schemas'

export function CreateWorkspaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { refreshProfile, switchTenant } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceSchema>({ resolver: zodResolver(workspaceSchema) })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      const { data } = await tenantsApi.create(name)
      await refreshProfile()
      switchTenant(data.data.id)
      toast.success(`Workspace "${data.data.name}" created`)
      close()
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create workspace"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={close}>
            Cancel
          </button>
          <button type="submit" form="create-workspace" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create workspace'}
          </button>
        </>
      }
    >
      <form id="create-workspace" onSubmit={onSubmit} noValidate>
        <p className="text-muted">
          A workspace has its own contacts, channels, team and billing. You will be its owner.
        </p>
        <FormField id="workspace-name" label="Workspace name" error={errors.name?.message}>
          <input
            id="workspace-name"
            autoFocus
            className={`form-control${errors.name ? ' is-invalid' : ''}`}
            {...register('name')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
