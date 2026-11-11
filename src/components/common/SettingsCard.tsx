import type { ReactNode } from 'react'

/** Settings section: icon, title, short explanation, optional action, then content. */
export function SettingsCard({ title, description, icon, children, action, className = '' }: { title: string; description?: ReactNode; icon: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`card settings-card mb-0 ${className}`}>
      <div className="card-header d-flex align-items-start gap-3">
        <span className="settings-card-icon" aria-hidden="true"><i className={icon} /></span>
        <div className="flex-1 min-w-0">
          <h6 className="card-title mb-0">{title}</h6>
          {description && <p className="text-muted fs-sm mb-0 mt-1">{description}</p>}
        </div>
        {action}
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}
