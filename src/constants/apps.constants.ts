import type { ConnectorKind } from '@/types/integration.types'
import type { RegionCode } from './regions.constants'

/**
 * Plug-and-play app catalog. Installing an app creates a connector for one account
 * in one market; the connector then appears under Integrations → Connectors and its
 * jobs under Sync jobs. Brand names are shown as text tiles, never as logos.
 */
export interface AppDefinition {
  id: string
  name: string
  kind: ConnectorKind
  vendor: string
  tagline: string
  description: string
  regions: RegionCode[]
  capabilities: string[]
  /** Background colour of the initials tile. */
  color: string
  initials: string
  auth: 'oauth' | 'api_key'
  /** Lowest plan that includes the app. */
  plan: 'starter' | 'business' | 'enterprise'
  setupMinutes: number
  popular?: boolean
  isNew?: boolean
  /** Automation template ids suggested right after install. */
  recipes?: string[]
  /** Per-market account label (Seller ID, Merchant ID, Store URL…). */
  accountLabel: string
}

export const APP_KINDS: { value: ConnectorKind; label: string; icon: string; description: string }[] = [
  { value: 'marketplace', label: 'Marketplaces', icon: 'ri-store-3-line', description: 'Sell on Amazon, eBay, Noon and more from one catalog' },
  { value: 'storefront', label: 'Storefronts', icon: 'ri-store-2-line', description: 'Sync your own web stores' },
  { value: 'courier', label: 'Couriers', icon: 'ri-truck-line', description: 'Book, label and track with local carriers' },
  { value: 'payments', label: 'Payments & BNPL', icon: 'ri-bank-card-line', description: 'Reconcile payouts, COD and BNPL' },
  { value: 'accounting', label: 'Accounting & tax', icon: 'ri-calculator-line', description: 'Post invoices, fees and VAT' },
  { value: 'messaging', label: 'Messaging', icon: 'ri-chat-3-line', description: 'Order updates on WhatsApp, SMS and Slack' },
  { value: 'marketing', label: 'Marketing', icon: 'ri-megaphone-line', description: 'Product feeds and customer flows' },
]

const ALL: RegionCode[] = ['AE', 'SA', 'US', 'GB', 'AU']

