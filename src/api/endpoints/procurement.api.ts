import { AppError } from '@/api/errors'
import { latency } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { actor, assertStatus, nextNumber } from '@/api/mock/ops'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { PurchaseOrder, Requisition, Supplier, SupplierReturn } from '@/types/procurement.types'

const call = callFor('procurement')

export const suppliersApi = createResourceApi<Supplier>('/suppliers', db.suppliers)

export interface PurchaseOrderInput {
  supplierId: string
  warehouseId: string
  expectedAt: string
  notes: string
  taxRate: number
  lines: { sku: string; ordered: number; unitCost: number }[]
}

function titleOf(sku: string) {
  return db.balances.rows().find((b) => b.sku === sku)?.productTitle ?? sku
}

export const purchaseOrdersApi = {
  ...createResourceApi<PurchaseOrder>('/purchase-orders', db.purchaseOrders),
  create: (input: PurchaseOrderInput) =>
    call<PurchaseOrder>(
      async () => {
        await latency()
        const supplier = db.suppliers.find(input.supplierId)
        const warehouse = db.warehouses.find(input.warehouseId)
        const lines = input.lines.map((l) => ({ ...l, title: titleOf(l.sku), received: 0, accepted: 0, rejected: 0 }))
        const subtotal = lines.reduce((n, l) => n + l.ordered * l.unitCost, 0)
        const tax = Math.round(subtotal * input.taxRate) / 100
        return db.purchaseOrders.create({ number: nextNumber(db.purchaseOrders.rows().map((p) => p.number), 'PO-', 9001), supplierId: supplier.id, supplierName: supplier.name, warehouseId: warehouse.id, warehouseName: warehouse.name, status: 'draft', currency: supplier.currency, expectedAt: input.expectedAt, lines, subtotal, tax, total: subtotal + tax, approvedBy: null, notes: input.notes })
      },
      () => http.post('/purchase-orders', input),
    ),
  submit: (id: string) =>
    call<PurchaseOrder>(async () => {
      assertStatus(db.purchaseOrders.find(id).status, ['draft'], 'submit for approval')
      return db.purchaseOrders.update(id, { status: 'pending_approval' })
    }, () => http.post(`/purchase-orders/${id}/submit`)),
  /** Approval also creates the expected goods receipt and raises incoming stock. */
  approve: (id: string) =>
    call<PurchaseOrder>(
      async () => {
        await latency()
        const po = db.purchaseOrders.find(id)
        assertStatus(po.status, ['pending_approval'], 'approve')
        await db.receipts.create({ number: nextNumber(db.receipts.rows().map((r) => r.number), 'GRN-', 7001), purchaseOrderId: po.id, purchaseOrderNumber: po.number, supplierName: po.supplierName, warehouseId: po.warehouseId, warehouseName: po.warehouseName, status: 'expected', mode: 'expected', lines: po.lines.map((l) => ({ sku: l.sku, title: l.title, expected: l.ordered, received: 0, accepted: 0, rejected: 0 })), receivedBy: null, expectedAt: po.expectedAt })
        db.balances.replaceAll(db.balances.rows().map((b) => {
          const line = po.lines.find((l) => l.sku === b.sku)
          return line && b.warehouseId === po.warehouseId ? { ...b, incoming: b.incoming + line.ordered } : b
        }))
        return db.purchaseOrders.update(id, { status: 'approved', approvedBy: actor() })
      },
      () => http.post(`/purchase-orders/${id}/approve`),
    ),
  cancel: (id: string) =>
    call<PurchaseOrder>(async () => {
      assertStatus(db.purchaseOrders.find(id).status, ['draft', 'pending_approval', 'approved'], 'cancel')
      return db.purchaseOrders.update(id, { status: 'cancelled' })
    }, () => http.post(`/purchase-orders/${id}/cancel`)),
  close: (id: string) =>
    call<PurchaseOrder>(async () => {
      assertStatus(db.purchaseOrders.find(id).status, ['partially_received', 'received'], 'close')
      return db.purchaseOrders.update(id, { status: 'closed' })
    }, () => http.post(`/purchase-orders/${id}/close`)),
}

export const requisitionsApi = {
  ...createResourceApi<Requisition>('/requisitions', db.requisitions),
  create: (input: { warehouseName: string; neededBy: string; reason: string; lines: { sku: string; quantity: number }[] }) =>
    call<Requisition>(async () => db.requisitions.create({ ...input, number: nextNumber(db.requisitions.rows().map((r) => r.number), 'REQ-', 1101), requestedBy: actor(), status: 'submitted' }), () => http.post('/requisitions', input)),
  decide: ({ id, approve }: { id: string; approve: boolean }) =>
    call<Requisition>(async () => {
      assertStatus(db.requisitions.find(id).status, ['submitted'], approve ? 'approve' : 'reject')
      return db.requisitions.update(id, { status: approve ? 'approved' : 'rejected' })
    }, () => http.post(`/requisitions/${id}/${approve ? 'approve' : 'reject'}`)),
  convert: ({ id, supplierId }: { id: string; supplierId: string }) =>
    call<PurchaseOrder>(
      async () => {
        const r = db.requisitions.find(id)
        assertStatus(r.status, ['approved'], 'convert')
        const warehouse = db.warehouses.rows().find((w) => w.name === r.warehouseName)
        if (!warehouse) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Warehouse not found')
        const po = await purchaseOrdersApi.create({ supplierId, warehouseId: warehouse.id, expectedAt: r.neededBy, notes: `From ${r.number}: ${r.reason}`, taxRate: 0, lines: r.lines.map((l) => ({ sku: l.sku, ordered: l.quantity, unitCost: db.balances.rows().find((b) => b.sku === l.sku)?.unitCost ?? 0 })) })
        await db.requisitions.update(id, { status: 'converted' })
        return po
      },
      () => http.post(`/requisitions/${id}/convert`, { supplierId }),
    ),
}

export const supplierReturnsApi = {
  ...createResourceApi<SupplierReturn>('/supplier-returns', db.supplierReturns),
  advance: (id: string) =>
    call<SupplierReturn>(async () => {
      const r = db.supplierReturns.find(id)
      assertStatus(r.status, ['draft', 'shipped'], 'advance')
      return db.supplierReturns.update(id, { status: r.status === 'draft' ? 'shipped' : 'credited' })
    }, () => http.post(`/supplier-returns/${id}/advance`)),
}
