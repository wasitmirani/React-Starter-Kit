import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Parent pages, e.g. `[{ label: 'Contacts', to: '/contacts' }]`. */
  back?: { label: string; to: string }
  actions?: ReactNode
  /** Rendered next to the title (status badge…). */
  meta?: ReactNode
}

export function PageHeader({ title, description, back, actions, meta }: PageHeaderProps) {
  return (
    <div className="page-header-bar">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="d-inline-flex align-items-center gap-1 text-muted fs-sm mb-2 link-primary">
            <i className="ri-arrow-left-line" /> {back.label}
          </Link>
        )}
        <div className="d-flex align-items-center flex-wrap gap-2">
          <h4 className="mb-0 text-truncate">{title}</h4>
          {meta}
        </div>
        {description && <p className="text-muted mb-0 mt-1">{description}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap align-items-center gap-2">{actions}</div>}
    </div>
  )
}
