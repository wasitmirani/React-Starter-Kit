import { appById } from '@/constants/apps.constants'
import { regionOf } from '@/constants/regions.constants'

/** Readable text colour on a brand background. */
function textOn(hex: string): string {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111827' : '#ffffff'
}

/** Initials tile for an app (brand names as text, never trademarked artwork). */
export function AppLogo({ appId, size = 'md', fallbackIcon = 'ri-plug-line' }: { appId: string; size?: 'sm' | 'md' | 'lg'; fallbackIcon?: string }) {
  const app = appById(appId)
  if (!app) return <span className={`app-logo app-logo-${size} app-logo-fallback`} aria-hidden="true"><i className={fallbackIcon} /></span>
  return (
    <span className={`app-logo app-logo-${size}`} style={{ background: app.color, color: textOn(app.color) }} aria-hidden="true">
      {app.initials}
    </span>
  )
}

export function RegionFlags({ regions, max = 6 }: { regions: string[]; max?: number }) {
  const shown = regions.slice(0, max)
  return (
    <span className="region-flags" aria-label={`Markets: ${regions.map((r) => regionOf(r)?.short ?? r).join(', ')}`}>
      {shown.map((r) => <span key={r} title={regionOf(r)?.name ?? r}>{regionOf(r)?.flag ?? r}</span>)}
      {regions.length > max && <span className="text-muted fs-xs">+{regions.length - max}</span>}
    </span>
  )
}
