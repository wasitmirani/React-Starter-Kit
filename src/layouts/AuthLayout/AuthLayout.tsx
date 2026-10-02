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
   <>
   <div className="auth-wrapper auth-modern">
    <div className="row justify-content-between align-items-center h-100 p-xl-5 g-0">
        <div className="position-fixed top-0 start-0 p-6 gap-2 d-none d-md-flex">
            <a href="index.html" className="btn btn-outline-light rounded-pill fs-sm py-6px px-4">
              <i className="ri-arrow-left-line me-1"></i>Back</a>
            <div className="dropdown">
                <button className="btn btn-outline-light rounded-pill fs-sm py-6px px-4 d-flex align-items-center" id="languageButton" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%207410%203900'%3e%3cpath%20fill='%23b22234'%20d='M0%200h7410v3900H0z'/%3e%3cpath%20d='M0%20450h7410m0%20600H0m0%20600h7410m0%20600H0m0%20600h7410m0%20600H0'%20stroke='%23fff'%20stroke-width='300'/%3e%3cpath%20fill='%233c3b6e'%20d='M0%200h2964v2100H0z'/%3e%3cg%20fill='%23fff'%3e%3cg%20id='d'%3e%3cg%20id='c'%3e%3cg%20id='e'%3e%3cg%20id='b'%3e%3cpath%20id='a'%20d='M247%2090l70.534%20217.082-184.66-134.164h228.253L176.466%20307.082z'/%3e%3cuse%20xlink:href='%23a'%20y='420'/%3e%3cuse%20xlink:href='%23a'%20y='840'/%3e%3cuse%20xlink:href='%23a'%20y='1260'/%3e%3c/g%3e%3cuse%20xlink:href='%23a'%20y='1680'/%3e%3c/g%3e%3cuse%20xlink:href='%23b'%20x='247'%20y='210'/%3e%3c/g%3e%3cuse%20xlink:href='%23c'%20x='494'/%3e%3c/g%3e%3cuse%20xlink:href='%23d'%20x='988'/%3e%3cuse%20xlink:href='%23c'%20x='1976'/%3e%3cuse%20xlink:href='%23e'%20x='2470'/%3e%3c/g%3e%3c/svg%3e" loading="lazy" alt="US" className="object-fit-cover size-3-5 me-6px rounded-circle"/> Language
                </button>
                <div className="dropdown-menu dropdown-menu-end w-48">
                    <div data-simplebar="" className="dropdown-menu-topbar px-2 mx-n2">
                        <ul className="p-0 mb-0">
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="en">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%207410%203900'%3e%3cpath%20fill='%23b22234'%20d='M0%200h7410v3900H0z'/%3e%3cpath%20d='M0%20450h7410m0%20600H0m0%20600h7410m0%20600H0m0%20600h7410m0%20600H0'%20stroke='%23fff'%20stroke-width='300'/%3e%3cpath%20fill='%233c3b6e'%20d='M0%200h2964v2100H0z'/%3e%3cg%20fill='%23fff'%3e%3cg%20id='d'%3e%3cg%20id='c'%3e%3cg%20id='e'%3e%3cg%20id='b'%3e%3cpath%20id='a'%20d='M247%2090l70.534%20217.082-184.66-134.164h228.253L176.466%20307.082z'/%3e%3cuse%20xlink:href='%23a'%20y='420'/%3e%3cuse%20xlink:href='%23a'%20y='840'/%3e%3cuse%20xlink:href='%23a'%20y='1260'/%3e%3c/g%3e%3cuse%20xlink:href='%23a'%20y='1680'/%3e%3c/g%3e%3cuse%20xlink:href='%23b'%20x='247'%20y='210'/%3e%3c/g%3e%3cuse%20xlink:href='%23c'%20x='494'/%3e%3c/g%3e%3cuse%20xlink:href='%23d'%20x='988'/%3e%3cuse%20xlink:href='%23c'%20x='1976'/%3e%3cuse%20xlink:href='%23e'%20x='2470'/%3e%3c/g%3e%3c/svg%3e" loading="lazy" alt="US" className="object-fit-cover rounded-1 size-6"/>
                                    <span>English</span>
                                    <span className="text-muted fs-13 ms-auto">EN</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="es">
                                    <img src="assets/images/es.svg" loading="lazy" alt="ES" className="object-fit-cover rounded-1 size-6" />
                                    <span>Spanish</span>
                                    <span className="text-muted fs-13 ms-auto">ES</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="fr">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%203%202'%3e%3cpath%20fill='%23EC1920'%20d='M0%200h3v2H0z'/%3e%3cpath%20fill='%23fff'%20d='M0%200h2v2H0z'/%3e%3cpath%20fill='%23051440'%20d='M0%200h1v2H0z'/%3e%3c/svg%3e" loading="lazy" alt="FR" className="object-fit-cover rounded-1 size-6" />
                                    <span>French</span>
                                    <span className="text-muted fs-13 ms-auto">FR</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="ru">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%209%206'%3e%3cpath%20fill='%23fff'%20d='M0%200h9v3H0z'/%3e%3cpath%20fill='%23DA291C'%20d='M0%203h9v3H0z'/%3e%3cpath%20fill='%230032A0'%20d='M0%202h9v2H0z'/%3e%3c/svg%3e" loading="lazy" alt="RU" className="object-fit-cover rounded-1 size-6" />
                                    <span>Russian</span>
                                    <span className="text-muted fs-13 ms-auto">RU</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="de">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%205%203'%3e%3cpath%20d='M0%200h5v3H0z'/%3e%3cpath%20fill='%23D00'%20d='M0%201h5v2H0z'/%3e%3cpath%20fill='%23FFCE00'%20d='M0%202h5v1H0z'/%3e%3c/svg%3e" loading="lazy" alt="DE" className="object-fit-cover rounded-1 size-6" />
                                    <span>German</span>
                                    <span className="text-muted fs-13 ms-auto">DE</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="it">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%203%202'%3e%3cpath%20fill='%23008C45'%20d='M0%200h1v2H0z'/%3e%3cpath%20fill='%23fff'%20d='M1%200h1v2H1z'/%3e%3cpath%20fill='%23CD212A'%20d='M2%200h1v2H2z'/%3e%3c/svg%3e" loading="lazy" alt="IT" className="object-fit-cover rounded-1 size-6" />
                                    <span>Italian</span>
                                    <span className="text-muted fs-13 ms-auto">IT</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="zh">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%2030%2020'%3e%3cdefs%3e%3cpath%20id='a'%20d='M0-1L.588.809-.952-.309H.952L-.588.809z'%20fill='%23FF0'/%3e%3c/defs%3e%3cpath%20fill='%23EE1C25'%20d='M0%200h30v20H0z'/%3e%3cuse%20xlink:href='%23a'%20transform='matrix(3%200%200%203%205%205)'/%3e%3cuse%20xlink:href='%23a'%20transform='rotate(23.036%20.093%2025.536)'/%3e%3cuse%20xlink:href='%23a'%20transform='rotate(45.87%201.273%2016.18)'/%3e%3cuse%20xlink:href='%23a'%20transform='rotate(69.945%20.996%2012.078)'/%3e%3cuse%20xlink:href='%23a'%20transform='rotate(20.66%20-19.689%2031.932)'/%3e%3c/svg%3e" loading="lazy" alt="CN" className="object-fit-cover rounded-1 size-6" />
                                    <span>Chinese</span>
                                    <span className="text-muted fs-13 ms-auto">ZH</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="ar">
                                    <img src="assets/images/sa.svg" loading="lazy" alt="SA" className="object-fit-cover rounded-1 size-6" />
                                    <span>Arabic</span>
                                    <span className="text-muted fs-13 ms-auto">AR</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="tr">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2012%208'%3e%3cpath%20fill='%23E30A17'%20d='M0%200h12v8H0z'/%3e%3ccircle%20cx='4.25'%20cy='4'%20r='2'%20fill='%23fff'/%3e%3ccircle%20cx='4.75'%20cy='4'%20r='1.6'%20fill='%23e30a17'/%3e%3cpath%20fill='%23fff'%20d='M5.83334%204l1.80901%20.58779-1.11804-1.53885v1.90212l1.11804-1.53885z'/%3e%3c/svg%3e" loading="lazy" alt="TR" className="object-fit-cover rounded-1 size-6" />
                                    <span>Turkish</span>
                                    <span className="text-muted fs-13 ms-auto">TR</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="he">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201100%20800'%3e%3cpath%20d='M0%200h1100v800H0z'%20fill='%23fff'/%3e%3cpath%20d='M0%2075h1100v125H0zm0%20525h1100v125H0z'%20fill='%230038b8'/%3e%3cpath%20d='M423.816%20472.853h252.368L550%20254.295zM550%20545.705l126.184-218.558H423.816z'%20fill='none'%20stroke='%230038b8'%20stroke-width='27.5'/%3e%3c/svg%3e" loading="lazy" alt="IL" className="object-fit-cover rounded-1 size-6" />
                                    <span>Hebrew</span>
                                    <span className="text-muted fs-13 ms-auto">HE</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="vi">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='-15%20-10%2030%2020'%3e%3cpath%20fill='%23DA251d'%20d='M-20-15h40v30h-40z'/%3e%3cg%20id='b'%20transform='translate(0%20-6)'%3e%3cpath%20id='a'%20fill='%23FF0'%20transform='rotate(18)'%20d='M0%200v6h4'/%3e%3cuse%20xlink:href='%23a'%20transform='scale(-1%201)'/%3e%3c/g%3e%3cg%20id='c'%20transform='rotate(72)'%3e%3cuse%20xlink:href='%23b'/%3e%3cuse%20xlink:href='%23b'%20transform='rotate(72)'/%3e%3c/g%3e%3cuse%20xlink:href='%23c'%20transform='scale(-1%201)'/%3e%3c/svg%3e" loading="lazy" alt="VN" className="object-fit-cover rounded-1 size-6" />
                                    <span>Vietnamese</span>
                                    <span className="text-muted fs-13 ms-auto">VI</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="nl">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%209%206'%3e%3cpath%20fill='%2321468B'%20d='M0%200h9v6H0z'/%3e%3cpath%20fill='%23FFF'%20d='M0%200h9v4H0z'/%3e%3cpath%20fill='%23AE1C28'%20d='M0%200h9v2H0z'/%3e%3c/svg%3e" loading="lazy" alt="NL" className="object-fit-cover rounded-1 size-6" />
                                    <span>Dutch</span>
                                    <span className="text-muted fs-13 ms-auto">NL</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="ko">
                                    <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='-36%20-24%2072%2048'%3e%3cpath%20fill='%23fff'%20d='M-36-24h72v48h-72z'/%3e%3cg%20transform='rotate(-56.31)'%3e%3cg%20id='b'%3e%3cpath%20id='a'%20d='M-6-25H6m-12%203H6m-12%203H6'%20stroke='%23000'%20stroke-width='2'/%3e%3cuse%20xlink:href='%23a'%20y='44'/%3e%3c/g%3e%3cpath%20stroke='%23fff'%20d='M0%2017v10'/%3e%3ccircle%20fill='%23cd2e3a'%20r='12'/%3e%3cpath%20fill='%230047a0'%20d='M0-12A6%206%200%20000%200a6%206%200%20010%2012%2012%2012%200%20010-24z'/%3e%3c/g%3e%3cg%20transform='rotate(-123.69)'%3e%3cuse%20xlink:href='%23b'/%3e%3cpath%20stroke='%23fff'%20d='M0-23.5v3M0%2017v3.5m0%203v3'/%3e%3c/g%3e%3c/svg%3e" loading="lazy" alt="KR" className="object-fit-cover rounded-1 size-6"/>
                                    <span>Korean</span>
                                    <span className="text-muted fs-13 ms-auto">KO</span>
                                </a> 
                            </li>
                            <li>
                                <a className="dropdown-item d-flex gap-2 align-items-center" href="#" data-lang="pt">
                                    <img src="/assets/images/pt.svg" loading="lazy" alt="PT" className="object-fit-cover rounded-1 size-6"/>
                                    <span>Portuguese</span>
                                    <span className="text-muted fs-13 ms-auto">PT</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>


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
