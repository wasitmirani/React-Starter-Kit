import { AppError } from '@/api/errors'
import { latency, nowIso } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { actor, assertStatus, moveStock, nextNumber, warehouseByName } from '@/api/mock/ops'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { CarrierAccount, CodRemittance, ReturnCondition, ReturnDisposition, ReturnRequest, Shipment } from '@/types/shipping.types'

const call = callFor('shipping')

export const shipmentsApi = {
  ...createResourceApi<Shipment>('/shipments', db.shipments),
  /**
   * Books with the carrier. A carrier failure leaves the shipment pending (never
   * marks the order shipped). Repeating a booked request returns the same booking.
   */
  book: ({ id, carrierId, service }: { id: string; carrierId: string; service: string }) =>
    call<Shipment>(
      async () => {
        await latency(500, 1000)
        const s = db.shipments.find(id)
        if (s.status === 'booked') return s
        assertStatus(s.status, ['pending'], 'book')
        const carrier = db.carriers.find(carrierId)
        if (carrier.status !== 'connected') throw new AppError(502, 'CARRIER_BOOKING_FAILED', `${carrier.name} rejected the booking: account connection error. The shipment stays pending.`)
        return db.shipments.update(id, { carrierId, carrierName: carrier.name, service, status: 'booked', trackingNumber: `${carrier.carrier.toUpperCase().slice(0, 3)}${Math.floor(100000000 + Math.random() * 899999999)}`, bookedAt: nowIso(), events: [{ at: nowIso(), status: 'booked', location: '', description: `Booked with ${carrier.name} (${service})` }] })
      },
      () => http.post(`/shipments/${id}/book`, { carrierId, service }),
    ),
  cancel: (id: string) =>
    call<Shipment>(async () => {
      const s = db.shipments.find(id)
      assertStatus(s.status, ['pending', 'booked'], 'cancel')
      return db.shipments.update(id, { status: 'cancelled', events: [...s.events, { at: nowIso(), status: 'cancelled', location: '', description: `Cancelled by ${actor()}` }] })
    }, () => http.post(`/shipments/${id}/cancel`)),
  /** Retry delivery or return to origin after a failed attempt. */
  resolveException: ({ id, resolution }: { id: string; resolution: 'reattempt' | 'rto' }) =>
    call<Shipment>(async () => {
      const s = db.shipments.find(id)
      assertStatus(s.status, ['delivery_failed'], 'resolve')
      const status = resolution === 'reattempt' ? 'out_for_delivery' : 'rto'
      return db.shipments.update(id, { status, exception: null, events: [...s.events, { at: nowIso(), status, location: s.destinationCity, description: resolution === 'reattempt' ? 'Reattempt requested' : 'Return to origin requested' }] })
    }, () => http.post(`/shipments/${id}/resolve`, { resolution })),
  label: (id: string) => call<{ url: string }>(async () => ({ url: `data:text/plain,Label for ${db.shipments.find(id).trackingNumber}` }), () => http.get(`/shipments/${id}/label`)),
}

export const carriersApi = {
  ...createResourceApi<CarrierAccount>('/carriers', db.carriers),
  test: (id: string) =>
    call<CarrierAccount>(async () => {
      await latency(500, 900)
      const c = db.carriers.find(id)
      if (c.status === 'error') throw new AppError(502, 'CARRIER_AUTH_FAILED', `${c.name} rejected the credentials. Update the API key and try again.`)
      return c
    }, () => http.post(`/carriers/${id}/test`)),
}

export const codApi = {
  ...createResourceApi<CodRemittance>('/cod-remittances', db.codRemittances),
  mark: ({ id, status }: { id: string; status: CodRemittance['status'] }) => call<CodRemittance>(() => db.codRemittances.update(id, { status }), () => http.post(`/cod-remittances/${id}/status`, { status })),
}

