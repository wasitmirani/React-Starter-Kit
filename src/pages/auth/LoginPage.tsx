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
      title="Sign in"
      subtitle={
        <>
          Don&apos;t have an account?{' '}
          <Link to={registerLink} className="text-body fw-semibold">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
