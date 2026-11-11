import { AppError, errorMessage } from '@/api/errors'
import { latency, nowIso, uid } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { actor, assertStatus, moveStock, nextNumber } from '@/api/mock/ops'
import { callFor, createResourceApi, http } from '@/api/resource'
import { ORDER_ACTIONS, type OrderAction } from '@/constants/domain.constants'
import type { Customer, ImportJob, Order, OrderItem, OrderStatus, Product, SalesChannel } from '@/types/commerce.types'
import type { EntityInput } from '@/types/common.types'

const call = callFor('commerce')

export interface ManualOrderInput {
  channelId: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  paymentMethod: Order['paymentMethod']
  currency: Order['currency']
  priority: Order['priority']
  shippingAddress: Order['shippingAddress']
  items: { sku: string; quantity: number; unitPrice: number }[]
  shipping: number
  discount: number
  note: string
}

export interface BulkResult {
  id: string
  number: string
  ok: boolean
  message: string
}

const event = (o: Order, text: string, note?: string): Order['timeline'] => [...o.timeline, { at: nowIso(), actor: actor(), event: text, note }]

function titleOf(sku: string) {
  for (const p of db.products.rows()) {
    const v = p.variants.find((x) => x.sku === sku)
    if (v) return `${p.title}${v.title !== 'Default' ? ` · ${v.title}` : ''}`
  }
  throw new AppError(422, 'VALIDATION_ERROR', `SKU ${sku} does not exist in the catalog.`)
}

/** Reserves stock line by line in one warehouse; partial when a line is short. */
function allocate(o: Order): Order {
  const warehouses = db.warehouses.rows()
  const warehouse = warehouses.find((w) => w.id === o.warehouseId) ?? warehouses.find((w) => (o.currency === 'AED' ? w.country === 'AE' : w.country === 'PK'))!
  const items: OrderItem[] = o.items.map((it) => {
    const need = it.quantity - it.allocated
    if (need <= 0) return it
    const balance = db.balances.rows().find((b) => b.sku === it.sku && b.warehouseId === warehouse.id)
    const take = Math.min(need, balance?.available ?? 0)
    if (take > 0) {
      moveStock({ sku: it.sku, warehouseId: warehouse.id, type: 'reservation', field: 'reserved', quantity: take, reference: ['order', o.number] })
      db.reservations.replaceAll([{ id: uid(), orderId: o.id, orderNumber: o.number, sku: it.sku, warehouseName: warehouse.name, quantity: take, status: 'active', createdAt: nowIso(), updatedAt: nowIso() }, ...db.reservations.rows()])
    }
    return { ...it, allocated: it.allocated + take }
  })
  const allocated = items.reduce((n, it) => n + it.allocated, 0)
  if (allocated === 0) throw new AppError(409, 'INSUFFICIENT_STOCK', `No available stock in ${warehouse.name} for this order.`)
  const full = items.every((it) => it.allocated >= it.quantity)
  return { ...o, items, warehouseId: warehouse.id, warehouseName: warehouse.name, status: full ? 'allocated' : 'partially_allocated', timeline: event(o, full ? `Allocated to ${warehouse.code}` : `Partially allocated in ${warehouse.code}`) }
}

/** Releases only active reservations; dispatched goods are never reversed automatically. */
function releaseReservations(o: Order) {
  const active = db.reservations.rows().filter((r) => r.orderId === o.id && r.status === 'active')
  for (const r of active) {
    const w = db.warehouses.rows().find((x) => x.name === r.warehouseName)!
    moveStock({ sku: r.sku, warehouseId: w.id, type: 'reservation_release', field: 'reserved', quantity: -r.quantity, reference: ['order', o.number] })
  }
  db.reservations.replaceAll(db.reservations.rows().map((r) => (r.orderId === o.id && r.status === 'active' ? { ...r, status: 'released', updatedAt: nowIso() } : r)))
}

function applyAction(o: Order, action: OrderAction, reason?: string): Order {
  assertStatus(o.status, Object.entries(ORDER_ACTIONS).filter(([, a]) => a.includes(action)).map(([s]) => s), action)
  switch (action) {
    case 'validate':
      return { ...o, status: 'ready_to_allocate', timeline: event(o, 'Validated') }
    case 'hold':
      return { ...o, status: 'on_hold', holdReason: reason || 'Manual hold', timeline: event(o, 'Placed on hold', reason) }
    case 'release':
      return { ...o, status: o.items.some((i) => i.allocated > 0) ? 'allocated' : 'ready_to_allocate', holdReason: null, timeline: event(o, 'Hold released', reason) }
    case 'allocate':
      return allocate(o)
    case 'cancel':
      releaseReservations(o)
      return { ...o, status: 'cancelled', items: o.items.map((i) => ({ ...i, allocated: 0 })), timeline: event(o, 'Cancelled', reason) }
  }
}

async function mockAction(id: string, action: OrderAction, reason?: string): Promise<Order> {
  await latency()
  const next = applyAction(db.orders.find(id), action, reason)
  return db.orders.update(id, next)
}