export const returnsApi = {
  ...createResourceApi<ReturnRequest>('/returns', db.returns),
  create: (input: { orderId: string; reason: string; items: { sku: string; quantity: number }[] }) =>
    call<ReturnRequest>(
      async () => {
        const o = db.orders.find(input.orderId)
        if (!['delivered', 'dispatched', 'delivery_failed'].includes(o.status)) throw new AppError(409, 'INVALID_STATE_TRANSITION', 'Only shipped orders can be returned.')
        const items = input.items.filter((i) => i.quantity > 0).map((i) => {
          const line = o.items.find((x) => x.sku === i.sku)!
          if (i.quantity > line.quantity) throw new AppError(422, 'VALIDATION_ERROR', `Cannot return more than ${line.quantity} of ${i.sku}.`)
          return { sku: i.sku, title: line.title, quantity: i.quantity, condition: null, disposition: null }
        })
        if (!items.length) throw new AppError(422, 'VALIDATION_ERROR', 'Choose at least one item.')
        return db.returns.create({ number: nextNumber(db.returns.rows().map((r) => r.number), 'RMA-', 5001), orderId: o.id, orderNumber: o.number, customerName: o.customerName, warehouseName: o.warehouseName ?? '', status: 'requested', reason: input.reason, items, refundStatus: 'none', refundAmount: items.reduce((n, i) => n + i.quantity * (o.items.find((x) => x.sku === i.sku)?.unitPrice ?? 0), 0), currency: o.currency, trackingNumber: null })
      },
      () => http.post('/returns', input),
    ),
  decide: ({ id, approve }: { id: string; approve: boolean }) =>
    call<ReturnRequest>(async () => {
      assertStatus(db.returns.find(id).status, ['requested'], approve ? 'approve' : 'reject')
      return db.returns.update(id, { status: approve ? 'approved' : 'rejected', refundStatus: approve ? 'pending' : 'none' })
    }, () => http.post(`/returns/${id}/${approve ? 'approve' : 'reject'}`)),
  receive: (id: string) =>
    call<ReturnRequest>(async () => {
      assertStatus(db.returns.find(id).status, ['approved'], 'receive')
      return db.returns.update(id, { status: 'received' })
    }, () => http.post(`/returns/${id}/receive`)),
  /** Inspection sets condition per item; stock is not sellable until disposition. */
  inspect: ({ id, items }: { id: string; items: { sku: string; condition: ReturnCondition; disposition: ReturnDisposition }[] }) =>
    call<ReturnRequest>(async () => {
      const r = db.returns.find(id)
      assertStatus(r.status, ['received'], 'inspect')
      return db.returns.update(id, { status: 'inspected', items: r.items.map((i) => ({ ...i, ...items.find((x) => x.sku === i.sku) })) })
    }, () => http.post(`/returns/${id}/inspect`, { items })),
  /** Applies dispositions once: restock adds sellable stock, quarantine holds it. */
  complete: (id: string) =>
    call<ReturnRequest>(
      async () => {
        await latency()
        const r = db.returns.find(id)
        assertStatus(r.status, ['inspected'], 'complete')
        const w = warehouseByName(r.warehouseName)
        for (const i of r.items) {
          if (i.disposition === 'restock') moveStock({ sku: i.sku, warehouseId: w.id, type: 'customer_return', quantity: i.quantity, reference: ['return', r.number] })
          if (i.disposition === 'quarantine') {
            moveStock({ sku: i.sku, warehouseId: w.id, type: 'customer_return', quantity: i.quantity, reference: ['return', r.number] })
            moveStock({ sku: i.sku, warehouseId: w.id, type: 'quarantine', field: 'quarantined', quantity: i.quantity, reference: ['return', r.number] })
          }
        }
        const o = db.orders.find(r.orderId)
        await db.orders.update(o.id, { status: 'returned', timeline: [...o.timeline, { at: nowIso(), actor: actor(), event: `Return ${r.number} completed` }] })
        return db.returns.update(id, { status: 'completed', refundStatus: 'refunded' })
      },
      () => http.post(`/returns/${id}/restock`),
    ),
}
