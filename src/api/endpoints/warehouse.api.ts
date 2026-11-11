import { AppError } from '@/api/errors'
import { latency, nowIso } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { actor, assertStatus, moveStock, nextNumber, notify } from '@/api/mock/ops'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { DispatchBatch, Location, PackingSession, PickWave, Receipt, StaffMember, Warehouse, WarehouseTask } from '@/types/warehouse.types'

const call = callFor('warehouse')
const log = (t: WarehouseTask, event: string) => [...t.history, { at: nowIso(), actor: actor(), event }]

export const warehousesApi = createResourceApi<Warehouse>('/warehouses', db.warehouses)

export const locationsApi = {
  ...createResourceApi<Location>('/warehouse/locations', db.locations),
  toggleBlock: (id: string) =>
    call<Location>(async () => db.locations.update(id, { status: db.locations.find(id).status === 'active' ? 'blocked' : 'active' }), () => http.post(`/warehouse/locations/${id}/toggle-block`)),
}

export interface ReceiveLine {
  sku: string
  received: number
  rejected: number
}

export const receiptsApi = {
  ...createResourceApi<Receipt>('/warehouse/receipts', db.receipts),
  /**
   * Records counted quantities. Only accepted units increase stock (to the receiving
   * dock) and a putaway task is created for them; receipt, PO and ledger change together.
   */
  receive: ({ id, lines, complete }: { id: string; lines: ReceiveLine[]; complete: boolean }) =>
    call<Receipt>(
      async () => {
        await latency(300, 600)
        const r = db.receipts.find(id)
        assertStatus(r.status, ['expected', 'receiving', 'inspecting'], 'receive')
        const next = r.lines.map((l) => {
          const input = lines.find((x) => x.sku === l.sku)
          if (!input) return l
          if (input.received < 0 || input.rejected < 0 || input.rejected > input.received) throw new AppError(422, 'VALIDATION_ERROR', `Invalid quantities for ${l.sku}.`)
          const accepted = input.received - input.rejected
          const delta = accepted - l.accepted
          if (delta) {
            moveStock({ sku: l.sku, warehouseId: r.warehouseId, type: 'purchase_receipt', quantity: delta, reference: ['receipt', r.number] })
            if (delta > 0) {
              const bin = db.balances.rows().find((b) => b.sku === l.sku && b.warehouseId === r.warehouseId)?.binCode ?? 'A-01-01'
              void db.tasks.create({ number: nextNumber(db.tasks.rows().map((t) => t.number), 'T-', 30001), type: 'putaway', status: 'open', priority: 'normal', warehouseId: r.warehouseId, warehouseName: r.warehouseName, sku: l.sku, productTitle: l.title, quantity: delta, quantityDone: 0, fromBin: 'RCV-01', toBin: bin, orderNumber: null, waveNumber: null, assigneeName: null, dueAt: new Date(Date.now() + 4 * 3_600_000).toISOString(), exception: null, history: [{ at: nowIso(), actor: 'System', event: `Created from ${r.number}` }] })
            }
          }
          return { ...l, received: input.received, rejected: input.rejected, accepted }
        })
        if (r.purchaseOrderId) {
          const po = db.purchaseOrders.find(r.purchaseOrderId)
          const poLines = po.lines.map((pl) => {
            const l = next.find((x) => x.sku === pl.sku)
            return l ? { ...pl, received: l.received, accepted: l.accepted, rejected: l.rejected } : pl
          })
          const full = poLines.every((l) => l.received >= l.ordered)
          await db.purchaseOrders.update(po.id, { lines: poLines, status: full && complete ? 'received' : 'partially_received' })
        }
        const status = complete ? 'completed' : next.some((l) => l.rejected > 0) ? 'inspecting' : 'receiving'
        if (complete) notify(`${r.number} received`, `${next.reduce((n, l) => n + l.accepted, 0)} units accepted into ${r.warehouseName}.`, 'success', '/receipts')
        return db.receipts.update(id, { lines: next, status, receivedBy: actor() })
      },
      () => http.post(`/warehouse/receipts/${id}/receive`, { lines, complete }),
    ),
  /** Blind receipt: no PO, quantities only. */
  createBlind: (input: { warehouseId: string; supplierName: string; lines: { sku: string; expected: number }[] }) =>
    call<Receipt>(
      async () => {
        const w = db.warehouses.find(input.warehouseId)
        const titles = new Map(db.balances.rows().map((b) => [b.sku, b.productTitle]))
        return db.receipts.create({ number: nextNumber(db.receipts.rows().map((x) => x.number), 'GRN-', 7001), purchaseOrderId: null, purchaseOrderNumber: null, supplierName: input.supplierName, warehouseId: w.id, warehouseName: w.name, status: 'expected', mode: 'blind', lines: input.lines.map((l) => ({ sku: l.sku, title: titles.get(l.sku) ?? l.sku, expected: l.expected, received: 0, accepted: 0, rejected: 0 })), receivedBy: null, expectedAt: nowIso() })
      },
      () => http.post('/warehouse/receipts', input),
    ),
}

