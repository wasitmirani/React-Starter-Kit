import { env } from '@/config/env.config'
import { latency } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { callFor, createResourceApi, http } from '@/api/resource'
import { PLANS } from '@/constants/billing.constants'
import type { AppNotification, DashboardOverview, Plan, Report, ServiceHealth, Subscription, TenantPreferences } from '@/types/platform.types'

const call = callFor('platform')
const DAY = 86_400_000
const SUBSCRIPTION_KEY = `${env.appSlug}.mock.v1.subscription`
const PREFERENCES_KEY = `${env.appSlug}.mock.v1.preferences`

function mockSubscription(): Subscription {
  const stored = localStorage.getItem(SUBSCRIPTION_KEY)
  if (stored) return JSON.parse(stored) as Subscription
  const renews = new Date()
  renews.setMonth(renews.getMonth() + 1, 1)
  const monthStart = Date.now() - 30 * DAY
  return {
    planId: 'business',
    cycle: 'monthly',
    status: 'active',
    renewsAt: renews.toISOString(),
    seats: 25,
    creditBalance: 0,
    paymentMethod: { brand: 'Visa', last4: '4242', expires: '08/28' },
    usage: [
      { key: 'orders', label: 'Orders', icon: 'ri-shopping-bag-3-line', used: db.orders.rows().filter((o) => new Date(o.placedAt).getTime() > monthStart).length, included: 25_000, unit: 'orders', overageRate: 0.02 },
      { key: 'warehouses', label: 'Warehouses', icon: 'ri-building-4-line', used: db.warehouses.rows().length, included: 10, unit: 'warehouses', overageRate: 49 },
      { key: 'skus', label: 'Active SKUs', icon: 'ri-price-tag-3-line', used: db.products.rows().flatMap((p) => p.variants).length, included: null, unit: 'SKUs', overageRate: null },
      { key: 'labels', label: 'Shipping labels', icon: 'ri-truck-line', used: db.shipments.rows().length, included: 30_000, unit: 'labels', overageRate: 0.01 },
      { key: 'seats', label: 'Seats', icon: 'ri-team-line', used: 6, included: 25, unit: 'seats', overageRate: 15 },
    ],
  }
}

export const billingApi = {
  plans: () => call<Plan[]>(async () => PLANS, () => http.get('/billing/plans')),
  subscription: () => call<Subscription>(async () => (await latency(), mockSubscription()), () => http.get('/billing/subscription')),
  changePlan: (planId: Plan['id'], cycle: Subscription['cycle']) =>
    call<Subscription>(async () => {
      await latency(400, 800)
      const next = { ...mockSubscription(), planId, cycle }
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(next))
      return next
    }, () => http.post('/billing/subscription', { planId, cycle })),
  invoices: createResourceApi('/billing/invoices', db.invoices).list,
}

export const notificationsApi = {
  ...createResourceApi('/notifications', db.notifications),
  markAllRead: () =>
    call(async () => {
      db.notifications.replaceAll(db.notifications.rows().map((n): AppNotification => ({ ...n, read: true })))
    }, () => http.post<void>('/notifications/read-all')),
}

const inRange = (iso: string, from: number, to: number) => {
  const t = new Date(iso).getTime()
  return t >= from && t < to
}

/** Revenue in the tenant base currency (AED converted at a fixed demo rate). */
const toBase = (amount: number, currency: string) => (currency === 'AED' ? amount * 75 : amount)

