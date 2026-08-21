export const themeConfig = {
  defaultTheme: 'light' as const,
  storageKey: 'react-kit-theme',
  colors: {
    light: {
      primary: '#2563eb',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
    },
    dark: {
      primary: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
    },
  },
} as const

export type ThemeMode = 'light' | 'dark'
