import { useEffect } from 'react'
import { useUiStore } from '@/store'

const DESKTOP_BP = 992

function applySidebarToDom(open: boolean) {
  const html = document.documentElement
  const overlay = document.getElementById('responsive-overlay')
  const isDesktop = window.innerWidth >= DESKTOP_BP

  if (isDesktop) {
    // Match Nilova default vertical "overlay" menu style
    html.setAttribute('data-vertical-style', 'overlay')
    if (open) {
      html.removeAttribute('data-toggled')
    } else {
      html.setAttribute('data-toggled', 'icon-overlay-close')
    }
    overlay?.classList.remove('active')
    return
  }

  html.removeAttribute('data-vertical-style')
  if (open) {
    html.setAttribute('data-toggled', 'open')
    overlay?.classList.add('active')
  } else {
    html.setAttribute('data-toggled', 'close')
    overlay?.classList.remove('active')
  }
}

/** Actions + state for hamburger / overlay — safe to call from multiple components. */
export function useSidebarToggle() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    closeSidebar: () => setSidebarOpen(false),
  }
}

/**
 * Syncs Zustand sidebar state to theme `data-toggled` / overlay.
 * Call once from MasterLayout only.
 * @param scriptsReady - re-apply after template switcher scripts finish (they may overwrite attrs).
 */
export function useSidebarDomSync(scriptsReady = true) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  useEffect(() => {
    if (!scriptsReady) return
    // Prefer React-controlled overlay menu over leftover template localStorage styles
    localStorage.removeItem('nilovaverticalstyles')
    applySidebarToDom(sidebarOpen)
  }, [sidebarOpen, scriptsReady])

  useEffect(() => {
    const onResize = () => {
      applySidebarToDom(useUiStore.getState().sidebarOpen)
    }

    // Start closed on small screens
    if (window.innerWidth < DESKTOP_BP) {
      setSidebarOpen(false)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setSidebarOpen])
}
