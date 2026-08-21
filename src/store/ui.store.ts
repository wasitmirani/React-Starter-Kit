import { create } from 'zustand'
import type { ThemeMode } from '@/config/theme.config'

interface UiState {
  theme: ThemeMode
  sidebarOpen: boolean
  globalLoading: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  globalLoading: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}))
