import { Link } from 'react-router-dom'
import { SignupForm } from '@/components/features/auth/SignupForm'
import { ROUTES } from '@/constants/routes.constants'

export function RegisterPage() {
  return (
    <section className="page auth-page">
      <h1>Create account</h1>
      <p>Get started with React Kit in a few steps.</p>
      <SignupForm />
      <p>
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
    </section>
  )
}