export const tasksApi = {
  ...createResourceApi<WarehouseTask>('/warehouse/tasks', db.tasks),
  assign: ({ ids, assigneeName }: { ids: string[]; assigneeName: string }) =>
    call<void>(
      async () => {
        await latency()
        for (const id of ids) {
          const t = db.tasks.find(id)
          if (t.status === 'completed') continue
          await db.tasks.update(id, { assigneeName, status: t.status === 'open' ? 'assigned' : t.status, history: log(t, t.assigneeName ? `Reassigned from ${t.assigneeName} to ${assigneeName}` : `Assigned to ${assigneeName}`) })
        }
      },
      () => http.post('/warehouse/tasks/assign', { ids, assigneeName }),
    ),
  /**
   * Validates a scan against the task: the bin first, then the SKU (or its barcode).
   * Wrong bins or SKUs are rejected; only an authorised exception bypasses them.
   */
  scan: ({ id, step, code }: { id: string; step: 'bin' | 'sku'; code: string }) =>
    call<WarehouseTask>(
      async () => {
        await latency(80, 200)
        const t = db.tasks.find(id)
        assertStatus(t.status, ['open', 'assigned', 'in_progress'], 'scan')
        const value = code.trim().toUpperCase()
        if (step === 'bin') {
          const expected = (t.type === 'putaway' ? t.toBin : t.fromBin) ?? ''
          if (value !== expected.toUpperCase()) throw new AppError(422, 'WAREHOUSE_LOCATION_INVALID', `Wrong bin. Expected ${expected}, scanned ${value}.`)
        } else {
          const barcodes = db.products.rows().flatMap((p) => p.variants).filter((v) => v.sku === t.sku).map((v) => v.barcode)
          if (value !== t.sku.toUpperCase() && !barcodes.includes(value)) throw new AppError(422, 'PICK_QUANTITY_MISMATCH', `Wrong item. Expected ${t.sku}.`)
        }
        return db.tasks.update(id, { status: 'in_progress', assigneeName: t.assigneeName ?? actor(), history: log(t, `Scanned ${step} ${value}`) })
      },
      () => http.post(`/warehouse/tasks/${id}/scan`, { step, code }),
    ),
  /** Confirms quantity; cannot exceed what remains. A shortfall needs a reason and raises an exception. */
  complete: ({ id, quantity, shortReason }: { id: string; quantity: number; shortReason?: string }) =>
    call<WarehouseTask>(
      async () => {
        await latency()
        const t = db.tasks.find(id)
        assertStatus(t.status, ['open', 'assigned', 'in_progress'], 'complete')
        const remaining = t.quantity - t.quantityDone
        if (quantity > remaining) throw new AppError(422, 'PICK_QUANTITY_MISMATCH', `Only ${remaining} remaining on this task.`)
        if (quantity < remaining && !shortReason) throw new AppError(422, 'VALIDATION_ERROR', 'Give a reason for the short quantity.', { shortReason: ['Required for a short pick'] })
        const short = quantity < remaining
        if (short && t.type === 'pick') notify(`Short pick on ${t.number}`, `${t.sku}: ${quantity}/${remaining} picked (${shortReason}).`, 'warning', `/tasks/${t.id}`)
        return db.tasks.update(id, { quantityDone: t.quantityDone + quantity, status: short ? 'exception' : 'completed', exception: short ? shortReason! : null, history: log(t, short ? `Short: confirmed ${quantity} of ${remaining} (${shortReason})` : `Confirmed ${quantity} units`) })
      },
      () => http.post(`/warehouse/tasks/${id}/complete`, { quantity, shortReason }),
    ),
  resolveException: (id: string) =>
    call<WarehouseTask>(async () => {
      const t = db.tasks.find(id)
      assertStatus(t.status, ['exception'], 'resolve')
      return db.tasks.update(id, { status: 'completed', history: log(t, 'Exception resolved by supervisor') })
    }, () => http.post(`/warehouse/tasks/${id}/resolve`)),
  /** Bin-to-bin move from the scanner: creates and completes a move task. */
  move: (input: { warehouseId: string; sku: string; fromBin: string; toBin: string; quantity: number }) =>
    call<WarehouseTask>(
      async () => {
        await latency()
        const bins = db.locations.rows().filter((l) => l.warehouseId === input.warehouseId)
        const to = bins.find((l) => l.code === input.toBin.toUpperCase())
        if (!to) throw new AppError(422, 'WAREHOUSE_LOCATION_INVALID', `Bin ${input.toBin} does not exist.`)
        if (to.status === 'blocked') throw new AppError(422, 'WAREHOUSE_LOCATION_INVALID', `Bin ${to.code} is blocked.`)
        const balance = db.balances.rows().find((b) => b.sku === input.sku && b.warehouseId === input.warehouseId)
        if (!balance || balance.available < input.quantity) throw new AppError(409, 'INSUFFICIENT_STOCK', `Not enough available ${input.sku} to move.`)
        await db.balances.update(balance.id, { binCode: to.code })
        const w = db.warehouses.find(input.warehouseId)
        return db.tasks.create({ number: nextNumber(db.tasks.rows().map((t) => t.number), 'T-', 30001), type: 'move', status: 'completed', priority: 'normal', warehouseId: w.id, warehouseName: w.name, sku: input.sku, productTitle: balance.productTitle, quantity: input.quantity, quantityDone: input.quantity, fromBin: input.fromBin, toBin: to.code, orderNumber: null, waveNumber: null, assigneeName: actor(), dueAt: nowIso(), exception: null, history: [{ at: nowIso(), actor: actor(), event: `Moved ${input.quantity} from ${input.fromBin} to ${to.code}` }] })
      },
      () => http.post('/warehouse/moves', input),
    ),
}

