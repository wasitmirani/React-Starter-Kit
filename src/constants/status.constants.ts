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
  partial: 'warning',
  cancelled: 'secondary',
  open: 'primary',
  closed: 'secondary',
  // connections
  connected: 'success',
  disconnected: 'secondary',
  error: 'danger',
  operational: 'success',
  degraded: 'warning',
  down: 'danger',
  live: 'success',
  sandbox: 'info',
  // listings and storefronts
  suppressed: 'danger',
  published: 'success',
  maintenance: 'warning',
  installed: 'success',
  // orders
  pending_validation: 'warning',
  on_hold: 'orange',
  ready_to_allocate: 'info',
  partially_allocated: 'warning',
  allocated: 'primary',
  picking: 'info',
  packed: 'primary',
  dispatched: 'info',
  delivered: 'success',
  delivery_failed: 'danger',
  returned: 'pink',
  // payments
  paid: 'success',
  cod_pending: 'warning',
  cod_collected: 'success',
  refunded: 'secondary',
  // inventory and warehouse
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  in_transit: 'info',
  received: 'success',
  scheduled: 'info',
  in_progress: 'primary',
  submitted: 'warning',
  expired: 'danger',
  quarantined: 'orange',
  ordered: 'info',
  dismissed: 'secondary',
  blocked: 'danger',
  expected: 'info',
  receiving: 'primary',
  inspecting: 'warning',
  assigned: 'info',
  exception: 'danger',
  planned: 'secondary',
  released: 'info',
  verified: 'success',
  handed_over: 'success',
  on_shift: 'success',
  off_shift: 'secondary',
  reserved: 'info',
  consumed: 'secondary',
  // procurement
  partially_received: 'warning',
  converted: 'success',
  shipped: 'info',
  credited: 'success',
  // shipping
  booked: 'primary',
  out_for_delivery: 'info',
  rto: 'pink',
  not_applicable: 'light',
  collected: 'success',
  remitted: 'success',
  reconciled: 'success',
  disputed: 'danger',
  // returns
  requested: 'warning',
  inspected: 'info',
  none: 'light',
  // 3PL
  onboarding: 'info',
  suspended: 'danger',
  retired: 'secondary',
  issued: 'info',
  overdue: 'danger',
  // integrations and automation
  queued: 'secondary',
  running: 'primary',
  retrying: 'warning',
  resolved: 'success',
  ignored: 'secondary',
  paused: 'warning',
  success: 'success',
  skipped: 'secondary',
  dry_run: 'info',
  // billing
  past_due: 'danger',
  trialing: 'info',
  void: 'secondary',
  // priority
  low: 'secondary',
  normal: 'info',
  high: 'orange',
  urgent: 'danger',
}

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? 'secondary'
}

export function humanize(value: string): string {
  const text = value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b(sku|cod|rto|api|url|ip|id|po|grn|rma|sla|vas|pos|b2b|csv)\b/gi, (word) => word.toUpperCase())
  return text.charAt(0).toUpperCase() + text.slice(1)
}
