import type { Entity } from './common.types'

export type Currency = 'PKR' | 'AED' | 'USD' | 'SAR' | 'GBP' | 'AUD' | 'EUR'

export type OrderStatus =
  | 'pending_validation'
  | 'on_hold'
  | 'ready_to_allocate'
  | 'partially_allocated'
  | 'allocated'
  | 'picking'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'delivery_failed'
  | 'returned'
  | 'cancelled'

export type PaymentMethod = 'cod' | 'prepaid' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'cod_pending' | 'cod_collected' | 'refunded'

export interface Address {
  name: string
  phone: string
  line1: string
  area: string
  city: string
  province: string
  country: string
}

export interface OrderItem {
  sku: string
  title: string
  quantity: number
  unitPrice: number
  allocated: number
  fulfilled: number
}

export interface OrderEvent {
  at: string
  actor: string
  event: string
  note?: string
}

export interface Order extends Entity {
  number: string
  externalId: string | null
  channelId: string
  channelName: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  clientId: string | null
  clientName: string | null
  warehouseId: string | null
  warehouseName: string | null
  status: OrderStatus
  priority: 'normal' | 'high' | 'urgent'
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  currency: Currency
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  shippingAddress: Address
  tags: string[]
  holdReason: string | null
  shipmentId: string | null
  placedAt: string
  timeline: OrderEvent[]
}

export interface Customer extends Entity {
  name: string
  email: string | null
  phone: string
  city: string
  country: string
  ordersCount: number
  totalSpent: number
  currency: Currency
  lastOrderAt: string | null
  tags: string[]
}

export type ProductStatus = 'draft' | 'active' | 'archived'

export interface Variant {
  id: string
  sku: string
  barcode: string
  title: string
  price: number
  cost: number
  weightKg: number
}

export interface BundleComponent {
  sku: string
  quantity: number
}

export interface Product extends Entity {
  title: string
  brand: string
  category: string
  description: string
  status: ProductStatus
  type: 'simple' | 'variant' | 'bundle'
  clientId: string | null
  clientName: string | null
  supplierId: string | null
  supplierName: string | null
  imageUrl: string | null
  currency: Currency
  dimensionsCm: { length: number; width: number; height: number }
  variants: Variant[]
  bundle: BundleComponent[]
  lotTracked: boolean
  reorderPoint: number
  /** Totals across warehouses; decorated by the API. */
  onHand: number
  available: number
}

export type ChannelType =
  | 'first_party_storefront'
  | 'custom_api'
  | 'pos'
  | 'b2b_portal'
  | 'manual'
  | 'csv_import'
  | 'shopify'
  | 'woocommerce'
  | 'amazon'
  | 'daraz'
  | 'noon'
  | 'ebay'
  | 'walmart'
  | 'etsy'
  | 'tiktok_shop'
  | 'trendyol'
  | 'salla'
  | 'zid'
  | 'bigcommerce'
  | 'magento'
  | 'catch'
  | 'kogan'

export interface SalesChannel extends Entity {
  name: string
  type: ChannelType
  status: 'connected' | 'error' | 'disconnected'
  currency: Currency
  defaultWarehouseId: string | null
  defaultWarehouseName: string | null
  orderImport: boolean
  inventorySync: boolean
  fulfillmentCallbacks: boolean
  safetyStock: number
  lastSyncAt: string | null
  ordersToday: number
  errors24h: number
}

export interface ImportJob extends Entity {
  type: 'products' | 'orders' | 'inventory' | 'customers'
  fileName: string
  status: 'processing' | 'completed' | 'failed' | 'partial'
  totalRows: number
  succeeded: number
  failed: number
  createdBy: string
  errors: { row: number; message: string }[]
}
