import type { ReactNode } from 'react'
import { CHANNELS } from '@/constants/channels.constants'
import { humanize, statusTone } from '@/constants/status.constants'
import type { Channel } from '@/types/channel.types'
import type { Tone } from '@/types/common.types'

interface ToneBadgeProps {
  tone: Tone
  children: ReactNode
  icon?: string
  dot?: boolean
  className?: string
}

/** Soft-coloured pill used for statuses, tags and counts. */
export function ToneBadge({ tone, children, icon, dot = false, className = '' }: ToneBadgeProps) {
  return (
    <span className={`badge bg-${tone}-subtle text-${tone === 'light' ? 'body' : tone} d-inline-flex align-items-center gap-1 fw-medium ${className}`}>
      {dot && <span className={`legend-dot bg-${tone}`} style={{ width: 6, height: 6 }} />}
      {icon && <i className={icon} />}
      {children}
    </span>
  )
}

/** Status word with its standard colour (see status.constants). */
export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <ToneBadge tone={statusTone(status)} dot className={className}>
      {label ?? humanize(status)}
    </ToneBadge>
  )
}

/** Channel icon + name, or only the icon with `iconOnly`. */
export function ChannelBadge({ channel, iconOnly = false }: { channel: Channel; iconOnly?: boolean }) {
  const meta = CHANNELS[channel]
  if (iconOnly) {
    return (
      <span className={`icon-tile icon-tile-sm bg-${meta.tone}-subtle text-${meta.tone}`} title={meta.label}>
        <i className={meta.icon} />
      </span>
    )
  }
  return (
    <ToneBadge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </ToneBadge>
  )
}

export function TagList({ tags, max = 3 }: { tags: string[]; max?: number }) {
  if (tags.length === 0) return <span className="text-muted">—</span>
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {tags.slice(0, max).map((tag) => (
        <span key={tag} className="badge bg-light text-body border fw-normal">
          {tag}
        </span>
      ))}
      {tags.length > max && <span className="badge bg-light text-muted border fw-normal">+{tags.length - max}</span>}
    </span>
  )
}
