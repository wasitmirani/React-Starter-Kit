import { Link, useSearchParams } from 'react-router-dom'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { ROUTES } from '@/constants/routes.constants'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const registerLink = redirect ? `${ROUTES.REGISTER}?redirect=${encodeURIComponent(redirect)}` : ROUTES.REGISTER

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your workspace to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to={registerLink} className="fw-semibold">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
