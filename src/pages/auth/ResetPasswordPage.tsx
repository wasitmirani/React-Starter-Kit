import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/endpoints/auth.api'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { ROUTES } from '@/constants/routes.constants'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/lib/validation/schemas'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null)
    try {
      await authApi.resetPassword(token as string, password)
      setDone(true)
    } catch (err) {
      setError(toApiError(err).message)
    }
  })

  return (
    <AuthCard title="Choose a new password" footer={<Link to={ROUTES.LOGIN}>Back to sign in</Link>}>
      {!token ? (
        <FormAlert message="This reset link is incomplete. Request a new one from the sign-in page." />
      ) : done ? (
        <>
          <FormAlert
            variant="success"
            message="Your password has been reset and all devices were signed out."
          />
          <Link to={ROUTES.LOGIN} className="btn btn-primary w-100">
            Sign in
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <FormAlert message={error} onClose={() => setError(null)} />
          <div className="row g-6">
            <FormField
              id="password"
              label="New password"
              hint="8+ characters with upper and lower case, a number and a symbol."
              error={errors.password?.message}
              className="col-12"
            >
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`form-control${errors.password ? ' is-invalid' : ''}`}
                {...register('password')}
              />
            </FormField>
            <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message} className="col-12">
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                {...register('confirmPassword')}
              />
            </FormField>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Reset password'}
              </button>
            </div>
          </div>
        </form>
      )}
    </AuthCard>
  )
}
