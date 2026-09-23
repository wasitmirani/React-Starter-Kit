export function SideBar() {
  return (
    <>
      <div id="main-sidebar" className="main-sidebar">
        <div className="sidebar-wrapper">
          <a href="#!" className="navbar-brand">
            <div className="logo-lg">
              <img src="/assets/images/main-logo.webp" loading="lazy" aria-label="logo" alt="Main Logo" height="26" className="mx-auto logo-dark" />
                <img src="/assets/images/logo-white.webp" loading="lazy" aria-label="logo" alt="Logo White" height="26" className="mx-auto logo-light" />
                </div>
                <div className="logo-sm">
                  <img src="/assets/images/logo-sm-dark.webp" loading="lazy" aria-label="logo" alt="Logo Sm Dark" height="26" className="mx-auto logo-dark"/>
                    <img src="/assets/images/logo-sm-dark.webp" loading="lazy" aria-label="logo" alt="Logo Sm White" height="26" className="mx-auto logo-light"/>
                    </div>
                  </a>
                  <div className="dropdown profile-dropdown mb-4">
                    <a href="#!" className="btn px-4 py-5 w-100 position-relative" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="position-relative">
                        <img src="/assets/images/user-38.webp" loading="lazy" alt="User 38" className="object-fit-cover rounded-circle size-12 mb-4"/>
                          <span className="badge bg-orange rounded-pill fw-normal position-absolute top-50 translate-middle-y profile-version">v.1</span>
                          <span className="size-2 bg-success rounded-circle d-block position-absolute bottom-0 end-0 mb-n6px"></span>
                      </span>
                      <div className="d-flex align-items-end justify-content-center">
                        <div className="flex-grow-1 content text-white text-start">
                          <h6 className="fw-medium text-truncate mb-1 admin-name" data-translate="pe-emma-anderson">Emma Anderson</h6>
                          <p className="fs-14 admin-id">ID: 170001</p>
                        </div>
                        <div className="size-6 avatar"><i data-lucide="settings" className="size-4-5 stroke-2"></i></div>
                      </div>
                    </a>
                    <div className="dropdown-menu p-0 profile-dropdown-menu">
                      <span className="text-muted px-5 pt-4 d-block">Welcome Back, Emma! 👋</span>
                      <ul className="list-unstyled mb-0 p-2 border-bottom">
                        <li>
                          <a className="dropdown-item align-items-center px-3 d-flex" href="pages-user-friends.html"><i className="mgc_user_1_line d-inline-block me-2"></i> User Profile <span className="text-muted ms-1 fst-italic fs-15">@emma.ander</span></a>
                        </li>
                        <li>
                          <a className="dropdown-item align-items-center px-3 d-flex" href="pages-account-settings.html"><i className="mgc_settings_3_line d-inline-block me-2"></i> Profile Preferences</a>
                        </li>
                        <li>
                          <a className="dropdown-item align-items-center px-3 d-flex" href="pages-help-center.html"><i className="mgc_headphone_2_line d-inline-block me-2"></i> Support Center</a>
                        </li>
                        <li>
                          <a className="dropdown-item align-items-center px-3 d-flex" href="pages-pricing.html"><i className="mgc_keyboard_line d-inline-block me-2"></i> Shortcut Keys</a>
                        </li>
                      </ul>
                      <div className="border-bottom">
                        <div className="d-flex justify-content-between align-items-center py-3 px-5">
                          <div>
                            <h6 className="mb-0">Free Plan</h6>
                            <p className="text-muted fs-sm">System control panel</p>
                          </div>
                          <a href="pages-pricing.html" className="badge bg-primary py-6px px-10px rounded-pill">Upgrade</a>
                        </div>
                      </div>
                      <ul className="list-unstyled mb-0 px-2">
                        <li>
                          <a className="dropdown-item align-items-center d-flex py-4 text-danger" href="auth-signin-basic.html"><i className="mgc_key_2_line d-inline-block me-2"></i> Log Out</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="navbar-menu px-5" id="navbar-menu-list" data-simplebar>
                    <ul className="list-unstyled p-0 navbar-nav-menu">
                      <li className="nav-menu-title" data-translate="pe-dashboards">Dashboards</li>
                      <li className="nav-item">
                        <a className="nav-link active collapsed" data-position="right-top" data-bs-toggle="collapse" href="#collapseDashboards" aria-expanded="false">
                          <span className="icons"><i className="mgc_dashboard_line"></i></span>
                          <span className="content" data-translate="pe-dashboards">Dashboards</span>
                          <span className="ms-auto menu-arrow"><i className="mgc_down_line"></i></span>
                        </a>
                        <div className="collapse" id="collapseDashboards">
                          <ul className="nav-menu-sub">
                            <li><a href="index.html" className="nav-link active"><span data-translate="pe-ecommerce">Ecommerce</span></a></li>


                          </ul>
                        </div>
                      </li>

                      <li className="nav-menu-title" data-translate="pe-apps">Apps</li>
                      <li className="nav-item">
                        <a className="nav-link collapsed" href="apps-chat-default.html">
                          <span className="icons"><i className="mgc_wechat_line"></i></span>
                          <span className="content" data-translate="pe-chat">Chat</span>
                        </a>
                      </li>


                    </ul>
                  </div>
                </div>
            </div>



          </>
          )
}

          export default SideBar