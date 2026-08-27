import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes.constants'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Unable to send reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="saas-auth-page p-6 max-w-md mx-auto">
      <h1 className="page-title mb-2">Forgot password</h1>
      <p className="text-textmuted mb-4">
        Enter your email and we will send a reset link.
      </p>
      {sent ? (
        <div className="box box-body">
          <p className="mb-3">If an account exists for {email}, a reset link was sent.</p>
          <Link to={ROUTES.LOGIN} className="ti-btn ti-btn-primary ti-btn-sm">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="box box-body space-y-3">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-danger fs-12 mb-0">{error}</p>}
          <button type="submit" className="ti-btn ti-btn-primary w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <Link to={ROUTES.LOGIN} className="fs-12 text-primary">
            Back to login
          </Link>
        </form>
      )}
    </div>
  )
}
