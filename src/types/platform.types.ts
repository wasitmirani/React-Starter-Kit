import type { Channel } from './channel.types'
import type { Entity } from './common.types'

export type FormFieldType = 'email' | 'text' | 'phone' | 'number' | 'select' | 'checkbox' | 'date'

export interface SignupFormField {
  id: string
  type: FormFieldType
  label: string
  /** Contact attribute the answer is saved to. */
  attribute: string
  required: boolean
  options: string[]
}

export interface SignupForm extends Entity {
  name: string
  type: 'embedded' | 'popup' | 'landing_page'
  status: 'published' | 'draft'
  listId: string | null
  doubleOptIn: boolean
  title: string
  description: string
  submitLabel: string
  successMessage: string
  fields: SignupFormField[]
  views: number
  submissions: number
}

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
  limits: { contacts: number | null; emails: number | null; seats: number | null }
}

export interface UsageItem {
  key: string
  label: string
  channel: Channel | null
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

/** Daily counts per channel, used by dashboards and reports. */
export interface ChannelSeries {
  channel: Channel
  points: { date: string; sent: number; delivered: number; engaged: number; failed: number }[]
}

export interface AnalyticsOverview {
  period: { from: string; to: string }
  totals: {
    sent: number
    delivered: number
    engaged: number
    failed: number
    conversations: number
    newContacts: number
    revenue: number
    avgFirstResponseMin: number
  }
  previous: AnalyticsOverview['totals']
  series: ChannelSeries[]
  contactGrowth: { date: string; value: number }[]
}

/** A workspace's connection to a third-party app used by automation steps. */
export interface Integration extends Entity {
  app: import('@/constants/automation.constants').IntegrationApp
  status: 'connected' | 'disconnected'
  /** Account or workspace name on the other side, e.g. "Northwind HQ". */
  account: string | null
  connectedBy: string | null
  connectedAt: string | null
}
