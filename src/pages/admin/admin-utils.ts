/** Non-component helpers for the platform (master) console. */

export const ADMIN_PLANS = [
  { id: 'free', name: 'Free' },
  { id: 'starter', name: 'Starter' },
  { id: 'business', name: 'Business' },
  { id: 'enterprise', name: 'Enterprise' },
] as const

/** "platform.tenant.suspended" → "Workspace suspended". */
export function describeAction(action: string): string {
  const map: Record<string, string> = {
    'platform.tenant.suspended': 'Workspace suspended',
    'platform.tenant.reactivated': 'Workspace reactivated',
    'platform.tenant.renamed': 'Workspace renamed',
    'platform.tenant.notes_updated': 'Admin notes updated',
    'platform.tenant.plan_changed': 'Plan changed',
    'platform.tenant.deleted': 'Workspace deleted',
    'platform.user.disabled': 'User disabled',
    'platform.user.enabled': 'User re-enabled',
    'platform.user.admin_granted': 'Platform admin granted',
    'platform.user.admin_revoked': 'Platform admin revoked',
    'platform.tenant.limits_changed': 'Custom limits set',
    'platform.tenant.limits_cleared': 'Custom limits removed',
    'platform.tenant.sending_paused': 'Sending paused',
    'platform.tenant.sending_resumed': 'Sending resumed',
    'platform.tenants.exported': 'Workspaces exported',
    'platform.user.signed_out': 'Signed out everywhere',
    'platform.user.email_verified': 'Email marked verified',
    'platform.user.password_reset_sent': 'Password reset sent',
    'platform.settings.announcement': 'Announcement updated',
    'platform.settings.signups_opened': 'Sign-ups opened',
    'platform.settings.signups_closed': 'Sign-ups closed',
  }
  return map[action] ?? action
}

/** Short human summary of an audit entry's metadata. */
export function describeMeta(meta: Record<string, unknown>): string {
  if (!meta || !Object.keys(meta).length) return ''
  if (meta.rows !== undefined) return `${String(meta.rows)} rows`
  if (meta.sessions !== undefined) return `${String(meta.email ?? '')} · ${String(meta.sessions)} session(s)`
  if (typeof meta.to === 'object' && meta.to !== null) return meta.reason ? `Reason: ${String(meta.reason)}` : ''
  if (meta.from !== undefined && meta.to !== undefined) return `${String(meta.from)} → ${String(meta.to)}${meta.forced ? ' (forced)' : ''}`
  if (meta.reason) return `Reason: ${String(meta.reason)}`
  if (meta.email) return String(meta.email)
  if (meta.name) return `${String(meta.name)}${meta.slug ? ` (${String(meta.slug)})` : ''}`
  return JSON.stringify(meta)
}
