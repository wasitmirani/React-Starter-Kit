import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { ROUTES } from '@/constants/routes.constants'

export function LoginPage() {
  return (
    <div className="saas-auth-page p-6">
      <h1 className="page-title">Sign in</h1>
      <p>Welcome back. Enter your credentials to continue.</p>
      <LoginForm />
      <p>
        No account? <Link to={ROUTES.REGISTER}>Create one</Link>
      </p>
    </div>
  )
}
