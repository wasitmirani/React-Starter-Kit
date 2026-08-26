import { useState, type FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { LoginFormProps } from './LoginForm.types'
import { styles } from './LoginForm.styles'

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      onSuccess?.()
    } catch {
      toast.error('Invalid email or password.')
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
          required
        />
      </Input>
      <Button type="submit" isLoading={isLoading} fullWidth>
        Sign in
      </Button>
    </form>
  )
}
