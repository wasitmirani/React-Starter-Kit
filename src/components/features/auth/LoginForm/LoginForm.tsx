import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_CREDENTIALS } from '@/constants/auth.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { LoginFormProps } from './LoginForm.types'
import { styles } from './LoginForm.styles'

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    try {
      await login({ email, password })
      setSuccess(true)
      toast.success('Welcome back!')
      onSuccess?.()
    } catch {
      setError('Invalid email or password')
      toast.error('Invalid email or password.')
    }
  }

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={handleSubmit}>
      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          <span>You&apos;ve successfully signed in!</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccess(false)}
          />
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError(null)}
          />
        </div>
      )}
      <div className="row g-6">
        <div className="col-12">
          <label htmlFor="emailInput" className="form-label">
            Email Or Username
          </label>
          <input
            type="text"
            id="emailInput"
            placeholder="Enter your email or username"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="col-12">
          <label htmlFor="passwordInput" className="form-label">
            Password
          </label>
          <div className="position-relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="passwordInput"
              className="form-control pe-8"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 me-3 translate-middle-y text-muted cursor-pointer border-0 bg-transparent p-0"
              id="passwordShowIcon"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i className={`ri-eye${showPassword ? '' : '-off'}-line size-5`} />
            </button>
          </div>
        </div>
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div className="form-check check-primary">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember me
            </label>
          </div>
          <Link to={ROUTES.FORGOT_PASSWORD} className="fs-sm">
            Forgot Password?
          </Link>
        </div>
        <div className="col-12 mt-7">
          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </div>
    </form>
  )
}
