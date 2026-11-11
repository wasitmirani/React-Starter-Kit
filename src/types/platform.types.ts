import type { Entity } from './common.types'

export interface WebhookEndpoint extends Entity {
  url: string
  description: string
  events: string[]
  status: 'active' | 'disabled'
  /** Only the prefix is ever shown after creation. */
  secretPrefix: string
  successRate: number
  lastDeliveryAt: string | null
}

export interface WebhookDelivery extends Entity {
  endpointId: string
  event: string
  statusCode: number | null
  success: boolean
  attempt: number
  durationMs: number
  requestBody: string
  responseBody: string
}

export interface Plan {
  id: 'free' | 'starter' | 'business' | 'enterprise'
  name: string
  priceMonthly: number | null
  description: string
  features: string[]
  limits: { orders: number | null; warehouses: number | null; seats: number | null }
}

export interface UsageItem {
  key: string
  label: string
  icon: string
  used: number
  included: number | null
  unit: string
  overageRate: number | null
}

export interface Subscription {
  planId: Plan['id']
  cycle: 'monthly' | 'yearly'
  status: 'active' | 'trialing' | 'past_due' | 'cancelled'
  renewsAt: string
  seats: number
  creditBalance: number
  paymentMethod: { brand: string; last4: string; expires: string } | null
  usage: UsageItem[]
}

export interface Invoice extends Entity {
  number: string
  periodStart: string
  periodEnd: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'failed'
}

export interface AppNotification extends Entity {
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  link: string | null
  read: boolean
}

export interface Kpi {
  value: number
  previous: number
}

/** Dashboard payload: one call, bounded aggregates only (never raw ledger rows). */
export interface DashboardOverview {
  period: { from: string; to: string }
  currency: string
  timezone: string
  kpis: {
    revenue: Kpi
    orders: Kpi
    unitsShipped: Kpi
    onTimeDispatch: Kpi
    inventoryValue: Kpi
    returnRate: Kpi
  }
  ordersByStatus: Record<string, number>
  daily: { date: string; orders: number; revenue: number; shipped: number }[]
  ordersByChannel: { channel: string; orders: number; revenue: number }[]
  lowStock: { sku: string; title: string; warehouse: string; available: number; reorderPoint: number }[]
  taskBacklog: { type: string; open: number; overdue: number }[]
  inbound: { purchaseOrdersDue: number; receiptsExpected: number; unitsIncoming: number }
  exceptions: { deliveryFailed: number; onHold: number; failedEvents: number; shortPicks: number }
  channelHealth: { name: string; status: string; lastSyncAt: string | null; errors24h: number }[]
}

export type ReportFormat = 'number' | 'currency' | 'percent'

export interface Report {
  key: string
  title: string
  definition: string
  columns: { key: string; label: string; format: ReportFormat }[]
  rows: { label: string; values: Record<string, number> }[]
  chart: { labels: string[]; series: { key: string; label: string; values: number[] }[] } | null
}

export interface ServiceHealth {
  name: string
  owner: 'nestjs' | 'go' | 'fastapi' | 'infra'
  status: 'operational' | 'degraded' | 'down'
  latencyMs: number
  uptime30d: number
  detail: string
}

export interface TenantPreferences {
  baseCurrency: string
  enabledCurrencies: string[]
  timezone: string
  weightUnit: 'kg' | 'lb'
  dimensionUnit: 'cm' | 'in'
  operatingMode: 'merchant' | 'threepl' | 'both'
  orderPrefix: string
  taxes: { country: string; name: string; rate: number; inclusive: boolean }[]
  backorderPolicy: 'reject' | 'allow' | 'hold'
  allocationStrategy: 'nearest' | 'fifo' | 'fefo' | 'priority'
}
