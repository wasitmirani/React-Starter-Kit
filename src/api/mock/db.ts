import { MockCollection } from './collection'
import { seed, seedOf } from './seed'

type Seed = typeof seed
type Row<K extends keyof Seed> = Seed[K][number]

/** Typed collection backed by one slice of the seed. */
function make<K extends keyof Seed>(key: K, name: string, searchFields: (keyof Row<K>)[], defaultSort?: keyof Row<K> & string) {
  return new MockCollection<Row<K>>(name, { searchFields, defaultSort, seed: seedOf(key) as () => Row<K>[] })
}

/** All mock collections, stored per workspace. Only `src/api` may import this. */
export const db = {
  // commerce
  orders: make('orders', 'orders', ['number', 'externalId', 'customerName', 'customerPhone', 'customerEmail'], 'placedAt'),
  customers: make('customers', 'customers', ['name', 'email', 'phone', 'city'], 'lastOrderAt'),
  products: make('products', 'products', ['title', 'brand', 'category']),
  channels: make('channels', 'channels', ['name', 'type']),
  listings: make('listings', 'listings', ['sku', 'title', 'marketplace', 'externalId'], 'revenue30d'),
  storefronts: make('storefronts', 'storefronts', ['name', 'domain'], 'name'),
  imports: make('imports', 'imports', ['fileName']),
  // inventory
  balances: make('balances', 'balances', ['sku', 'productTitle', 'binCode'], 'sku'),
  ledger: make('ledger', 'ledger', ['sku', 'referenceNumber', 'actorName']),
  reservations: make('reservations', 'reservations', ['orderNumber', 'sku']),
  adjustments: make('adjustments', 'adjustments', ['number', 'note', 'requestedBy']),
  transfers: make('transfers', 'transfers', ['number']),
  stockCounts: make('stockCounts', 'stock-counts', ['number', 'zone', 'assigneeName']),
  lots: make('lots', 'lots', ['lotNumber', 'sku', 'productTitle'], 'expiresAt'),
  replenishment: make('replenishment', 'replenishment', ['sku', 'productTitle', 'supplierName']),
  // warehouse
  warehouses: make('warehouses', 'warehouses', ['code', 'name', 'city'], 'code'),
  locations: make('locations', 'locations', ['code', 'zone'], 'code'),
  receipts: make('receipts', 'receipts', ['number', 'purchaseOrderNumber', 'supplierName']),
  tasks: make('tasks', 'tasks', ['number', 'sku', 'productTitle', 'orderNumber', 'assigneeName'], 'dueAt'),
  waves: make('waves', 'waves', ['number']),
  packing: make('packing', 'packing', ['orderNumber', 'station', 'packerName']),
  dispatchBatches: make('dispatchBatches', 'dispatch', ['number', 'carrierName', 'driverName']),
  staff: make('staff', 'staff', ['name'], 'name'),
  // procurement
  suppliers: make('suppliers', 'suppliers', ['code', 'name', 'contactName', 'email'], 'name'),
  purchaseOrders: make('purchaseOrders', 'purchase-orders', ['number', 'supplierName']),
  requisitions: make('requisitions', 'requisitions', ['number', 'requestedBy', 'reason']),
  supplierReturns: make('supplierReturns', 'supplier-returns', ['number', 'supplierName']),
  // shipping and returns
  shipments: make('shipments', 'shipments', ['number', 'orderNumber', 'trackingNumber', 'destinationCity']),
  carriers: make('carriers', 'carriers', ['name', 'accountNumber'], 'name'),
  codRemittances: make('codRemittances', 'cod', ['number', 'carrierName']),
  returns: make('returns', 'returns', ['number', 'orderNumber', 'customerName']),
  // 3PL
  clients: make('clients', 'clients', ['code', 'name', 'contactName', 'email'], 'name'),
  rateCards: make('rateCards', 'rate-cards', ['name']),
  usage: make('usage', 'usage', ['clientName', 'reference']),
  statements: make('statements', 'statements', ['number', 'clientName']),
  // integrations and automation
  connectors: make('connectors', 'connectors', ['name', 'provider', 'account'], 'name'),
  syncJobs: make('syncJobs', 'sync-jobs', ['connectorName'], 'startedAt'),
  failedEvents: make('failedEvents', 'failed-events', ['source', 'eventType', 'externalId', 'error'], 'lastAttemptAt'),
  rules: make('rules', 'rules', ['name', 'description']),
  executions: make('executions', 'executions', ['ruleName', 'subject']),
  // platform
  webhooks: make('webhooks', 'webhooks', ['url', 'description']),
  deliveries: make('deliveries', 'webhook-deliveries', ['event']),
  invoices: make('invoices', 'invoices', ['number'], 'periodEnd'),
  notifications: make('notifications', 'notifications', ['title', 'body']),
}