export const dashboardApi = {
  overview: (days: number, warehouseId?: string) =>
    call<DashboardOverview>(
      async () => {
        await latency(200, 450)
        const now = Date.now()
        const from = now - days * DAY
        const prevFrom = from - days * DAY
        const orders = db.orders.rows().filter((o) => !warehouseId || o.warehouseId === warehouseId)
        const live = orders.filter((o) => o.status !== 'cancelled')
        const cur = live.filter((o) => inRange(o.placedAt, from, now))
        const prev = live.filter((o) => inRange(o.placedAt, prevFrom, from))
        const revenue = (list: typeof orders) => Math.round(list.reduce((n, o) => n + toBase(o.total, o.currency), 0))
        const units = (list: typeof orders) => list.filter((o) => ['dispatched', 'delivered', 'returned', 'delivery_failed'].includes(o.status)).reduce((n, o) => n + o.items.reduce((m, i) => m + i.fulfilled, 0), 0)
        const shipments = db.shipments.rows()
        const balances = db.balances.rows().filter((b) => !warehouseId || b.warehouseId === warehouseId)
        const value = Math.round(balances.reduce((n, b) => n + toBase(b.onHand * b.unitCost, b.warehouseId === 'wh-dxb' ? 'AED' : 'PKR'), 0))
        const returns = db.returns.rows()
        const byStatus: Record<string, number> = {}
        for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1
        const daily = Array.from({ length: days }, (_, i) => {
          const start = from + i * DAY
          const list = live.filter((o) => inRange(o.placedAt, start, start + DAY))
          return { date: new Date(start).toISOString().slice(0, 10), orders: list.length, revenue: revenue(list), shipped: shipments.filter((s) => s.bookedAt && inRange(s.bookedAt, start, start + DAY)).length }
        })
        const channels = new Map<string, { orders: number; revenue: number }>()
        for (const o of cur) {
          const c = channels.get(o.channelName) ?? { orders: 0, revenue: 0 }
          channels.set(o.channelName, { orders: c.orders + 1, revenue: c.revenue + toBase(o.total, o.currency) })
        }
        const tasks = db.tasks.rows().filter((t) => t.status !== 'completed' && (!warehouseId || t.warehouseId === warehouseId))
        return {
          period: { from: new Date(from).toISOString(), to: new Date(now).toISOString() },
          currency: 'PKR',
          timezone: 'Asia/Karachi',
          kpis: {
            revenue: { value: revenue(cur), previous: revenue(prev) },
            orders: { value: cur.length, previous: prev.length },
            unitsShipped: { value: units(cur), previous: units(prev) },
            onTimeDispatch: { value: 0.94, previous: 0.91 },
            inventoryValue: { value, previous: Math.round(value * 0.96) },
            returnRate: { value: cur.length ? returns.length / live.length : 0, previous: 0.041 },
          },
          ordersByStatus: byStatus,
          daily,
          ordersByChannel: [...channels.entries()].map(([channel, v]) => ({ channel, orders: v.orders, revenue: Math.round(v.revenue) })).sort((a, b) => b.revenue - a.revenue),
          lowStock: balances.filter((b) => b.available <= b.reorderPoint).sort((a, b) => a.available - b.available).slice(0, 6).map((b) => ({ sku: b.sku, title: b.productTitle, warehouse: b.warehouseName, available: b.available, reorderPoint: b.reorderPoint })),
          taskBacklog: ['pick', 'pack', 'putaway', 'replenish', 'count', 'move'].map((type) => ({ type, open: tasks.filter((t) => t.type === type).length, overdue: tasks.filter((t) => t.type === type && new Date(t.dueAt).getTime() < now).length })),
          inbound: {
            purchaseOrdersDue: db.purchaseOrders.rows().filter((p) => ['approved', 'partially_received'].includes(p.status) && new Date(p.expectedAt).getTime() < now + 7 * DAY).length,
            receiptsExpected: db.receipts.rows().filter((r) => r.status !== 'completed').length,
            unitsIncoming: balances.reduce((n, b) => n + b.incoming, 0),
          },
          exceptions: {
            deliveryFailed: shipments.filter((s) => s.status === 'delivery_failed').length,
            onHold: orders.filter((o) => o.status === 'on_hold').length,
            failedEvents: db.failedEvents.rows().filter((e) => e.status === 'failed').length,
            shortPicks: db.tasks.rows().filter((t) => t.status === 'exception').length,
          },
          channelHealth: db.channels.rows().map((c) => ({ name: c.name, status: c.status, lastSyncAt: c.lastSyncAt, errors24h: c.errors24h })),
        }
      },
      () => http.get('/analytics/dashboard', { days, warehouse_id: warehouseId }),
    ),
}

