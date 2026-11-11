import { AppError } from '@/api/errors'
import { latency, nowIso, paginate } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { actor, assertStatus, moveStock, nextNumber } from '@/api/mock/ops'
import { callFor, createResourceApi, http, toParams } from '@/api/resource'
import type { ListQuery, Page } from '@/types/common.types'
import type { Adjustment, CountLine, LedgerEntry, Lot, ReplenishmentSuggestion, Reservation, StockBalance, StockCount, Transfer } from '@/types/inventory.types'
import type { PurchaseOrder } from '@/types/procurement.types'

const call = callFor('inventory')

/** `stock=low|out` narrows to SKUs at or below reorder point / with nothing available. */
function queryBalances(q: ListQuery = {}) {
  const { stock, ...filters } = q.filters ?? {}
  let rows = db.balances.query({ ...q, filters })
  if (stock === 'low') rows = rows.filter((b) => b.available > 0 && b.available <= b.reorderPoint)
  if (stock === 'out') rows = rows.filter((b) => b.available <= 0)
  return rows
}

export const balancesApi = {
  ...createResourceApi<StockBalance>('/inventory/balances', db.balances),
  list: (q?: ListQuery) =>
    call<Page<StockBalance>>(
      async () => {
        await latency()
        return paginate(queryBalances(q), q?.page, q?.perPage)
      },
      () => http.get('/inventory/balances', toParams(q)),
    ),
  /** Totals for the stock overview header (bounded aggregate, not raw rows). */
  summary: (q?: ListQuery) =>
    call<{ onHand: number; reserved: number; available: number; damaged: number; quarantined: number; incoming: number; inTransit: number; value: number; skus: number; low: number; out: number }>(
      async () => {
        await latency(80, 200)
        const rows = queryBalances({ ...q, filters: { ...q?.filters, stock: undefined } })
        const sum = (k: keyof StockBalance) => rows.reduce((n, b) => n + (b[k] as number), 0)
        return { onHand: sum('onHand'), reserved: sum('reserved'), available: sum('available'), damaged: sum('damaged'), quarantined: sum('quarantined'), incoming: sum('incoming'), inTransit: sum('inTransit'), value: rows.reduce((n, b) => n + b.onHand * b.unitCost, 0), skus: new Set(rows.map((b) => b.sku)).size, low: rows.filter((b) => b.available > 0 && b.available <= b.reorderPoint).length, out: rows.filter((b) => b.available <= 0).length }
      },
      () => http.get('/inventory/balances/summary', toParams(q)),
    ),
}

export const ledgerApi = createResourceApi<LedgerEntry>('/inventory/ledger', db.ledger)

export const reservationsApi = {
  ...createResourceApi<Reservation>('/inventory/reservations', db.reservations),
  release: (id: string) =>
    call<Reservation>(
      async () => {
        await latency()
        const r = db.reservations.find(id)
        assertStatus(r.status, ['active'], 'release this reservation')
        const w = db.warehouses.rows().find((x) => x.name === r.warehouseName)!
        moveStock({ sku: r.sku, warehouseId: w.id, type: 'reservation_release', field: 'reserved', quantity: -r.quantity, reference: ['order', r.orderNumber], reason: 'Released manually' })
        return db.reservations.update(id, { status: 'released' })
      },
      () => http.post(`/inventory/reservations/${id}/release`),
    ),
}

export interface AdjustmentInput {
  warehouseId: string
  reason: Adjustment['reason']
  note: string
  lines: { sku: string; quantity: number }[]
}

export const adjustmentsApi = {
  ...createResourceApi<Adjustment>('/inventory/adjustments', db.adjustments),
  create: (input: AdjustmentInput) =>
    call<Adjustment>(
      async () => {
        await latency()
        const w = db.warehouses.find(input.warehouseId)
        const lines = input.lines.map((l) => ({ ...l, binCode: db.balances.rows().find((b) => b.sku === l.sku && b.warehouseId === w.id)?.binCode ?? 'RCV-01' }))
        return db.adjustments.create({ number: nextNumber(db.adjustments.rows().map((a) => a.number), 'ADJ-', 6001), warehouseId: w.id, warehouseName: w.name, reason: input.reason, status: 'pending_approval', lines, note: input.note, requestedBy: actor(), approvedBy: null })
      },
      () => http.post('/inventory/adjustments', input),
    ),
  decide: ({ id, approve }: { id: string; approve: boolean }) =>
    call<Adjustment>(
      async () => {
        await latency()
        const a = db.adjustments.find(id)
        assertStatus(a.status, ['pending_approval'], approve ? 'approve' : 'reject')
        if (approve) {
          for (const l of a.lines) {
            const type = a.reason === 'damage' ? 'damage' : l.quantity >= 0 ? 'adjustment_increase' : 'adjustment_decrease'
            moveStock({ sku: l.sku, warehouseId: a.warehouseId, type, quantity: l.quantity, reference: ['adjustment', a.number], reason: a.note || a.reason })
          }
        }
        return db.adjustments.update(id, { status: approve ? 'approved' : 'rejected', approvedBy: actor() })
      },
      () => http.post(`/inventory/adjustments/${id}/${approve ? 'approve' : 'reject'}`),
    ),
}

