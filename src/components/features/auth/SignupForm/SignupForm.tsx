import { useState, type FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { SignupFormProps } from './SignupForm.types'
import { styles } from './SignupForm.styles'

export function SignupForm({ onSuccess, className = '' }: SignupFormProps) {
  const { register, isLoading } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await register({ name, email, password, confirmPassword })
      toast.success('Account created successfully.')
      onSuccess?.()
    } catch {
      toast.error('Unable to create account.')
    }
  }

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={handleSubmit}>
      <Input>
        <label htmlFor="signup-name">Name</label>
        <input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Input>
      <Input>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Input>
      <Input>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Input>
      <Input>
        <label htmlFor="signup-confirm">Confirm password</label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Input>
      <Button type="submit" isLoading={isLoading} fullWidth>
        Create account
      </Button>
    </form>
  )
}