export const APP_CATALOG: AppDefinition[] = [
  // ---------- marketplaces ----------
  { id: 'amazon', name: 'Amazon Seller Central', kind: 'marketplace', vendor: 'Amazon SP-API', tagline: 'Orders, FBA/FBM stock, listings and buy box', description: 'Import orders every 2 minutes, publish stock to FBM offers, mirror FBA inventory, manage prices and track buy-box share across Amazon.ae, Amazon.sa, Amazon.com, Amazon.co.uk and Amazon.com.au.', regions: ['AE', 'SA', 'US', 'GB', 'AU'], capabilities: ['Order import', 'Inventory publish', 'FBA inventory', 'Listings', 'Repricing', 'Returns', 'Fulfillment ack'], color: '#232F3E', initials: 'a', auth: 'oauth', plan: 'starter', setupMinutes: 5, popular: true, recipes: ['tpl-stock-sync', 'tpl-amazon-sla', 'tpl-review-request'], accountLabel: 'Seller ID' },
  { id: 'ebay', name: 'eBay', kind: 'marketplace', vendor: 'eBay Sell APIs', tagline: 'Listings, orders and stock across eBay sites', description: 'Create and revise listings from the shared catalog, import paid orders, push tracking back and keep quantities in sync on eBay.com, eBay.co.uk and eBay.com.au.', regions: ['US', 'GB', 'AU'], capabilities: ['Order import', 'Inventory publish', 'Listings', 'Fulfillment ack', 'Returns'], color: '#E53238', initials: 'eB', auth: 'oauth', plan: 'starter', setupMinutes: 4, popular: true, recipes: ['tpl-stock-sync', 'tpl-cheapest-courier'], accountLabel: 'eBay user ID' },
  { id: 'noon', name: 'Noon', kind: 'marketplace', vendor: 'Noon Partner API', tagline: 'Noon UAE and KSA orders, FBN and stock', description: 'Pull orders for Noon UAE and Noon KSA, publish stock for merchant-fulfilled offers, track FBN inventory and push AWB numbers back automatically.', regions: ['AE', 'SA'], capabilities: ['Order import', 'Inventory publish', 'FBN inventory', 'Listings', 'Fulfillment ack'], color: '#FEEE00', initials: 'no', auth: 'api_key', plan: 'starter', setupMinutes: 6, popular: true, recipes: ['tpl-stock-sync', 'tpl-ksa-route'], accountLabel: 'Partner ID' },
  { id: 'walmart', name: 'Walmart Marketplace', kind: 'marketplace', vendor: 'Walmart Seller API', tagline: 'US marketplace orders, items and inventory', description: 'Import Walmart.com orders, acknowledge and ship them with tracking, and sync item inventory and prices.', regions: ['US'], capabilities: ['Order import', 'Inventory publish', 'Listings', 'Fulfillment ack'], color: '#0071CE', initials: 'W', auth: 'api_key', plan: 'business', setupMinutes: 8, recipes: ['tpl-stock-sync'], accountLabel: 'Partner ID' },
  { id: 'etsy', name: 'Etsy', kind: 'marketplace', vendor: 'Etsy Open API v3', tagline: 'Handmade and vintage shop orders', description: 'Sync Etsy shop receipts, variations and stock; mark orders shipped with tracking.', regions: ['US', 'GB', 'AU'], capabilities: ['Order import', 'Inventory publish', 'Fulfillment ack'], color: '#F1641E', initials: 'Et', auth: 'oauth', plan: 'starter', setupMinutes: 3, accountLabel: 'Shop name' },
  { id: 'tiktok_shop', name: 'TikTok Shop', kind: 'marketplace', vendor: 'TikTok Shop Partner API', tagline: 'Social commerce orders and stock', description: 'Import TikTok Shop orders, publish stock and push shipping info for the US and UK shops.', regions: ['US', 'GB'], capabilities: ['Order import', 'Inventory publish', 'Fulfillment ack'], color: '#111111', initials: 'TT', auth: 'oauth', plan: 'business', setupMinutes: 5, isNew: true, accountLabel: 'Shop ID' },
  { id: 'trendyol', name: 'Trendyol', kind: 'marketplace', vendor: 'Trendyol Seller API', tagline: 'Fashion and lifestyle in the GCC', description: 'Import Trendyol GCC orders and keep stock and prices in sync for the UAE and Saudi storefronts.', regions: ['AE', 'SA'], capabilities: ['Order import', 'Inventory publish', 'Listings'], color: '#F27A1A', initials: 'Tr', auth: 'api_key', plan: 'business', setupMinutes: 6, isNew: true, accountLabel: 'Supplier ID' },
  { id: 'namshi', name: 'Namshi', kind: 'marketplace', vendor: 'Namshi Seller Center', tagline: 'Fashion marketplace for UAE and KSA', description: 'Receive Namshi orders, push stock and confirm shipments for fashion and beauty catalogs.', regions: ['AE', 'SA'], capabilities: ['Order import', 'Inventory publish'], color: '#000000', initials: 'Na', auth: 'api_key', plan: 'business', setupMinutes: 6, accountLabel: 'Seller ID' },
  { id: 'catch', name: 'Catch', kind: 'marketplace', vendor: 'Mirakl', tagline: 'Australian marketplace orders and offers', description: 'Import Catch.com.au orders and sync offers, stock and prices through the Mirakl seller API.', regions: ['AU'], capabilities: ['Order import', 'Inventory publish', 'Listings'], color: '#0A68FF', initials: 'Ca', auth: 'api_key', plan: 'business', setupMinutes: 5, accountLabel: 'Shop ID' },
  { id: 'kogan', name: 'Kogan', kind: 'marketplace', vendor: 'Kogan Marketplace API', tagline: 'Australian marketplace orders', description: 'Import Kogan.com orders and keep stock in sync.', regions: ['AU'], capabilities: ['Order import', 'Inventory publish'], color: '#E4002B', initials: 'Ko', auth: 'api_key', plan: 'business', setupMinutes: 5, accountLabel: 'Seller ID' },
  { id: 'onbuy', name: 'OnBuy', kind: 'marketplace', vendor: 'OnBuy API', tagline: 'UK marketplace orders and listings', description: 'Import OnBuy orders, publish listings and stock for the UK.', regions: ['GB'], capabilities: ['Order import', 'Inventory publish', 'Listings'], color: '#2A2F86', initials: 'OB', auth: 'api_key', plan: 'business', setupMinutes: 5, accountLabel: 'Seller ID' },

  // ---------- storefronts ----------
  { id: 'shopify', name: 'Shopify', kind: 'storefront', vendor: 'Shopify Admin API', tagline: 'Orders, products and multi-location stock', description: 'Two-way sync with Shopify: import orders, publish stock per location, create fulfillments with tracking and keep products in step.', regions: ALL, capabilities: ['Order import', 'Inventory publish', 'Product sync', 'Fulfillment ack'], color: '#5E8E3E', initials: 'Sh', auth: 'oauth', plan: 'starter', setupMinutes: 2, popular: true, recipes: ['tpl-stock-sync', 'tpl-whatsapp-updates'], accountLabel: 'Store domain' },
  { id: 'woocommerce', name: 'WooCommerce', kind: 'storefront', vendor: 'WooCommerce REST API', tagline: 'WordPress stores', description: 'Import WooCommerce orders and push stock and order status back with consumer key credentials.', regions: ALL, capabilities: ['Order import', 'Inventory publish', 'Fulfillment ack'], color: '#7F54B3', initials: 'Wo', auth: 'api_key', plan: 'starter', setupMinutes: 4, popular: true, accountLabel: 'Store URL' },
  { id: 'salla', name: 'Salla', kind: 'storefront', vendor: 'Salla Partners API', tagline: 'Saudi e-commerce platform', description: 'Sync Salla stores: orders, stock, products and shipment status, with Arabic product data preserved.', regions: ['SA', 'AE'], capabilities: ['Order import', 'Inventory publish', 'Product sync', 'Fulfillment ack'], color: '#004D5A', initials: 'سلة', auth: 'oauth', plan: 'starter', setupMinutes: 3, popular: true, recipes: ['tpl-ksa-route', 'tpl-zatca'], accountLabel: 'Store ID' },
  { id: 'zid', name: 'Zid', kind: 'storefront', vendor: 'Zid API', tagline: 'Saudi store builder', description: 'Import Zid orders and keep stock and order status in sync for Saudi merchants.', regions: ['SA'], capabilities: ['Order import', 'Inventory publish', 'Fulfillment ack'], color: '#5B2A86', initials: 'زد', auth: 'oauth', plan: 'starter', setupMinutes: 3, accountLabel: 'Store ID' },
  { id: 'bigcommerce', name: 'BigCommerce', kind: 'storefront', vendor: 'BigCommerce API', tagline: 'Headless and multi-storefront', description: 'Orders, stock and shipments for BigCommerce stores, including multi-storefront channels.', regions: ['US', 'GB', 'AU'], capabilities: ['Order import', 'Inventory publish', 'Product sync', 'Fulfillment ack'], color: '#121118', initials: 'BC', auth: 'oauth', plan: 'business', setupMinutes: 4, accountLabel: 'Store hash' },
  { id: 'magento', name: 'Adobe Commerce (Magento)', kind: 'storefront', vendor: 'Magento REST API', tagline: 'Enterprise stores and B2B', description: 'Import orders and push shipments and stock to Magento 2 / Adobe Commerce.', regions: ALL, capabilities: ['Order import', 'Inventory publish', 'Fulfillment ack'], color: '#EE672F', initials: 'Mg', auth: 'api_key', plan: 'business', setupMinutes: 10, accountLabel: 'Base URL' },
  { id: 'wix', name: 'Wix eCommerce', kind: 'storefront', vendor: 'Wix Stores API', tagline: 'Small business stores', description: 'Sync Wix Stores orders and inventory.', regions: ALL, capabilities: ['Order import', 'Inventory publish'], color: '#0C6EFC', initials: 'Wx', auth: 'oauth', plan: 'starter', setupMinutes: 3, accountLabel: 'Site ID' },

  // ---------- couriers ----------
  { id: 'aramex', name: 'Aramex', kind: 'courier', vendor: 'Aramex Shipping API', tagline: 'GCC and international express', description: 'Rates, AWB booking, labels, pickups, COD and tracking across the UAE, KSA and international lanes.', regions: ['AE', 'SA', 'AU'], capabilities: ['Rates', 'Booking', 'Labels', 'Tracking', 'COD', 'Pickups'], color: '#E2231A', initials: 'Ax', auth: 'api_key', plan: 'starter', setupMinutes: 5, popular: true, accountLabel: 'Account number' },
  { id: 'smsa', name: 'SMSA Express', kind: 'courier', vendor: 'SMSA API', tagline: 'Saudi domestic and GCC', description: 'Book SMSA shipments, print labels, collect COD and track deliveries across Saudi Arabia.', regions: ['SA', 'AE'], capabilities: ['Booking', 'Labels', 'Tracking', 'COD'], color: '#0B4DA2', initials: 'SM', auth: 'api_key', plan: 'starter', setupMinutes: 5, popular: true, accountLabel: 'Pass key' },
  { id: 'naqel', name: 'Naqel Express', kind: 'courier', vendor: 'Naqel API', tagline: 'Saudi e-commerce last mile', description: 'Waybills, COD and tracking for Saudi Arabia with Naqel.', regions: ['SA'], capabilities: ['Booking', 'Labels', 'Tracking', 'COD'], color: '#00843D', initials: 'Nq', auth: 'api_key', plan: 'starter', setupMinutes: 6, accountLabel: 'Client ID' },
  { id: 'spl', name: 'SPL (Saudi Post)', kind: 'courier', vendor: 'SPL API', tagline: 'National address and nationwide reach', description: 'Book SPL parcels, validate national addresses and track deliveries.', regions: ['SA'], capabilities: ['Booking', 'Labels', 'Tracking', 'Address validation'], color: '#00A651', initials: 'SP', auth: 'api_key', plan: 'business', setupMinutes: 8, accountLabel: 'Customer number' },
  { id: 'jt', name: 'J&T Express', kind: 'courier', vendor: 'J&T Open API', tagline: 'Low-cost GCC delivery', description: 'Economy COD and prepaid delivery across the UAE and KSA.', regions: ['AE', 'SA'], capabilities: ['Booking', 'Labels', 'Tracking', 'COD'], color: '#D7000F', initials: 'J&T', auth: 'api_key', plan: 'starter', setupMinutes: 5, accountLabel: 'Customer code' },
  { id: 'emirates_post', name: 'Emirates Post', kind: 'courier', vendor: 'EPG API', tagline: 'UAE national post', description: 'Domestic and international parcels from the UAE.', regions: ['AE'], capabilities: ['Booking', 'Labels', 'Tracking'], color: '#C8102E', initials: 'EP', auth: 'api_key', plan: 'starter', setupMinutes: 6, accountLabel: 'Account number' },
  { id: 'quiqup', name: 'Quiqup', kind: 'courier', vendor: 'Quiqup API', tagline: 'Same-day delivery in Dubai', description: 'Same-day and next-day delivery in the UAE with live tracking.', regions: ['AE'], capabilities: ['Booking', 'Tracking', 'Same day', 'COD'], color: '#FF5A5F', initials: 'Qq', auth: 'api_key', plan: 'starter', setupMinutes: 4, isNew: true, accountLabel: 'API client ID' },
  { id: 'imile', name: 'iMile', kind: 'courier', vendor: 'iMile API', tagline: 'GCC e-commerce delivery', description: 'COD-friendly delivery across the UAE and KSA.', regions: ['AE', 'SA'], capabilities: ['Booking', 'Labels', 'Tracking', 'COD'], color: '#0052D9', initials: 'iM', auth: 'api_key', plan: 'starter', setupMinutes: 5, accountLabel: 'Customer ID' },
  { id: 'dhl', name: 'DHL Express', kind: 'courier', vendor: 'MyDHL API', tagline: 'International express', description: 'International rates, paperless trade, duties estimates, labels and tracking.', regions: ALL, capabilities: ['Rates', 'Booking', 'Labels', 'Tracking', 'Customs', 'Pickups'], color: '#FFCC00', initials: 'DHL', auth: 'api_key', plan: 'starter', setupMinutes: 6, popular: true, accountLabel: 'Account number' },
  { id: 'fedex', name: 'FedEx', kind: 'courier', vendor: 'FedEx Ship API', tagline: 'US domestic and international', description: 'Ground, Express and International with rates, labels and tracking.', regions: ['US', 'GB', 'AE', 'AU'], capabilities: ['Rates', 'Booking', 'Labels', 'Tracking', 'Customs'], color: '#4D148C', initials: 'Fx', auth: 'api_key', plan: 'starter', setupMinutes: 6, accountLabel: 'Account number' },
  { id: 'ups', name: 'UPS', kind: 'courier', vendor: 'UPS API', tagline: 'Ground and air in the US and UK', description: 'Rates, labels, pickups and tracking for UPS Ground, 2nd Day Air and international.', regions: ['US', 'GB'], capabilities: ['Rates', 'Booking', 'Labels', 'Tracking', 'Pickups'], color: '#351C15', initials: 'UPS', auth: 'oauth', plan: 'starter', setupMinutes: 6, accountLabel: 'Shipper number' },
  { id: 'usps', name: 'USPS', kind: 'courier', vendor: 'USPS Web Tools', tagline: 'Ground Advantage and Priority Mail', description: 'Low-cost US domestic labels with commercial pricing and tracking.', regions: ['US'], capabilities: ['Rates', 'Labels', 'Tracking'], color: '#333366', initials: 'US', auth: 'api_key', plan: 'starter', setupMinutes: 4, accountLabel: 'CRID' },
  { id: 'royal_mail', name: 'Royal Mail', kind: 'courier', vendor: 'Click & Drop API', tagline: 'Tracked 24/48 across the UK', description: 'Create Royal Mail Tracked 24/48 labels via Click & Drop and pull tracking.', regions: ['GB'], capabilities: ['Labels', 'Tracking', 'Manifests'], color: '#DA202A', initials: 'RM', auth: 'api_key', plan: 'starter', setupMinutes: 4, popular: true, accountLabel: 'Click & Drop key' },
  { id: 'evri', name: 'Evri', kind: 'courier', vendor: 'Evri API', tagline: 'Low-cost UK parcels', description: 'Economy UK delivery with ParcelShop drop-off and tracking.', regions: ['GB'], capabilities: ['Booking', 'Labels', 'Tracking'], color: '#007BC4', initials: 'Ev', auth: 'api_key', plan: 'starter', setupMinutes: 5, accountLabel: 'Client ID' },
  { id: 'dpd_uk', name: 'DPD UK', kind: 'courier', vendor: 'DPD API', tagline: 'Predict 1-hour delivery window', description: 'Next-day UK delivery with Predict notifications.', regions: ['GB'], capabilities: ['Booking', 'Labels', 'Tracking'], color: '#DC0032', initials: 'DPD', auth: 'api_key', plan: 'starter', setupMinutes: 5, accountLabel: 'Account number' },
  { id: 'auspost', name: 'Australia Post', kind: 'courier', vendor: 'Shipping & Tracking API', tagline: 'eParcel and Express Post', description: 'Book eParcel and Express Post, print labels, lodge manifests and track.', regions: ['AU'], capabilities: ['Rates', 'Booking', 'Labels', 'Tracking', 'Manifests'], color: '#DC1928', initials: 'AP', auth: 'api_key', plan: 'starter', setupMinutes: 6, popular: true, accountLabel: 'Account number' },
  { id: 'startrack', name: 'StarTrack', kind: 'courier', vendor: 'StarTrack API', tagline: 'Business-to-business freight in Australia', description: 'Premium and road express for heavier parcels in Australia.', regions: ['AU'], capabilities: ['Booking', 'Labels', 'Tracking'], color: '#1D1D1B', initials: 'ST', auth: 'api_key', plan: 'business', setupMinutes: 6, accountLabel: 'Account number' },
  { id: 'sendle', name: 'Sendle', kind: 'courier', vendor: 'Sendle API', tagline: 'Carbon-neutral small business delivery', description: 'Flat-rate door-to-door delivery for small businesses in Australia and the US.', regions: ['AU', 'US'], capabilities: ['Rates', 'Booking', 'Labels', 'Tracking'], color: '#00B5A5', initials: 'Se', auth: 'api_key', plan: 'starter', setupMinutes: 3, accountLabel: 'Sendle ID' },
  { id: 'couriers_please', name: 'CouriersPlease', kind: 'courier', vendor: 'CP API', tagline: 'Metro delivery in Australia', description: 'Low-cost metro parcels and ParcelConnect pickup points.', regions: ['AU'], capabilities: ['Booking', 'Labels', 'Tracking'], color: '#F28C00', initials: 'CP', auth: 'api_key', plan: 'starter', setupMinutes: 5, accountLabel: 'Account code' },

  // ---------- payments ----------
  { id: 'stripe', name: 'Stripe', kind: 'payments', vendor: 'Stripe', tagline: 'Card payments and payouts', description: 'Match Stripe charges, refunds and payouts to orders for clean reconciliation.', regions: ALL, capabilities: ['Payment capture', 'Refunds', 'Payout reconciliation'], color: '#635BFF', initials: 'S', auth: 'oauth', plan: 'starter', setupMinutes: 2, popular: true, accountLabel: 'Account ID' },
  { id: 'tabby', name: 'Tabby', kind: 'payments', vendor: 'Tabby', tagline: 'Buy now, pay later in the GCC', description: 'Capture and refund Tabby payments on dispatch and return; reconcile settlements.', regions: ['AE', 'SA'], capabilities: ['Capture on dispatch', 'Refunds', 'Settlements'], color: '#3BFFC1', initials: 'ta', auth: 'api_key', plan: 'starter', setupMinutes: 3, popular: true, accountLabel: 'Merchant code' },
  { id: 'tamara', name: 'Tamara', kind: 'payments', vendor: 'Tamara', tagline: 'Split in 3 or 4 in KSA and UAE', description: 'Authorise, capture on shipment and refund Tamara orders automatically.', regions: ['SA', 'AE'], capabilities: ['Capture on dispatch', 'Refunds', 'Settlements'], color: '#E9B9A0', initials: 'Tm', auth: 'api_key', plan: 'starter', setupMinutes: 3, accountLabel: 'Merchant ID' },
  { id: 'checkout', name: 'Checkout.com', kind: 'payments', vendor: 'Checkout.com', tagline: 'Enterprise card acquiring', description: 'Card payments, mada and Apple Pay with automated captures and refunds.', regions: ['AE', 'SA', 'GB'], capabilities: ['Payment capture', 'Refunds', 'mada', 'Apple Pay'], color: '#186AFF', initials: 'Co', auth: 'api_key', plan: 'business', setupMinutes: 5, accountLabel: 'Processing channel' },
  { id: 'afterpay', name: 'Afterpay / Clearpay', kind: 'payments', vendor: 'Afterpay', tagline: 'BNPL in Australia, US and UK', description: 'Capture and refund Afterpay (Clearpay in the UK) orders.', regions: ['AU', 'US', 'GB'], capabilities: ['Capture on dispatch', 'Refunds'], color: '#B2FCE4', initials: 'Af', auth: 'api_key', plan: 'business', setupMinutes: 4, accountLabel: 'Merchant ID' },
  { id: 'paypal', name: 'PayPal', kind: 'payments', vendor: 'PayPal', tagline: 'Wallet payments and disputes', description: 'Reconcile PayPal transactions and push tracking to protect against disputes.', regions: ALL, capabilities: ['Payout reconciliation', 'Tracking upload'], color: '#003087', initials: 'PP', auth: 'oauth', plan: 'starter', setupMinutes: 2, accountLabel: 'Merchant ID' },

  // ---------- accounting and tax ----------
  { id: 'xero', name: 'Xero', kind: 'accounting', vendor: 'Xero', tagline: 'Invoices, fees and COGS journals', description: 'Post daily sales summaries, marketplace fees, refunds and COGS to Xero with tax codes per market.', regions: ['GB', 'AU', 'US', 'AE'], capabilities: ['Sales journals', 'Fees', 'COGS', 'Tax codes'], color: '#13B5EA', initials: 'X', auth: 'oauth', plan: 'business', setupMinutes: 5, popular: true, accountLabel: 'Organisation' },
  { id: 'quickbooks', name: 'QuickBooks Online', kind: 'accounting', vendor: 'Intuit', tagline: 'Sales receipts and inventory value', description: 'Create sales receipts, refunds and fee expenses in QuickBooks Online.', regions: ['US', 'GB', 'AU'], capabilities: ['Sales receipts', 'Fees', 'COGS'], color: '#2CA01C', initials: 'qb', auth: 'oauth', plan: 'business', setupMinutes: 5, accountLabel: 'Company ID' },
  { id: 'zoho_books', name: 'Zoho Books', kind: 'accounting', vendor: 'Zoho', tagline: 'GCC VAT and ZATCA e-invoicing', description: 'Post invoices with UAE VAT and ZATCA Phase 2 e-invoicing for Saudi Arabia.', regions: ['AE', 'SA'], capabilities: ['Invoices', 'ZATCA e-invoicing', 'VAT returns'], color: '#E42527', initials: 'Zo', auth: 'oauth', plan: 'business', setupMinutes: 6, recipes: ['tpl-zatca'], accountLabel: 'Organization ID' },
  { id: 'avalara', name: 'Avalara', kind: 'accounting', vendor: 'Avalara AvaTax', tagline: 'US sales tax by state', description: 'Calculate and commit US sales tax per order and track nexus thresholds.', regions: ['US'], capabilities: ['Tax calculation', 'Nexus tracking', 'Filing export'], color: '#FF6600', initials: 'Av', auth: 'api_key', plan: 'enterprise', setupMinutes: 10, accountLabel: 'Account ID' },

  // ---------- messaging ----------
  { id: 'whatsapp', name: 'WhatsApp Business', kind: 'messaging', vendor: 'Meta Cloud API', tagline: 'Order, COD and delivery updates', description: 'Send approved templates for order confirmation, COD verification, out-for-delivery and review requests, in Arabic and English.', regions: ALL, capabilities: ['Order updates', 'COD confirmation', 'Delivery alerts', 'Arabic templates'], color: '#25D366', initials: 'WA', auth: 'oauth', plan: 'starter', setupMinutes: 8, popular: true, recipes: ['tpl-whatsapp-updates', 'tpl-cod-confirm'], accountLabel: 'Phone number ID' },
  { id: 'twilio', name: 'Twilio SMS', kind: 'messaging', vendor: 'Twilio', tagline: 'SMS notifications worldwide', description: 'Transactional SMS for order and delivery updates.', regions: ALL, capabilities: ['Order updates', 'Delivery alerts'], color: '#F22F46', initials: 'Tw', auth: 'api_key', plan: 'starter', setupMinutes: 3, accountLabel: 'Account SID' },
  { id: 'slack', name: 'Slack', kind: 'messaging', vendor: 'Slack', tagline: 'Ops alerts in your channels', description: 'Post sync failures, low stock and SLA risks to Slack channels.', regions: ALL, capabilities: ['Alerts', 'Daily digest'], color: '#4A154B', initials: 'Sl', auth: 'oauth', plan: 'starter', setupMinutes: 1, accountLabel: 'Workspace' },

  // ---------- marketing ----------
  { id: 'klaviyo', name: 'Klaviyo', kind: 'marketing', vendor: 'Klaviyo', tagline: 'Post-purchase and back-in-stock flows', description: 'Send fulfilment events and back-in-stock signals to Klaviyo flows.', regions: ALL, capabilities: ['Fulfilment events', 'Back in stock'], color: '#1D1D1B', initials: 'K', auth: 'api_key', plan: 'business', setupMinutes: 3, accountLabel: 'Public key' },
  { id: 'google_merchant', name: 'Google Merchant Center', kind: 'marketing', vendor: 'Content API', tagline: 'Shopping feeds with live stock', description: 'Publish product feeds per country with accurate price and availability.', regions: ALL, capabilities: ['Product feed', 'Local inventory'], color: '#4285F4', initials: 'G', auth: 'oauth', plan: 'business', setupMinutes: 5, accountLabel: 'Merchant ID' },
  { id: 'meta_catalog', name: 'Meta Commerce', kind: 'marketing', vendor: 'Meta Catalog API', tagline: 'Instagram and Facebook shops', description: 'Keep Facebook and Instagram catalogs in sync with stock and price.', regions: ALL, capabilities: ['Product feed', 'Stock sync'], color: '#0866FF', initials: 'Me', auth: 'oauth', plan: 'business', setupMinutes: 4, accountLabel: 'Catalog ID' },
]

