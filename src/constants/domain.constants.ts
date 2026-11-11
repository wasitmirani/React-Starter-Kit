import type { Option } from '@/types/common.types'
import type { ChannelType, OrderStatus } from '@/types/commerce.types'
import { humanize } from './status.constants'

const opts = <V extends string>(values: readonly V[]): Option<V>[] => values.map((value) => ({ value, label: humanize(value) }))

export type OrderAction = 'validate' | 'hold' | 'release' | 'allocate' | 'cancel'

/**
 * Order state machine (plan §4.4): the actions each status allows. The UI only
 * offers these; the API validates the same transitions server-side.
 */
export const ORDER_ACTIONS: Record<OrderStatus, OrderAction[]> = {
  pending_validation: ['validate', 'hold', 'cancel'],
  on_hold: ['release', 'cancel'],
  ready_to_allocate: ['allocate', 'hold', 'cancel'],
  partially_allocated: ['allocate', 'hold', 'cancel'],
  allocated: ['hold', 'cancel'],
  picking: ['hold'],
  packed: [],
  dispatched: [],
  delivered: [],
  delivery_failed: [],
  returned: [],
  cancelled: [],
}

export const ORDER_ACTION_META: Record<OrderAction, { label: string; icon: string; permission: string; danger?: boolean }> = {
  validate: { label: 'Validate', icon: 'ri-checkbox-circle-line', permission: 'orders.update' },
  hold: { label: 'Place on hold', icon: 'ri-pause-circle-line', permission: 'orders.update' },
  release: { label: 'Release hold', icon: 'ri-play-circle-line', permission: 'orders.update' },
  allocate: { label: 'Allocate stock', icon: 'ri-stack-line', permission: 'orders.allocate' },
  cancel: { label: 'Cancel order', icon: 'ri-close-circle-line', permission: 'orders.cancel', danger: true },
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending_validation', 'on_hold', 'ready_to_allocate', 'partially_allocated', 'allocated', 'picking', 'packed', 'dispatched', 'delivered', 'delivery_failed', 'returned', 'cancelled',
]

/** Statuses in which an order is still being worked on (the "open" pipeline). */
export const OPEN_ORDER_STATUSES: OrderStatus[] = ['pending_validation', 'on_hold', 'ready_to_allocate', 'partially_allocated', 'allocated', 'picking', 'packed']

