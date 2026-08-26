import { ROUTES } from '@/constants/routes.constants'

export type SidebarSubItem = {
  title: string
  link: string
  /** Tabler Icons class, e.g. `ti ti-chart-bar`. */
  icon: string
  /** Match NavLink `end` for exact active state (e.g. dashboard root). */
  end?: boolean
}

export type SidebarHeading = {
  type: 'heading'
  title: string
}

export type SidebarSingleItem = {
  type: 'single'
  id: string
  title: string
  link: string
  /** Tabler Icons class, e.g. `ti ti-package`. */
  icon: string
}

export type SidebarMultiItem = {
  type: 'multi'
  id: string
  title: string
  /** Tabler Icons class, e.g. `ti ti-layout-dashboard`. */
  icon: string
  children: SidebarSubItem[]
}

export type SidebarMenuEntry = SidebarHeading | SidebarSingleItem | SidebarMultiItem

/** Sidebar nav for MasterLayout — mirrors protected app routes. */
export const SIDEBAR_MENU: SidebarMenuEntry[] = [
  { type: 'heading', title: 'Main' },
  {
    type: 'multi',
    id: 'dashboards',
    title: 'Dashboards',
    icon: 'ti ti-layout-dashboard',
    children: [
      { title:'CRM', link: ROUTES.DASHBOARD, icon: 'ti ti-building-community', end: true },
      { title: 'Analytics', link: ROUTES.ANALYTICS, icon: 'ti ti-chart-bar' },
    ],
  },
  { type: 'heading', title: 'Web Apps' },
  {
    type: 'single',
    id: 'users',
    title: 'Users',
    link: ROUTES.USERS,
    icon: 'ti ti-users',
  },
  {
    type: 'single',
    id: 'products',
    title: 'Products',
    link: ROUTES.PRODUCTS,
    icon: 'ti ti-package',
  },
  {
    type: 'single',
    id: 'settings',
    title: 'Settings',
    link: ROUTES.SETTINGS,
    icon: 'ti ti-settings',
  },
]

export function getSidebarMenu(): SidebarMenuEntry[] {
  return SIDEBAR_MENU
}

export function isPathUnderMenu(pathname: string, item: SidebarMultiItem): boolean {
  return item.children.some((child) =>
    child.end ? pathname === child.link : pathname === child.link || pathname.startsWith(`${child.link}/`),
  )
}
