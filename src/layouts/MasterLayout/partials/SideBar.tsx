import { NavLink, useLocation } from 'react-router-dom'
import {
  getSidebarMenu,
  isPathUnderMenu,
  type SidebarMenuEntry,
  type SidebarMultiItem,
  type SidebarSingleItem,
} from '@/utils/helpers/sidebar.menu'

function MenuHeading({ title }: { title: string }) {
  return <li className="nav-menu-title">{title}</li>
}

function SingleMenuItem({ item }: { item: SidebarSingleItem }) {
  return (
    <li className="nav-item">
      <NavLink
        to={item.link}
        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
      >
        <span className="icons">
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
    <li className="nav-item">
      <a
        className={`nav-link${open ? '' : ' collapsed'}${open ? ' active' : ''}`}
        data-position="right-top"
        data-bs-toggle="collapse"
        href={`#${collapseId}`}
        aria-expanded={open}
      >
        <span className="icons">
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
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
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

  return (
    <div id="main-sidebar" className="main-sidebar">
      <div className="sidebar-wrapper">
        <a href="#!" className="navbar-brand">
          <div className="logo-lg">
            <img
              src="/assets/images/main-logo.webp"
              loading="lazy"
              aria-label="logo"
              alt="Main Logo"
              height="26"
              className="mx-auto logo-dark"
            />
            <img
              src="/assets/images/logo-white.webp"
              loading="lazy"
              aria-label="logo"
              alt="Logo White"
              height="26"
              className="mx-auto logo-light"
            />
          </div>
          <div className="logo-sm">
            <img
              src="/assets/images/logo-sm-dark.webp"
              loading="lazy"
              aria-label="logo"
              alt="Logo Sm Dark"
              height="26"
              className="mx-auto logo-dark"
            />
            <img
              src="/assets/images/logo-sm-dark.webp"
              loading="lazy"
              aria-label="logo"
              alt="Logo Sm White"
              height="26"
              className="mx-auto logo-light"
            />
          </div>
        </a>

      

        <div className="navbar-menu px-5" id="navbar-menu-list" data-simplebar>
          <ul className="list-unstyled p-0 navbar-nav-menu">
            {menuItems.map((entry) => renderMenuEntry(entry, pathname))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SideBar