export const wavesApi = {
  ...createResourceApi<PickWave>('/warehouse/pick-waves', db.waves),
  /** Batches allocated orders of one warehouse into a wave and creates its pick tasks. */
  create: (input: { warehouseId: string; strategy: PickWave['strategy']; maxOrders: number }) =>
    call<PickWave>(
      async () => {
        await latency(300, 600)
        const w = db.warehouses.find(input.warehouseId)
        const orders = db.orders.rows().filter((o) => o.status === 'allocated' && o.warehouseId === w.id).slice(0, input.maxOrders)
        if (!orders.length) throw new AppError(409, 'INVALID_STATE_TRANSITION', `No allocated orders waiting in ${w.name}.`)
        const number = nextNumber(db.waves.rows().map((x) => x.number), 'WAV-', 601)
        let units = 0
        for (const o of orders) {
          for (const it of o.items) {
            units += it.allocated
            const bin = db.balances.rows().find((b) => b.sku === it.sku && b.warehouseId === w.id)?.binCode ?? null
            await db.tasks.create({ number: nextNumber(db.tasks.rows().map((t) => t.number), 'T-', 30001), type: 'pick', status: 'open', priority: o.priority, warehouseId: w.id, warehouseName: w.name, sku: it.sku, productTitle: it.title, quantity: it.allocated, quantityDone: 0, fromBin: bin, toBin: 'PCK-01', orderNumber: o.number, waveNumber: number, assigneeName: null, dueAt: new Date(Date.now() + 3 * 3_600_000).toISOString(), exception: null, history: [{ at: nowIso(), actor: 'System', event: `Created in ${number}` }] })
          }
          await db.orders.update(o.id, { status: 'picking', timeline: [...o.timeline, { at: nowIso(), actor: actor(), event: `Added to ${number}` }] })
        }
        return db.waves.create({ number, warehouseName: w.name, strategy: input.strategy, status: 'released', ordersCount: orders.length, linesCount: orders.reduce((n, o) => n + o.items.length, 0), unitsPicked: 0, unitsTotal: units, assignees: [], cutoffAt: new Date(Date.now() + 4 * 3_600_000).toISOString() })
      },
      () => http.post('/warehouse/pick-waves', input),
    ),
}

