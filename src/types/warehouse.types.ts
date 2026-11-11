import type { Entity } from './common.types'

export interface Warehouse extends Entity {
  code: string
  name: string
  type: 'own' | 'third_party'
  status: 'active' | 'inactive'
  address: string
  city: string
  country: string
  timezone: string
  cutoffTime: string
  workingHours: string
  binsCount: number
  utilization: number
  staffCount: number
  openTasks: number
}

export type BinType = 'storage' | 'picking' | 'receiving' | 'packing' | 'dispatch' | 'quarantine' | 'damaged'

export interface Location extends Entity {
  warehouseId: string
  warehouseName: string
  code: string
  zone: string
  type: BinType
  capacity: number
  used: number
  status: 'active' | 'blocked'
}

export interface ReceiptLine {
  sku: string
  title: string
  expected: number
  received: number
  accepted: number
  rejected: number
}

export interface Receipt extends Entity {
  number: string
  purchaseOrderId: string | null
  purchaseOrderNumber: string | null
  supplierName: string
  warehouseId: string
  warehouseName: string
  status: 'expected' | 'receiving' | 'inspecting' | 'completed'
  mode: 'expected' | 'blind'
  lines: ReceiptLine[]
  receivedBy: string | null
  expectedAt: string
}

export type TaskType = 'putaway' | 'pick' | 'pack' | 'replenish' | 'count' | 'move'
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'exception'

export interface WarehouseTask extends Entity {
  number: string
  type: TaskType
  status: TaskStatus
  priority: 'normal' | 'high' | 'urgent'
  warehouseId: string
  warehouseName: string
  sku: string
  productTitle: string
  quantity: number
  quantityDone: number
  fromBin: string | null
  toBin: string | null
  orderNumber: string | null
  waveNumber: string | null
  assigneeName: string | null
  dueAt: string
  exception: string | null
  history: { at: string; actor: string; event: string }[]
}

export interface PickWave extends Entity {
  number: string
  warehouseName: string
  strategy: 'single_order' | 'batch' | 'zone' | 'wave'
  status: 'planned' | 'released' | 'picking' | 'completed'
  ordersCount: number
  linesCount: number
  unitsPicked: number
  unitsTotal: number
  assignees: string[]
  cutoffAt: string
}

export interface PackingSession extends Entity {
  orderId: string
  orderNumber: string
  warehouseName: string
  station: string
  status: 'open' | 'verified' | 'packed' | 'exception'
  items: { sku: string; title: string; quantity: number; verified: number }[]
  packageType: string | null
  weightKg: number | null
  packerName: string | null
}

export interface DispatchBatch extends Entity {
  number: string
  carrierName: string
  warehouseName: string
  status: 'open' | 'closed' | 'handed_over'
  shipmentIds: string[]
  parcels: number
  driverName: string | null
  vehicle: string | null
  handedOverAt: string | null
}

export interface StaffMember extends Entity {
  name: string
  role: 'picker' | 'packer' | 'receiver' | 'dispatcher' | 'supervisor'
  warehouseName: string
  status: 'on_shift' | 'off_shift'
  tasksToday: number
  unitsPerHour: number
  accuracy: number
}
