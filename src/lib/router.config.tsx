import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MasterLayout } from '@/layouts/MasterLayout'
import { ScanLayout } from '@/layouts/ScanLayout'
import { HomeRedirect, RequireAuth, RequirePermission } from '@/middleware'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  AcceptInvitationPage,
  NotFoundPage,
} from '@/pages'


/** Code-split route: the page module loads the first time it is visited. */
function page<M>(route: string, load: () => Promise<M>, name: keyof M & string): RouteObject {
  return { path: route.slice(1), lazy: () => load().then((m) => ({ Component: m[name] as ComponentType })) }
}

/** Routes that need a permission beyond area read access (create/manage screens). */
function gated(permission: string, routes: RouteObject[]): RouteObject {
  return { element: <RequirePermission permission={permission} />, children: routes }
}

const orders = () => import('@/pages/orders/OrdersPage')
const customers = () => import('@/pages/customers/CustomersPage')
const inventory = () => import('@/pages/inventory/StockOverviewPage')
const records = () => import('@/pages/inventory/InventoryRecordsPages')
const counts = () => import('@/pages/inventory/StockCountsPage')
const warehouses = () => import('@/pages/warehouse/WarehousesPage')
const receipts = () => import('@/pages/warehouse/ReceiptsPage')
const tasks = () => import('@/pages/warehouse/TasksPage')
const pos = () => import('@/pages/procurement/PurchaseOrdersPage')
const procurement = () => import('@/pages/procurement/ProcurementPages')
const shipments = () => import('@/pages/shipping/ShipmentsPage')
const carriers = () => import('@/pages/shipping/CarriersPage')
const returns = () => import('@/pages/shipping/ReturnsPage')
const clients = () => import('@/pages/threepl/ClientsPage')
const clientBilling = () => import('@/pages/threepl/BillingPages')
const connectors = () => import('@/pages/integrations/ConnectorsPage')
const rules = () => import('@/pages/automation/RulesPage')
const scan = () => import('@/pages/scan/ScanPages')

