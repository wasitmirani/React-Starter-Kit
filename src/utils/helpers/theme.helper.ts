import type { ThemeMode } from '@/config/theme.config'

type HeaderMenuStyles = {
  header: string
  menu: string
}

/** Mirror Nilova darkFn/lightFn header+menu pairing for the active theme template. */
function getHeaderMenuStyles(themeName: string, mode: ThemeMode): HeaderMenuStyles {
  if (mode === 'dark') {
    switch (themeName) {
      case 'fusion':
      case 'saas':
      case 'neon':
      case 'elegant':
      case 'retro':
        return { header: 'transparent', menu: 'dark' }
      case 'modern':
        return { header: 'gradient', menu: 'dark' }
      case 'prism':
        return { header: 'transparent', menu: 'transparent' }
      case 'frost':
        return { header: 'transparent', menu: 'gradient' }
      case 'flat':
      default:
        return { header: 'dark', menu: 'dark' }
    }
  }

  switch (themeName) {
    case 'fusion':
      return { header: 'transparent', menu: 'light' }
    case 'modern':
      return { header: 'gradient', menu: 'light' }
    case 'flat':
      return { header: 'light', menu: 'light' }
    case 'prism':
      return { header: 'transparent', menu: 'transparent' }
    case 'frost':
      return { header: 'transparent', menu: 'gradient' }
    case 'saas':
    case 'neon':
    case 'elegant':
    case 'retro':
      return { header: 'transparent', menu: 'dark' }
    case 'galaxy':
      return { header: 'light', menu: 'dark' }
    default:
      return { header: 'light', menu: 'dark' }
  }
}

function syncSwitcherRadios(mode: ThemeMode, header: string, menu: string) {
  const setChecked = (selector: string, checked = true) => {
    const el = document.querySelector<HTMLInputElement>(selector)
    if (el) el.checked = checked
  }

  setChecked('#switcher-light-theme', mode === 'light')
  setChecked('#switcher-dark-theme', mode === 'dark')
  setChecked(`#switcher-header-${header}`)
  setChecked(`#switcher-menu-${menu === 'color' ? 'primary' : menu}`)
}

/** Apply Nilova template dark/light mode on <html>, header, menu + localStorage. */
export function applyNilovaThemeMode(mode: ThemeMode) {
  const html = document.documentElement
  const themeName =
    html.getAttribute('data-theme-template') ||
    localStorage.getItem('nilovaThemeTemplate') ||
    'default'
  const { header, menu } = getHeaderMenuStyles(themeName, mode)

  html.classList.remove('dark', 'light')
  html.classList.add(mode)
  html.setAttribute('data-header-styles', header)
  html.setAttribute('data-menu-styles', menu)

  localStorage.setItem('nilovaUserMode', mode)
  localStorage.setItem('nilovaHeader', header)
  localStorage.setItem('nilovaMenu', menu)
  localStorage.setItem('hs_theme', mode)

  if (mode === 'dark') {
    localStorage.setItem('nilovadarktheme', 'true')
  } else {
    localStorage.removeItem('nilovadarktheme')
  }

  // Clear inline color overrides left by the template switcher
  ;[
    '--color-bodybg',
    '--color-bodybg2',
    '--color-dark',
    '--color-light',
    '--color-formcontrolbg',
    '--input-border',
    '--color-inputborder',
    '--color-customblack',
    '--color-customwhite',
    '--gray-3',
  ].forEach((prop) => html.style.removeProperty(prop))

  syncSwitcherRadios(mode, header, menu)
}

export function getNilovaThemeMode(): ThemeMode {
  const html = document.documentElement
  if (html.classList.contains('dark')) return 'dark'
  if (html.classList.contains('light')) return 'light'

  const stored =
    localStorage.getItem('nilovaUserMode') ||
    (localStorage.getItem('nilovadarktheme') ? 'dark' : null)

  return stored === 'dark' ? 'dark' : 'light'
}

export function toggleNilovaThemeMode(): ThemeMode {
  const next: ThemeMode = getNilovaThemeMode() === 'dark' ? 'light' : 'dark'
  applyNilovaThemeMode(next)
  return next
}
