import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { themeConfig, type ThemeMode } from '@/config/theme.config'
import { applyNilovaThemeMode, getNilovaThemeMode } from '@/utils/helpers/theme.helper'
import { ThemeContext } from './ThemeContext'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(themeConfig.storageKey) as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
    return getNilovaThemeMode() || themeConfig.defaultTheme
  })

  useEffect(() => {
    applyNilovaThemeMode(theme)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(themeConfig.storageKey, theme)
  }, [theme])

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