const app: RouteObject[] = [
  page(ROUTES.DASHBOARD, () => import('@/pages/dashboard/DashboardPage'), 'DashboardPage'),
  page(ROUTES.REPORTS, () => import('@/pages/reports/ReportsPage'), 'ReportsPage'),
  page(ROUTES.DASH_GLOBAL_SALES, () => import('@/pages/dashboard/GlobalSalesDashboardPage'), 'GlobalSalesDashboardPage'),
  page(ROUTES.DASH_SHIPPING, () => import('@/pages/dashboard/ShippingDashboardPage'), 'ShippingDashboardPage'),

  page(ROUTES.APP_MARKETPLACE, () => import('@/pages/marketplace/AppMarketplacePage'), 'AppMarketplacePage'),
  page(ROUTES.LISTINGS, () => import('@/pages/marketplace/ListingsPage'), 'ListingsPage'),
  page(ROUTES.STOREFRONTS, () => import('@/pages/marketplace/StorefrontsPage'), 'StorefrontsPage'),
  page(ROUTES.COURIERS, () => import('@/pages/shipping/CourierDirectoryPage'), 'CourierDirectoryPage'),
  page(ROUTES.AUTOMATION_TEMPLATES, () => import('@/pages/automation/AutomationTemplatesPage'), 'AutomationTemplatesPage'),

  gated('orders.create', [page(ROUTES.ORDER_NEW, () => import('@/pages/orders/OrderCreatePage'), 'OrderCreatePage')]),
  page(ROUTES.ORDERS, orders, 'OrdersPage'),
  page(ROUTES.ORDER, () => import('@/pages/orders/OrderDetailPage'), 'OrderDetailPage'),
  page(ROUTES.CUSTOMERS, customers, 'CustomersPage'),
  page(ROUTES.CUSTOMER, customers, 'CustomerDetailPage'),

  gated('products.manage', [
    page(ROUTES.PRODUCT_NEW, () => import('@/pages/catalog/ProductFormPage'), 'ProductFormPage'),
    page(ROUTES.PRODUCT_EDIT, () => import('@/pages/catalog/ProductFormPage'), 'ProductFormPage'),
  ]),
  page(ROUTES.PRODUCTS, () => import('@/pages/catalog/ProductsPage'), 'ProductsPage'),
  page(ROUTES.PRODUCT, () => import('@/pages/catalog/ProductDetailPage'), 'ProductDetailPage'),
  page(ROUTES.IMPORTS, () => import('@/pages/catalog/ImportsPage'), 'ImportsPage'),
  page(ROUTES.CHANNELS, () => import('@/pages/catalog/ChannelsPage'), 'ChannelsPage'),

  page(ROUTES.INVENTORY, inventory, 'StockOverviewPage'),
  page(ROUTES.INVENTORY_ITEM, inventory, 'InventoryItemPage'),
  page(ROUTES.LEDGER, records, 'LedgerPage'),
  page(ROUTES.RESERVATIONS, records, 'ReservationsPage'),
  page(ROUTES.LOTS, records, 'LotsPage'),
  page(ROUTES.REPLENISHMENT, records, 'ReplenishmentPage'),
  page(ROUTES.ADJUSTMENTS, () => import('@/pages/inventory/AdjustmentsPage'), 'AdjustmentsPage'),
  page(ROUTES.TRANSFERS, () => import('@/pages/inventory/TransfersPage'), 'TransfersPage'),
  page(ROUTES.STOCK_COUNTS, counts, 'StockCountsPage'),
  page(ROUTES.STOCK_COUNT, counts, 'StockCountPage'),

  page(ROUTES.WAREHOUSES, warehouses, 'WarehousesPage'),
  page(ROUTES.WAREHOUSE, warehouses, 'WarehouseDetailPage'),
  page(ROUTES.LOCATIONS, warehouses, 'LocationsPage'),
  page(ROUTES.STAFF, warehouses, 'StaffPage'),
  page(ROUTES.RECEIPTS, receipts, 'ReceiptsPage'),
  page(ROUTES.RECEIPT, receipts, 'ReceiptPage'),
  page(ROUTES.TASKS, tasks, 'TasksPage'),
  page(ROUTES.PUTAWAY, tasks, 'PutawayPage'),
  page(ROUTES.TASK, tasks, 'TaskDetailPage'),
  page(ROUTES.WAVES, () => import('@/pages/warehouse/WavesPage'), 'WavesPage'),
  page(ROUTES.PACKING, () => import('@/pages/warehouse/PackingPage'), 'PackingPage'),
  page(ROUTES.DISPATCH, () => import('@/pages/warehouse/DispatchPage'), 'DispatchPage'),

  gated('procurement.create', [page(ROUTES.PURCHASE_ORDER_NEW, () => import('@/pages/procurement/PurchaseOrderCreatePage'), 'PurchaseOrderCreatePage')]),
  page(ROUTES.PURCHASE_ORDERS, pos, 'PurchaseOrdersPage'),
  page(ROUTES.PURCHASE_ORDER, pos, 'PurchaseOrderPage'),
  page(ROUTES.SUPPLIERS, procurement, 'SuppliersPage'),
  page(ROUTES.REQUISITIONS, procurement, 'RequisitionsPage'),
  page(ROUTES.SUPPLIER_RETURNS, procurement, 'SupplierReturnsPage'),

  page(ROUTES.SHIPMENTS, shipments, 'ShipmentsPage'),
  page(ROUTES.TRACKING_EXCEPTIONS, shipments, 'TrackingExceptionsPage'),
  page(ROUTES.SHIPMENT, shipments, 'ShipmentDetailPage'),
  page(ROUTES.CARRIERS, carriers, 'CarriersPage'),
  page(ROUTES.COD, carriers, 'CodPage'),
  page(ROUTES.RETURNS, returns, 'ReturnsPage'),
  page(ROUTES.RETURN, returns, 'ReturnDetailPage'),

  page(ROUTES.CLIENTS, clients, 'ClientsPage'),
  page(ROUTES.CLIENT, clients, 'ClientDetailPage'),
  page(ROUTES.SLA, clients, 'SlaPage'),
  page(ROUTES.RATE_CARDS, clientBilling, 'RateCardsPage'),
  page(ROUTES.USAGE, clientBilling, 'UsagePage'),
  page(ROUTES.STATEMENTS, clientBilling, 'StatementsPage'),

  page(ROUTES.DIRECT_API, () => import('@/pages/integrations/DirectApiPage'), 'DirectApiPage'),
  page(ROUTES.WEBHOOKS, () => import('@/pages/integrations/WebhooksPage'), 'WebhooksPage'),
  page(ROUTES.SYNC_JOBS, connectors, 'SyncJobsPage'),
  page(ROUTES.FAILED_EVENTS, connectors, 'FailedEventsPage'),
  page(ROUTES.CONNECTORS, connectors, 'ConnectorsPage'),
  page(ROUTES.AUTOMATION_RULES, rules, 'RulesPage'),
  page(ROUTES.AUTOMATION_RUNS, rules, 'ExecutionsPage'),
  page(ROUTES.AUTOMATION_RULE, () => import('@/pages/automation/RuleEditorPage'), 'RuleEditorPage'),

  page(ROUTES.SETTINGS_BILLING, () => import('@/pages/settings/BillingPage'), 'BillingPage'),
  page(ROUTES.SETTINGS_DOCUMENTS, () => import('@/pages/documents/DocumentTemplatesPage'), 'DocumentTemplatesPage'),
  page(ROUTES.SETTINGS_PROFILE, () => import('@/pages/settings/ProfilePage'), 'ProfilePage'),
  gated('tenant.read', [
    page(ROUTES.SETTINGS_WORKSPACE, () => import('@/pages/settings/WorkspaceSettingsPage'), 'WorkspaceSettingsPage'),
    page(ROUTES.SETTINGS_OPERATIONS, () => import('@/pages/settings/OperationsSettingsPage'), 'OperationsSettingsPage'),
    page(ROUTES.SYSTEM_HEALTH, () => import('@/pages/settings/SystemHealthPage'), 'SystemHealthPage'),
  ]),
  gated('members.read', [page(ROUTES.SETTINGS_TEAM, () => import('@/pages/settings/TeamPage'), 'TeamPage')]),
  gated('roles.read', [page(ROUTES.SETTINGS_ROLES, () => import('@/pages/settings/RolesPage'), 'RolesPage')]),
  gated('api_keys.read', [page(ROUTES.SETTINGS_API_KEYS, () => import('@/pages/settings/ApiKeysPage'), 'ApiKeysPage')]),
  gated('audit.read', [page(ROUTES.SETTINGS_AUDIT_LOG, () => import('@/pages/settings/AuditLogPage'), 'AuditLogPage')]),

  // Platform (master) console.
  gated('platform.admin', [
    page(ROUTES.ADMIN, () => import('@/pages/admin/AdminOverviewPage'), 'AdminOverviewPage'),
    page(ROUTES.ADMIN_TENANTS, () => import('@/pages/admin/AdminTenantsPage'), 'AdminTenantsPage'),
    page(ROUTES.ADMIN_TENANT, () => import('@/pages/admin/AdminTenantDetailPage'), 'AdminTenantDetailPage'),
    page(ROUTES.ADMIN_USERS, () => import('@/pages/admin/AdminUsersPage'), 'AdminUsersPage'),
    page(ROUTES.ADMIN_AUDIT, () => import('@/pages/admin/AdminAuditPage'), 'AdminAuditPage'),
    page(ROUTES.ADMIN_SETTINGS, () => import('@/pages/admin/AdminSettingsPage'), 'AdminSettingsPage'),
  ]),
]

