import type { Tone } from '@/types/common.types'

/**
 * Status value → badge tone. One table for every module so the same word
 * always has the same colour. Unknown values fall back to `secondary`.
 */
const STATUS_TONES: Record<string, Tone> = {
  // generic
  active: 'success',
  inactive: 'secondary',
  draft: 'secondary',
  disabled: 'secondary',
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'danger',
  cancelled: 'secondary',
  // connections and verification
  connected: 'success',
  disconnected: 'secondary',
  error: 'danger',
  verified: 'success',
  // campaigns and workflows
  scheduled: 'info',
  running: 'primary',
  paused: 'warning',
  waiting: 'info',
  goal_reached: 'success',
  success: 'success',
  skipped: 'secondary',
  info: 'light',
  live: 'success',
  published: 'success',
  // messages
  queued: 'secondary',
  sent: 'info',
  delivered: 'success',
  read: 'primary',
  received: 'primary',
  bounced: 'danger',
  unknown: 'warning',
  // templates
  approved: 'success',
  rejected: 'danger',
  // consent
  subscribed: 'success',
  unsubscribed: 'secondary',
  none: 'light',
  blocklisted: 'danger',
  // inbox
  open: 'primary',
  snoozed: 'info',
  resolved: 'success',
  // deals and billing
  won: 'success',
  lost: 'danger',
  paid: 'success',
  void: 'secondary',
  past_due: 'danger',
  trialing: 'info',
  // calls
  in_progress: 'primary',
  no_answer: 'warning',
  busy: 'warning',
  voicemail: 'info',
  released: 'secondary',
  // priority
  low: 'secondary',
  normal: 'info',
  medium: 'warning',
  high: 'orange',
  urgent: 'danger',
}

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? 'secondary'
}

export function humanize(value: string): string {
  const text = value.replace(/[_-]+/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