export const OPTIONS = {
  orderStatus: opts(ORDER_STATUSES),
  paymentMethod: opts(['cod', 'prepaid', 'bank_transfer'] as const),
  paymentStatus: opts(['pending', 'paid', 'cod_pending', 'cod_collected', 'refunded'] as const),
  priority: opts(['normal', 'high', 'urgent'] as const),
  currency: opts(['AED', 'SAR', 'USD', 'GBP', 'AUD', 'EUR', 'PKR'] as const).map((o) => ({ ...o, label: o.value })),
  productStatus: opts(['draft', 'active', 'archived'] as const),
  productType: opts(['simple', 'variant', 'bundle'] as const),
  channelType: opts(['first_party_storefront', 'custom_api', 'pos', 'b2b_portal', 'manual', 'csv_import', 'amazon', 'ebay', 'noon', 'walmart', 'etsy', 'tiktok_shop', 'trendyol', 'catch', 'kogan', 'daraz', 'shopify', 'woocommerce', 'salla', 'zid', 'bigcommerce', 'magento'] as const),
  connection: opts(['connected', 'error', 'disconnected'] as const),
  adjustmentReason: opts(['damage', 'count_correction', 'found', 'lost', 'expired', 'other'] as const),
  adjustmentStatus: opts(['pending_approval', 'approved', 'rejected'] as const),
  transferStatus: opts(['draft', 'in_transit', 'received', 'cancelled'] as const),
  countStatus: opts(['scheduled', 'in_progress', 'submitted', 'approved'] as const),
  countType: opts(['cycle', 'full'] as const),
  movementType: opts(['purchase_receipt', 'reservation', 'reservation_release', 'dispatch', 'customer_return', 'supplier_return', 'adjustment_increase', 'adjustment_decrease', 'damage', 'quarantine', 'transfer_dispatch', 'transfer_receipt', 'count_variance'] as const),
  reservationStatus: opts(['active', 'released', 'consumed'] as const),
  lotStatus: opts(['active', 'expired', 'quarantined'] as const),
  replenishmentStatus: opts(['open', 'ordered', 'dismissed'] as const),
  binType: opts(['storage', 'picking', 'receiving', 'packing', 'dispatch', 'quarantine', 'damaged'] as const),
  binStatus: opts(['active', 'blocked'] as const),
  receiptStatus: opts(['expected', 'receiving', 'inspecting', 'completed'] as const),
  taskType: opts(['putaway', 'pick', 'pack', 'replenish', 'count', 'move'] as const),
  taskStatus: opts(['open', 'assigned', 'in_progress', 'completed', 'exception'] as const),
  waveStatus: opts(['planned', 'released', 'picking', 'completed'] as const),
  waveStrategy: opts(['single_order', 'batch', 'zone', 'wave'] as const),
  packingStatus: opts(['open', 'verified', 'packed', 'exception'] as const),
  dispatchStatus: opts(['open', 'closed', 'handed_over'] as const),
  staffRole: opts(['picker', 'packer', 'receiver', 'dispatcher', 'supervisor'] as const),
  activeStatus: opts(['active', 'inactive'] as const),
  poStatus: opts(['draft', 'pending_approval', 'approved', 'partially_received', 'received', 'closed', 'cancelled'] as const),
  requisitionStatus: opts(['submitted', 'approved', 'rejected', 'converted'] as const),
  supplierReturnStatus: opts(['draft', 'shipped', 'credited'] as const),
  shipmentStatus: opts(['pending', 'booked', 'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'cancelled'] as const),
  codStatus: opts(['not_applicable', 'pending', 'collected', 'remitted'] as const),
  remittanceStatus: opts(['pending', 'received', 'reconciled', 'disputed'] as const),
  returnStatus: opts(['requested', 'approved', 'rejected', 'received', 'inspected', 'completed'] as const),
  returnCondition: opts(['sellable', 'damaged', 'missing', 'wrong_item'] as const),
  returnDisposition: opts(['restock', 'quarantine', 'dispose', 'supplier_return'] as const),
  clientStatus: opts(['active', 'onboarding', 'suspended'] as const),
  billableActivity: opts(['storage', 'receiving', 'putaway', 'pick', 'pack', 'dispatch', 'returns', 'vas'] as const),
  rateCardStatus: opts(['active', 'draft', 'retired'] as const),
  statementStatus: opts(['draft', 'issued', 'paid', 'overdue'] as const),
  connectorKind: opts(['marketplace', 'storefront', 'courier', 'payments', 'accounting', 'messaging', 'marketing'] as const),
  syncJobType: opts(['orders_import', 'inventory_publish', 'product_sync', 'tracking_pull', 'fulfillment_ack'] as const),
  syncJobStatus: opts(['queued', 'running', 'completed', 'failed', 'partial'] as const),
  failedEventStatus: opts(['failed', 'retrying', 'resolved', 'ignored'] as const),
  ruleStatus: opts(['active', 'paused', 'draft'] as const),
  ruleTrigger: opts(['order_imported', 'order_total_above', 'order_cancelled', 'inventory_below_reorder', 'stock_out', 'po_received', 'task_overdue', 'shipment_dispatched', 'shipment_delivered', 'delivery_failed', 'return_received', 'listing_error', 'marketplace_sla_risk', 'schedule_every_15_min', 'schedule_daily'] as const),
  ruleOperator: opts(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in'] as const),
  ruleAction: opts(['add_tag', 'place_hold', 'assign_warehouse', 'select_shipping_service', 'book_cheapest_courier', 'split_order', 'notify_user', 'set_priority', 'create_replenishment', 'create_purchase_order', 'sync_inventory_to_channels', 'update_listing_price', 'send_whatsapp', 'send_email', 'request_review', 'call_webhook'] as const),
  executionResult: opts(['success', 'skipped', 'failed', 'dry_run'] as const),
  listingStatus: opts(['live', 'pending', 'suppressed', 'error', 'inactive'] as const),
  storefrontStatus: opts(['published', 'draft', 'maintenance'] as const),
}

export const RULE_FIELDS: Option[] = opts(['channel', 'marketplace', 'region', 'warehouse', 'client', 'sku', 'category', 'order_total', 'destination_country', 'destination_city', 'payment_method', 'customer_tag'])

export const CHANNEL_META: Record<ChannelType, { label: string; icon: string }> = {
  first_party_storefront: { label: 'LinqWorks Direct storefront', icon: 'ri-store-2-line' },
  custom_api: { label: 'Custom API', icon: 'ri-code-s-slash-line' },
  pos: { label: 'POS', icon: 'ri-computer-line' },
  b2b_portal: { label: 'B2B portal', icon: 'ri-building-line' },
  manual: { label: 'Manual', icon: 'ri-edit-box-line' },
  csv_import: { label: 'CSV import', icon: 'ri-file-excel-2-line' },
  shopify: { label: 'Shopify', icon: 'ri-shopping-bag-line' },
  woocommerce: { label: 'WooCommerce', icon: 'ri-wordpress-line' },
  amazon: { label: 'Amazon', icon: 'ri-amazon-line' },
  daraz: { label: 'Daraz', icon: 'ri-store-3-line' },
  noon: { label: 'Noon', icon: 'ri-sun-line' },
  ebay: { label: 'eBay', icon: 'ri-auction-line' },
  walmart: { label: 'Walmart', icon: 'ri-store-line' },
  etsy: { label: 'Etsy', icon: 'ri-palette-line' },
  tiktok_shop: { label: 'TikTok Shop', icon: 'ri-tiktok-line' },
  trendyol: { label: 'Trendyol', icon: 'ri-t-shirt-line' },
  salla: { label: 'Salla', icon: 'ri-shopping-basket-line' },
  zid: { label: 'Zid', icon: 'ri-shopping-cart-line' },
  bigcommerce: { label: 'BigCommerce', icon: 'ri-store-2-line' },
  magento: { label: 'Adobe Commerce', icon: 'ri-stack-line' },
  catch: { label: 'Catch', icon: 'ri-store-3-line' },
  kogan: { label: 'Kogan', icon: 'ri-store-3-line' },
}

/** Couriers by market (plan §4.10); availability depends on merchant API access. */
export const CARRIERS = [
  { key: 'tcs', name: 'TCS', country: 'PK' },
  { key: 'leopards', name: 'Leopards Courier', country: 'PK' },
  { key: 'postex', name: 'PostEx', country: 'PK' },
  { key: 'trax', name: 'Trax', country: 'PK' },
  { key: 'mnp', name: 'M&P', country: 'PK' },
  { key: 'blueex', name: 'BlueEx', country: 'PK' },
  { key: 'aramex', name: 'Aramex', country: 'AE' },
  { key: 'dhl', name: 'DHL Express', country: 'AE' },
  { key: 'imile', name: 'iMile', country: 'AE' },
  { key: 'quiqup', name: 'Quiqup', country: 'AE' },
  { key: 'emirates_post', name: 'Emirates Post', country: 'AE' },
  { key: 'smsa', name: 'SMSA Express', country: 'SA' },
  { key: 'naqel', name: 'Naqel Express', country: 'SA' },
  { key: 'spl', name: 'SPL (Saudi Post)', country: 'SA' },
  { key: 'jt', name: 'J&T Express', country: 'SA' },
  { key: 'ups', name: 'UPS', country: 'US' },
  { key: 'fedex', name: 'FedEx', country: 'US' },
  { key: 'usps', name: 'USPS', country: 'US' },
  { key: 'royal_mail', name: 'Royal Mail', country: 'GB' },
  { key: 'evri', name: 'Evri', country: 'GB' },
  { key: 'dpd_uk', name: 'DPD UK', country: 'GB' },
  { key: 'auspost', name: 'Australia Post', country: 'AU' },
  { key: 'startrack', name: 'StarTrack', country: 'AU' },
  { key: 'sendle', name: 'Sendle', country: 'AU' },
] as const

export const TASK_ICONS: Record<string, string> = {
  putaway: 'ri-inbox-archive-line',
  pick: 'ri-hand-coin-line',
  pack: 'ri-archive-2-line',
  replenish: 'ri-refresh-line',
  count: 'ri-list-check-3',
  move: 'ri-arrow-left-right-line',
}