export const appById = (id: string) => APP_CATALOG.find((a) => a.id === id)

/** Courier figures used by the rate shopper (indicative, refined by live rates once connected). */
export interface CourierProfile {
  appId: string
  service: string
  regions: string[]
  baseUsd: number
  perKgUsd: number
  transit: string
  cod: boolean
  international: boolean
  tags: string[]
}

export const COURIER_PROFILES: CourierProfile[] = [
  { appId: 'aramex', service: 'Domestic Express', regions: ['AE', 'SA'], baseUsd: 5.2, perKgUsd: 0.9, transit: '1–2 days', cod: true, international: true, tags: ['COD', 'Pickups'] },
  { appId: 'smsa', service: 'SMSA Standard', regions: ['SA'], baseUsd: 4.3, perKgUsd: 0.7, transit: '1–3 days', cod: true, international: false, tags: ['COD'] },
  { appId: 'naqel', service: 'E-commerce', regions: ['SA'], baseUsd: 3.9, perKgUsd: 0.8, transit: '2–3 days', cod: true, international: false, tags: ['COD', 'Lowest cost'] },
  { appId: 'spl', service: 'Parcel', regions: ['SA'], baseUsd: 3.5, perKgUsd: 1.1, transit: '2–5 days', cod: false, international: false, tags: ['National address'] },
  { appId: 'jt', service: 'Economy', regions: ['AE', 'SA'], baseUsd: 3.4, perKgUsd: 0.6, transit: '2–4 days', cod: true, international: false, tags: ['COD', 'Lowest cost'] },
  { appId: 'emirates_post', service: 'Domestic parcel', regions: ['AE'], baseUsd: 4.1, perKgUsd: 0.8, transit: '2–3 days', cod: false, international: true, tags: [] },
  { appId: 'quiqup', service: 'Same day', regions: ['AE'], baseUsd: 7.9, perKgUsd: 0.5, transit: 'Same day', cod: true, international: false, tags: ['Same day', 'COD'] },
  { appId: 'imile', service: 'Standard', regions: ['AE', 'SA'], baseUsd: 3.7, perKgUsd: 0.7, transit: '1–3 days', cod: true, international: false, tags: ['COD'] },
  { appId: 'dhl', service: 'Express Worldwide', regions: ['AE', 'SA', 'US', 'GB', 'AU'], baseUsd: 18.5, perKgUsd: 6.4, transit: '1–3 days', cod: false, international: true, tags: ['International', 'Fastest'] },
  { appId: 'fedex', service: 'Ground / Intl Priority', regions: ['US', 'GB', 'AE', 'AU'], baseUsd: 9.8, perKgUsd: 1.6, transit: '1–5 days', cod: false, international: true, tags: ['International'] },
  { appId: 'ups', service: 'Ground', regions: ['US', 'GB'], baseUsd: 9.4, perKgUsd: 1.5, transit: '1–5 days', cod: false, international: true, tags: [] },
  { appId: 'usps', service: 'Ground Advantage', regions: ['US'], baseUsd: 5.1, perKgUsd: 1.2, transit: '2–5 days', cod: false, international: false, tags: ['Lowest cost'] },
  { appId: 'royal_mail', service: 'Tracked 48', regions: ['GB'], baseUsd: 3.9, perKgUsd: 0.9, transit: '2–3 days', cod: false, international: true, tags: ['Lowest cost'] },
  { appId: 'evri', service: 'Next day', regions: ['GB'], baseUsd: 4.2, perKgUsd: 0.7, transit: '1–2 days', cod: false, international: false, tags: [] },
  { appId: 'dpd_uk', service: 'Next day Predict', regions: ['GB'], baseUsd: 6.8, perKgUsd: 0.6, transit: '1 day', cod: false, international: false, tags: ['Fastest'] },
  { appId: 'auspost', service: 'Parcel Post', regions: ['AU'], baseUsd: 6.3, perKgUsd: 1.4, transit: '2–6 days', cod: false, international: true, tags: [] },
  { appId: 'startrack', service: 'Premium', regions: ['AU'], baseUsd: 9.6, perKgUsd: 0.9, transit: '1–2 days', cod: false, international: false, tags: ['Fastest'] },
  { appId: 'sendle', service: 'Standard', regions: ['AU', 'US'], baseUsd: 5.4, perKgUsd: 1.0, transit: '2–5 days', cod: false, international: false, tags: ['Carbon neutral'] },
  { appId: 'couriers_please', service: 'Metro', regions: ['AU'], baseUsd: 5.0, perKgUsd: 0.8, transit: '1–4 days', cod: false, international: false, tags: ['Lowest cost'] },
]

/** App id for a courier or channel display name ("Aramex UAE" → aramex). */
export function appIdByName(name: string): string {
  const n = name.toLowerCase()
  return APP_CATALOG.find((a) => n.includes(a.name.toLowerCase()) || n.startsWith(a.name.split(/[\s(]/)[0].toLowerCase()))?.id ?? n
}
