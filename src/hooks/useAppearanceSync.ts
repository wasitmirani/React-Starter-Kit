import { useEffect, useMemo, useRef } from 'react'
import { usersApi } from '@/api/endpoints/users.api'
import { useTheme } from '@/contexts/ThemeContext/useTheme'
import { useTenantSettings } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { applyBrand, currentBrand, resolveAppearance } from '@/utils/helpers/brand'

/** Effective appearance for the signed-in person in the current workspace. */
export function useAppearance() {
  const { user, currentMembership } = useAuth()
  const settings = useTenantSettings()
  const workspace = currentMembership ? (settings.data?.settings?.appearance as { brandTheme?: string; colorMode?: string } | undefined) : undefined
  return useMemo(() => resolveAppearance(user?.preferences, workspace), [user?.preferences, workspace])
}

/**
 * Applies the stored appearance (yours, else the workspace default) after sign-in and
 * on workspace switch, and saves a dark-mode toggle from the top bar to your account,
 * so the choice follows you to other devices.
 */
export function useAppearanceSync() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const { theme, setTheme } = useTheme()
  const resolved = useAppearance()
  const userRef = useRef(user)
  userRef.current = user

  useEffect(() => {
    if (resolved.brand !== currentBrand()) applyBrand(resolved.brand)
  }, [resolved.brand])

  useEffect(() => {
    if (resolved.colorMode && resolved.colorMode !== theme) setTheme(resolved.colorMode)
    // Only when the stored choice changes, not on every toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.colorMode, setTheme])

  // Only a real click on the moon icon counts as a choice; theme changes made by the
  // kit's own scripts at load must never be saved as a preference.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest('#darkModeButton')) return
      // The kit flips data-bs-theme in its own handler; read the result next frame.
      requestAnimationFrame(() => {
        const next = document.documentElement.getAttribute('data-bs-theme')
        if ((next !== 'light' && next !== 'dark') || !userRef.current) return
        if (userRef.current.preferences?.colorMode === next) return
        usersApi
          .updateMe({ preferences: { colorMode: next } })
          .then(({ data }) => setUser(data.data))
          .catch(() => {
            /* offline: the toggle still applies in this browser */
          })
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [setUser])
}
