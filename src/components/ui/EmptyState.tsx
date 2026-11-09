import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon = 'ri-inbox-line', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      <span className="icon-tile icon-tile-lg bg-primary-subtle text-primary">
        <i className={icon} />
      </span>
      <h6 className="mb-1">{title}</h6>
      {description && <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 420 }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Loading placeholder lines for cards. */
export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="placeholder-glow" aria-busy="true">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="placeholder col-12 rounded mb-2 d-block" style={{ width: `${90 - i * 12}%`, height: 12 }} />
      ))}
    </div>
  )
}