export const packingApi = {
  ...createResourceApi<PackingSession>('/warehouse/packing-sessions', db.packing),
  /** Scans one unit of a SKU into the parcel; refuses items not on the order or already complete. */
  verify: ({ id, code }: { id: string; code: string }) =>
    call<PackingSession>(
      async () => {
        const s = db.packing.find(id)
        assertStatus(s.status, ['open', 'exception'], 'verify items')
        const value = code.trim().toUpperCase()
        const barcodeSku = db.products.rows().flatMap((p) => p.variants).find((v) => v.barcode === value)?.sku
        const item = s.items.find((i) => i.sku.toUpperCase() === value || i.sku === barcodeSku)
        if (!item) throw new AppError(422, 'PICK_QUANTITY_MISMATCH', `${value} is not on order ${s.orderNumber}.`)
        if (item.verified >= item.quantity) throw new AppError(422, 'PICK_QUANTITY_MISMATCH', `All ${item.quantity} of ${item.sku} already verified.`)
        const items = s.items.map((i) => (i === item ? { ...i, verified: i.verified + 1 } : i))
        return db.packing.update(id, { items, status: items.every((i) => i.verified >= i.quantity) ? 'verified' : 'open', packerName: s.packerName ?? actor() })
      },
      () => http.post(`/warehouse/packing-sessions/${id}/verify`, { code }),
    ),
  /** Requires every unit verified; marks the order packed and creates its shipment for booking. */
  pack: ({ id, packageType, weightKg }: { id: string; packageType: string; weightKg: number }) =>
    call<PackingSession>(
      async () => {
        await latency()
        const s = db.packing.find(id)
        assertStatus(s.status, ['verified'], 'pack (verify every item first)')
        const o = db.orders.find(s.orderId)
        const carrier = db.carriers.rows().find((c) => (o.currency === 'AED' ? c.country === 'AE' : c.country === 'PK') && c.status === 'connected')!
        const shipment = await db.shipments.create({ number: nextNumber(db.shipments.rows().map((x) => x.number), 'SHP-', 20001), orderId: o.id, orderNumber: o.number, carrierId: carrier.id, carrierName: carrier.name, service: carrier.services[0], trackingNumber: null, status: 'pending', packages: 1, weightKg, currency: o.currency, codAmount: o.paymentMethod === 'cod' ? o.total : 0, codStatus: o.paymentMethod === 'cod' ? 'pending' : 'not_applicable', destinationCity: o.shippingAddress.city, country: o.shippingAddress.country, bookedAt: null, deliveredAt: null, exception: null, events: [] })
        await db.orders.update(o.id, { status: 'packed', shipmentId: shipment.id, timeline: [...o.timeline, { at: nowIso(), actor: actor(), event: `Packed (${packageType}, ${weightKg} kg)` }] })
        return db.packing.update(id, { status: 'packed', packageType, weightKg })
      },
      () => http.post(`/warehouse/packing-sessions/${id}/pack`, { packageType, weightKg }),
    ),
  /** Opens a session for a picked order (status picking). */
  open: ({ orderId, station }: { orderId: string; station: string }) =>
    call<PackingSession>(
      async () => {
        const o = db.orders.find(orderId)
        assertStatus(o.status, ['picking', 'allocated'], 'open packing')
        const existing = db.packing.rows().find((p) => p.orderId === orderId && p.status !== 'packed')
        if (existing) return existing
        return db.packing.create({ orderId: o.id, orderNumber: o.number, warehouseName: o.warehouseName ?? '', station, status: 'open', items: o.items.map((i) => ({ sku: i.sku, title: i.title, quantity: i.quantity, verified: 0 })), packageType: null, weightKg: null, packerName: actor() })
      },
      () => http.post('/warehouse/packing-sessions', { orderId, station }),
    ),
}

