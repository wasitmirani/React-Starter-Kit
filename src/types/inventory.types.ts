import type { Entity } from './common.types'

export interface StockBalance extends Entity {
  sku: string
  productId: string
  productTitle: string
  warehouseId: string
  warehouseName: string
  clientName: string | null
  binCode: string
  onHand: number
  reserved: number
  damaged: number
  quarantined: number
  /** on_hand − reserved − damaged − quarantined; computed by the API. */
  available: number
  incoming: number
  inTransit: number
  reorderPoint: number
  unitCost: number
}

export type MovementType =
  | 'purchase_receipt'
  | 'reservation'
  | 'reservation_release'
  | 'dispatch'
  | 'customer_return'
  | 'supplier_return'
  | 'adjustment_increase'
  | 'adjustment_decrease'
  | 'damage'
  | 'quarantine'
  | 'transfer_dispatch'
  | 'transfer_receipt'
  | 'count_variance'

export interface LedgerEntry extends Entity {
  movementType: MovementType
  sku: string
  warehouseName: string
  binCode: string
  quantity: number
  balanceAfter: number
  referenceType: string
  referenceNumber: string
  actorName: string
  reason: string | null
}

export interface Reservation extends Entity {
  orderId: string
  orderNumber: string
  sku: string
  warehouseName: string
  quantity: number
  status: 'active' | 'released' | 'consumed'
}

export interface StockLine {
  sku: string
  binCode: string
  quantity: number
}

export interface Adjustment extends Entity {
  number: string
  warehouseId: string
  warehouseName: string
  reason: 'damage' | 'count_correction' | 'found' | 'lost' | 'expired' | 'other'
  status: 'pending_approval' | 'approved' | 'rejected'
  /** Signed quantities: positive adds stock, negative removes it. */
  lines: StockLine[]
  note: string
  requestedBy: string
  approvedBy: string | null
}

export interface TransferLine {
  sku: string
  quantity: number
  received: number
}

export interface Transfer extends Entity {
  number: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  status: 'draft' | 'in_transit' | 'received' | 'cancelled'
  lines: TransferLine[]
  dispatchedAt: string | null
  receivedAt: string | null
  note: string
}

export interface CountLine {
  sku: string
  binCode: string
  expected: number
  counted: number | null
}

export interface StockCount extends Entity {
  number: string
  warehouseId: string
  warehouseName: string
  zone: string
  type: 'cycle' | 'full'
  status: 'scheduled' | 'in_progress' | 'submitted' | 'approved'
  lines: CountLine[]
  assigneeName: string
  scheduledFor: string
}

export interface Lot extends Entity {
  lotNumber: string
  sku: string
  productTitle: string
  warehouseName: string
  quantity: number
  expiresAt: string | null
  status: 'active' | 'expired' | 'quarantined'
}

export interface ReplenishmentSuggestion extends Entity {
  sku: string
  productTitle: string
  warehouseName: string
  available: number
  reorderPoint: number
  suggestedQty: number
  supplierName: string | null
  status: 'open' | 'ordered' | 'dismissed'
}
