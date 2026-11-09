import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterSchema } from '@/lib/validation/schemas'
import type { SignupFormProps } from './SignupForm.types'
import { styles } from './SignupForm.styles'

export function SignupForm({ onSuccess, className = '' }: SignupFormProps) {
  const { register: signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async ({ confirmPassword: _confirm, ...payload }) => {
    setError(null)
    try {
      await signUp(payload)
      onSuccess?.()
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.code === 'EMAIL_TAKEN') setFieldError('email', { message: apiError.message })
      else setError(apiError.message)
    }
  })

  const field = (name: keyof RegisterSchema) => `form-control${errors[name] ? ' is-invalid' : ''}`

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={onSubmit} noValidate>
      <FormAlert message={error} onClose={() => setError(null)} />
      <div className="row g-6">
        <FormField id="name" label="Your name" error={errors.name?.message} required className="col-12">
          <input id="name" autoComplete="name" className={field('name')} {...register('name')} />
        </FormField>
        <FormField id="email" label="Work email" error={errors.email?.message} required className="col-12">
          <input id="email" type="email" autoComplete="email" className={field('email')} {...register('email')} />
        </FormField>
        <FormField
          id="workspaceName"
          label="Workspace name"
          hint="Usually your company or brand. You can rename it later."
          error={errors.workspaceName?.message}
          className="col-12"
        >
          <input id="workspaceName" className={field('workspaceName')} {...register('workspaceName')} />
        </FormField>
        <FormField
          id="password"
          label="Password"
          hint="8+ characters with upper and lower case, a number and a symbol."
          error={errors.password?.message}
          className="col-md-6"
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={field('password')}
            {...register('password')}
          />
        </FormField>
        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message} required className="col-md-6">
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={field('confirmPassword')}
            {...register('confirmPassword')}
          />
        </FormField>
        <div className="col-12 mt-7">
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </div>
    </form>
  )
}