export interface TransferInput {
  fromWarehouseId: string
  toWarehouseId: string
  note: string
  lines: { sku: string; quantity: number }[]
}

export const transfersApi = {
  ...createResourceApi<Transfer>('/inventory/transfers', db.transfers),
  create: (input: TransferInput) =>
    call<Transfer>(
      async () => {
        await latency()
        if (input.fromWarehouseId === input.toWarehouseId) throw new AppError(422, 'VALIDATION_ERROR', 'Source and destination must differ.', { toWarehouseId: ['Choose a different warehouse'] })
        const from = db.warehouses.find(input.fromWarehouseId)
        const to = db.warehouses.find(input.toWarehouseId)
        return db.transfers.create({ number: nextNumber(db.transfers.rows().map((t) => t.number), 'TRF-', 4001), fromWarehouseId: from.id, fromWarehouseName: from.name, toWarehouseId: to.id, toWarehouseName: to.name, status: 'draft', lines: input.lines.map((l) => ({ ...l, received: 0 })), dispatchedAt: null, receivedAt: null, note: input.note })
      },
      () => http.post('/inventory/transfers', input),
    ),
  /** Stock leaves the source and is held in transit until received. */
  dispatch: (id: string) =>
    call<Transfer>(
      async () => {
        await latency()
        const t = db.transfers.find(id)
        assertStatus(t.status, ['draft'], 'dispatch')
        for (const l of t.lines) {
          moveStock({ sku: l.sku, warehouseId: t.fromWarehouseId, type: 'transfer_dispatch', quantity: -l.quantity, reference: ['transfer', t.number] })
          moveStock({ sku: l.sku, warehouseId: t.toWarehouseId, type: 'transfer_dispatch', field: 'inTransit', quantity: l.quantity, reference: ['transfer', t.number] })
        }
        return db.transfers.update(id, { status: 'in_transit', dispatchedAt: nowIso() })
      },
      () => http.post(`/inventory/transfers/${id}/dispatch`),
    ),
  receive: ({ id, received }: { id: string; received: Record<string, number> }) =>
    call<Transfer>(
      async () => {
        await latency()
        const t = db.transfers.find(id)
        assertStatus(t.status, ['in_transit'], 'receive')
        const lines = t.lines.map((l) => ({ ...l, received: Math.min(l.quantity, Math.max(0, received[l.sku] ?? l.quantity)) }))
        for (const l of lines) {
          moveStock({ sku: l.sku, warehouseId: t.toWarehouseId, type: 'transfer_receipt', field: 'inTransit', quantity: -l.quantity, reference: ['transfer', t.number] })
          if (l.received) moveStock({ sku: l.sku, warehouseId: t.toWarehouseId, type: 'transfer_receipt', quantity: l.received, reference: ['transfer', t.number] })
        }
        return db.transfers.update(id, { status: 'received', receivedAt: nowIso(), lines })
      },
      () => http.post(`/inventory/transfers/${id}/receive`, { received }),
    ),
  cancel: (id: string) =>
    call<Transfer>(
      async () => {
        assertStatus(db.transfers.find(id).status, ['draft'], 'cancel')
        return db.transfers.update(id, { status: 'cancelled' })
      },
      () => http.post(`/inventory/transfers/${id}/cancel`),
    ),
}

