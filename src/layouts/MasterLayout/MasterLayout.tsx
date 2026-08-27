import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Switcher from '@/layouts/MasterLayout/Switcher'
import HeaderMenu from '@/layouts/MasterLayout/HeaderMenu'
import { SideBar } from '@/layouts/MasterLayout/SideBar'
import { useTemplateScripts } from '@/layouts/MasterLayout/useTemplateScripts'
import { useSidebarDomSync, useSidebarToggle } from '@/layouts/MasterLayout/useSidebarToggle'
import { PageSkeleton, type PageSkeletonVariant } from '@/components/common/PageSkeleton'
import { ErrorBoundary } from '@/pages/error/ErrorBoundary'
import { ROUTES } from '@/constants/routes.constants'

function skeletonVariant(pathname: string): PageSkeletonVariant {
  if (
    pathname === ROUTES.DASHBOARD ||
    pathname === ROUTES.ANALYTICS ||
    pathname.startsWith(`${ROUTES.ANALYTICS}/`)
  ) {
    return 'dashboard'
  }
  if (
    pathname === ROUTES.USERS ||
    pathname === ROUTES.PRODUCTS ||
    pathname.startsWith(`${ROUTES.PRODUCTS}/`)
  ) {
    return 'table'
  }
  return 'default'
}

export function MasterLayout() {
  const scriptsReady = useTemplateScripts()
  useSidebarDomSync(scriptsReady)
  const { closeSidebar } = useSidebarToggle()
  const location = useLocation()
  const [routeProgress, setRouteProgress] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const progressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const skipFirstProgress = useRef(true)

  // First boot: hold skeleton until template scripts are ready
  useEffect(() => {
    if (scriptsReady) setBootDone(true)
  }, [scriptsReady])

  const showBootSkeleton = !bootDone

  // Soft top progress on SPA navigations (after first paint)
  useEffect(() => {
    if (skipFirstProgress.current) {
      skipFirstProgress.current = false
      return
    }

    setRouteProgress(true)
    if (progressTimer.current) clearTimeout(progressTimer.current)
    progressTimer.current = setTimeout(() => setRouteProgress(false), 520)

    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current)
    }
  }, [location.pathname])

  return (
    <>
      <div className={`progress-top-bar${routeProgress ? ' is-active' : ''}`} aria-hidden="true" />

      <Switcher />

      <div className="page">
        <HeaderMenu />
        <SideBar />
        <div className="main-content app-content">
          <div className="container-fluid page-container main-body-container">
            {showBootSkeleton ? (
              <PageSkeleton variant={skeletonVariant(location.pathname)} />
            ) : null}
            {/* Always keep Outlet mounted so route content / navigation never stalls on scripts. */}
            <div
              key={location.pathname}
              className="saas-page-enter"
              hidden={showBootSkeleton}
              aria-hidden={showBootSkeleton}
            >
              <ErrorBoundary
                fallback={
                  <div className="box box-body">
                    <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
                    <p className="text-textmuted mb-0">
                      This page failed to load. Refresh or use the sidebar to navigate elsewhere.
                    </p>
                  </div>
                }
              >
                <Outlet />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      <div className="scrollToTop justify-center">
        <span className="arrow leading-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="#000000"
            viewBox="0 0 256 256"
          >
            <path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v24a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v24H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Zm0-32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,184Z"></path>
          </svg>
        </span>
      </div>

      <div
        id="responsive-overlay"
        onClick={closeSidebar}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter') closeSidebar()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close sidebar"
      />
    </>
  )
}
