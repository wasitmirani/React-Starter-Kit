/**
 * Keep --color-primary-main (RGB triplet) in sync with --color-primary.
 * Template switcher only sets the hex primary; our polish uses primary-main for rgba().
 */
function hexToRgbTriplet(hex: string): string | null {
  const cleaned = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned) && !/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return null
  }
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned
  const n = Number.parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `${r}, ${g}, ${b}`
}

export function syncPrimaryRgbVar(root: HTMLElement = document.documentElement) {
  const primary = getComputedStyle(root).getPropertyValue('--color-primary').trim()
  if (!primary) return
  const triplet = hexToRgbTriplet(primary)
  if (triplet) {
    root.style.setProperty('--color-primary-main', triplet)
  }
}

export function observePrimaryColor() {
  const root = document.documentElement
  syncPrimaryRgbVar(root)

  const observer = new MutationObserver(() => {
    syncPrimaryRgbVar(root)
  })

  observer.observe(root, {
    attributes: true,
    attributeFilter: ['style', 'class', 'data-theme-template'],
  })

  return () => observer.disconnect()
}
