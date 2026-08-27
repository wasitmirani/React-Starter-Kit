import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { observePrimaryColor } from '@/utils/theme-primary-sync'

/** Layout / libs — load once while MasterLayout is mounted. */
const LAYOUT_SCRIPTS = [
  '/assets/js/sticky.js',
  // simplebar.js intentionally omitted — it rewrites #sidebar-scroll and breaks React menu updates
  '/assets/libs/swiper/swiper-bundle.min.js',
  '/assets/js/custom.js',
  '/assets/js/custom-switcher.min.js',
] as const

/**
 * Page widgets (charts, swipers, etc.) — must re-execute after SPA navigations
 * because they query DOM nodes that React replaces on each route.
 */
const PAGE_SCRIPTS = [
  '/assets/js/crm-dashboard.js',
  '/assets/js/projects-dashboard.js',
  '/assets/js/analytics-dashboard.js',
] as const

const DASHBOARD_BODY_CLASSES = [
  'crm-dashboard',
  'analytics-dashboard',
  'project-dashboard',
] as const

function dashboardBodyClass(pathname: string): (typeof DASHBOARD_BODY_CLASSES)[number] {
  if (pathname === ROUTES.ANALYTICS || pathname.startsWith(`${ROUTES.ANALYTICS}/`)) {
    return 'analytics-dashboard'
  }
  if (pathname === ROUTES.DASHBOARD) {
    return 'project-dashboard'
  }
  return 'project-dashboard'
}

function syncBodyDashboardClass(pathname: string) {
  const next = dashboardBodyClass(pathname)
  for (const cls of DASHBOARD_BODY_CLASSES) {
    document.body.classList.toggle(cls, cls === next)
  }
}

const CRM_CHART_KEYS = [
  'crmtotalCustomers',
  'crmtotalDeals',
  'crmtotalRevenue',
  'crmtotalConversion',
] as const

type DestroyableChart = { destroy?: () => void }

function loadScript(src: string, forceReload = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-template-src="${src}"]`,
    )

    if (existing && !forceReload) {
      resolve()
      return
    }

    existing?.remove()

    const script = document.createElement('script')
    // Cache-bust so the browser re-executes page scripts on route revisit
    script.src = forceReload ? `${src}?v=${Date.now()}` : src
    script.async = false
    script.dataset.templateSrc = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

function destroyTemplateCharts() {
  for (const key of CRM_CHART_KEYS) {
    const chart = (window as unknown as Record<string, DestroyableChart | undefined>)[key]
    try {
      chart?.destroy?.()
    } catch {
      // ignore stale instances from a previous route
    }
    delete (window as unknown as Record<string, unknown>)[key]
  }
}

function reinitPreline() {
  try {
    ;(
      window as unknown as {
        HSStaticMethods?: { autoInit?: () => void }
      }
    ).HSStaticMethods?.autoInit?.()
  } catch {
    // Preline may not be ready on first paint
  }
}

/**
 * Loads non-menu theme scripts after MasterLayout mounts, and re-runs page
 * widget scripts whenever the route changes (SPA navigation / revisit).
 * Menu / hamburger interactions are handled in React (useSidebarToggle + SideBar).
 * @returns true once scripts have finished loading (switcher may have mutated html attrs).
 */
export function useTemplateScripts() {
  const { pathname } = useLocation()
  const [scriptsReady, setScriptsReady] = useState(false)
  const layoutLoadedRef = useRef(false)

  useEffect(() => {
    const stop = observePrimaryColor()
    return stop
  }, [])

  useEffect(() => {
    syncBodyDashboardClass(pathname)
  }, [pathname])

  useEffect(() => {
    return () => {
      for (const cls of DASHBOARD_BODY_CLASSES) {
        document.body.classList.remove(cls)
      }
      document.body.classList.add('project-dashboard')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!layoutLoadedRef.current) {
        for (const src of LAYOUT_SCRIPTS) {
          if (cancelled) return
          try {
            await loadScript(src, false)
          } catch {
            // Continue loading remaining scripts even if one fails
          }
        }
        if (!cancelled) {
          layoutLoadedRef.current = true
          // Unlock the shell ASAP so routes (login/agents) are interactive.
          setScriptsReady(true)
        }
      }

      // Wait one frame so the new Outlet content is in the DOM before page scripts query it
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      if (cancelled) return

      destroyTemplateCharts()

      for (const src of PAGE_SCRIPTS) {
        if (cancelled) return
        try {
          await loadScript(src, true)
        } catch {
          // Continue loading remaining scripts even if one fails
        }
      }

      if (cancelled) return
      reinitPreline()
      // Re-apply saved primary + sync RGB triplet used by polish shadows
      try {
        const html = document.documentElement
        const primary = localStorage.getItem('primaryRGB')
        if (primary) {
          html.style.setProperty('--color-primary', primary)
        }
      } catch {
        // ignore storage access issues
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [pathname])

  return scriptsReady
}
