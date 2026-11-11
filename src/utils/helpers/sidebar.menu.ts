import { ROUTES } from '@/constants/routes.constants'

export type SidebarSubItem = {
  title: string
  link: string
  /** Match NavLink `end` for exact active state. */
  end?: boolean
  /** Hidden unless the user holds this permission in the current workspace. */
  permission?: string
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
  /** MingCute icon class, e.g. `mgc_inbox_line`. */
  icon: string
  permission?: string
  end?: boolean
}

export type SidebarMultiItem = {
  type: 'multi'
  id: string
  title: string
  icon: string
  children: SidebarSubItem[]
}

export type SidebarMenuEntry = SidebarHeading | SidebarSingleItem | SidebarMultiItem

/**
 * Sidebar navigation. Items a role cannot read are hidden. Product permission keys
 * are only enforced once the server's catalogue knows them (see hooks/useCan.ts).
 */
export const SIDEBAR_MENU: SidebarMenuEntry[] = [
  { type: 'heading', title: 'Overview' },
  { type: 'single', id: 'dashboard', title: 'Dashboard', link: ROUTES.DASHBOARD, icon: 'mgc_dashboard_line' },
  {
    type: 'multi',
    id: 'dashboards',
    title: 'Analytics',
    icon: 'mgc_chart_line_line',
    children: [
      { title: 'Global sales', link: ROUTES.DASH_GLOBAL_SALES, permission: 'reports.read' },
      { title: 'Shipping performance', link: ROUTES.DASH_SHIPPING, permission: 'shipping.read' },
      { title: 'Reports', link: ROUTES.REPORTS, permission: 'reports.read' },
    ],
  },

  { type: 'heading', title: 'Sell everywhere' },
  { type: 'single', id: 'apps', title: 'App marketplace', link: ROUTES.APP_MARKETPLACE, icon: 'mgc_plugin_2_line', permission: 'integrations.manage' },
  { type: 'single', id: 'listings', title: 'Marketplace listings', link: ROUTES.LISTINGS, icon: 'mgc_shop_line', permission: 'products.read' },
  { type: 'single', id: 'storefronts', title: 'Storefronts', link: ROUTES.STOREFRONTS, icon: 'mgc_store_2_line', permission: 'products.read' },
  { type: 'single', id: 'channels', title: 'Sales channels', link: ROUTES.CHANNELS, icon: 'mgc_world_2_line', permission: 'products.read' },

  { type: 'heading', title: 'Commerce' },
  { type: 'single', id: 'orders', title: 'Orders', link: ROUTES.ORDERS, icon: 'mgc_shopping_bag_3_line', permission: 'orders.read' },
  { type: 'single', id: 'customers', title: 'Customers', link: ROUTES.CUSTOMERS, icon: 'mgc_user_heart_line', permission: 'orders.read' },
  {
    type: 'multi',
    id: 'catalog',
    title: 'Catalog',
    icon: 'mgc_tag_line',
    children: [
      { title: 'Products', link: ROUTES.PRODUCTS, permission: 'products.read' },
      { title: 'Catalog imports', link: ROUTES.IMPORTS, permission: 'products.manage' },
    ],
  },

  { type: 'heading', title: 'Operations' },
  {
    type: 'multi',
    id: 'inventory',
    title: 'Inventory',
    icon: 'mgc_box_3_line',
    children: [
      { title: 'Stock overview', link: ROUTES.INVENTORY, permission: 'inventory.read' },
      { title: 'Stock ledger', link: ROUTES.LEDGER, permission: 'inventory.read' },
      { title: 'Reservations', link: ROUTES.RESERVATIONS, permission: 'inventory.read' },
      { title: 'Adjustments', link: ROUTES.ADJUSTMENTS, permission: 'inventory.read' },
      { title: 'Transfers', link: ROUTES.TRANSFERS, permission: 'inventory.read' },
      { title: 'Stock counts', link: ROUTES.STOCK_COUNTS, permission: 'inventory.read' },
      { title: 'Lots and expiry', link: ROUTES.LOTS, permission: 'inventory.read' },
      { title: 'Replenishment', link: ROUTES.REPLENISHMENT, permission: 'inventory.read' },
    ],
  },
  {
    type: 'multi',
    id: 'warehouse',
    title: 'Warehouse',
    icon: 'mgc_building_4_line',
    children: [
      { title: 'Warehouses', link: ROUTES.WAREHOUSES, permission: 'warehouse.read' },
      { title: 'Locations', link: ROUTES.LOCATIONS, permission: 'warehouse.read' },
      { title: 'Inbound receipts', link: ROUTES.RECEIPTS, permission: 'warehouse.read' },
      { title: 'Putaway', link: ROUTES.PUTAWAY, permission: 'warehouse.read' },
      { title: 'Pick waves', link: ROUTES.WAVES, permission: 'warehouse.read' },
      { title: 'All tasks', link: ROUTES.TASKS, permission: 'warehouse.read' },
      { title: 'Packing', link: ROUTES.PACKING, permission: 'warehouse.read' },
      { title: 'Dispatch manifests', link: ROUTES.DISPATCH, permission: 'warehouse.read' },
      { title: 'Staff and productivity', link: ROUTES.STAFF, permission: 'warehouse.read' },
    ],
  },
  { type: 'single', id: 'scan', title: 'Scanner app', link: ROUTES.SCAN, icon: 'mgc_barcode_line', permission: 'warehouse.read' },
  {
    type: 'multi',
    id: 'procurement',
    title: 'Procurement',
    icon: 'mgc_file_check_line',
    children: [
      { title: 'Purchase orders', link: ROUTES.PURCHASE_ORDERS, permission: 'procurement.read' },
      { title: 'Suppliers', link: ROUTES.SUPPLIERS, permission: 'procurement.read' },
      { title: 'Requisitions', link: ROUTES.REQUISITIONS, permission: 'procurement.read' },
      { title: 'Supplier returns', link: ROUTES.SUPPLIER_RETURNS, permission: 'procurement.read' },
    ],
  },
  {
    type: 'multi',
    id: 'shipping',
    title: 'Shipping & returns',
    icon: 'mgc_truck_line',
    children: [
      { title: 'Shipments', link: ROUTES.SHIPMENTS, permission: 'shipping.read' },
      { title: 'Couriers & rate shopper', link: ROUTES.COURIERS, permission: 'shipping.read' },
      { title: 'Tracking exceptions', link: ROUTES.TRACKING_EXCEPTIONS, permission: 'shipping.read' },
      { title: 'Carrier accounts', link: ROUTES.CARRIERS, permission: 'shipping.read' },
      { title: 'COD reconciliation', link: ROUTES.COD, permission: 'shipping.read' },
      { title: 'Returns / RMA', link: ROUTES.RETURNS, permission: 'returns.read' },
    ],
  },

  { type: 'heading', title: '3PL' },
  {
    type: 'multi',
    id: 'threepl',
    title: '3PL clients',
    icon: 'mgc_group_line',
    children: [
      { title: 'Clients', link: ROUTES.CLIENTS, permission: 'clients.read' },
      { title: 'Rate cards', link: ROUTES.RATE_CARDS, permission: 'clients.read' },
      { title: 'Usage ledger', link: ROUTES.USAGE, permission: 'clients.read' },
      { title: 'Client statements', link: ROUTES.STATEMENTS, permission: 'clients.read' },
      { title: 'SLA reports', link: ROUTES.SLA, permission: 'clients.read' },
    ],
  },

  { type: 'heading', title: 'Connect' },
  {
    type: 'multi',
    id: 'integrations',
    title: 'Integrations',
    icon: 'mgc_plugin_line',
    children: [
      { title: 'Connectors', link: ROUTES.CONNECTORS, end: true, permission: 'integrations.manage' },
      { title: 'LinqWorks Direct API', link: ROUTES.DIRECT_API, permission: 'integrations.manage' },
      { title: 'Webhook endpoints', link: ROUTES.WEBHOOKS, permission: 'integrations.manage' },
      { title: 'Sync jobs', link: ROUTES.SYNC_JOBS, permission: 'integrations.manage' },
      { title: 'Failed events', link: ROUTES.FAILED_EVENTS, permission: 'integrations.manage' },
    ],
  },
  {
    type: 'multi',
    id: 'automation',
    title: 'Automation',
    icon: 'mgc_flash_line',
    children: [
      { title: 'Rules', link: ROUTES.AUTOMATION_RULES, end: true, permission: 'automation.manage' },
      { title: 'Templates', link: ROUTES.AUTOMATION_TEMPLATES, permission: 'automation.manage' },
      { title: 'Execution history', link: ROUTES.AUTOMATION_RUNS, permission: 'automation.manage' },
    ],
  },

  { type: 'heading', title: 'Administration' },
  {
    type: 'multi',
    id: 'settings',
    title: 'Settings',
    icon: 'mgc_settings_3_line',
    children: [
      { title: 'Workspace', link: ROUTES.SETTINGS_WORKSPACE, permission: 'tenant.read' },
      { title: 'Tax, currency & operations', link: ROUTES.SETTINGS_OPERATIONS, permission: 'tenant.read' },
      { title: 'Users', link: ROUTES.SETTINGS_TEAM, permission: 'members.read' },
      { title: 'Roles & permissions', link: ROUTES.SETTINGS_ROLES, permission: 'roles.read' },
      { title: 'API keys', link: ROUTES.SETTINGS_API_KEYS, permission: 'api_keys.read' },
      { title: 'Subscription & usage', link: ROUTES.SETTINGS_BILLING, permission: 'billing.read' },
      { title: 'Invoice & label templates', link: ROUTES.SETTINGS_DOCUMENTS, permission: 'orders.read' },
      { title: 'Audit log', link: ROUTES.SETTINGS_AUDIT_LOG, permission: 'audit.read' },
      { title: 'System health', link: ROUTES.SYSTEM_HEALTH, permission: 'tenant.read' },
    ],
  },
  { type: 'single', id: 'profile', title: 'My profile', link: ROUTES.SETTINGS_PROFILE, icon: 'mgc_user_3_line' },

  // Platform (master) console: hidden unless the account is a platform admin.
  { type: 'heading', title: 'Platform' },
  {
    type: 'multi',
    id: 'platform-admin',
    title: 'Platform admin',
    icon: 'mgc_shield_line',
    children: [
      { title: 'Overview', link: ROUTES.ADMIN, end: true, permission: 'platform.admin' },
      { title: 'Workspaces', link: ROUTES.ADMIN_TENANTS, permission: 'platform.admin' },
      { title: 'Users', link: ROUTES.ADMIN_USERS, permission: 'platform.admin' },
      { title: 'Platform settings', link: ROUTES.ADMIN_SETTINGS, permission: 'platform.admin' },
      { title: 'Platform audit', link: ROUTES.ADMIN_AUDIT, permission: 'platform.admin' },
    ],
  },
]

