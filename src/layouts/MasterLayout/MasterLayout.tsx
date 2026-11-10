import { useEffect } from 'react'
import { RequireAreaAccess } from '@/middleware/RequireAuth'
import { Outlet, useLocation } from 'react-router-dom'
import Switcher from './partials/Switcher'
import HeaderMenu from './partials/HeaderMenu'
import SideBar from './partials/SideBar'
import { loadAlloceScripts, refreshAlloceIcons } from '@/utils/alloce/loadAlloceScripts'
import { EmailVerificationBanner } from '@/components/features/account/EmailVerificationBanner'
import { OfflineDemoBanner } from '@/components/features/account/OfflineDemoBanner'
import { RolePreviewBanner } from '@/components/features/account/RolePreviewBanner'
import { NoWorkspace } from '@/components/features/workspace/NoWorkspace'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'

const MasterLayout = () => {
  const location = useLocation()
  const { currentMembership } = useAuth()
  // Live updates (inbox, delivery statuses, runs) over WebSocket.
  useRealtimeSync()
  // Profile settings do not need a workspace; everything else does.
  const needsWorkspace = !currentMembership && location.pathname !== ROUTES.SETTINGS_PROFILE

  // Defer Alloce main.js until after the final mount so #toggleSidebar /
  // #darkModeButton / #settingsModal exist. rAF is cancelled on StrictMode cleanup.
  useEffect(() => {
    let cancelled = false
    const frame = requestAnimationFrame(() => {
      if (!cancelled) void loadAlloceScripts()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void refreshAlloceIcons()
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname])

  return (
    <>
   

      <HeaderMenu />
      <Switcher />
      <SideBar />

      <div id="sidebar-backdrop" className="sidebar-backdrop"></div>
      <div className="min-vh-100 position-relative">
        <div className="page-wrapper">
          <div className="container-fluid">
            <OfflineDemoBanner />
            <RolePreviewBanner />
            <EmailVerificationBanner />
            {needsWorkspace ? <NoWorkspace /> : <RequireAreaAccess><Outlet key={currentMembership?.tenant.id} /></RequireAreaAccess>}
          </div>
        </div>
      </div>
    </>
  )
}

export default MasterLayout
