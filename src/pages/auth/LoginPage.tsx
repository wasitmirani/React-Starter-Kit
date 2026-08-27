import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { DEMO_CREDENTIALS } from '@/constants/auth.constants'
import { ROUTES } from '@/constants/routes.constants'
import { env } from '@/config/env.config'

export function LoginPage() {
  return (
    <div className="saas-auth-page p-6">
      <h1 className="page-title">Sign in</h1>
      <p>Welcome back. Enter your credentials to continue.</p>
      {env.useMockApi ? (
        <p className="text-textmuted text-sm mb-4">
          Demo: <code>{DEMO_CREDENTIALS.email}</code> /{' '}
          <code>{DEMO_CREDENTIALS.password}</code>
        </p>
      ) : (
        <p className="text-textmuted text-sm mb-4">
          Connected to API at <code>{env.api.baseUrl}{env.api.prefix}</code>. Register
          an account if you do not have one yet.
        </p>
      )}
      <LoginForm />
      <p>
        No account? <Link to={ROUTES.REGISTER}>Create one</Link>
      </p>
    </div>
  )
}