/** Warehouse scanner screens: full-screen, touch-first layout without the app shell. */
const scanner: RouteObject[] = [
  page(ROUTES.SCAN, scan, 'ScanHomePage'),
  page(ROUTES.SCAN_TASK, scan, 'ScanTaskPage'),
  page(ROUTES.SCAN_RECEIVE, scan, 'ScanReceivePage'),
  page(ROUTES.SCAN_MOVE, scan, 'ScanMovePage'),
]

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      // Prospects land on the product page; signed-in users go straight to the dashboard.
      { index: true, element: <HomeRedirect /> },
      { path: ROUTES.LANDING.slice(1), lazy: () => import('@/pages/landing/LandingPage').then((m) => ({ Component: m.LandingPage })) },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN.slice(1), element: <LoginPage /> },
          { path: ROUTES.REGISTER.slice(1), element: <RegisterPage /> },
          { path: ROUTES.FORGOT_PASSWORD.slice(1), element: <ForgotPasswordPage /> },
          { path: ROUTES.RESET_PASSWORD.slice(1), element: <ResetPasswordPage /> },
        ],
      },
      {
        // Reachable whether or not the user is signed in.
        element: <AuthLayout redirectIfAuthenticated={false} />,
        children: [
          { path: ROUTES.VERIFY_EMAIL.slice(1), element: <VerifyEmailPage /> },
          { path: ROUTES.ACCEPT_INVITATION.slice(1), element: <AcceptInvitationPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { element: <MasterLayout />, children: app },
          // Printable invoices and airway bills render without the app shell.
          { element: <RequirePermission permission="orders.read" />, children: [page(ROUTES.DOCUMENTS_PRINT, () => import('@/pages/documents/DocumentsPrintPage'), 'DocumentsPrintPage')] },
          { element: <ScanLayout />, children: [gated('warehouse.read', scanner)] },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
