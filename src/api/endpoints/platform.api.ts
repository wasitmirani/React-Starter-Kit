import { latency } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { createFaker } from '@/api/mock/faker'
import { callFor, createResourceApi, http } from '@/api/resource'
import { useAuthStore } from '@/store/auth.store'
import { PLANS } from '@/constants/billing.constants'
import type { Channel } from '@/types/channel.types'
import type {
  AnalyticsOverview,
  AppNotification,
  Integration,
  ChannelSeries,
  Plan,
  Subscription,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/types/platform.types'

const call = callFor('platform')

export const formsApi = createResourceApi('/forms', db.forms)

export const webhooksApi = {
  ...createResourceApi('/webhook-endpoints', db.webhooks),
  deliveries: (endpointId?: string) =>
    call<WebhookDelivery[]>(
      async () => {
        await latency()
        return db.deliveries.query({ filters: { endpointId } }).slice(0, 50)
      },
      () => http.get('/webhook-deliveries', { endpoint_id: endpointId }),
    ),
  /** Sends a signed `ping` event to the endpoint. */
  sendTest: (id: string) =>
    call<WebhookDelivery>(
      async () => {
        await latency(300, 700)
        const endpoint = db.webhooks.find(id)
        const ok = endpoint.status === 'active'
        return db.deliveries.create({
          endpointId: id,
          event: 'ping',
          statusCode: ok ? 200 : null,
          success: ok,
          attempt: 1,
          durationMs: 120,
          requestBody: JSON.stringify({ type: 'ping', createdAt: new Date().toISOString() }, null, 2),
          responseBody: ok ? '{"ok":true}' : 'Endpoint disabled',
        })
      },
      () => http.post(`/webhook-endpoints/${id}/test`),
    ),
  redeliver: (deliveryId: string) =>
    call<WebhookDelivery>(
      async () => {
        await latency(300, 700)
        return db.deliveries.update(deliveryId, { success: true, statusCode: 200, responseBody: '{"ok":true}' })
      },
      () => http.post(`/webhook-deliveries/${deliveryId}/redeliver`),
    ),
  /** The full secret is returned once; only its prefix is stored for display. */
  rotateSecret: (id: string) =>
    call<{ endpoint: WebhookEndpoint; secret: string }>(
      async () => {
        const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`
        const endpoint = await db.webhooks.update(id, { secretPrefix: secret.slice(0, 10) })
        return { endpoint, secret }
      },
      () => http.post(`/webhook-endpoints/${id}/rotate-secret`),
    ),
}

const SUBSCRIPTION_KEY = 'birdcrm.mock.v1.subscription'

function mockSubscription(): Subscription {
  const stored = localStorage.getItem(SUBSCRIPTION_KEY)
  if (stored) return JSON.parse(stored) as Subscription
  const renews = new Date()
  renews.setMonth(renews.getMonth() + 1, 1)
  return {
    planId: 'business',
    cycle: 'monthly',
    status: 'active',
    renewsAt: renews.toISOString(),
    seats: 5,
    creditBalance: 42.5,
    paymentMethod: { brand: 'Visa', last4: '4242', expires: '08/28' },
    usage: [
      { key: 'contacts', label: 'Contacts', channel: null, used: db.contacts.rows().length, included: 50_000, unit: 'contacts', overageRate: null },
      { key: 'email', label: 'Emails', channel: 'email', used: 184_210, included: 250_000, unit: 'emails', overageRate: 0.0008 },
      { key: 'sms', label: 'SMS segments', channel: 'sms', used: 12_840, included: null, unit: 'segments', overageRate: 0.0079 },
      { key: 'whatsapp', label: 'WhatsApp conversations', channel: 'whatsapp', used: 3_412, included: 1_000, unit: 'conversations', overageRate: 0.0147 },
      { key: 'voice', label: 'Voice minutes', channel: 'voice', used: 1_830, included: 2_000, unit: 'minutes', overageRate: 0.013 },
      { key: 'seats', label: 'Seats', channel: null, used: 4, included: 5, unit: 'seats', overageRate: 25 },
    ],
  }
}

export const billingApi = {
  plans: () => call<Plan[]>(async () => PLANS, () => http.get('/billing/plans')),
  subscription: () =>
    call<Subscription>(
      async () => {
        await latency()
        return mockSubscription()
      },
      () => http.get('/billing/subscription'),
    ),
  changePlan: (planId: Plan['id'], cycle: Subscription['cycle']) =>
    call<Subscription>(
      async () => {
        await latency(400, 800)
        const next = { ...mockSubscription(), planId, cycle }
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(next))
        return next
      },
      () => http.post('/billing/subscription', { planId, cycle }),
    ),
  invoices: createResourceApi('/billing/invoices', db.invoices).list,
}

/**
 * Connections to third-party apps used by automation steps. The backend runs the
 * provider's OAuth flow on connect and keeps tokens in `SecretStore`; they are never returned.
 */
export const integrationsApi = {
  list: createResourceApi('/integrations', db.integrations).list,
  connect: (id: string, account: string) =>
    call<Integration>(
      async () => {
        await latency(500, 900)
        return db.integrations.update(id, { status: 'connected', account, connectedBy: useAuthStore.getState().user?.name ?? 'You', connectedAt: new Date().toISOString() })
      },
      () => http.post(`/integrations/${id}/connect`, { account }),
    ),
  disconnect: (id: string) =>
    call<Integration>(
      async () => {
        await latency(200, 400)
        return db.integrations.update(id, { status: 'disconnected', account: null, connectedBy: null, connectedAt: null })
      },
      () => http.post(`/integrations/${id}/disconnect`),
    ),
}

export const notificationsApi = {
  ...createResourceApi('/notifications', db.notifications),
  markAllRead: () =>
    call(
      async () => {
        db.notifications.replaceAll(db.notifications.rows().map((n): AppNotification => ({ ...n, read: true })))
      },
      () => http.post<void>('/notifications/read-all'),
    ),
}

const SERIES_CHANNELS: [Channel, number][] = [
  ['email', 5200],
  ['sms', 900],
  ['whatsapp', 1400],
  ['voice', 120],
]

function buildSeries(days: number, offsetDays: number): ChannelSeries[] {
  return SERIES_CHANNELS.map(([channel, base]) => ({
    channel,
    points: Array.from({ length: days }, (_, i) => {
      const dayIndex = offsetDays + days - 1 - i
      const date = new Date(Date.now() - dayIndex * 86_400_000)
      const f = createFaker(Math.floor(date.getTime() / 86_400_000) * 31 + base)
      const weekday = date.getDay()
      const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1
      const sent = Math.round(base * weekend * (0.7 + f.rand() * 0.6))
      const failed = Math.round(sent * (0.005 + f.rand() * 0.02))
      const delivered = sent - failed - Math.round(sent * f.rand() * 0.02)
      const engaged = Math.round(delivered * (channel === 'email' ? 0.28 : channel === 'whatsapp' ? 0.62 : 0.12) * (0.8 + f.rand() * 0.4))
      return { date: date.toISOString().slice(0, 10), sent, delivered, engaged, failed }
    }),
  }))
}

function totals(series: ChannelSeries[], days: number, seed: number): AnalyticsOverview['totals'] {
  const sum = (key: 'sent' | 'delivered' | 'engaged' | 'failed') =>
    series.reduce((n, s) => n + s.points.reduce((m, p) => m + p[key], 0), 0)
  const f = createFaker(seed)
  return {
    sent: sum('sent'),
    delivered: sum('delivered'),
    engaged: sum('engaged'),
    failed: sum('failed'),
    conversations: Math.round(days * (38 + f.rand() * 10)),
    newContacts: Math.round(days * (42 + f.rand() * 14)),
    revenue: Math.round(days * (1800 + f.rand() * 600)),
    avgFirstResponseMin: Number((4 + f.rand() * 4).toFixed(1)),
  }
}

export const analyticsApi = {
  overview: (days: number) =>
    call<AnalyticsOverview>(
      async () => {
        await latency(200, 450)
        const series = buildSeries(days, 0)
        const previous = buildSeries(days, days)
        let running = db.contacts.rows().length - days * 45
        return {
          period: { from: series[0].points[0].date, to: series[0].points[days - 1].date },
          totals: totals(series, days, days),
          previous: totals(previous, days, days + 1),
          series,
          contactGrowth: series[0].points.map((p, i) => {
            running += Math.round(30 + ((i * 37) % 30))
            return { date: p.date, value: Math.max(0, running) }
          }),
        }
      },
      () => http.get('/analytics/overview', { days }),
    ),
}
