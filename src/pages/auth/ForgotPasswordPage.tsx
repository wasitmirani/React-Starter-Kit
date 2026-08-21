import { PasswordReset } from '@/components/features/auth/PasswordReset'

export function ForgotPasswordPage() {
  return (
    <section className="page auth-page">
      <h1>Reset password</h1>
      <p>We will email you a reset link.</p>
      <PasswordReset>
        <p>Password reset form placeholder.</p>
      </PasswordReset>
    </section>
  )
}
