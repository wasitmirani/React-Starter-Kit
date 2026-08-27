import { useEffect } from 'react'

const SPLASH_ID = 'loader'

/**
 * Owns the HTML boot splash (#loader). Keeps it visible for `minMs`, then
 * fades it out — the pattern real SaaS apps use so the brand moment never flashes.
 */
export function AppSplash({ minMs = 720, ready = true }: { minMs?: number; ready?: boolean }) {
  useEffect(() => {
    if (!ready) return

    const splash = document.getElementById(SPLASH_ID)
    if (!splash) return

    const started = performance.now()
    let fadeTimer: ReturnType<typeof setTimeout> | undefined

    const elapsed = performance.now() - started
    const wait = Math.max(0, minMs - elapsed)

    fadeTimer = setTimeout(() => {
      splash.classList.add('is-done', 'hidden!')
      splash.setAttribute('aria-busy', 'false')
      splash.setAttribute('aria-hidden', 'true')
    }, wait)

    return () => {
      if (fadeTimer) clearTimeout(fadeTimer)
    }
  }, [minMs, ready])

  return null
}
