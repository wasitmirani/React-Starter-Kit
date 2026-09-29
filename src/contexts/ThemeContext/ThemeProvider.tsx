import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { themeConfig, type ThemeMode } from '@/config/theme.config'
import { ThemeContext } from './ThemeContext'

interface ThemeProviderProps {
  children: ReactNode
}

function readInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(themeConfig.storageKey) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored

  const session = sessionStorage.getItem('data-bs-theme')
  if (session === 'light' || session === 'dark') return session

  const attr = document.documentElement.getAttribute('data-bs-theme')
  if (attr === 'light' || attr === 'dark') return attr

  return themeConfig.defaultTheme
}

function applyAlloceThemeMode(mode: ThemeMode) {
  const html = document.documentElement
  html.setAttribute('data-bs-theme', mode)
  sessionStorage.setItem('data-bs-theme', mode)
  localStorage.setItem(themeConfig.storageKey, mode)

  const radio = document.querySelector<HTMLInputElement>(
    `input[name="data-bs-theme"][value="${mode}"]`,
  )
  if (radio) radio.checked = true

  if (mode === 'dark') {
    html.setAttribute('data-sidebar-colors', 'dark')
    sessionStorage.setItem('data-sidebar-colors', 'dark')
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readInitialTheme())

  useEffect(() => {
    applyAlloceThemeMode(theme)
  }, [theme])

  // Keep React state in sync when Alloce darkModeButton / switcher changes data-bs-theme
  useEffect(() => {
    const html = document.documentElement
    const sync = () => {
      const next = html.getAttribute('data-bs-theme')
      if (next === 'light' || next === 'dark') {
        setThemeState((prev) => (prev === next ? prev : next))
        localStorage.setItem(themeConfig.storageKey, next)
      }
    }

    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ['data-bs-theme'] })
    return () => observer.disconnect()
  }, [])

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
