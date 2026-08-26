import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes.constants'
import { NavLink } from 'react-router-dom'

export function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="grid grid-cols-12 authentication authentication-cover-main mx-0">
      <div className="2xl:col-span-9 xl:col-span-9 col-span-12">
        <div className="grid grid-cols-12 justify-center! items-center! h-full">
          <div className="2xl:col-span-4 xl:col-span-3 lg:col-span-3 md:col-span-3  sm:col-span-2"></div>
          <div className="2xl:col-span-4 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-8 col-span-12">
            <div className="box border-0! shadow-none! my-6!">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <div className="2xl:col-span-3 xl:col-span-3 col-lg-12  col-span-12 xl:block hidden px-0">
            <div className="authentication-cover overflow-hidden">
                <div className="authentication-cover-logo">
                    <NavLink to="/">
                    <img src="/assets/images/brand-logos/toggle-logo.png" alt="logo" className="desktop-dark" /> 
                    </NavLink>
                </div>
                <div className="authentication-cover-background">
                    <img src="/assets/images/media/backgrounds/9.png" alt="" />
                </div>
                <div className="authentication-cover-content">
                    <div className="p-12">
                        <div className="font-semibold fs-28 mb-2 lh-base">Welcome to Dashboard</div>
                        <p className="mb-0! text-textmuted font-medium">Manage your website and content with ease using our powerful admin tools.</p>
                    </div>
                    <div>



                      
                        <img src="/assets/images/media/media-72.png" alt="" className="img-fluid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