/** Menu with entries the user cannot access removed (and headings left empty dropped). */
export function getSidebarMenu(can: (permission: string) => boolean): SidebarMenuEntry[] {
  const allowed = (permission?: string) => !permission || can(permission)
  const visible = SIDEBAR_MENU.flatMap<SidebarMenuEntry>((entry) => {
    if (entry.type === 'single') return allowed(entry.permission) ? [entry] : []
    if (entry.type === 'multi') {
      const children = entry.children.filter((child) => allowed(child.permission))
      return children.length > 0 ? [{ ...entry, children }] : []
    }
    return [entry]
  })
  return visible.filter((entry, i) => entry.type !== 'heading' || (visible[i + 1] && visible[i + 1].type !== 'heading'))
}

export function isPathUnderMenu(pathname: string, item: SidebarMultiItem): boolean {
  return item.children.some((child) =>
    child.end ? pathname === child.link : pathname === child.link || pathname.startsWith(`${child.link}/`),
  )
}

/** Flat list of every reachable page, for the command palette. */
export function flattenMenu(entries: SidebarMenuEntry[]): { title: string; group: string; link: string }[] {
  let group = ''
  return entries.flatMap((entry) => {
    if (entry.type === 'heading') {
      group = entry.title
      return []
    }
    if (entry.type === 'single') return [{ title: entry.title, group, link: entry.link }]
    return entry.children.map((child) => ({ title: child.title, group: entry.title, link: child.link }))
  })
}
