import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { DEMO_CREDENTIALS } from '@/constants/auth.constants'
import { ROUTES } from '@/constants/routes.constants'
import { env } from '@/config/env.config'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { LoginFormProps } from './LoginForm.types'
import { styles } from './LoginForm.styles'

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTES.DASHBOARD

  const [email, setEmail] = useState(env.useMockApi ? DEMO_CREDENTIALS.email : '')
  const [password, setPassword] = useState(env.useMockApi ? DEMO_CREDENTIALS.password : '')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      onSuccess?.()
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Invalid email or password.'
      toast.error(message || 'Invalid email or password.')
    }
  }

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={handleSubmit}>
      <Input>
        <label className="form-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="ti-form-control"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </Input>
      <Input>
        <label className="form-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="ti-form-control"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Input>
      <Button type="submit" isLoading={isLoading} fullWidth>
        Sign in
      </Button>
    </form>
  )
}
