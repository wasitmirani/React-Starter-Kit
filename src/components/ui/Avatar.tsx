const PALETTE = ['primary', 'success', 'warning', 'info', 'danger', 'secondary', 'orange', 'pink'] as const

function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

interface AvatarProps {
  name: string
  src?: string | null
  /** Pixel size. */
  size?: number
  className?: string
}

/** Photo or coloured initials; the colour is stable per name. */
export function Avatar({ name, src, size = 36, className = '' }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }
  if (src) return <img src={src} alt={name} className={`rounded-circle object-fit-cover flex-shrink-0 ${className}`} style={style} />
  const tone = PALETTE[hash(name) % PALETTE.length]
  return (
    <span className={`avatar-initials bg-${tone}-subtle text-${tone} ${className}`} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
