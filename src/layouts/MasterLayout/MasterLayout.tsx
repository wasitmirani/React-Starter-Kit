import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Switcher from './partials/Switcher'
import HeaderMenu from './partials/HeaderMenu'
import SideBar from './partials/SideBar'
import { loadAlloceScripts, refreshAlloceIcons } from '@/utils/alloce/loadAlloceScripts'

const MasterLayout = () => {
  const location = useLocation()

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
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default MasterLayout
