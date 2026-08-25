import { useEffect, useState } from 'react'

const TEMPLATE_SCRIPTS = [
  '/assets/js/sticky.js',
  // simplebar.js intentionally omitted — it rewrites #sidebar-scroll and breaks React menu updates
  '/assets/js/crm-dashboard.js',
  '/assets/js/custom.js',
  '/assets/js/custom-switcher.min.js',
] as const

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-template-src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.dataset.templateSrc = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

/**
 * Loads non-menu theme scripts after MasterLayout mounts.
 * Menu / hamburger interactions are handled in React (useSidebarToggle + SideBar).
 * @returns true once scripts have finished loading (switcher may have mutated html attrs).
 */
export function useTemplateScripts() {
  const [scriptsReady, setScriptsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      for (const src of TEMPLATE_SCRIPTS) {
        if (cancelled) return
        try {
          await loadScript(src)
        } catch {
          // Continue loading remaining scripts even if one fails
        }
      }
      if (!cancelled) setScriptsReady(true)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  return scriptsReady
}
