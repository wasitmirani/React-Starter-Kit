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
    <form className={`${styles.root} auth-form ${className}`.trim()} onSubmit={onSubmit} noValidate>
      {/* A failed sign-in stays next to the form (it is about these fields), not in a passing toast. */}
      <FormAlert message={error} onClose={() => setError(null)} />

      <FormField id="email" label="Email" error={errors.email?.message} className="mb-4">
        <div className="auth-input">
          <i className="ri-mail-line" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            className={`form-control${errors.email ? ' is-invalid' : ''}`}
            {...register('email')}
          />
        </div>
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        className="mb-5"
        aside={
          <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link-sm">
            Forgot password?
          </Link>
        }
      >
        <div className="auth-input">
          <i className="ri-lock-2-line" aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`form-control has-toggle${errors.password ? ' is-invalid' : ''}`}
            placeholder="Your password"
            {...register('password')}
          />
          <button
            type="button"
            className="auth-input-toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
          </button>
        </div>
      </FormField>

      <button type="submit" className="btn btn-primary btn-lg w-100 auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Signing in…
          </>
        ) : (
          <>
            Sign in <i className="ri-arrow-right-line" aria-hidden="true" />
          </>
        )}
      </button>

      {demo && (
        <>
          <div className="auth-divider"><span>or</span></div>
          <button type="button" className="btn btn-light btn-lg w-100 auth-demo" onClick={useDemo} disabled={isSubmitting}>
            <i className="ri-flask-line" aria-hidden="true" /> Try the demo account
          </button>
          <p className="auth-demo-note">
            {demo.email} · works even when the server is offline
          </p>
        </>
      )}
    </form>
  )
}
