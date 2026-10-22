import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  getSidebarMenu,
  isPathUnderMenu,
  type SidebarMenuEntry,
  type SidebarMultiItem,
  type SidebarSingleItem,
} from '@/utils/helpers/sidebar.menu'

const NAV_ACTIVE_KEY = 'wa-nav-active'

const NAV_ACTIVE_OPTIONS = [
  { id: 'solid', label: 'Solid green' },
  { id: 'soft', label: 'Soft tint' },
  { id: 'mint', label: 'Mint' },
  { id: 'teal', label: 'Teal' },
  { id: 'glow', label: 'Glow' },
  { id: 'slate', label: 'Slate' },
  { id: 'contrast', label: 'Contrast' },
] as const

type NavActiveStyle = (typeof NAV_ACTIVE_OPTIONS)[number]['id']

function readStoredActiveStyle(): NavActiveStyle {
  const stored = sessionStorage.getItem(NAV_ACTIVE_KEY)
  const match = NAV_ACTIVE_OPTIONS.find((opt) => opt.id === stored)
  return match?.id ?? 'solid'
}

function MenuHeading({ title }: { title: string }) {
  return <li className="nav-menu-title">{title}</li>
}

function SingleMenuItem({ item }: { item: SidebarSingleItem }) {
  return (
    <li className="nav-item">
      <NavLink
        to={item.link}
        className={({ isActive }) =>
          `nav-link wa-nav-link${isActive ? ' active wa-nav-active' : ''}`
        }
      >
        <span className="wa-nav-icon icons">
          <i className={item.icon}></i>
        </span>
        <span className="content">{item.title}</span>
      </NavLink>
    </li>
  )
}

function MultiMenuItem({ item, open }: { item: SidebarMultiItem; open: boolean }) {
  const collapseId = `collapse-${item.id}`

  return (
    <li className={`nav-item${open ? ' wa-nav-open' : ''}`}>
      <a
        className={`nav-link wa-nav-link${open ? ' wa-nav-active' : ' collapsed'}`}
        data-position="right-top"
        data-bs-toggle="collapse"
        href={`#${collapseId}`}
        aria-expanded={open}
      >
        <span className="wa-nav-icon icons">
          <i className={item.icon}></i>
        </span>
        <span className="content">{item.title}</span>
        <span className="ms-auto menu-arrow">
          <i className="mgc_down_line"></i>
        </span>
      </a>
      <div className={`collapse${open ? ' show' : ''}`} id={collapseId}>
        <ul className="nav-menu-sub">
          {item.children.map((child) => (
            <li key={child.link}>
              <NavLink
                to={child.link}
                end={child.end}
                className={({ isActive }) =>
                  `nav-link wa-nav-link${isActive ? ' active wa-nav-active' : ''}`
                }
              >
                <span>{child.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function renderMenuEntry(entry: SidebarMenuEntry, pathname: string) {
  if (entry.type === 'heading') {
    return <MenuHeading key={`heading-${entry.title}`} title={entry.title} />
  }
  if (entry.type === 'single') {
    return <SingleMenuItem key={entry.id} item={entry} />
  }
  return (
    <MultiMenuItem
      key={entry.id}
      item={entry}
      open={isPathUnderMenu(pathname, entry)}
    />
  )
}

export function SideBar() {
  const { pathname } = useLocation()
  const menuItems = getSidebarMenu()
  const [activeStyle, setActiveStyle] = useState<NavActiveStyle>(() => readStoredActiveStyle())

  useEffect(() => {
    sessionStorage.setItem(NAV_ACTIVE_KEY, activeStyle)
  }, [activeStyle])

  return (
    <div
      id="main-sidebar"
      className="main-sidebar wa-sidebar"
      data-wa-nav-active={activeStyle}
    >
      <div className="sidebar-wrapper">
        <a href="#!" className="navbar-brand" aria-label="WhatsApp CRM">
          <span className="wa-brand-mark" aria-hidden="true">
            <i className="ri-whatsapp-fill"></i>
          </span>
          <span className="wa-brand-copy">
            <span className="wa-brand-name">WhatsApp CRM</span>
            <span className="wa-brand-tag">Business workspace</span>
          </span>
          {/* Keep Alloce logo nodes for theme switcher compatibility (hidden via CSS) */}
          <div className="logo-lg visually-hidden" aria-hidden="true">
            <img src="/assets/images/main-logo.webp" alt="" className="logo-dark" height="26" />
            <img src="/assets/images/logo-white.webp" alt="" className="logo-light" height="26" />
          </div>
          <div className="logo-sm visually-hidden" aria-hidden="true">
            <img src="/assets/images/logo-sm-dark.webp" alt="" className="logo-dark" height="26" />
            <img src="/assets/images/logo-sm-dark.webp" alt="" className="logo-light" height="26" />
          </div>
        </a>

        <div className="navbar-menu" id="navbar-menu-list" data-simplebar>
          <ul className="list-unstyled p-0 navbar-nav-menu">
            {menuItems.map((entry) => renderMenuEntry(entry, pathname))}
          </ul>
        </div>

        <div className="wa-sidebar-foot">
          <div className="wa-sidebar-foot-card">
            <i className="ri-flashlight-line" aria-hidden="true"></i>
            <div>
              <strong>Pro tips</strong>
              <span>Connect Meta Cloud API</span>
            </div>
          </div>

          <div className="wa-active-picker" role="group" aria-label="Active menu style">
            <span className="wa-active-picker-label">Active style</span>
            <div className="wa-active-picker-row">
              {NAV_ACTIVE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`wa-active-swatch${activeStyle === opt.id ? ' is-selected' : ''}`}
                  data-style={opt.id}
                  title={opt.label}
                  aria-label={opt.label}
                  aria-pressed={activeStyle === opt.id}
                  onClick={() => setActiveStyle(opt.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