export const ordersApi = {
  ...createResourceApi<Order>('/orders', db.orders),
  create: (input: ManualOrderInput) =>
    call<Order>(
      async () => {
        await latency()
        const channel = db.channels.find(input.channelId)
        const items = input.items.map((i) => ({ ...i, title: titleOf(i.sku), allocated: 0, fulfilled: 0 }))
        const subtotal = items.reduce((n, i) => n + i.quantity * i.unitPrice, 0)
        const tax = input.currency === 'AED' ? (subtotal - input.discount) * 0.05 : 0
        const number = nextNumber(db.orders.rows().map((o) => o.number), 'LW-', 10001)
        let customer = db.customers.rows().find((c) => c.phone === input.customerPhone)
        if (!customer) customer = await db.customers.create({ name: input.customerName, email: input.customerEmail, phone: input.customerPhone, city: input.shippingAddress.city, country: input.shippingAddress.country, ordersCount: 0, totalSpent: 0, currency: input.currency, lastOrderAt: null, tags: [] })
        const total = Math.round((subtotal - input.discount + input.shipping + tax) * 100) / 100
        await db.customers.update(customer.id, { ordersCount: customer.ordersCount + 1, totalSpent: customer.totalSpent + total, lastOrderAt: nowIso() })
        return db.orders.create({
          number, externalId: null, channelId: channel.id, channelName: channel.name, customerId: customer.id, customerName: input.customerName, customerPhone: input.customerPhone, customerEmail: input.customerEmail,
          clientId: null, clientName: null, warehouseId: null, warehouseName: null, status: 'pending_validation', priority: input.priority, paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === 'cod' ? 'cod_pending' : 'pending', currency: input.currency, items, subtotal, discount: input.discount, shipping: input.shipping, tax, total,
          shippingAddress: input.shippingAddress, tags: [], holdReason: null, shipmentId: null, placedAt: nowIso(),
          timeline: [{ at: nowIso(), actor: actor(), event: 'Order created manually', note: input.note || undefined }],
        })
      },
      () => http.post('/orders', input),
    ),
  action: ({ id, action, reason }: { id: string; action: OrderAction; reason?: string }) =>
    call<Order>(() => mockAction(id, action, reason), () => http.post(`/orders/${id}/${action === 'release' ? 'release-hold' : action}`, { reason })),
  /** Applies one action to many orders; each record reports its own result. */
  bulk: ({ ids, action, reason }: { ids: string[]; action: OrderAction; reason?: string }) =>
    call<BulkResult[]>(
      async () => {
        const results: BulkResult[] = []
        for (const id of ids) {
          const number = db.orders.find(id).number
          try {
            await mockAction(id, action, reason)
            results.push({ id, number, ok: true, message: 'Done' })
          } catch (e) {
            results.push({ id, number, ok: false, message: errorMessage(e) })
          }
        }
        return results
      },
      () => http.post('/orders/bulk', { ids, action, reason }),
    ),
  counts: () =>
    call<Record<OrderStatus | 'all', number>>(
      async () => {
        await latency(60, 150)
        const counts = { all: 0 } as Record<OrderStatus | 'all', number>
        for (const o of db.orders.rows()) {
          counts[o.status] = (counts[o.status] ?? 0) + 1
          counts.all += 1
        }
        return counts
      },
      () => http.get('/orders/counts'),
    ),
}

export const customersApi = createResourceApi<Customer>('/customers', db.customers)

function decorateProduct(p: Product): Product {
  const rows = db.balances.rows().filter((b) => b.productId === p.id)
  return { ...p, onHand: rows.reduce((n, b) => n + b.onHand, 0), available: rows.reduce((n, b) => n + b.available, 0) }
}

export const productsApi = {
  ...createResourceApi<Product>('/products', db.products, { decorate: decorateProduct }),
  create: (input: EntityInput<Product>) =>
    call<Product>(
      async () => {
        const skus = new Set(db.products.rows().flatMap((p) => p.variants.map((v) => v.sku)))
        const dup = input.variants.find((v) => skus.has(v.sku))
        if (dup) throw new AppError(409, 'VALIDATION_ERROR', `SKU ${dup.sku} already exists.`, { variants: [`Duplicate SKU ${dup.sku}`] })
        return db.products.create({ ...input, variants: input.variants.map((v) => ({ ...v, id: v.id || uid() })), onHand: 0, available: 0 })
      },
      () => http.post('/products', input),
    ),
  /** Every SKU for pickers: `{ sku, title, price }`. */
  skus: () =>
    call<{ sku: string; title: string; price: number; productId: string }[]>(
      async () => db.products.rows().filter((p) => p.status === 'active').flatMap((p) => p.variants.map((v) => ({ sku: v.sku, title: `${p.title}${v.title !== 'Default' ? ` · ${v.title}` : ''}`, price: v.price, productId: p.id }))),
      () => http.get('/products/skus'),
    ),
}

export const channelsApi = {
  ...createResourceApi<SalesChannel>('/channels', db.channels),
  sync: (id: string) =>
    call<SalesChannel>(
      async () => {
        await latency(600, 1100)
        return db.channels.update(id, { lastSyncAt: nowIso(), status: 'connected', errors24h: 0 })
      },
      () => http.post(`/channels/${id}/sync`),
    ),
}

export interface ImportRequest {
  type: ImportJob['type']
  fileName: string
  rows: Record<string, string>[]
}

export const importsApi = {
  ...createResourceApi<ImportJob>('/imports', db.imports),
  /** Validates rows; failed rows come back with actionable messages. */
  run: (req: ImportRequest) =>
    call<ImportJob>(
      async () => {
        await latency(500, 900)
        const errors = req.rows.flatMap((row, i) => {
          const sku = row.sku ?? row.SKU
          if (!sku) return [{ row: i + 2, message: 'Column "sku" is empty' }]
          if (req.type === 'products' && !(row.title ?? row.Title)) return [{ row: i + 2, message: 'Column "title" is empty' }]
          return []
        })
        return db.imports.create({ type: req.type, fileName: req.fileName, status: errors.length === 0 ? 'completed' : errors.length === req.rows.length ? 'failed' : 'partial', totalRows: req.rows.length, succeeded: req.rows.length - errors.length, failed: errors.length, createdBy: actor(), errors })
      },
      () => http.post('/imports', req),
    ),
}
