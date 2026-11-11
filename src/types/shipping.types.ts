import type { Currency } from './commerce.types'
import type { Entity } from './common.types'

export type ShipmentStatus =
  | 'pending'
  | 'booked'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'rto'
  | 'cancelled'

export type CodStatus = 'not_applicable' | 'pending' | 'collected' | 'remitted'

export interface TrackingEvent {
  at: string
  status: string
  location: string
  description: string
}

export interface Shipment extends Entity {
  number: string
  orderId: string
  orderNumber: string
  carrierId: string
  carrierName: string
  service: string
  trackingNumber: string | null
  status: ShipmentStatus
  packages: number
  weightKg: number
  currency: Currency
  codAmount: number
  codStatus: CodStatus
  destinationCity: string
  country: string
  bookedAt: string | null
  deliveredAt: string | null
  exception: string | null
  events: TrackingEvent[]
}

export interface CarrierAccount extends Entity {
  carrier: string
  name: string
  accountNumber: string
  country: string
  status: 'connected' | 'error' | 'disconnected'
  mode: 'live' | 'sandbox'
  services: string[]
  codSupported: boolean
  shipments30d: number
  onTimeRate: number
}

export interface CodRemittance extends Entity {
  number: string
  carrierName: string
  periodStart: string
  periodEnd: string
  shipmentsCount: number
  currency: Currency
  collected: number
  fees: number
  remitted: number
  status: 'pending' | 'received' | 'reconciled' | 'disputed'
}

export type ReturnCondition = 'sellable' | 'damaged' | 'missing' | 'wrong_item'
export type ReturnDisposition = 'restock' | 'quarantine' | 'dispose' | 'supplier_return'

export interface ReturnItem {
  sku: string
  title: string
  quantity: number
  condition: ReturnCondition | null
  disposition: ReturnDisposition | null
}

export interface ReturnRequest extends Entity {
  number: string
  orderId: string
  orderNumber: string
  customerName: string
  warehouseName: string
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'inspected' | 'completed'
  reason: string
  items: ReturnItem[]
  refundStatus: 'none' | 'pending' | 'refunded'
  refundAmount: number
  currency: Currency
  trackingNumber: string | null
}
