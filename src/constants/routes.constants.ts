export const ROUTES = {
  HOME: '/',
  /** Public product and pricing page for prospects. */
  LANDING: '/welcome',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ACCEPT_INVITATION: '/accept-invitation',

  DASHBOARD: '/dashboard',
  DASH_GLOBAL_SALES: '/dashboards/global-sales',
  DASH_SHIPPING: '/dashboards/shipping',
  REPORTS: '/reports',

  // Sell everywhere
  APP_MARKETPLACE: '/apps',
  LISTINGS: '/listings',
  STOREFRONTS: '/storefronts',
  COURIERS: '/couriers',

  // Commerce
  ORDERS: '/orders',
  ORDER_NEW: '/orders/new',
  ORDER: '/orders/:id',
  CUSTOMERS: '/customers',
  CUSTOMER: '/customers/:id',
  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT: '/products/:id',
  PRODUCT_EDIT: '/products/:id/edit',
  IMPORTS: '/imports',
  CHANNELS: '/channels',

  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_ITEM: '/inventory/:id',
  LEDGER: '/inventory-ledger',
  RESERVATIONS: '/reservations',
  ADJUSTMENTS: '/adjustments',
  TRANSFERS: '/transfers',
  STOCK_COUNTS: '/stock-counts',
  STOCK_COUNT: '/stock-counts/:id',
  LOTS: '/lots',
  REPLENISHMENT: '/replenishment',

  // Warehouse
  WAREHOUSES: '/warehouses',
  WAREHOUSE: '/warehouses/:id',
  LOCATIONS: '/locations',
  RECEIPTS: '/receipts',
  RECEIPT: '/receipts/:id',
  PUTAWAY: '/putaway',
  WAVES: '/pick-waves',
  TASKS: '/tasks',
  TASK: '/tasks/:id',
  PACKING: '/packing',
  DISPATCH: '/dispatch',
  STAFF: '/warehouse-staff',

  // Procurement
  SUPPLIERS: '/suppliers',
  PURCHASE_ORDERS: '/purchase-orders',
  PURCHASE_ORDER_NEW: '/purchase-orders/new',
  PURCHASE_ORDER: '/purchase-orders/:id',
  REQUISITIONS: '/requisitions',
  SUPPLIER_RETURNS: '/supplier-returns',

  // Shipping and returns
  SHIPMENTS: '/shipments',
  SHIPMENT: '/shipments/:id',
  CARRIERS: '/carriers',
  TRACKING_EXCEPTIONS: '/tracking-exceptions',
  COD: '/cod-reconciliation',
  RETURNS: '/returns',
  RETURN: '/returns/:id',

  // 3PL
  CLIENTS: '/clients',
  CLIENT: '/clients/:id',
  RATE_CARDS: '/rate-cards',
  USAGE: '/usage-ledger',
  STATEMENTS: '/client-statements',
  SLA: '/sla-reports',

  // Integrations and automation
  CONNECTORS: '/integrations',
  DIRECT_API: '/integrations/direct-api',
  WEBHOOKS: '/integrations/webhooks',
  SYNC_JOBS: '/integrations/sync-jobs',
  FAILED_EVENTS: '/integrations/failed-events',
  AUTOMATION_RULES: '/automation',
  AUTOMATION_TEMPLATES: '/automation/templates',
  AUTOMATION_RULE: '/automation/:id',
  AUTOMATION_RUNS: '/automation-runs',

  // Warehouse scanner app (mobile, keyboard-wedge first)
  SCAN: '/scan',
  SCAN_TASK: '/scan/tasks/:id',
  SCAN_RECEIVE: '/scan/receive',
  SCAN_MOVE: '/scan/move',

  // Administration
  SETTINGS_WORKSPACE: '/settings/workspace',
  SETTINGS_OPERATIONS: '/settings/operations',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_API_KEYS: '/settings/api-keys',
  SETTINGS_AUDIT_LOG: '/settings/audit-log',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_DOCUMENTS: '/settings/documents',
  /** Shell-less print view for invoices and airway bills. */
  DOCUMENTS_PRINT: '/print/documents',
  SETTINGS_PROFILE: '/settings/profile',
  SYSTEM_HEALTH: '/settings/system-health',

  // Platform (master) console: platform admins only.
  ADMIN: '/admin',
  ADMIN_TENANTS: '/admin/workspaces',
  ADMIN_TENANT: '/admin/workspaces/:id',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_SETTINGS: '/admin/settings',
  NOT_FOUND: '*',
} as const

/** Fills `:param` placeholders: `to(ROUTES.ORDER, { id })`. */
export function to(route: string, params: Record<string, string>): string {
  return route.replace(/:(\w+)/g, (_, key: string) => encodeURIComponent(params[key] ?? ''))
}
