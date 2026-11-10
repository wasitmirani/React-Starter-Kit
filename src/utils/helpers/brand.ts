/**
 * Brand colour themes (styles in assets/styles/brand-themes.css). The choice is a
 * personal preference kept in this browser, applied before the first paint by
 * index.html so there is no flash of the wrong colour.
 */
export type BrandTheme = 'lagoon' | 'violet' | 'ocean' | 'ember' | 'berry'

export const BRAND_THEMES: { id: BrandTheme; name: string; description: string; rgb: string; shades: [string, string, string] }[] = [
  { id: 'lagoon', name: 'Material teal', description: 'The Alloce Material colours. Calm and professional.', rgb: '4, 114, 99', shades: ['#023d35', '#047263', '#b4d5d0'] },
  { id: 'violet', name: 'Violet', description: 'Rich purple. Creative and premium.', rgb: '109, 40, 217', shades: ['#4c1d95', '#6d28d9', '#ddd6fe'] },
  { id: 'ocean', name: 'Ocean', description: 'Royal blue. Classic and trusted.', rgb: '37, 99, 235', shades: ['#1e3a8a', '#2563eb', '#bfdbfe'] },
  { id: 'ember', name: 'Ember', description: 'Burnt orange. Warm and energetic.', rgb: '194, 65, 12', shades: ['#7c2d12', '#c2410c', '#fed7aa'] },
  { id: 'berry', name: 'Berry', description: 'Fuchsia. Bold and playful.', rgb: '162, 28, 175', shades: ['#701a75', '#a21caf', '#f5d0fe'] },
]

const KEY = 'linqflow.brand'
export const DEFAULT_BRAND: BrandTheme = 'lagoon'

export function currentBrand(): BrandTheme {
  const attr = document.documentElement.getAttribute('data-brand') as BrandTheme | null
  return BRAND_THEMES.some((t) => t.id === attr) ? attr! : DEFAULT_BRAND
}

/** Applies a theme now and remembers it for this browser. */
export function applyBrand(id: BrandTheme) {
  const theme = BRAND_THEMES.find((t) => t.id === id) ?? BRAND_THEMES[0]
  document.documentElement.setAttribute('data-brand', theme.id)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.shades[1])
  try {
    localStorage.setItem(KEY, theme.id)
  } catch {
    /* private mode: the choice lasts for this visit */
  }
}
