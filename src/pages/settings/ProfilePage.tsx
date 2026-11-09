import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/endpoints/auth.api'
import { usersApi } from '@/api/endpoints/users.api'
import { errorMessage, toApiError } from '@/api/errors'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { queryKeys, useSessions } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/auth.store'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordSchema,
  type ProfileSchema,
} from '@/lib/validation/schemas'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

function ProfileForm() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileSchema>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (user) reset({ name: user.name })
  }, [user, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { data } = await usersApi.updateMe(values)
      setUser(data.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="row g-5">
      <FormField id="profile-name" label="Name" error={errors.name?.message} className="col-md-6">
        <input id="profile-name" className={`form-control${errors.name ? ' is-invalid' : ''}`} {...register('name')} />
      </FormField>
      <FormField
        id="profile-email"
        label="Email"
        className="col-md-6"
        hint={user?.emailVerified ? 'Verified' : 'Not verified yet — check your inbox.'}
      >
        <input id="profile-email" className="form-control" value={user?.email ?? ''} readOnly disabled />
      </FormField>
      <div className="col-12 d-flex justify-content-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}

function ChangePasswordForm() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await authApi.changePassword(currentPassword, newPassword)
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success('Password changed. Your other devices were signed out.')
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.code === 'INVALID_PASSWORD') setError('currentPassword', { message: apiError.message })
      else toast.error(apiError.message)
    }
  })

  const cls = (name: keyof ChangePasswordSchema) => `form-control${errors[name] ? ' is-invalid' : ''}`

  return (
    <form onSubmit={onSubmit} noValidate className="row g-5">
      <FormField id="pw-current" label="Current password" error={errors.currentPassword?.message} className="col-md-4">
        <input id="pw-current" type="password" autoComplete="current-password" className={cls('currentPassword')} {...register('currentPassword')} />
      </FormField>
      <FormField id="pw-new" label="New password" error={errors.newPassword?.message} className="col-md-4">
        <input id="pw-new" type="password" autoComplete="new-password" className={cls('newPassword')} {...register('newPassword')} />
      </FormField>
      <FormField id="pw-confirm" label="Confirm new password" error={errors.confirmPassword?.message} className="col-md-4">
        <input id="pw-confirm" type="password" autoComplete="new-password" className={cls('confirmPassword')} {...register('confirmPassword')} />
      </FormField>
      <div className="col-12 d-flex justify-content-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Changing…' : 'Change password'}
        </button>
      </div>
    </form>
  )
}

function SessionsList() {
  const sessions = useSessions()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const revoke = useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success('Device signed out')
      setRevokingId(null)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  if (sessions.isLoading) return <Loader size="sm" />
  if (sessions.isError) return <div className="alert alert-danger">{errorMessage(sessions.error)}</div>

  return (
    <>
      <ul className="list-group">
        {sessions.data?.map((s) => (
          <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center gap-3">
            <div className="text-truncate">
              <div className="fw-medium text-truncate">{s.userAgent ?? 'Unknown device'}</div>
              <div className="text-muted fs-sm">
                {s.ip ?? 'Unknown IP'} · active {formatRelativeTime(s.lastUsedAt)}
              </div>
            </div>
            {s.current ? (
              <span className="badge bg-success-subtle text-success">This device</span>
            ) : (
              <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setRevokingId(s.id)}>
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={revokingId !== null}
        title="Sign out device"
        message="That device will need to sign in again."
        confirmLabel="Sign out"
        danger
        busy={revoke.isPending}
        onClose={() => setRevokingId(null)}
        onConfirm={() => revoke.mutate(revokingId!)}
      />
    </>
  )
}

export function ProfilePage() {
  return (
    <>
      <PageHeader title="My profile" description="Your name, password and signed-in devices." />
      <div className="card">
        <div className="card-header">
          <h6 className="card-title mb-0">Profile</h6>
        </div>
        <div className="card-body">
          <ProfileForm />
        </div>
      </div>
      <div className="card mt-6">
        <div className="card-header">
          <h6 className="card-title mb-0">Password</h6>
        </div>
        <div className="card-body">
          <ChangePasswordForm />
        </div>
      </div>
      <div className="card mt-6">
        <div className="card-header">
          <h6 className="card-title mb-0">Signed-in devices</h6>
        </div>
        <div className="card-body">
          <SessionsList />
        </div>
      </div>
    </>
  )
}
