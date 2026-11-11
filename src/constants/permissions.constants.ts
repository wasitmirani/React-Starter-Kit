import type { Permission } from '@/types/workspace.types'

/** Workspace-foundation permissions (served by the backend since Phase 1). */
export const FOUNDATION_PERMISSIONS: Permission[] = [
  { key: 'tenant.read', category: 'workspace', description: 'View workspace details and settings' },
  { key: 'tenant.update', category: 'workspace', description: 'Update workspace details and settings' },
  { key: 'members.read', category: 'team', description: 'View team members and invitations' },
  { key: 'members.manage', category: 'team', description: 'Invite, update and remove team members' },
  { key: 'roles.read', category: 'team', description: 'View roles and permissions' },
  { key: 'roles.manage', category: 'team', description: 'Create, update and delete custom roles' },
  { key: 'api_keys.read', category: 'developer', description: 'View API keys' },
  { key: 'api_keys.manage', category: 'developer', description: 'Create, rotate and revoke API keys' },
  { key: 'audit.read', category: 'security', description: 'View the audit log' },
]

/** Product permissions (plan §3.2). Logic checks these codes, never role names. */
export const PRODUCT_PERMISSIONS: Permission[] = [
  { key: 'orders.read', category: 'orders', description: 'View orders and customers' },
  { key: 'orders.create', category: 'orders', description: 'Create manual orders' },
  { key: 'orders.update', category: 'orders', description: 'Edit orders, place and release holds' },
  { key: 'orders.cancel', category: 'orders', description: 'Cancel orders and release reservations' },
  { key: 'orders.allocate', category: 'orders', description: 'Allocate orders to warehouses' },
  { key: 'products.read', category: 'catalog', description: 'View products, variants and channels' },
  { key: 'products.manage', category: 'catalog', description: 'Create, edit, import and archive products' },
  { key: 'inventory.read', category: 'inventory', description: 'View balances, ledger and reservations' },
  { key: 'inventory.adjust', category: 'inventory', description: 'Request stock adjustments and counts' },
  { key: 'inventory.approve', category: 'inventory', description: 'Approve adjustments and count variances' },
  { key: 'inventory.transfer', category: 'inventory', description: 'Create, dispatch and receive transfers' },
  { key: 'warehouse.read', category: 'warehouse', description: 'View warehouses, locations and tasks' },
  { key: 'warehouse.manage', category: 'warehouse', description: 'Configure warehouses, bins, waves and staff' },
  { key: 'warehouse.receive', category: 'warehouse', description: 'Receive and inspect inbound goods' },
  { key: 'warehouse.putaway', category: 'warehouse', description: 'Confirm putaway tasks' },
  { key: 'warehouse.pick', category: 'warehouse', description: 'Pick and report short picks' },
  { key: 'warehouse.pack', category: 'warehouse', description: 'Verify and pack orders' },
  { key: 'warehouse.dispatch', category: 'warehouse', description: 'Close manifests and hand over to carriers' },
  { key: 'procurement.read', category: 'procurement', description: 'View suppliers and purchase orders' },
  { key: 'procurement.create', category: 'procurement', description: 'Create purchase orders and requisitions' },
  { key: 'procurement.approve', category: 'procurement', description: 'Approve purchase orders' },
  { key: 'shipping.read', category: 'shipping', description: 'View shipments, carriers and COD' },
  { key: 'shipping.book', category: 'shipping', description: 'Book shipments and print labels' },
  { key: 'shipping.cancel', category: 'shipping', description: 'Cancel booked shipments' },
  { key: 'returns.read', category: 'returns', description: 'View returns' },
  { key: 'returns.approve', category: 'returns', description: 'Approve or reject return requests' },
  { key: 'returns.inspect', category: 'returns', description: 'Inspect and restock returned items' },
  { key: 'clients.read', category: 'threepl', description: 'View 3PL clients, usage and statements' },
  { key: 'clients.manage', category: 'threepl', description: 'Onboard clients and manage rate cards' },
  { key: 'integrations.manage', category: 'developer', description: 'Connect channels, couriers and webhooks' },
  { key: 'automation.manage', category: 'automation', description: 'Create, publish and pause automation rules' },
  { key: 'reports.read', category: 'reports', description: 'View reports and analytics' },
  { key: 'billing.read', category: 'billing', description: 'View plan, usage and invoices' },
  { key: 'billing.manage', category: 'billing', description: 'Change plan and payment details' },
]

export const ALL_PERMISSIONS: Permission[] = [...PRODUCT_PERMISSIONS, ...FOUNDATION_PERMISSIONS]

