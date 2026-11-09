import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { env } from '@/config/env.config'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginSchema } from '@/lib/validation/schemas'
import type { LoginFormProps } from './LoginForm.types'
import { styles } from './LoginForm.styles'

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const demo = env.demoAccount
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await login(values)
      onSuccess?.()
    } catch (err) {
      setError(toApiError(err).message)
    }
  })

  const useDemo = () => {
    if (!demo) return
    setValue('email', demo.email, { shouldValidate: true })
    setValue('password', demo.password, { shouldValidate: true })
    void onSubmit()
  }

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={onSubmit} noValidate>
      <FormAlert message={error} onClose={() => setError(null)} />
      {demo && (
        <div className="alert alert-info d-flex align-items-center gap-3 mb-6">
          <i className="ri-flask-line fs-5" />
          <div className="flex-1 fs-sm">
            <div className="fw-medium">Demo account</div>
            <div>
              <code>{demo.email}</code> · <code>{demo.password}</code>
            </div>
            <div className="text-muted fs-xs mt-1">Works without the backend: if the server or database is down you get an offline demo.</div>
          </div>
          <button type="button" className="btn btn-sm btn-primary text-nowrap" onClick={useDemo} disabled={isSubmitting}>
            Sign in as demo
          </button>
        </div>
      )}
      <div className="row g-6">
        <FormField id="email" label="Email" error={errors.email?.message} required className="col-12">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={`form-control${errors.email ? ' is-invalid' : ''}`}
            {...register('email')}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message} required className="col-12">
          <div className="position-relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`form-control pe-8${errors.password ? ' is-invalid' : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 me-3 translate-middle-y text-muted border-0 bg-transparent p-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i className={`ri-eye${showPassword ? '' : '-off'}-line size-5`} />
            </button>
          </div>
        </FormField>
        <div className="col-12 d-flex justify-content-end">
          <Link to={ROUTES.FORGOT_PASSWORD} className="fs-sm">
            Forgot password?
          </Link>
        </div>
        <div className="col-12 mt-7">
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </form>
  )
}
