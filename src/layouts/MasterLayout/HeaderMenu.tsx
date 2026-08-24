const HeaderMenu = ()=>{
    return (
     
    <>
         <header className="app-header sticky" id="header">

            {/* Start::main-header-container */}
            <div className="main-header-container container-fluid px-3">

                {/* Start::header-content-left */}
                <div className="header-content-left">

                    {/* Start::header-element */}
                    <div className="header-element">
                        <div className="horizontal-logo">
                            <a href="index.html" className="header-logo">
                                <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" />
                                <img src="/assets/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" />
                                <img src="/assets/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" />
                                <img src="/assets/images/brand-logos/desktop-white.png" alt="logo" className="desktop-white" />
                                <img src="/assets/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" />
                            </a>
                        </div>
                    </div>
                    {/* End::header-element */}

                    {/* Start::header-element */}
                    <div className="header-element lg:mx-0 mx-2 items-center! header-toggle-btn pe-3">
                        <a aria-label="Hide Sidebar" className="sidemenu-toggle horizontal-navtoggle block lg:hidden" id="headerToggleBtn"
                            data-bs-toggle="sidebar" href="javascript:void(0);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-panel-left-close-icon lucide-panel-left-close open-sidemenu-toggle">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M9 3v18" />
                                <path d="m16 15-3-3 3-3" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-panel-left-open-icon lucide-panel-left-open close-sidemenu-toggle">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M9 3v18" />
                                <path d="m14 9 3 3-3 3" />
                            </svg>
                        </a>
                    </div>
                    {/* End::header-element */}
            
                    <div className="header-element header-search header-search-content hidden! md:flex!">
                        <button type="button" className="header-search-bar responsive-search disabled:pointer-events-none" id="hs-searchOverlay" aria-label="Open search1" data-hs-overlay="#searchOverlay">
                            <span className="header-search-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                                    className="lucide lucide-search-icon lucide-search">
                                    <path d="m21 21-4.34-4.34" />
                                    <circle cx="11" cy="11" r="8" />
                                </svg>
                            </span>

                            <span className="grow opacity-80 font-light">What are you Looking For ?</span>

                            <span className="shortcut-key">
                                <kbd>⌘k</kbd>
                            </span>
                        </button>
                    </div>

                </div>
                {/* End::header-content-left */}

                {/* Start::header-content-right */}
                <ul className="header-content-right">

                    {/* Start::header-element */}
                    <li className="header-element md:hidden! block!">
                        <a aria-label="anchor" href="javascript:void(0);" className="header-link responsive-search"  data-hs-overlay="#searchOverlay">
                            {/* Start::header-link-icon */}
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className="header-link-icon"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                fill="none">
                                <path d="M17 17L21 21"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            {/* End::header-link-icon */}
                        </a>  
                    </li>
                    {/* End::header-element */}

                    {/* Start::header-element */}
                    <li className="header-element country-selector hs-dropdown ti-dropdown hidden! sm:block! [--placement:bottom-right]">
                        {/* Start::header-link|dropdown-toggle */}
                        <a href="javascript:void(0);" className="header-link hs-dropdown-toggle ti-dropdown-toggle" data-bs-auto-close="outside" data-bs-toggle="dropdown">
                           <span className="avatar avatar-xs lh-1 avatar-rounded">
                                <img src="/assets/images/flags/us_flag.jpg" alt="img" />
                            </span>
                        </a>
                        {/* End::header-link|dropdown-toggle */}
                        <ul className="main-header-dropdown hs-dropdown-menu ti-dropdown-menu dropdown-menu-end min-w-40 hidden" data-popper-placement="none">
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/us_flag.jpg" alt="img" />
                                    </span>
                                    English
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/spain_flag.jpg" alt="img" />
                                    </span>
                                    español
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/french_flag.jpg" alt="img" />
                                    </span>
                                    français
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/uae_flag.jpg" alt="img" />
                                    </span>
                                    عربي
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/germany_flag.jpg" alt="img" />
                                    </span>
                                    Deutsch
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/china_flag.jpg" alt="img" />
                                    </span>
                                    中国人
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/italy_flag.jpg" alt="img" />
                                    </span>
                                    Italiano
                                </a>
                            </li>
                            <li>
                                <a className="ti-dropdown-item flex items-center" href="javascript:void(0);">
                                    <span className="avatar avatar-rounded avatar-xs leading-none me-2">
                                        <img src="/assets/images/flags/russia_flag.jpg" alt="img" />
                                    </span>
                                    Русский
                                </a>
                            </li>
                        </ul>
                    </li>
                    {/* End::header-element */}

                     {/* light and dark theme */}
                     <li className="block lg:hidden header-theme-mode-container">
                        <div className="header-element header-theme-mode  items-center!">
                
                            <a aria-label="anchor"
                                className="hs-dark-mode-active:hidden! flex! layout-setting hs-dark-mode group shrink-0 justify-center items-center gap-2  rounded-full! font-medium transition-all text-xs dark:bg-bgdark dark:hover:bg-transparent text-textmuted dark:hover:text-primary header-link dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                                href="javascript:void(0);" data-hs-theme-click-value="dark">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-moon-icon lucide-moon header-link-icon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
                                    </svg>
                            </a>
                            <a aria-label="anchor"
                                className="hs-dark-mode-active:flex! hidden! layout-setting hs-dark-mode group shrink-0 justify-center items-center gap-2  rounded-full! font-medium text-defaulttextcolor  transition-all text-xs dark:bg-bgdark dark:hover:bg-transparent  dark:hover:text-primary header-link dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                                href="javascript:void(0);" data-hs-theme-click-value="light">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-sun-icon lucide-sun header-link-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                                    </svg>
                            </a>
                        </div>
                    </li>
                        {/* End light and dark theme */}

                    {/* Start::header-element */}
                    <li className="header-element notifications-dropdown hidden! xl:flex! relative">
                        {/* Start::header-link|dropdown-toggle */}
                        <a href="javascript:void(0);" className="header-link dropdown-toggle" data-hs-overlay="#notification-canvas" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-bell-ring-icon lucide-bell-ring header-link-icon">
                                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                                <path d="M22 8c0-2.3-.8-4.3-2-6" />
                                <path
                                    d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                                <path d="M4 2C2.8 3.7 2 5.7 2 8" />
                            </svg>
                            <span className="header-icon-pulse bg-secondary rounded pulse pulse-secondary"></span>
                        </a>
                        {/* End::header-link|dropdown-toggle */}

                    </li>
                    {/* End::header-element */}

                    {/* Start::header-element */}
                    <li className="header-element header-fullscreen">
                        {/* Start::header-link */}
                        <a onclick="openFullscreen();" href="javascript:void(0);" className="header-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-maximize-icon lucide-maximize full-screen-open header-link-icon">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-minimize-icon lucide-minimize full-screen-close header-link-icon hidden">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                            </svg>
                        </a>
                        {/* End::header-link */}
                    </li>
                    {/* End::header-element */}

                    {/* Start::header-element */}
                        <li className="header-element hs-dropdown profile-header-drop">
                        {/* Start::header-link|dropdown-toggle */}
                        <a href="javascript:void(0);" className="hs-dropdown-toggle ti-dropdown-toggle shrink-0" id="mainHeaderProfile" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                            <div className="flex items-center gap-2">
                                <div className="avatar avatar-sm avatar-rounded leading-none">
                                    <img src="/assets/images/faces/10.jpg" alt="" />
                                </div>

                                <div className="hidden sm:block">
                                    <span className="block font-semibold leading-none">Tom Phillip</span>
                                    <span className="opacity-70 text-xs">tomp32@gmail.com</span>
                                </div>
                            </div>
                        </a>
                        {/* End::header-link|dropdown-toggle */}
                        <div className="main-header-dropdown hs-dropdown-menu ti-dropdown-menu pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end hidden">
                            <div className="p-4!">
                                <div className="flex items-start gap-2">
                                    <div className="leading-none">
                                        <span className="avatar avatar-sm bg-primary-transparent avatar-rounded">
                                            <img src="/assets/images/faces/10.jpg" alt="" />
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block font-semibold leading-none">Tom Phillip</span>
                                        <span className="text-textmuted text-xs">tomp32@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <ul className="list-unstyled mb-0!">
                                <li>
                                    <ul className="list-unstyled mb-0! sub-list">
                                        <li>
                                            <a className="ti-dropdown-item flex items-center" href="profile.html"><i className="ti ti-user-circle me-2 text-[18px]"></i>View Profile</a>
                                        </li>
                                        <li>
                                            <a className="ti-dropdown-item flex items-center" href="mail-settings.html"><i className="ti ti-settings-cog me-2 text-[18px]"></i>Account Settings</a>
                                        </li>
                                    </ul>        
                                </li>
                                <li>
                                    <ul className="list-unstyled mb-0! sub-list">
                                        <li>
                                            <a className="ti-dropdown-item flex items-center" href="javascript:void(0);"><i className="ti ti-lifebuoy me-2 text-[18px]"></i>Support</a>
                                        </li>
                                        <li>
                                            <a className="ti-dropdown-item flex items-center" href="javascript:void(0);"><i className="ti ti-bolt me-2 text-[18px]"></i>Activity Log</a>
                                        </li>
                                        <li>
                                            <a className="ti-dropdown-item flex items-center" href="javascript:void(0);"><i className="ti ti-calendar me-2 text-[18px]"></i>Events</a>
                                        </li>
                                    </ul>        
                                </li>
                                <li><a className="ti-dropdown-item flex items-center" href="sign-in-cover.html"><i className="ti ti-logout me-2 text-[18px]"></i>Log Out</a></li>
                            </ul>
                        </div>
                    </li>  
                    {/* End::header-element */}

                    {/* Start::header-element */}
                    <li className="header-element">
                        {/* Start::header-link|switcher-icon */}
                        <a href="javascript:void(0);" className="header-link switcher-icon" data-hs-overlay="#switcher-canvas" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                                className="lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal  header-link-icon">
                                <path d="M10 5H3" />
                                <path d="M12 19H3" />
                                <path d="M14 3v4" />
                                <path d="M16 17v4" />
                                <path d="M21 12h-9" />
                                <path d="M21 19h-5" />
                                <path d="M21 5h-7" />
                                <path d="M8 10v4" />
                                <path d="M8 12H3" />
                            </svg>
                        </a>
                        {/* End::header-link|switcher-icon */}
                    </li>
                    {/* End::header-element */}

                </ul>
                {/* End::header-content-right */}

            </div>
            {/* End::main-header-container */}
        </header>
        </>
    );
}
export default HeaderMenu;