export const REPORT_CATALOG = [
  { key: 'sales', title: 'Sales and order volume', group: 'Commerce' },
  { key: 'channels', title: 'Orders by channel', group: 'Commerce' },
  { key: 'inventory_value', title: 'Inventory availability and valuation', group: 'Inventory' },
  { key: 'low_stock', title: 'Low stock and reorder', group: 'Inventory' },
  { key: 'productivity', title: 'Warehouse productivity', group: 'Warehouse' },
  { key: 'carriers', title: 'Carrier performance', group: 'Shipping' },
  { key: 'returns', title: 'Returns and reasons', group: 'Shipping' },
  { key: 'suppliers', title: 'Supplier performance', group: 'Procurement' },
  { key: 'client_charges', title: '3PL client charges', group: '3PL' },
  { key: 'cod', title: 'COD collected vs remitted', group: 'Finance' },
] as const

function buildReport(key: string, days: number): Report {
  const from = Date.now() - days * DAY
  const group = <T>(rows: T[], by: (r: T) => string) => {
    const m = new Map<string, T[]>()
    for (const r of rows) m.set(by(r), [...(m.get(by(r)) ?? []), r])
    return [...m.entries()]
  }
  const meta = REPORT_CATALOG.find((r) => r.key === key) ?? REPORT_CATALOG[0]
  const base = { key, title: meta.title, chart: null }
  switch (key) {
    case 'sales': {
      const orders = db.orders.rows().filter((o) => o.status !== 'cancelled' && new Date(o.placedAt).getTime() >= from)
      const rows = group(orders, (o) => o.placedAt.slice(0, 10)).sort(([a], [b]) => a.localeCompare(b)).map(([label, list]) => ({ label, values: { orders: list.length, units: list.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0), revenue: Math.round(list.reduce((n, o) => n + toBase(o.total, o.currency), 0)) } }))
      return { ...base, definition: 'Orders placed per day (cancelled excluded). Revenue = order total incl. shipping and tax, converted to PKR.', columns: [{ key: 'orders', label: 'Orders', format: 'number' }, { key: 'units', label: 'Units', format: 'number' }, { key: 'revenue', label: 'Revenue', format: 'currency' }], rows, chart: { labels: rows.map((r) => r.label), series: [{ key: 'revenue', label: 'Revenue', values: rows.map((r) => r.values.revenue) }] } }
    }
    case 'channels': {
      const orders = db.orders.rows().filter((o) => new Date(o.placedAt).getTime() >= from)
      const rows = group(orders, (o) => o.channelName).map(([label, list]) => ({ label, values: { orders: list.length, cancelled: list.filter((o) => o.status === 'cancelled').length, revenue: Math.round(list.reduce((n, o) => n + toBase(o.total, o.currency), 0)), aov: Math.round(list.reduce((n, o) => n + toBase(o.total, o.currency), 0) / list.length) } }))
      return { ...base, definition: 'Orders and revenue by sales channel. AOV = revenue / orders.', columns: [{ key: 'orders', label: 'Orders', format: 'number' }, { key: 'cancelled', label: 'Cancelled', format: 'number' }, { key: 'revenue', label: 'Revenue', format: 'currency' }, { key: 'aov', label: 'AOV', format: 'currency' }], rows, chart: { labels: rows.map((r) => r.label), series: [{ key: 'orders', label: 'Orders', values: rows.map((r) => r.values.orders) }] } }
    }
    case 'inventory_value':
    case 'low_stock': {
      const balances = db.balances.rows()
      if (key === 'low_stock') {
        const rows = balances.filter((b) => b.available <= b.reorderPoint).map((b) => ({ label: `${b.sku} · ${b.warehouseName}`, values: { available: b.available, reorderPoint: b.reorderPoint, incoming: b.incoming, shortfall: Math.max(0, b.reorderPoint - b.available) } }))
        return { ...base, definition: 'SKU-warehouse pairs where available ≤ reorder point. Available = on hand − reserved − damaged − quarantined.', columns: [{ key: 'available', label: 'Available', format: 'number' }, { key: 'reorderPoint', label: 'Reorder point', format: 'number' }, { key: 'incoming', label: 'Incoming', format: 'number' }, { key: 'shortfall', label: 'Shortfall', format: 'number' }], rows }
      }
      const rows = group(balances, (b) => b.warehouseName).map(([label, list]) => ({ label, values: { onHand: list.reduce((n, b) => n + b.onHand, 0), reserved: list.reduce((n, b) => n + b.reserved, 0), available: list.reduce((n, b) => n + b.available, 0), value: Math.round(list.reduce((n, b) => n + toBase(b.onHand * b.unitCost, b.warehouseId === 'wh-dxb' ? 'AED' : 'PKR'), 0)) } }))
      return { ...base, definition: 'Current balances by warehouse. Value = on hand × unit cost (moving average), in PKR.', columns: [{ key: 'onHand', label: 'On hand', format: 'number' }, { key: 'reserved', label: 'Reserved', format: 'number' }, { key: 'available', label: 'Available', format: 'number' }, { key: 'value', label: 'Value', format: 'currency' }], rows, chart: { labels: rows.map((r) => r.label), series: [{ key: 'available', label: 'Available', values: rows.map((r) => r.values.available) }, { key: 'reserved', label: 'Reserved', values: rows.map((r) => r.values.reserved) }] } }
    }
    case 'productivity': {
      const rows = db.staff.rows().map((s) => ({ label: `${s.name} (${s.role})`, values: { tasks: s.tasksToday, uph: s.unitsPerHour, accuracy: s.accuracy } }))
      return { ...base, definition: 'Tasks completed today, units per hour and scan accuracy (correct scans / all scans).', columns: [{ key: 'tasks', label: 'Tasks', format: 'number' }, { key: 'uph', label: 'Units / hour', format: 'number' }, { key: 'accuracy', label: 'Accuracy', format: 'percent' }], rows, chart: { labels: rows.map((r) => r.label.split(' (')[0]), series: [{ key: 'uph', label: 'Units / hour', values: rows.map((r) => r.values.uph) }] } }
    }
    case 'carriers': {
      const rows = group(db.shipments.rows().filter((s) => s.bookedAt), (s) => s.carrierName).map(([label, list]) => ({ label, values: { shipments: list.length, delivered: list.filter((s) => s.status === 'delivered').length, failed: list.filter((s) => s.status === 'delivery_failed' || s.status === 'rto').length, successRate: list.filter((s) => s.status === 'delivered').length / list.length } }))
      return { ...base, definition: 'Shipments booked per carrier. Success rate = delivered / booked.', columns: [{ key: 'shipments', label: 'Shipments', format: 'number' }, { key: 'delivered', label: 'Delivered', format: 'number' }, { key: 'failed', label: 'Failed / RTO', format: 'number' }, { key: 'successRate', label: 'Success rate', format: 'percent' }], rows, chart: { labels: rows.map((r) => r.label), series: [{ key: 'delivered', label: 'Delivered', values: rows.map((r) => r.values.delivered) }, { key: 'failed', label: 'Failed / RTO', values: rows.map((r) => r.values.failed) }] } }
    }
    case 'returns': {
      const rows = group(db.returns.rows(), (r) => r.reason).map(([label, list]) => ({ label, values: { returns: list.length, units: list.reduce((n, r) => n + r.items.reduce((m, i) => m + i.quantity, 0), 0), refunded: Math.round(list.filter((r) => r.refundStatus === 'refunded').reduce((n, r) => n + toBase(r.refundAmount, r.currency), 0)) } }))
      return { ...base, definition: 'Return requests by customer reason. Refunded amount in PKR.', columns: [{ key: 'returns', label: 'Returns', format: 'number' }, { key: 'units', label: 'Units', format: 'number' }, { key: 'refunded', label: 'Refunded', format: 'currency' }], rows }
    }
    case 'suppliers': {
      const rows = db.suppliers.rows().map((s) => {
        const pos = db.purchaseOrders.rows().filter((p) => p.supplierId === s.id)
        const lines = pos.flatMap((p) => p.lines)
        const received = lines.reduce((n, l) => n + l.received, 0)
        return { label: s.name, values: { orders: pos.length, onTime: s.onTimeRate, rejectRate: received ? lines.reduce((n, l) => n + l.rejected, 0) / received : 0, leadTime: s.leadTimeDays } }
      })
      return { ...base, definition: 'Purchase orders per supplier, on-time receipt rate and rejected / received units.', columns: [{ key: 'orders', label: 'POs', format: 'number' }, { key: 'onTime', label: 'On time', format: 'percent' }, { key: 'rejectRate', label: 'Reject rate', format: 'percent' }, { key: 'leadTime', label: 'Lead time (days)', format: 'number' }], rows }
    }
    case 'client_charges': {
      const usage = db.usage.rows().filter((u) => new Date(u.createdAt).getTime() >= from)
      const rows = group(usage, (u) => u.clientName).map(([label, list]) => {
        const values: Record<string, number> = { total: Math.round(list.reduce((n, u) => n + u.amount, 0)) }
        for (const act of ['storage', 'pick', 'pack', 'dispatch']) values[act] = Math.round(list.filter((u) => u.activity === act).reduce((n, u) => n + u.amount, 0))
        return { label, values }
      })
      return { ...base, definition: 'Billable usage by client and activity, in each client’s rate card currency.', columns: [{ key: 'storage', label: 'Storage', format: 'number' }, { key: 'pick', label: 'Pick', format: 'number' }, { key: 'pack', label: 'Pack', format: 'number' }, { key: 'dispatch', label: 'Dispatch', format: 'number' }, { key: 'total', label: 'Total', format: 'number' }], rows }
    }
    default: {
      const rows = db.codRemittances.rows().map((r) => ({ label: `${r.number} · ${r.carrierName}`, values: { collected: r.collected, fees: r.fees, remitted: r.remitted, variance: Math.round(r.collected - r.fees - r.remitted) } }))
      return { ...base, definition: 'COD collected by carriers vs remitted to the tenant. Variance = collected − fees − remitted (pending remittances show the full amount).', columns: [{ key: 'collected', label: 'Collected', format: 'number' }, { key: 'fees', label: 'Fees', format: 'number' }, { key: 'remitted', label: 'Remitted', format: 'number' }, { key: 'variance', label: 'Variance', format: 'number' }], rows }
    }
  }
}

