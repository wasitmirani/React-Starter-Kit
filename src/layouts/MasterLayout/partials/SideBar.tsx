import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCan } from '@/hooks/useCan'
import { BrandMark } from '@/components/common/BrandMark'
import { ROUTES } from '@/constants/routes.constants'
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
        end={item.end}
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
  const can = useCan()
  const menuItems = getSidebarMenu(can)

  return (
    <div id="main-sidebar" className="main-sidebar">
      <div className="sidebar-wrapper">
        <Link to={ROUTES.DASHBOARD} className="navbar-brand">
          <div className="logo-lg">
            <BrandMark />
          </div>
          <div className="logo-sm">
            <BrandMark compact />
          </div>
        </Link>

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
