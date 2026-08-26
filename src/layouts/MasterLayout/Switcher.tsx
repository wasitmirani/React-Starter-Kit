const Switcher = () => {
  return (
   <>
    <div className="hs-overlay ti-offcanvas ti-offcanvas-right hs-overlay-backdrop-open:bg-[#11182780]" tabIndex={-1}
        id="switcher-canvas">
        <div className="offcanvas-header block p-4">
            <div className="flex items-center justify-between">
                <h5 className="offcanvas-title mb-0! text-default">Preview Setting</h5>
                <button type="button"
                    className="btn-close ti-btn shrink-0 p-0 mb-0!  transition-none text-defaulttextcolor dark:text-defaulttextcolor/80 hover:text-gray-700 focus:ring-gray-400 focus:ring-offset-white  dark:hover:text-white/80 dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                    data-hs-overlay="#switcher-canvas" aria-expanded={true}>
                    <span className="sr-only">Close modal</span>
                    <i className="ri-close-large-line leading-none text-lg text-[20px]!"></i>
                </button>
            </div>
            <nav>
                <nav className="flex rtl:space-x-reverse !sm:flex-nowrap p-[0.65rem] bg-light rounded-md mt-4" aria-label="Tabs" role="tablist">
                    <button type="button"
                        className="hs-tab-active:bg-white dark:hs-tab-active:bg-bodybg hs-tab-active:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] justify-center hs-tab-active:!text-default p-2 rounded-md inline-flex items-center gap-2 bg-transparent text-sm font-medium text-center text-defaulttextcolor! dark:text-white/50 dark:hover:text-white active w-full"
                        data-hs-tab="#switcher-home">
                        Theme Styles
                    </button>
                    <button type="button"
                        className="hs-tab-active:bg-white dark:hs-tab-active:bg-bodybg hs-tab-active:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] justify-center hs-tab-active:!text-default p-2 inline-flex items-center gap-2 bg-transparent text-sm rounded-md font-medium text-center text-defaulttextcolor! dark:text-white/50 dark:hover:text-white w-full"
                        data-hs-tab="#switcher-profile">
                        Theme Colors
                    </button>
                </nav>
            </nav>
        </div>
        <div className="ti-offcanvas-body pb-60!">
            <div className="tab-content" id="nav-tabContent">
                <div className="active border-0!" id="switcher-home" role="tabpanel" aria-labelledby="switcher-home-tab"
                    tabIndex={0}>
                     <div className="">
                        <p className="switcher-style-head">Choose Suitable Theme:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-default-theme" defaultChecked />
                                <label className="layout-card" htmlFor="switcher-default-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/1.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Default</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-fusion-theme" />

                                <label className="layout-card" htmlFor="switcher-fusion-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/2.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Fusion</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-modern-theme"/>

                                <label className="layout-card" htmlFor="switcher-modern-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/3.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Modern</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-saas-theme"/>

                                <label className="layout-card" htmlFor="switcher-saas-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/4.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">SaaS</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-neon-theme"/>

                                <label className="layout-card" htmlFor="switcher-neon-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/5.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Neon</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-galaxy-theme"/>

                                <label className="layout-card" htmlFor="switcher-galaxy-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/6.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Galaxy</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-elegant-theme"/>

                                <label className="layout-card" htmlFor="switcher-elegant-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/7.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Elegant</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-flat-theme"/>

                                <label className="layout-card" htmlFor="switcher-flat-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/8.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Flat</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-prism-theme"/>

                                <label className="layout-card" htmlFor="switcher-prism-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/9.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Prism</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-retro-theme"/>

                                <label className="layout-card" htmlFor="switcher-retro-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/10.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Retro</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-frost-theme"/>

                                <label className="layout-card" htmlFor="switcher-frost-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/11.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Frost</span>
                            </li>
                            <li className="col-span-6 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-template-style" id="switcher-nova-theme"/>

                                <label className="layout-card" htmlFor="switcher-nova-theme">
                                    <span className="layout-preview layout-image-preview block">
                                        <img src="/assets/images/media/themes/12.png" alt="Light Theme Layout" className="img-fluid" />
                                    </span>
                                </label>
                    
                                <span className="layout-badge">Nova</span>
                            </li>
                        </ul>
                     </div>
                    <div className="">
                        <p className="switcher-style-head">Theme Color Mode:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-style" id="switcher-light-theme" defaultChecked />
                                <label className="layout-card preview-light" htmlFor="switcher-light-theme">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>

                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>

                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Light</span>
                            </li>

                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="theme-style" id="switcher-dark-theme"/>
                                <label className="layout-card preview-dark" htmlFor="switcher-dark-theme">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>

                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>

                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Dark</span>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Directions:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="direction" id="switcher-ltr" defaultChecked />    
                                <label className="layout-card" htmlFor="switcher-ltr">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">LTR</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="direction" id="switcher-rtl"/>
                                <label className="layout-card preview-rtl" htmlFor="switcher-rtl">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">RTL</span>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Navigation Styles:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-style" id="switcher-vertical"
                                    defaultChecked />
                                <label className="layout-card" htmlFor="switcher-vertical">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Vertical</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-style"
                                    id="switcher-horizontal"/>
                                <label className="layout-card preview-horizontal" htmlFor="switcher-horizontal">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Horizontal</span>
                            </li>
                        </ul>
                    </div>
                    <div className="navigation-menu-styles">
                        <p className="switcher-style-head">Vertical & Horizontal Menu Styles:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-menu-styles"
                                    id="switcher-menu-click" />
                                <label className="layout-card preview-menuclick" htmlFor="switcher-menu-click">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Menu Click</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-menu-styles"
                                    id="switcher-menu-hover" />
                                <label className="layout-card preview-menuhover" htmlFor="switcher-menu-hover">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Menu Hover</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-menu-styles"
                                    id="switcher-icon-click" />
                                <label className="layout-card preview-iconclick" htmlFor="switcher-icon-click">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Icon Click</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="navigation-menu-styles"
                                    id="switcher-icon-hover" />
                                <label className="layout-card preview-iconhover" htmlFor="switcher-icon-hover">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Icon Hover</span>
                            </li>
                        </ul>
                    </div>
                    <div className="sidemenu-layout-styles">
                        <p className="switcher-style-head">Sidemenu Layout Styles:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles"
                                    id="switcher-default-menu" defaultChecked />
                                <label className="layout-card" htmlFor="switcher-default-menu">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Default</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles"
                                    id="switcher-closed-menu" />
                                <label className="layout-card preview-closed" htmlFor="switcher-closed-menu">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Closed</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles"
                                    id="switcher-icontext-menu" />
                                <label className="layout-card preview-icontext" htmlFor="switcher-icontext-menu">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Icon Text</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles"
                                    id="switcher-icon-overlay" />
                                <label className="layout-card preview-overlay" htmlFor="switcher-icon-overlay">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Overlay</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles"
                                    id="switcher-detached" />
                                <label className="layout-card preview-detached" htmlFor="switcher-detached">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-header">
                                                <span className="header-search"></span>
                                                <span className="header-icons">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>   
                                                </span>
                                            </span>
                                            <span className="layout-main">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Detached</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="sidemenu-layout-styles" id="switcher-double-menu" />
                                <label className="layout-card preview-double" htmlFor="switcher-double-menu">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="d-flex">
                                                <span className="layout-sidebar">
                                                    <span>
                                                        <span className="sidebar-logo"></span>
                                                        <span className="sidebar-line"></span>
                                                        <span className="sidebar-line"></span>
                                                        <span className="sidebar-line"></span>
                                                        <span className="sidebar-line"></span>
                                                    </span>
                                                </span>
                                                <span className="sidebar-submenu"></span>
                                            </span>
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Double</span>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Page Styles:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="page-styles" id="switcher-regular"
                                    defaultChecked />
                                <label className="layout-card" htmlFor="switcher-regular">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Regular</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="page-styles" id="switcher-classic" />
                                <label className="layout-card preview-classic" htmlFor="switcher-classic">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Classic</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="page-styles" id="switcher-modern" />
                                <label className="layout-card preview-modern" htmlFor="switcher-modern">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Modern</span>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Layout Width Styles:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="layout-width"
                                    id="switcher-default-width" />
                                <label className="layout-card preview-default-width" htmlFor="switcher-default-width">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Default</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="layout-width" id="switcher-full-width"
                                    defaultChecked />
                                <label className="layout-card" htmlFor="switcher-full-width">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Full</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="layout-width" id="switcher-boxed" />
                                <label className="layout-card preview-boxed-width" htmlFor="switcher-boxed">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Boxed</span>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Menu Positions:</p>
                        <div className="grid sm:grid-cols-3 grid-cols-2 switcher-style gap-x-0">
                            <div className="flex">
                                <div className="form-check switch-select">
                                    <input className="form-check-input align-text-bottom!" type="radio" name="menu-positions"
                                        id="switcher-menu-fixed" defaultChecked />
                                    <label className="form-check-label" htmlFor="switcher-menu-fixed">
                                        Fixed
                                    </label>
                                </div>
                            </div>
                            <div className="flex">
                                <div className="form-check switch-select">
                                    <input className="form-check-input align-text-bottom!" type="radio" name="menu-positions"
                                        id="switcher-menu-scroll" />
                                    <label className="form-check-label" htmlFor="switcher-menu-scroll">
                                        Scrollable
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Header Positions:</p>
                        <div className="grid sm:grid-cols-3 grid-cols-2 switcher-style gap-x-0">
                            <div className="flex">
                                <div className="form-check switch-select">
                                    <input className="form-check-input align-text-bottom!" type="radio" name="header-positions"
                                        id="switcher-header-fixed" defaultChecked />
                                    <label className="form-check-label" htmlFor="switcher-header-fixed">
                                        Fixed
                                    </label>
                                </div>
                            </div>
                            <div className="flex">
                                <div className="form-check switch-select">
                                    <input className="form-check-input align-text-bottom!" type="radio" name="header-positions"
                                        id="switcher-header-scroll" />
                                    <label className="form-check-label" htmlFor="switcher-header-scroll">
                                        Scrollable
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <p className="switcher-style-head">Loader:</p>
                        <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="page-loader" id="switcher-loader-enable" />
                                <label className="layout-card preview-loader" htmlFor="switcher-loader-enable"> 
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">

                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Enable</span>
                            </li>
    
                            <li className="col-span-4 layout-card-item">
                                <input className="layout-radio" type="radio" name="page-loader" id="switcher-loader-disable"
                                    defaultChecked />
                                <label className="layout-card" htmlFor="switcher-loader-disable">
                                    <span className="layout-preview">
                                        <span className="layout-preview-inner">
                                            <span className="layout-sidebar">
                                                <span className="sidebar-logo"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                                <span className="sidebar-line"></span>
                                            </span>
    
                                            <span className="layout-main">
                                                <span className="layout-header">
                                                    <span className="header-search"></span>
                                                    <span className="header-icons">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                </span>
    
                                                <span className="layout-content">
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                    <span className="content-line"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <span className="layout-badge">Disable</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-0 hidden" id="switcher-profile" role="tabpanel" aria-labelledby="switcher-profile-tab"
                    tabIndex={0} >
                    <div>
                        <div className="theme-colors">
                            <p className="switcher-style-head">Menu Colors:</p>
                            <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">

                                {/* Light Menu */}
                                <li className="col-span-4 layout-card-item active">
                                    <input className="layout-radio" type="radio" name="menu-colors" id="switcher-menu-light" />
                                    <label className="layout-card preview-menu-light" htmlFor="switcher-menu-light" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title="Light Menu">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <span className="layout-badge">Light</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio" type="radio" name="menu-colors" id="switcher-menu-dark" defaultChecked />
                                    <label className="layout-card preview-menu-dark" htmlFor="switcher-menu-dark" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title="Dark Menu">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <span className="layout-badge">Dark</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio" type="radio" name="menu-colors" id="switcher-menu-primary" />
                                    <label className="layout-card preview-menu-primary" htmlFor="switcher-menu-primary" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title="Color Menu">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <span className="layout-badge">Color</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio" type="radio" name="menu-colors" id="switcher-menu-gradient" />
                                    <label className="layout-card preview-menu-gradient" htmlFor="switcher-menu-gradient" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title="Gradient Menu">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <span className="layout-badge">Gradient</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio" type="radio" name="menu-colors" id="switcher-menu-transparent" />
                                    <label className="layout-card preview-menu-transparent" htmlFor="switcher-menu-transparent" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title="Transparent Menu">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <span className="layout-badge">Transparent</span>
                                </li>
                        
                            </ul>
                            <div className="px-4 pb-3 text-textmuted! fs-11">Note:If you want to change color Menu dynamically
                                change
                                from below Theme Primary color picker</div>
                        </div>
                        <div className="theme-colors">
                            <p className="switcher-style-head">Header Colors:</p>
                            <ul className="grid grid-cols-12 gap-x-4 gap-y-2 layout-card-list">

                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio color-input color-white" type="radio" name="header-colors"
                                        id="switcher-header-light" defaultChecked />
                        
                                    <label className="layout-card preview-header-light" htmlFor="switcher-header-light"
                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Light Header">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                        
                                    <span className="layout-badge">Light</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio color-input color-dark" type="radio" name="header-colors"
                                        id="switcher-header-dark" />
                        
                                    <label className="layout-card preview-header-dark" htmlFor="switcher-header-dark"
                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Dark Header">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                        
                                    <span className="layout-badge">Dark</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio color-input color-primary" type="radio" name="header-colors"
                                        id="switcher-header-primary" />
                        
                                    <label className="layout-card preview-header-primary" htmlFor="switcher-header-primary"
                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Color Header">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                        
                                    <span className="layout-badge">Color</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item">
                                    <input className="layout-radio color-input color-gradient" type="radio" name="header-colors"
                                        id="switcher-header-gradient" />
                        
                                    <label className="layout-card preview-header-gradient" htmlFor="switcher-header-gradient"
                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Gradient Header">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                        
                                    <span className="layout-badge">Gradient</span>
                                </li>
                        
                                <li className="col-span-4 layout-card-item active">
                                    <input className="layout-radio color-input color-transparent" type="radio" name="header-colors"
                                        id="switcher-header-transparent" />
                        
                                    <label className="layout-card preview-header-transparent" htmlFor="switcher-header-transparent"
                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Transparent Header">
                                        <span className="layout-preview">
                                            <span className="layout-preview-inner">
                                                <span className="layout-sidebar">
                                                    <span className="sidebar-logo"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                    <span className="sidebar-line"></span>
                                                </span>
                        
                                                <span className="layout-main">
                                                    <span className="layout-header">
                                                        <span className="header-search"></span>
                                                        <span className="header-icons">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </span>
                                                    </span>
                        
                                                    <span className="layout-content">
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                        <span className="content-line"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                        
                                    <span className="layout-badge">Transparent</span>
                                </li>
                        
                            </ul>
                            <div className="px-4 pb-3 text-textmuted! fs-11">Note:If you want to change color Header dynamically
                                change from below Theme Primary color picker</div>
                        </div>
                        <div className="theme-colors">
                            <p className="switcher-style-head">Theme Primary:</p>
                            <div className="flex flex-wrap items-center switcher-style">
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! align-text-top! color-primary-1"
                                        type="radio" name="theme-primary" id="switcher-primary" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! align-text-top! color-primary-2"
                                        type="radio" name="theme-primary" id="switcher-primary1" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! align-text-top! color-primary-3"
                                        type="radio" name="theme-primary" id="switcher-primary2" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! align-text-top! color-primary-4"
                                        type="radio" name="theme-primary" id="switcher-primary3" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! align-text-top! color-primary-5"
                                        type="radio" name="theme-primary" id="switcher-primary4" />
                                </div>
                                <div className="form-check switch-select ps-0 color-primary-light">
                                    <div className="theme-container-primary"></div>
                                    <div className="pickr-container-primary"></div>
                                </div>
                            </div>
                        </div>
                        <div className="theme-colors">
                            <p className="switcher-style-head">Theme Background:</p>
                            <div className="flex flex-wrap items-center switcher-style">
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! color-bg-1" type="radio"
                                        name="theme-background" id="switcher-background" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! color-bg-2" type="radio"
                                        name="theme-background" id="switcher-background1" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! color-bg-3" type="radio"
                                        name="theme-background" id="switcher-background2" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! color-bg-4" type="radio"
                                        name="theme-background" id="switcher-background3" />
                                </div>
                                <div className="form-check switch-select me-3">
                                    <input className="form-check-input color-input m-0! color-bg-5" type="radio"
                                        name="theme-background" id="switcher-background4" />
                                </div>
                                <div className="form-check switch-select ps-0 tooltip-static-demo color-bg-transparent">
                                    <div className="theme-container-background hidden"></div>
                                    <div className="pickr-container-background"></div>
                                </div>
                            </div>
                        </div>
                        <div className="menu-image mb-3!">
                            <p className="switcher-style-head">Menu With Background Image:</p>
                            <div className="flex flex-wrap items-center switcher-style">
                                <div className="form-check switch-select menu-img-select m-2">
                                    <input className="form-check-input bgimage-input bg-img1" type="radio"
                                        name="menu-background" id="switcher-bg-img" />
                                    <div className="bg-img-container">
                                        <img src="/assets/images/menu-bg-images/bg-img1.jpg" alt="" />
                                    </div>
                                </div>
                                <div className="form-check switch-select menu-img-select m-2">
                                    <input className="form-check-input bgimage-input bg-img2" type="radio"
                                        name="menu-background" id="switcher-bg-img1" />
                                    <div className="bg-img-container">
                                        <img src="/assets/images/menu-bg-images/bg-img2.jpg" alt="" />
                                    </div>      
                                </div>
                                <div className="form-check switch-select menu-img-select m-2">
                                    <input className="form-check-input bgimage-input bg-img3" type="radio"
                                        name="menu-background" id="switcher-bg-img2" />
                                    <div className="bg-img-container">
                                        <img src="/assets/images/menu-bg-images/bg-img3.jpg" alt="" />
                                    </div>
                                </div>
                                <div className="form-check switch-select menu-img-select m-2">
                                    <input className="form-check-input bgimage-input bg-img4" type="radio"
                                        name="menu-background" id="switcher-bg-img3" />
                                    <div className="bg-img-container">
                                        <img src="/assets/images/menu-bg-images/bg-img4.jpg" alt="" />
                                    </div>
                                </div>
                                <div className="form-check switch-select menu-img-select m-2">
                                    <input className="form-check-input bgimage-input bg-img5" type="radio"
                                        name="menu-background" id="switcher-bg-img4" />
                                    <div className="bg-img-container">
                                        <img src="/assets/images/menu-bg-images/bg-img5.jpg" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="block canvas-footer">
                    <div className="flex justify-between sm:flex-nowrap flex-wrap sm:gap-1 gap-2 text-nowrap">
                      
                        <a href="javascript:void(0);" id="reset-all"
                            className="ti-btn px-4! ti-btn-danger grow  md:grow-0 block text-center text-white!">Reset</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
   </>
  );
}

export default Switcher