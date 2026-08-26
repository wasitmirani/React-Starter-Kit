import { PasswordReset } from '@/components/features/auth/PasswordReset'

export function ForgotPasswordPage() {
  return (
    <div className="saas-auth-page p-6">
      <h1 className="page-title">Reset password</h1>
      <p>We will email you a reset link.</p>
      <PasswordReset>
        <p className="text-textmuted mb-0">Password reset form placeholder.</p>
      </PasswordReset>
    </div>
  )
}
