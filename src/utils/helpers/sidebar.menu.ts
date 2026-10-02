import { ROUTES } from '@/constants/routes.constants'

export type SidebarSubItem = {
  title: string
  link: string
  /** MingCute icon class, e.g. `mgc_chart_bar_line`. */
  icon?: string
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
  /** MingCute icon class, e.g. `mgc_package_line`. */
  icon: string
}

export type SidebarMultiItem = {
  type: 'multi'
  id: string
  title: string
  /** MingCute icon class, e.g. `mgc_dashboard_line`. */
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
    icon: 'mgc_dashboard_line',
    children: [
      { title: 'CRM', link: ROUTES.DASHBOARD, end: true },
      { title: 'Analytics', link: ROUTES.ANALYTICS },
    ],
  },
  { type: 'heading', title: 'Web Apps' },
  {
    type: 'single',
    id: 'users',
    title: 'Users',
    link: ROUTES.USERS,
    icon: 'mgc_group_line',
  },
  {
    type: 'single',
    id: 'products',
    title: 'Products',
    link: ROUTES.PRODUCTS,
    icon: 'mgc_package_line',
  },
  {
    type: 'single',
    id: 'settings',
    title: 'Settings',
    link: ROUTES.SETTINGS,
    icon: 'mgc_settings_3_line',
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
