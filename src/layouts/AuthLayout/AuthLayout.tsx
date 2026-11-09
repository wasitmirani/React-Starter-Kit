import { Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { safeRedirect } from '@/utils/helpers/redirect'

interface AuthLayoutProps {
  /** Signed-in users are sent on to the app (login/register pages). */
  redirectIfAuthenticated?: boolean
}

export function AuthLayout({ redirectIfAuthenticated = true }: AuthLayoutProps) {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  if (redirectIfAuthenticated && isAuthenticated) {
    const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from
    const target = searchParams.get('redirect') ?? (from ? from.pathname + from.search : null)
    return <Navigate to={safeRedirect(target)} replace />
  }

  return (
   <>
   <div className="auth-wrapper auth-modern">
    <div className="row justify-content-between align-items-center h-100 p-xl-5 g-0">
        {/* Login Form */}
        <div className="col-xl-7 h-100 position-relative">
        <div className="row g-0 auth-modern-row justify-content-center align-items-center">
        <Outlet />
        </div>
        </div>
        {/* Login Form */}


        <div className="col-xl-5 h-100 overflow-hidden position-relative d-none d-xl-block rounded-20px">
            <div className="swiper swiper-navigation-custom" id="authCreative">
                <div className="swiper-wrapper">
                    <div className="swiper-slide position-relative">
                        <img src="assets/images/1.webp" alt="1" className="w-100 vh-100 object-fit-cover me-n6"/>
                        <div className="p-5 backdrop-blur rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 text-white position-absolute bottom-0 start-0 m-6 mb-16 z-1">
                            <div className="d-flex align-items-center justify-content-between gap-5 mb-3">
                                <p className="fs-16">Manage users, reports and settings.</p>
                                <a href="#!" className="text-reset"><i className="mgc_share_3_line fs-17"></i></a>
                            </div>
                            <div className="d-flex gap-4 align-items-center mb-5">
                                <p><i className="ri-heart-3-line me-1"></i> 1.2k</p>
                                <p><i className="ri-download-cloud-line me-1"></i> 956</p>
                                <p><i className="ri-checkbox-circle-fill me-1"></i> Secure admin access panel.</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">System Active</span>
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">Real-time Data</span>
                            </div>
                        </div>
                    </div>
                    <div className="swiper-slide position-relative">
                        <img src="assets/images/2.webp" alt="2" className="w-100 vh-100 object-fit-cover me-n6"/>
                        <div className="p-5 backdrop-blur rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 text-white position-absolute bottom-0 start-0 m-6 mb-16 z-1">
                            <div className="d-flex align-items-center justify-content-between gap-5 mb-3">
                                <p className="fs-16">Track analytics, growth and performance.</p>
                                <a href="#!" className="text-reset"><i className="mgc_share_3_line fs-17"></i></a>
                            </div>
                            <div className="d-flex gap-4 align-items-center mb-5">
                                <p><i className="ri-heart-3-line me-1"></i> 2.4k</p>
                                <p><i className="ri-download-cloud-line me-1"></i> 1.1k</p>
                                <p><i className="ri-checkbox-circle-fill me-1"></i> Smart data insights panel.</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">Live Analytics</span>
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">AI Reports</span>
                            </div>
                        </div>
                    </div>
                    <div className="swiper-slide position-relative">
                        <img src="assets/images/3.webp" alt="3" className="w-100 vh-100 object-fit-cover me-n6"/>
                        <div className="p-5 backdrop-blur rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 text-white position-absolute bottom-0 start-0 m-6 mb-16 z-1">
                            <div className="d-flex align-items-center justify-content-between gap-5 mb-3">
                                <p className="fs-16">Control access, security and permissions.</p>
                                <a href="#!" className="text-reset"><i className="mgc_share_3_line fs-17"></i></a>
                            </div>
                            <div className="d-flex gap-4 align-items-center mb-5">
                                <p><i className="ri-heart-3-line me-1"></i> 99.9%</p>
                                <p><i className="ri-download-cloud-line me-1"></i> 870</p>
                                <p><i className="ri-checkbox-circle-fill me-1"></i> Advanced Data secured.</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">Secure Access</span>
                                <span className="badge bg-body-secondary bg-opacity-10 border border-white border-opacity-10 px-3 py-6px rounded">Data Protection</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="swiper-button-next fs-xl fw-normal text-body">
                    <div className="size-12 fs-xl fw-normal text-body bg-light-subtle rounded-circle flex-shrink-0 avatar">
                        <i className="ri-arrow-right-line"></i>
                    </div>
                </div>
                <div className="swiper-button-prev">
                    <div className="size-12 fs-xl fw-normal text-body bg-light-subtle rounded-circle flex-shrink-0 avatar">
                        <i className="ri-arrow-left-line"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
   </>
  )
}