export const dispatchApi = {
  ...createResourceApi<DispatchBatch>('/warehouse/dispatch-batches', db.dispatchBatches),
  /** Manifest of every booked, not yet manifested shipment for one carrier. */
  create: ({ carrierId }: { carrierId: string }) =>
    call<DispatchBatch>(
      async () => {
        const carrier = db.carriers.find(carrierId)
        const taken = new Set(db.dispatchBatches.rows().flatMap((b) => b.shipmentIds))
        const list = db.shipments.rows().filter((s) => s.carrierId === carrierId && s.status === 'booked' && !taken.has(s.id))
        if (!list.length) throw new AppError(409, 'INVALID_STATE_TRANSITION', `No booked ${carrier.name} shipments waiting for a manifest.`)
        const warehouse = db.orders.find(list[0].orderId).warehouseName ?? ''
        return db.dispatchBatches.create({ number: nextNumber(db.dispatchBatches.rows().map((b) => b.number), 'MAN-', 801), carrierName: carrier.name, warehouseName: warehouse, status: 'open', shipmentIds: list.map((s) => s.id), parcels: list.reduce((n, s) => n + s.packages, 0), driverName: null, vehicle: null, handedOverAt: null })
      },
      () => http.post('/warehouse/dispatch-batches', { carrierId }),
    ),
  /** Handover: shipments go in transit, orders become dispatched and stock leaves the warehouse. */
  handover: ({ id, driverName, vehicle }: { id: string; driverName: string; vehicle: string }) =>
    call<DispatchBatch>(
      async () => {
        await latency(300, 600)
        const b = db.dispatchBatches.find(id)
        assertStatus(b.status, ['open', 'closed'], 'hand over')
        for (const sid of b.shipmentIds) {
          const s = db.shipments.find(sid)
          if (s.status !== 'booked') continue
          const o = db.orders.find(s.orderId)
          for (const it of o.items) {
            if (o.warehouseId && it.allocated) {
              moveStock({ sku: it.sku, warehouseId: o.warehouseId, type: 'dispatch', field: 'reserved', quantity: -it.allocated, reference: ['order', o.number] })
              moveStock({ sku: it.sku, warehouseId: o.warehouseId, type: 'dispatch', quantity: -it.allocated, reference: ['order', o.number] })
            }
          }
          db.reservations.replaceAll(db.reservations.rows().map((r) => (r.orderId === o.id && r.status === 'active' ? { ...r, status: 'consumed' } : r)))
          await db.orders.update(o.id, { status: 'dispatched', items: o.items.map((i) => ({ ...i, fulfilled: i.allocated })), timeline: [...o.timeline, { at: nowIso(), actor: actor(), event: `Dispatched on ${b.number}` }] })
          await db.shipments.update(sid, { status: 'in_transit', events: [...s.events, { at: nowIso(), status: 'in_transit', location: b.warehouseName, description: `Handed over to ${driverName}` }] })
        }
        return db.dispatchBatches.update(id, { status: 'handed_over', driverName, vehicle, handedOverAt: nowIso() })
      },
      () => http.post(`/warehouse/dispatch-batches/${id}/handover`, { driverName, vehicle }),
    ),
}

export const staffApi = createResourceApi<StaffMember>('/warehouse/staff', db.staff)
