import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
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
          <Link to={ROUTES.HOME} className="d-inline-flex text-reset text-decoration-none" aria-label={appConfig.name}>
            <BrandMark />
          </Link>
        </div>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-baseline mb-8">
          <h1 className="mb-0 fs-4 fw-semibold">{title}</h1>
          {subtitle && <div className="text-muted mb-0">{subtitle}</div>}
        </div>
        {children}
        {footer && <div className="mt-8 text-center text-muted">{footer}</div>}
      </div>
    </div>
  )
}