export const PERMISSION_CATEGORIES: Record<string, { label: string; icon: string; description: string }> = {
  orders: { label: 'Orders', icon: 'ri-shopping-bag-3-line', description: 'Orders, holds, allocation and customers' },
  catalog: { label: 'Catalog', icon: 'ri-price-tag-3-line', description: 'Products, variants, imports and channels' },
  inventory: { label: 'Inventory', icon: 'ri-stack-line', description: 'Balances, adjustments, transfers and counts' },
  warehouse: { label: 'Warehouse', icon: 'ri-building-4-line', description: 'Receiving, putaway, picking, packing and dispatch' },
  procurement: { label: 'Procurement', icon: 'ri-file-list-3-line', description: 'Suppliers and purchase orders' },
  shipping: { label: 'Shipping', icon: 'ri-truck-line', description: 'Shipments, carriers and COD' },
  returns: { label: 'Returns', icon: 'ri-arrow-go-back-line', description: 'RMAs and inspection' },
  threepl: { label: '3PL', icon: 'ri-team-line', description: 'Clients, rate cards and billing' },
  automation: { label: 'Automation', icon: 'ri-flashlight-line', description: 'Rules and execution history' },
  developer: { label: 'Integrations', icon: 'ri-plug-line', description: 'Connectors, API keys and webhooks' },
  reports: { label: 'Reports', icon: 'ri-bar-chart-box-line', description: 'Operational reporting' },
  billing: { label: 'Billing', icon: 'ri-bank-card-line', description: 'Plan, usage and invoices' },
  workspace: { label: 'Workspace', icon: 'ri-building-line', description: 'Workspace settings' },
  team: { label: 'Team & roles', icon: 'ri-shield-user-line', description: 'Members, invitations and roles' },
  security: { label: 'Security', icon: 'ri-shield-keyhole-line', description: 'Audit log' },
}

export const CATEGORY_ORDER = Object.keys(PERMISSION_CATEGORIES)

/** Actions with financial, customer-facing or irreversible effects, flagged in the role editor. */
export const SENSITIVE_PERMISSIONS = new Set(['orders.cancel', 'inventory.approve', 'procurement.approve', 'shipping.cancel', 'returns.approve', 'billing.manage', 'members.manage', 'roles.manage', 'api_keys.manage', 'integrations.manage', 'tenant.update'])

const keys = (...prefixes: string[]) => ALL_PERMISSIONS.filter((p) => prefixes.some((x) => p.key === x || p.key.startsWith(`${x}.`))).map((p) => p.key)
const READ_ALL = ALL_PERMISSIONS.filter((p) => p.key.endsWith('.read')).map((p) => p.key)
const BASE = ['tenant.read', 'members.read']

/** Built-in roles (plan §3.1 personas). Also offered as starting points for custom roles. */
export const ROLE_PRESETS: { key: string; name: string; description: string; icon: string; permissions: string[] }[] = [
  { key: 'owner', name: 'Owner', description: 'Full access, including billing and security', icon: 'ri-vip-crown-2-line', permissions: ALL_PERMISSIONS.map((p) => p.key) },
  { key: 'admin', name: 'Admin', description: 'Manages the workspace, team and integrations', icon: 'ri-shield-user-line', permissions: ALL_PERMISSIONS.map((p) => p.key).filter((k) => k !== 'billing.manage') },
  { key: 'operations_manager', name: 'Operations manager', description: 'Orders, allocation, fulfillment and exceptions', icon: 'ri-route-line', permissions: [...new Set([...keys('orders', 'shipping', 'returns', 'automation'), ...READ_ALL, ...BASE])] },
  { key: 'inventory_manager', name: 'Inventory manager', description: 'Stock accuracy, adjustments, transfers and purchasing', icon: 'ri-stack-line', permissions: [...new Set([...keys('inventory', 'products', 'procurement'), 'orders.read', 'warehouse.read', 'reports.read', ...BASE])] },
  { key: 'warehouse_manager', name: 'Warehouse manager', description: 'Layout, staff, waves and workload', icon: 'ri-building-4-line', permissions: [...new Set([...keys('warehouse', 'inventory'), 'orders.read', 'shipping.read', 'shipping.book', 'returns.read', 'returns.inspect', 'products.read', 'reports.read', ...BASE])] },
  { key: 'warehouse_operator', name: 'Warehouse operator', description: 'Receives, picks, packs and dispatches with the scanner', icon: 'ri-barcode-box-line', permissions: ['warehouse.read', 'warehouse.receive', 'warehouse.putaway', 'warehouse.pick', 'warehouse.pack', 'warehouse.dispatch', 'inventory.read', 'products.read', 'tenant.read'] },
  { key: 'finance', name: 'Finance', description: 'COD reconciliation, client billing and exports', icon: 'ri-money-dollar-circle-line', permissions: [...new Set([...READ_ALL, 'clients.manage', 'billing.manage', ...BASE])] },
  { key: 'support', name: 'Customer support', description: 'Order lookup, permitted holds and returns', icon: 'ri-customer-service-2-line', permissions: ['orders.read', 'orders.update', 'returns.read', 'returns.approve', 'shipping.read', 'products.read', 'inventory.read', ...BASE] },
  { key: 'viewer', name: 'Viewer', description: 'Read-only access to everything', icon: 'ri-eye-line', permissions: READ_ALL },
]
