export const themeConfig = {
  defaultTheme: 'light' as const,
  storageKey: 'react-kit-theme',
} as const

export type ThemeMode = 'light' | 'dark'
