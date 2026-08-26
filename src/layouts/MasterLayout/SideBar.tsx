import { useEffect, useState, type MouseEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebarToggle } from '@/layouts/MasterLayout/useSidebarToggle'
import {
  SIDEBAR_MENU,
  isPathUnderMenu,
  type SidebarMultiItem,
} from '@/utils/helpers/sidebar.menu'

function menuLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'side-menu__item active' : 'side-menu__item'
}

function MenuIcon({ icon }: { icon: string }) {
  return <i className={`${icon} side-menu__icon`} aria-hidden="true"></i>
}

function AngleIcons({ open }: { open: boolean }) {
  return (
    <span className="side-menu__angle">
      <i
        className="ti ti-plus side-menu__angle_open"
        style={{ display: open ? 'none' : 'flex' }}
        aria-hidden="true"
      />
      <i
        className="ti ti-minus side-menu__angle_close"
        style={{ display: open ? 'flex' : 'none' }}
        aria-hidden="true"
      />
    </span>
  )
}

function MultiMenuItem({
  item,
  open,
  active,
  onToggle,
}: {
  item: SidebarMultiItem
  open: boolean
  active: boolean
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <li className={`slide has-sub${open ? ' open' : ''}${active ? ' active' : ''}`}>
      <button
        type="button"
        className={`side-menu__item${active ? ' active' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <MenuIcon icon={item.icon} />
        <span className="side-menu__label">{item.title}</span>
        <AngleIcons open={open} />
      </button>
      {open ? (
        <ul className="slide-menu child1" style={{ display: 'block' }}>
          <li className="slide side-menu__label1">
            <span>{item.title}</span>
          </li>
          {item.children.map((child) => (
            <li key={child.link} className="slide">
              <NavLink to={child.link} end={child.end} className={menuLinkClass}>
                <i className={`side-menu-doublemenu__icon`} aria-hidden="true"></i>
                {child.title}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function SideBar() {
  const location = useLocation()
  const { toggleSidebar } = useSidebarToggle()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      SIDEBAR_MENU.filter((entry): entry is SidebarMultiItem => entry.type === 'multi').map(
        (item) => [item.id, isPathUnderMenu(location.pathname, item)],
      ),
    ),
  )
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev }
      for (const entry of SIDEBAR_MENU) {
        if (entry.type === 'multi' && isPathUnderMenu(location.pathname, entry)) {
          next[entry.id] = true
        }
      }
      return next
    })
  }, [location.pathname])

  const toggleSubmenu = (id: string) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpenMenus((prev) => ({ [id]: !prev[id] }))
  }

  const onToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    toggleSidebar()
  }

  const onProfileToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setProfileOpen((open) => !open)
  }

  const onThemeToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleTheme()
  }

  return (
    <aside className="app-sidebar sticky" id="sidebar">
      <div className="main-sidebar-header">
        <NavLink to={ROUTES.DASHBOARD} end className="header-logo">
          <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" />
          <img src="/assets/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" />
          <img src="/assets/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" />
          <img src="/assets/images/brand-logos/desktop-white.png" alt="logo" className="desktop-white" />
          <img src="/assets/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" />
        </NavLink>
        <button
          type="button"
          aria-label="Toggle Sidebar"
          className="sidemenu-toggle horizontal-navtoggle"
          id="menuToggleBtn"
          onClick={onToggleClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="open-sidemenu-toggle"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="m16 15-3-3 3-3" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="close-sidemenu-toggle"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="m14 9 3 3-3 3" />
          </svg>
        </button>
      </div>

      <div className="main-sidebar" id="sidebar-scroll">
        <nav className="main-menu-container nav nav-pills flex-col sub-open">
          <div className="slide-left" id="slide-left">
            <i className="ti ti-chevron-left text-xl" aria-hidden="true" />
          </div>
          <ul className="main-menu">
            {SIDEBAR_MENU.map((entry) => {
              if (entry.type === 'heading') {
                return (
                  <li key={`heading-${entry.title}`} className="slide__category">
                    <span className="category-name">{entry.title}</span>
                  </li>
                )
              }

              if (entry.type === 'multi') {
                const active = isPathUnderMenu(location.pathname, entry)
                return (
                  <MultiMenuItem
                    key={entry.id}
                    item={entry}
                    open={!!openMenus[entry.id]}
                    active={active}
                    onToggle={toggleSubmenu(entry.id)}
                  />
                )
              }

              return (
                <li key={entry.id} className="slide">
                  <NavLink to={entry.link} className={menuLinkClass}>
                    <MenuIcon icon={entry.icon} />
                    <span className="side-menu__label">{entry.title}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="doublemenu_bottom-menu ">
            <ul className="main-menu mb-0! border-t! border-menubordercolor py-2">
              <li className="slide">
                <button
                  type="button"
                  className="side-menu__item"
                  onClick={onThemeToggle}
                  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {isDark ? (
                    <span className="flex items-center w-full">
                      <i className="ti ti-sun side-menu__icon" aria-hidden="true"></i>
                      <span className="side-menu__label">Theme Settings</span>
                    </span>
                  ) : (
                    <span className="flex items-center w-full">
                      <i className="ti ti-moon side-menu__icon" aria-hidden="true"></i>
                      <span className="side-menu__label">Theme Settings</span>
                    </span>
                  )}
                </button>
              </li>
              <li className="slide">
                <NavLink to={ROUTES.LOGIN} className={menuLinkClass}>
                  <i className="ti ti-logout side-menu__icon" aria-hidden="true" />
                  <span className="side-menu__label">Logout</span>
                </NavLink>
              </li>
            </ul>
            <ul className="main-menu mb-0! border-t! border-menubordercolor py-2 block">
              <li className="slide">
                <div className="hs-dropdown [--placement:right-start] ti-dropdown relative inline-flex w-full profile-drop">
                  <button
                    type="button"
                    id="mainProfile"
                    className="hs-dropdown-toggle flex w-full items-center gap-3 rounded-md px-4 py-2"
                    onClick={onProfileToggle}
                    aria-expanded={profileOpen}
                  >
                    <div className="shrink-0">
                      <img
                        src="/assets/images/faces/10.jpg"
                        alt="Profile"
                        className="size-7 rounded-sm object-cover"
                      />
                    </div>
                    <div className="flex-1 side-menu__label flex-col justify-start items-start! text-start!">
                      <span className="block text-sm font-semibold mb-0">Tom Phillip</span>
                      <span className="block text-xs opacity-80">@Tomphillip32</span>
                    </div>
                    <i
                      className={`ti ti-chevron-right size-4 text-gray-500 transition-transform flex profile-end-arrow${profileOpen ? ' rotate-90' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    className={`hs-dropdown-menu rounded-lg min-w-54! p-1! ti-dropdown-menu${profileOpen ? '' : ' hidden'}`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="mainProfile"
                  >
                    <NavLink
                      to={ROUTES.SETTINGS}
                      className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="ti ti-user-circle text-lg"></i>
                      View Profile
                    </NavLink>
                    <NavLink
                      to={ROUTES.SETTINGS}
                      className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="ti ti-settings-cog text-lg"></i>
                      Account Settings
                    </NavLink>
                    <button type="button" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item w-full text-start">
                      <i className="ti ti-lifebuoy text-lg"></i>
                      Support
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item w-full text-start">
                      <i className="ti ti-bolt text-lg"></i>
                      Activity Log
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item w-full text-start">
                      <i className="ti ti-calendar text-lg"></i>
                      Events
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-md px-4 py-3 text-[15px]! text-sm ti-dropdown-item w-full text-start">
                      <i className="ti ti-help text-lg"></i>
                      Help
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="slide-right" id="slide-right">
            <i className="ti ti-chevron-right text-xl" aria-hidden="true" />
          </div>
        </nav>
      </div>
    </aside>
  )
}
