import type { AutomationRule } from '@/types/integration.types'

/** Ready-made automation flows. "Use template" creates a draft rule the merchant can review, dry-run and publish. */
export interface AutomationTemplate {
  id: string
  name: string
  summary: string
  category: 'Inventory' | 'Fulfilment' | 'Shipping' | 'Customer' | 'Finance' | 'Marketplace'
  icon: string
  regions: string[]
  /** App ids the flow works best with; shown as "Works with". */
  apps: string[]
  impact: string
  rule: Pick<AutomationRule, 'name' | 'description' | 'trigger' | 'conditions' | 'actions'>
  popular?: boolean
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'tpl-stock-sync', name: 'Sync stock to every channel', category: 'Inventory', icon: 'ri-refresh-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['amazon', 'ebay', 'noon', 'shopify'], impact: 'Prevents overselling across marketplaces', popular: true,
    summary: 'Every 15 minutes, publish available stock (minus safety stock) to Amazon, eBay, Noon and your stores.',
    rule: { name: 'Sync stock to all channels', description: 'Publish available quantity minus safety stock to every connected channel every 15 minutes.', trigger: 'schedule_every_15_min', conditions: [], actions: [{ type: 'sync_inventory_to_channels', value: 'All connected channels' }] },
  },
  {
    id: 'tpl-cheapest-courier', name: 'Book the cheapest courier', category: 'Shipping', icon: 'ri-truck-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['aramex', 'smsa', 'royal_mail', 'auspost', 'usps'], impact: 'Cuts shipping cost by 12–22%', popular: true,
    summary: 'When an order is packed, compare connected couriers for the destination and book the cheapest that meets the promised delivery date.',
    rule: { name: 'Auto-book cheapest courier', description: 'Rate-shop connected couriers and book the cheapest service that meets the delivery promise.', trigger: 'order_imported', conditions: [{ field: 'payment_method', operator: 'not_equals', value: 'cod' }], actions: [{ type: 'book_cheapest_courier', value: 'Meet promised date' }, { type: 'add_tag', value: 'auto_booked' }] },
  },
  {
    id: 'tpl-ksa-route', name: 'Route KSA orders to Riyadh', category: 'Fulfilment', icon: 'ri-route-line', regions: ['SA'], apps: ['noon', 'salla', 'smsa'], impact: '1 day faster delivery in Saudi Arabia', popular: true,
    summary: 'Allocate orders shipping to Saudi Arabia from your Riyadh warehouse and book SMSA.',
    rule: { name: 'Route KSA orders to Riyadh', description: 'Allocate Saudi orders from the Riyadh warehouse and book SMSA Express.', trigger: 'order_imported', conditions: [{ field: 'destination_country', operator: 'equals', value: 'SA' }], actions: [{ type: 'assign_warehouse', value: 'RUH-01' }, { type: 'select_shipping_service', value: 'SMSA Standard' }] },
  },
  {
    id: 'tpl-uae-route', name: 'Route UAE orders to Dubai', category: 'Fulfilment', icon: 'ri-route-line', regions: ['AE'], apps: ['amazon', 'noon', 'aramex'], impact: 'Next-day delivery across the Emirates',
    summary: 'Allocate UAE orders from Dubai South and choose Quiqup same-day for Dubai addresses.',
    rule: { name: 'Route UAE orders to Dubai', description: 'Allocate UAE orders from DXB-01; same-day courier for Dubai.', trigger: 'order_imported', conditions: [{ field: 'destination_country', operator: 'equals', value: 'AE' }], actions: [{ type: 'assign_warehouse', value: 'DXB-01' }, { type: 'select_shipping_service', value: 'Quiqup Same day' }] },
  },
  {
    id: 'tpl-cod-confirm', name: 'Confirm COD orders on WhatsApp', category: 'Customer', icon: 'ri-whatsapp-line', regions: ['AE', 'SA'], apps: ['whatsapp'], impact: 'Reduces COD returns (RTO) by up to 30%', popular: true,
    summary: 'Hold new COD orders and ask the customer to confirm on WhatsApp in Arabic or English; release when they reply.',
    rule: { name: 'Confirm COD orders on WhatsApp', description: 'Hold COD orders until the customer confirms on WhatsApp.', trigger: 'order_imported', conditions: [{ field: 'payment_method', operator: 'equals', value: 'cod' }], actions: [{ type: 'place_hold', value: 'Awaiting WhatsApp confirmation' }, { type: 'send_whatsapp', value: 'cod_confirmation_ar_en' }] },
  },
  {
    id: 'tpl-whatsapp-updates', name: 'WhatsApp delivery updates', category: 'Customer', icon: 'ri-chat-smile-2-line', regions: ['AE', 'SA', 'GB', 'AU', 'US'], apps: ['whatsapp'], impact: 'Fewer "where is my order" tickets',
    summary: 'Message customers with the tracking link when the parcel is dispatched.',
    rule: { name: 'WhatsApp dispatch update', description: 'Send the tracking link on dispatch.', trigger: 'shipment_dispatched', conditions: [], actions: [{ type: 'send_whatsapp', value: 'order_dispatched' }] },
  },
  {
    id: 'tpl-amazon-sla', name: 'Protect Amazon & Noon SLAs', category: 'Marketplace', icon: 'ri-timer-flash-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['amazon', 'noon'], impact: 'Keeps late-shipment rate under 4%', popular: true,
    summary: 'When a marketplace order is at risk of missing its ship-by date, make it urgent and alert the warehouse lead.',
    rule: { name: 'Marketplace SLA guard', description: 'Escalate marketplace orders close to their ship-by date.', trigger: 'marketplace_sla_risk', conditions: [{ field: 'marketplace', operator: 'in', value: 'Amazon, Noon' }], actions: [{ type: 'set_priority', value: 'urgent' }, { type: 'notify_user', value: 'Warehouse lead' }] },
  },
  {
    id: 'tpl-review-request', name: 'Request a review after delivery', category: 'Marketplace', icon: 'ri-star-smile-line', regions: ['US', 'GB', 'AU', 'AE', 'SA'], apps: ['amazon'], impact: 'More reviews, better ranking',
    summary: 'Five days after delivery, send the marketplace review request (Amazon "Request a Review").',
    rule: { name: 'Request review after delivery', description: 'Request a marketplace review 5 days after delivery.', trigger: 'shipment_delivered', conditions: [{ field: 'channel', operator: 'contains', value: 'Amazon' }], actions: [{ type: 'request_review', value: 'After 5 days' }] },
  },
  {
    id: 'tpl-low-stock-po', name: 'Low stock → draft purchase order', category: 'Inventory', icon: 'ri-file-list-3-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: [], impact: 'Never run out of best sellers',
    summary: 'When a SKU drops below its reorder point, draft a PO to the preferred supplier and notify purchasing.',
    rule: { name: 'Low stock purchase order', description: 'Draft a PO when stock falls below the reorder point.', trigger: 'inventory_below_reorder', conditions: [], actions: [{ type: 'create_purchase_order', value: '30 days of cover' }, { type: 'notify_user', value: 'Purchasing' }] },
  },
  {
    id: 'tpl-stockout-pause', name: 'Pause listings at stock-out', category: 'Marketplace', icon: 'ri-pause-circle-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['amazon', 'ebay', 'noon'], impact: 'Avoids cancellations and account health hits',
    summary: 'When a SKU sells out, push zero to every marketplace immediately instead of waiting for the next sync.',
    rule: { name: 'Zero out listings at stock-out', description: 'Publish zero stock everywhere the moment a SKU sells out.', trigger: 'stock_out', conditions: [], actions: [{ type: 'sync_inventory_to_channels', value: 'Push 0 now' }, { type: 'notify_user', value: 'Inventory manager' }] },
  },
  {
    id: 'tpl-fx-pricing', name: 'Multi-currency price sync', category: 'Marketplace', icon: 'ri-exchange-dollar-line', regions: ['AE', 'SA', 'GB', 'AU'], apps: ['amazon', 'ebay'], impact: 'Keeps margins stable across currencies',
    summary: 'Daily, convert your base price to AED, SAR, GBP and AUD with your margin and rounding rules, and update listings.',
    rule: { name: 'Daily multi-currency repricing', description: 'Recalculate local prices from the USD base price every day.', trigger: 'schedule_daily', conditions: [], actions: [{ type: 'update_listing_price', value: 'Base USD × FX + 3%, round to .99' }] },
  },
  {
    id: 'tpl-split', name: 'Split orders by warehouse', category: 'Fulfilment', icon: 'ri-git-branch-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: [], impact: 'Ships what is in stock without waiting',
    summary: 'When no single warehouse can fulfil an order, split it into shipments from the closest warehouses.',
    rule: { name: 'Split by warehouse', description: 'Split orders that one warehouse cannot fulfil.', trigger: 'order_imported', conditions: [{ field: 'order_total', operator: 'greater_than', value: '0' }], actions: [{ type: 'split_order', value: 'Closest warehouses first' }] },
  },
  {
    id: 'tpl-zatca', name: 'ZATCA e-invoice on dispatch', category: 'Finance', icon: 'ri-file-shield-2-line', regions: ['SA'], apps: ['zoho_books'], impact: 'Fatoora Phase 2 compliant invoices',
    summary: 'When a Saudi order ships, issue a ZATCA-compliant e-invoice and email it to the customer.',
    rule: { name: 'ZATCA e-invoice on dispatch', description: 'Issue a ZATCA e-invoice for Saudi orders on dispatch.', trigger: 'shipment_dispatched', conditions: [{ field: 'destination_country', operator: 'equals', value: 'SA' }], actions: [{ type: 'call_webhook', value: 'zatca.invoice.issue' }, { type: 'send_email', value: 'Tax invoice (AR/EN)' }] },
  },
  {
    id: 'tpl-high-value', name: 'Review high-value orders', category: 'Finance', icon: 'ri-shield-check-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: [], impact: 'Stops fraud before it ships',
    summary: 'Hold orders above a threshold for a manual check and tag them for the finance team.',
    rule: { name: 'High-value order review', description: 'Hold orders above 2,000 for manual review.', trigger: 'order_imported', conditions: [{ field: 'order_total', operator: 'greater_than', value: '2000' }], actions: [{ type: 'place_hold', value: 'High value review' }, { type: 'add_tag', value: 'fraud_check' }] },
  },
  {
    id: 'tpl-failed-delivery', name: 'Recover failed deliveries', category: 'Shipping', icon: 'ri-error-warning-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['whatsapp'], impact: 'Saves the sale before it returns',
    summary: 'When a delivery fails, message the customer to reschedule and alert support.',
    rule: { name: 'Failed delivery recovery', description: 'Ask the customer to reschedule and notify support.', trigger: 'delivery_failed', conditions: [], actions: [{ type: 'send_whatsapp', value: 'delivery_reschedule' }, { type: 'notify_user', value: 'Customer support' }, { type: 'add_tag', value: 'delivery_failed' }] },
  },
  {
    id: 'tpl-listing-error', name: 'Fix listing errors fast', category: 'Marketplace', icon: 'ri-alert-line', regions: ['AE', 'SA', 'US', 'GB', 'AU'], apps: ['amazon', 'ebay', 'noon', 'slack'], impact: 'Suppressed listings back live sooner',
    summary: 'When a marketplace suppresses a listing, alert the catalog team in Slack with the reason.',
    rule: { name: 'Listing error alert', description: 'Alert the catalog team when a listing is suppressed.', trigger: 'listing_error', conditions: [], actions: [{ type: 'notify_user', value: 'Catalog team' }, { type: 'call_webhook', value: 'slack #catalog' }] },
  },
]

export const TEMPLATE_CATEGORIES = ['Inventory', 'Fulfilment', 'Shipping', 'Customer', 'Finance', 'Marketplace'] as const
