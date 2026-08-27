import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { SignupFormProps } from './SignupForm.types'
import { styles } from './SignupForm.styles'

const PASSWORD_HINT =
  'At least 8 characters with upper, lower, and a number (e.g. Password1)'

export function SignupForm({ onSuccess, className = '' }: SignupFormProps) {
  const { register, isLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        organizationName: organizationName || undefined,
      })
      toast.success('Account created successfully.')
      onSuccess?.()
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Unable to create account.'
      toast.error(message || 'Unable to create account.')
    }
  }

  return (
    <form className={`${styles.root} ${className}`.trim()} onSubmit={handleSubmit}>
      <Input>
        <label className="form-label" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          className="ti-form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Input>
      <Input>
        <label className="form-label" htmlFor="signup-org">
          Organization name
        </label>
        <input
          id="signup-org"
          className="ti-form-control"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Optional"
        />
      </Input>
      <Input>
        <label className="form-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          className="ti-form-control"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Input>
      <Input>
        <label className="form-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          className="ti-form-control"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <p className="text-textmuted fs-12 mt-1 mb-0">{PASSWORD_HINT}</p>
      </Input>
      <Input>
        <label className="form-label" htmlFor="signup-confirm">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          className="ti-form-control"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </Input>
      <Button type="submit" isLoading={isLoading} fullWidth>
        Create account
      </Button>
    </form>
  )
}