export const reportsApi = {
  get: (key: string, days: number) => call<Report>(async () => (await latency(200, 450), buildReport(key, days)), () => http.get(`/reports/${key}`, { days })),
}

export const systemApi = {
  health: () =>
    call<ServiceHealth[]>(
      async () => {
        await latency()
        const failing = db.connectors.rows().filter((c) => c.status === 'error').length
        return [
          { name: 'Core API', owner: 'nestjs', status: 'operational', latencyMs: 84, uptime30d: 0.9997, detail: 'Auth, tenants, orders, catalog, procurement, billing' },
          { name: 'Inventory & WMS service', owner: 'go', status: 'operational', latencyMs: 21, uptime30d: 0.9999, detail: 'Reservations, ledger, tasks and scans' },
          { name: 'Intelligence service', owner: 'fastapi', status: 'operational', latencyMs: 140, uptime30d: 0.998, detail: 'Reports, forecasting, imports' },
          { name: 'Integration workers', owner: 'infra', status: failing ? 'degraded' : 'operational', latencyMs: 310, uptime30d: 0.996, detail: failing ? `${failing} connectors failing; events queued for retry` : 'All connectors healthy' },
          { name: 'PostgreSQL', owner: 'infra', status: 'operational', latencyMs: 4, uptime30d: 1, detail: 'Primary + 1 replica' },
          { name: 'RabbitMQ', owner: 'infra', status: 'operational', latencyMs: 2, uptime30d: 0.9998, detail: `Outbox lag 0.4 s · DLQ ${db.failedEvents.rows().filter((e) => e.status === 'failed').length}` },
          { name: 'Redis', owner: 'infra', status: 'operational', latencyMs: 1, uptime30d: 1, detail: 'Cache and rate limits only (never source of truth)' },
        ]
      },
      () => http.get('/system/health'),
    ),
}

const DEFAULT_PREFERENCES: TenantPreferences = {
  baseCurrency: 'PKR',
  enabledCurrencies: ['PKR', 'AED'],
  timezone: 'Asia/Karachi',
  weightUnit: 'kg',
  dimensionUnit: 'cm',
  operatingMode: 'both',
  orderPrefix: 'LW-',
  taxes: [
    { country: 'PK', name: 'GST', rate: 18, inclusive: true },
    { country: 'AE', name: 'VAT', rate: 5, inclusive: false },
  ],
  backorderPolicy: 'hold',
  allocationStrategy: 'nearest',
}

export const preferencesApi = {
  get: () => call<TenantPreferences>(async () => JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null') ?? DEFAULT_PREFERENCES, () => http.get('/settings/operations')),
  save: (prefs: TenantPreferences) =>
    call<TenantPreferences>(async () => {
      await latency()
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
      return prefs
    }, () => http.put('/settings/operations', prefs)),
}
