import { env } from '@/config/env.config'

/** Product logo: mark + name. `compact` shows only the mark (collapsed sidebar). */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="d-inline-flex align-items-center gap-2 text-reset">
      <span className="icon-tile icon-tile-sm bg-primary text-white" aria-hidden="true">
        <i className="ri-chat-smile-3-fill" />
      </span>
      {!compact && <span className="fw-semibold fs-5 brand-name">{env.appName}</span>}
    </span>
  )
}
