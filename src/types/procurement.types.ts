import type { Currency } from './commerce.types'
import type { Entity } from './common.types'

export interface Supplier extends Entity {
  code: string
  name: string
  contactName: string
  email: string
  phone: string
  city: string
  country: string
  currency: Currency
  paymentTerms: string
  leadTimeDays: number
  status: 'active' | 'inactive'
  onTimeRate: number
  openOrders: number
}

export interface PurchaseOrderLine {
  sku: string
  title: string
  ordered: number
  received: number
  accepted: number
  rejected: number
  unitCost: number
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'cancelled'

export interface PurchaseOrder extends Entity {
  number: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  status: PurchaseOrderStatus
  currency: Currency
  expectedAt: string
  lines: PurchaseOrderLine[]
  subtotal: number
  tax: number
  total: number
  approvedBy: string | null
  notes: string
}

export interface Requisition extends Entity {
  number: string
  requestedBy: string
  warehouseName: string
  status: 'submitted' | 'approved' | 'rejected' | 'converted'
  lines: { sku: string; quantity: number }[]
  neededBy: string
  reason: string
}

export interface SupplierReturn extends Entity {
  number: string
  supplierName: string
  purchaseOrderNumber: string | null
  status: 'draft' | 'shipped' | 'credited'
  lines: { sku: string; quantity: number }[]
  reason: string
  creditAmount: number
  currency: Currency
}
