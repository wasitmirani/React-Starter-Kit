import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/endpoints/auth.api'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { Loader } from '@/components/common/Loader'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'

type State = { kind: 'verifying' } | { kind: 'done' } | { kind: 'failed'; message: string }

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isAuthenticated, refreshProfile } = useAuth()
  const [state, setState] = useState<State>(
    token ? { kind: 'verifying' } : { kind: 'failed', message: 'This verification link is incomplete.' },
  )
  // Tokens are single-use: never submit twice (StrictMode re-runs effects in development).
  const submitted = useRef(false)

  useEffect(() => {
    if (!token || submitted.current) return
    submitted.current = true
    authApi
      .verifyEmail(token)
      .then(async () => {
        setState({ kind: 'done' })
        if (isAuthenticated) await refreshProfile()
      })
      .catch((err) => setState({ kind: 'failed', message: toApiError(err).message }))
  }, [token, isAuthenticated, refreshProfile])

  const next = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN

  return (
    <AuthCard title="Email verification">
      {state.kind === 'verifying' && <Loader label="Verifying your email…" />}
      {state.kind === 'done' && <FormAlert variant="success" message="Your email address is verified." />}
      {state.kind === 'failed' && <FormAlert message={state.message} />}
      {state.kind !== 'verifying' && (
        <Link to={next} className="btn btn-primary w-100">
          {isAuthenticated ? 'Go to dashboard' : 'Sign in'}
        </Link>
      )}
    </AuthCard>
  )
}