export const stockCountsApi = {
  ...createResourceApi<StockCount>('/inventory/stock-counts', db.stockCounts),
  create: (input: { warehouseId: string; zone: string; type: StockCount['type']; assigneeName: string; scheduledFor: string }) =>
    call<StockCount>(
      async () => {
        await latency()
        const w = db.warehouses.find(input.warehouseId)
        const lines = db.balances.rows().filter((b) => b.warehouseId === w.id && (input.type === 'full' || b.binCode.startsWith(input.zone))).map((b) => ({ sku: b.sku, binCode: b.binCode, expected: b.onHand, counted: null }))
        if (!lines.length) throw new AppError(422, 'VALIDATION_ERROR', `No stock in zone ${input.zone} of ${w.name}.`, { zone: ['Zone has no stock'] })
        return db.stockCounts.create({ ...input, number: nextNumber(db.stockCounts.rows().map((c) => c.number), 'CNT-', 8001), warehouseName: w.name, status: 'scheduled', lines })
      },
      () => http.post('/inventory/stock-counts', input),
    ),
  saveCounts: ({ id, lines, submit }: { id: string; lines: CountLine[]; submit: boolean }) =>
    call<StockCount>(
      async () => {
        await latency()
        const c = db.stockCounts.find(id)
        assertStatus(c.status, ['scheduled', 'in_progress'], 'record counts')
        if (submit && lines.some((l) => l.counted == null)) throw new AppError(422, 'VALIDATION_ERROR', 'Count every line before submitting.')
        return db.stockCounts.update(id, { lines, status: submit ? 'submitted' : 'in_progress' })
      },
      () => http.post(`/inventory/stock-counts/${id}/${submit ? 'submit' : 'save'}`, { lines }),
    ),
  /** Variances post as `count_variance` ledger movements. */
  approve: (id: string) =>
    call<StockCount>(
      async () => {
        await latency()
        const c = db.stockCounts.find(id)
        assertStatus(c.status, ['submitted'], 'approve')
        for (const l of c.lines) {
          const diff = (l.counted ?? l.expected) - l.expected
          if (diff) moveStock({ sku: l.sku, warehouseId: c.warehouseId, type: 'count_variance', quantity: diff, reference: ['stock_count', c.number], reason: 'Count variance approved' })
        }
        return db.stockCounts.update(id, { status: 'approved' })
      },
      () => http.post(`/inventory/stock-counts/${id}/approve`),
    ),
}

export const lotsApi = createResourceApi<Lot>('/inventory/lots', db.lots)

export const replenishmentApi = {
  ...createResourceApi<ReplenishmentSuggestion>('/inventory/replenishment', db.replenishment),
  /** Groups the chosen suggestions by supplier into draft purchase orders. */
  createPurchaseOrders: (ids: string[]) =>
    call<PurchaseOrder[]>(
      async () => {
        await latency(400, 800)
        const picked = ids.map((id) => db.replenishment.find(id)).filter((s) => s.status === 'open')
        const bySupplier = new Map<string, ReplenishmentSuggestion[]>()
        for (const s of picked) bySupplier.set(s.supplierName ?? 'Unassigned', [...(bySupplier.get(s.supplierName ?? 'Unassigned') ?? []), s])
        const created: PurchaseOrder[] = []
        for (const [supplierName, rows] of bySupplier) {
          const supplier = db.suppliers.rows().find((x) => x.name === supplierName) ?? db.suppliers.rows()[0]
          const warehouse = db.warehouses.rows().find((w) => w.name === rows[0].warehouseName)!
          const lines = rows.map((s) => {
            const cost = db.balances.rows().find((b) => b.sku === s.sku)?.unitCost ?? 0
            return { sku: s.sku, title: s.productTitle, ordered: s.suggestedQty, received: 0, accepted: 0, rejected: 0, unitCost: cost }
          })
          const subtotal = lines.reduce((n, l) => n + l.ordered * l.unitCost, 0)
          created.push(await db.purchaseOrders.create({ number: nextNumber(db.purchaseOrders.rows().map((p) => p.number), 'PO-', 9001), supplierId: supplier.id, supplierName: supplier.name, warehouseId: warehouse.id, warehouseName: warehouse.name, status: 'draft', currency: supplier.currency, expectedAt: new Date(Date.now() + supplier.leadTimeDays * 86_400_000).toISOString(), lines, subtotal, tax: 0, total: subtotal, approvedBy: null, notes: 'Created from replenishment suggestions' }))
        }
        db.replenishment.replaceAll(db.replenishment.rows().map((s) => (picked.some((p) => p.id === s.id) ? { ...s, status: 'ordered', updatedAt: nowIso() } : s)))
        return created
      },
      () => http.post('/inventory/replenishment/purchase-orders', { ids }),
    ),
  dismiss: (id: string) => call<ReplenishmentSuggestion>(() => db.replenishment.update(id, { status: 'dismissed' }), () => http.post(`/inventory/replenishment/${id}/dismiss`)),
}
