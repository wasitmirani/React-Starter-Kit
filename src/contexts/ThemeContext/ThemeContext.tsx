import { createContext } from 'react'
import type { ThemeMode } from '@/config/theme.config'

export interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
