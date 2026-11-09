import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { appConfig } from '@/config/app.config'
import { ROUTES } from '@/constants/routes.constants'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Shared frame for the sign-in, sign-up and account-recovery screens. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="col-md-9 col-lg-7 col-xxl-6">
      <div className="p-4 p-md-10 pb-20 pb-md-16 pb-xl-10">
        <div className="mb-10 text-center">
          <Link to={ROUTES.HOME} className="logos">
            <img src="/assets/images/main-logo.webp" loading="lazy" alt={appConfig.name} className="h-7 logo-dark" />
            <img src="/assets/images/logo-white.webp" loading="lazy" alt={appConfig.name} className="h-7 logo-light" />
          </Link>
        </div>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-baseline mb-8">
          <h6 className="mb-0 fs-16 fw-bold">{title}</h6>
          {subtitle && <div className="text-muted mb-0">{subtitle}</div>}
        </div>
        {children}
        {footer && <div className="mt-8 text-center text-muted">{footer}</div>}
      </div>
    </div>
  )
}
