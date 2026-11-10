import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Shared frame for the sign-in, sign-up and account-recovery screens (the logo is in AuthLayout). */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="auth-card">
      <header className="auth-card-head">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      {children}
      {footer && <div className="auth-card-foot">{footer}</div>}
    </div>
  )
}
