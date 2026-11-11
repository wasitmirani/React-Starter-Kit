import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/endpoints/auth.api'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { ROUTES } from '@/constants/routes.constants'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/lib/validation/schemas'

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      await authApi.forgotPassword(email)
      setSentTo(email)
    } catch (err) {
      setError(toApiError(err).message)
    }
  })

  return (
    <AuthCard title="Reset your password" footer={<Link to={ROUTES.LOGIN}>Back to sign in</Link>}>
      {sentTo ? (
        <FormAlert
          variant="success"
          message={`If an account exists for ${sentTo}, we've sent a link to reset the password. It expires in 1 hour.`}
        />
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <FormAlert message={error} onClose={() => setError(null)} />
          <p className="text-muted">Enter the email you signed up with and we&apos;ll send you a reset link.</p>
          <FormField id="email" label="Email" error={errors.email?.message} className="mb-6">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-control${errors.email ? ' is-invalid' : ''}`}
              {...register('email')}
            />
          </FormField>
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
