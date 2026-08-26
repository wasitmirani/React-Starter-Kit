import { Link } from 'react-router-dom'
import { SignupForm } from '@/components/features/auth/SignupForm'
import { ROUTES } from '@/constants/routes.constants'

export function RegisterPage() {
  return (
    <div className="saas-auth-page p-6">
      <h1 className="page-title">Create account</h1>
      <p>Get started with React Kit in a few steps.</p>
      <SignupForm />
      <p>
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
    </div>
  )
}
