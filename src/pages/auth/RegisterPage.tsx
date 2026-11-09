import { Link, useSearchParams } from 'react-router-dom'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { SignupForm } from '@/components/features/auth/SignupForm'
import { ROUTES } from '@/constants/routes.constants'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const loginLink = redirect ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirect)}` : ROUTES.LOGIN

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to={loginLink} className="text-body fw-semibold">
            Sign in
          </Link>
        </>
      }
      footer="We'll send a link to verify your email address."
    >
      <SignupForm />
    </AuthCard>
  )
}
