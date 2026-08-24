export const SideBar = ()=>{
    return (
        <>
        
        {/* Start::app-sidebar */}
         <aside className="app-sidebar sticky" id="sidebar">

             {/* Start::main-sidebar-header */}
             <div className="main-sidebar-header">
                 <a href="index.html" className="header-logo">
                     <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" />
                     <img src="/assets/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" />
                     <img src="/assets/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" />
                     <img src="/assets/images/brand-logos/desktop-white.png" alt="logo" className="desktop-white" />
                     <img src="/assets/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" />
                 </a>
                 <a aria-label="Hide Sidebar" className="sidemenu-toggle horizontal-navtoggle" id="menuToggleBtn" data-bs-toggle="sidebar" href="javascript:void(0);">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-panel-left-close-icon lucide-panel-left-close open-sidemenu-toggle"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-panel-left-open-icon lucide-panel-left-open close-sidemenu-toggle"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
                 </a>
             </div>
             {/* End::main-sidebar-header */}

             {/* Start::main-sidebar */}
             <div className="main-sidebar" id="sidebar-scroll">

                 {/* Start::nav */}
                 <nav className="main-menu-container nav nav-pills flex-col sub-open">
                     <div className="slide-left" id="slide-left">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24"> <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path> </svg>
                     </div>
                     <ul className="main-menu">
                         {/* Start::slide__category */}
                         <li className="slide__category"><span className="category-name">Main</span></li>
                         {/* End::slide__category */}

                         {/* Start::slide */}
                         <li className="slide has-sub">
                             <a href="javascript:void(0);" className="side-menu__item">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-airplay-icon lucide-airplay side-menu__icon"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><path d="m12 15 5 6H7Z"/></svg>
                                 <span className="side-menu__label">Dashboards</span>
                                 <span className="side-menu__angle">
                                     <i className="ri-add-line side-menu__angle_open"></i>
                                     <i className="ri-subtract-line side-menu__angle_close"></i>
                                 </span> 
                             </a>
                             <ul className="slide-menu child1">
                                 <li className="slide side-menu__label1">
                                     <a href="javascript:void(0)">Dashboards</a>
                                 </li>
                                 <li className="slide">
                                     <a href="index.html" className="side-menu__item"> 
                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-badge-dollar-sign-icon lucide-badge-dollar-sign side-menu-doublemenu__icon"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                                         Sales</a>
                                 </li>
                               </ul>
                         </li>
                         {/* End::slide */}

                         {/* Start::slide__category */}
                         <li className="slide__category"><span className="category-name">Web Apps</span></li>
                         {/* End::slide__category */}

                    
                         {/* Start::slide */}
                         <li className="slide">
                             <a href="widgets.html" className="side-menu__item">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-aperture-icon lucide-aperture side-menu__icon"><circle cx="12" cy="12" r="10"></circle><path d="m14.31 8 5.74 9.94"></path><path d="M9.69 8h11.48"></path><path d="m7.38 12 5.74-9.94"></path><path d="M9.69 16 3.95 6.06"></path><path d="M14.31 16H2.83"></path><path d="m16.62 12-5.74 9.94"></path></svg>
                                 <span className="side-menu__label">Widgets</span>
                             </a>
                         </li>
                         {/* End::slide */}    

                    

                    
                         </ul>
                         <div className="doublemenu_bottom-menu ">
                         <ul className="main-menu mb-0! border-t! border-menubordercolor py-2">
                             {/* Start::slide */}
                             <li className="slide">
                                 <a href="javascript:void(0);" className="side-menu__item layout-setting">
                                     <span className="layout-setting-doublemenu hs-dark-mode-active:hidden! flex! hs-dark-mode group shrink-0 justify-center items-center rounded-md! font-medium transition-all text-xs  text-textmuted">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-moon-icon lucide-cloud-moon side-menu__icon"><path d="M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z"/><path d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"/></svg>
                                             <span className="side-menu__label hs-dark-mode-active:hidden flex">Theme Settings</span>
                                     </span>
                                     <span className="layout-setting-doublemenu hs-dark-mode-active:!flex hidden! hs-dark-mode group shrink-0 justify-center items-center rounded-md! font-medium text-defaulttextcolor  transition-all text-xs  ">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-icon lucide-cloud-sun side-menu__icon"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>
                                             <span className="side-menu__label hs-dark-mode-active:flex hidden">Theme Settings</span>
                                     </span>
                                 </a>
                             </li>
                                {/* End::slide */}
                             {/* Start::slide */}
                             <li className="slide">
                                 <a href="sign-in-cover.html" className="side-menu__item">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-out-icon lucide-log-out side-menu__icon"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
                                     <span className="side-menu__label">Logout</span>
                                 </a>
                             </li>
                             {/* End::slide */}
                         </ul>
                         <ul className="main-menu mb-0! border-t! border-menubordercolor py-2 sm:block hidden">
                             {/* Start::slide */}
                             <li className="slide">
                                 <div className="hs-dropdown [--placement:right-start]  ti-dropdown relative inline-flex w-full profile-drop">
                                     {/* Trigger */}
                                     <a id="mainProfile" href="javascript:void(0);" className="hs-dropdown-toggle flex w-full items-center gap-3 rounded-md px-4 py-2">
                                         <div className="shrink-0">
                                             <img src="/assets/images/faces/10.jpg" alt="Profile" className="size-7 rounded-sm object-cover" />
                                         </div>
                                         <div className="flex-1 side-menu__label flex-col justify-start items-start! text-start!">
                                             <span className="block text-sm font-semibold mb-0">
                                                 Tom Phillip
                                             </span>
                                             <span className="block text-xs opacity-80">
                                                 @Tomphillip32
                                             </span>
                                         </div>

                                         <svg className="size-4 text-gray-500 hs-dropdown-open:rotate-90 transition-transform rtl:rotate-180 flex profile-end-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                         <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
                                         </svg>
                                     </a>

                                     {/* Dropdown Menu */}
                                     <div className="hs-dropdown-menu rounded-lg min-w-54! p-1! ti-dropdown-menu hidden" role="menu" aria-orientation="vertical" aria-labelledby="mainProfile">
                                         <a href="profile.html" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-user-circle text-lg"></i>
                                         View Profile
                                         </a>

                                         <a href="mail-settings.html" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-settings-cog text-lg"></i>
                                         Account Settings
                                         </a>

                                         <a href="javascript:void(0);" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-lifebuoy text-lg"></i>
                                         Support
                                         </a>

                                         <a href="javascript:void(0);" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-bolt text-lg"></i>
                                         Activity Log
                                         </a>

                                         <a href="javascript:void(0);" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-calendar text-lg"></i>
                                         Events
                                         </a>

                                         <a href="javascript:void(0);" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item">
                                         <i className="ti ti-help text-lg"></i>
                                         Help
                                         </a>
                                     </div>
                                 </div>
                             </li>
                             {/* End::slide */}
                         </ul>
                     </div>
                     <div className="slide-right" id="slide-right"><svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24"> <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path> </svg></div>
                      
                 </nav>
                 {/* End::nav */}

             </div>
        
             {/* End::main-sidebar */}

         </aside>
         {/* End::app-sidebar */}
        </>
    );
}