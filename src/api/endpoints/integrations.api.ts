import { AppError } from '@/api/errors'
import { latency, nowIso } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { AutomationRule, Connector, FailedEvent, RuleExecution, SyncJob } from '@/types/integration.types'
import type { WebhookDelivery, WebhookEndpoint } from '@/types/platform.types'

const call = callFor('integrations')

export const connectorsApi = {
  ...createResourceApi<Connector>('/integrations', db.connectors),
  connect: ({ id, account, mode }: { id: string; account: string; mode: Connector['mode'] }) =>
    call<Connector>(async () => {
      await latency(600, 1000)
      return db.connectors.update(id, { status: 'connected', account, mode, errors24h: 0, lastSyncAt: nowIso() })
    }, () => http.post(`/integrations/${id}/connect`, { account, mode })),
  disconnect: (id: string) => call<Connector>(() => db.connectors.update(id, { status: 'disconnected', account: null, lastSyncAt: null }), () => http.post(`/integrations/${id}/disconnect`)),
  /** Queues a sync; the job appears in Sync jobs and reports its own result. */
  sync: (id: string) =>
    call<SyncJob>(
      async () => {
        await latency(400, 800)
        const c = db.connectors.find(id)
        if (c.status === 'disconnected') throw new AppError(409, 'INTEGRATION_DISCONNECTED', `Connect ${c.name} before syncing.`)
        const ok = c.status === 'connected'
        await db.connectors.update(id, { lastSyncAt: nowIso() })
        return db.syncJobs.create({ connectorId: c.id, connectorName: c.name, type: c.kind === 'courier' ? 'tracking_pull' : 'orders_import', status: ok ? 'completed' : 'failed', processed: ok ? Math.floor(Math.random() * 40) : 0, failed: ok ? 0 : 1, startedAt: nowIso(), finishedAt: nowIso() })
      },
      () => http.post(`/integrations/${id}/sync`),
    ),
}

export const syncJobsApi = createResourceApi<SyncJob>('/sync-jobs', db.syncJobs)

export const failedEventsApi = {
  ...createResourceApi<FailedEvent>('/failed-events', db.failedEvents),
  /** Manual replay after the cause is fixed; the same external event ID keeps it idempotent. */
  retry: (id: string) =>
    call<FailedEvent>(async () => {
      await latency(500, 900)
      const e = db.failedEvents.find(id)
      const fixed = !e.error.startsWith('SIGNATURE_INVALID')
      return db.failedEvents.update(id, { attempts: e.attempts + 1, lastAttemptAt: nowIso(), status: fixed ? 'resolved' : 'failed' })
    }, () => http.post(`/failed-events/${id}/retry`)),
  ignore: (id: string) => call<FailedEvent>(() => db.failedEvents.update(id, { status: 'ignored' }), () => http.post(`/failed-events/${id}/ignore`)),
}

export const webhooksApi = {
  ...createResourceApi<WebhookEndpoint>('/webhook-endpoints', db.webhooks),
  deliveries: (endpointId?: string) =>
    call<WebhookDelivery[]>(async () => {
      await latency()
      return db.deliveries.query({ filters: { endpointId } }).slice(0, 50)
    }, () => http.get('/webhook-deliveries', { endpoint_id: endpointId })),
  /** Sends a signed `ping` event to the endpoint. */
  sendTest: (id: string) =>
    call<WebhookDelivery>(async () => {
      await latency(300, 700)
      const ok = db.webhooks.find(id).status === 'active'
      return db.deliveries.create({ endpointId: id, event: 'ping', statusCode: ok ? 200 : null, success: ok, attempt: 1, durationMs: 120, requestBody: JSON.stringify({ type: 'ping', createdAt: nowIso() }, null, 2), responseBody: ok ? '{"ok":true}' : 'Endpoint disabled' })
    }, () => http.post(`/webhook-endpoints/${id}/test`)),
  redeliver: (deliveryId: string) =>
    call<WebhookDelivery>(async () => {
      await latency(300, 700)
      return db.deliveries.update(deliveryId, { success: true, statusCode: 200, responseBody: '{"ok":true}' })
    }, () => http.post(`/webhook-deliveries/${deliveryId}/redeliver`)),
  /** The full secret is returned once; only its prefix is stored for display. */
  rotateSecret: (id: string) =>
    call<{ endpoint: WebhookEndpoint; secret: string }>(async () => {
      const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`
      const endpoint = await db.webhooks.update(id, { secretPrefix: secret.slice(0, 10) })
      return { endpoint, secret }
    }, () => http.post(`/webhook-endpoints/${id}/rotate-secret`)),
}

export const rulesApi = {
  ...createResourceApi<AutomationRule>('/automation/rules', db.rules),
  /** Saving a published rule creates a new version. */
  update: (id: string, patch: Partial<AutomationRule>) =>
    call<AutomationRule>(async () => {
      const r = db.rules.find(id)
      const versioned = 'conditions' in patch || 'actions' in patch || 'trigger' in patch
      return db.rules.update(id, { ...patch, version: versioned && r.status !== 'draft' ? r.version + 1 : r.version })
    }, () => http.patch(`/automation/rules/${id}`, patch)),
  /** Evaluates the rule against recent orders without applying any action. */
  dryRun: (id: string) =>
    call<{ evaluated: number; matched: { subject: string; actions: string[] }[] }>(
      async () => {
        await latency(400, 800)
        const rule = db.rules.find(id)
        const sample = db.orders.rows().slice(0, 50)
        const matches = sample.filter((o) =>
          rule.conditions.every((c) => {
            const value = { payment_method: o.paymentMethod, order_total: String(o.total), destination_country: o.shippingAddress.country, destination_city: o.shippingAddress.city, channel: o.channelName, warehouse: o.warehouseName ?? '', customer_tag: o.tags.join(',') }[c.field] ?? ''
            if (c.operator === 'equals') return value === c.value
            if (c.operator === 'not_equals') return value !== c.value
            if (c.operator === 'greater_than') return Number(value) > Number(c.value)
            if (c.operator === 'less_than') return Number(value) < Number(c.value)
            if (c.operator === 'in') return c.value.split(',').map((x) => x.trim()).includes(value)
            return value.includes(c.value)
          }),
        )
        await db.executions.create({ ruleId: rule.id, ruleName: rule.name, trigger: rule.trigger, subject: `Dry run on ${sample.length} orders`, result: 'dry_run', actionsApplied: [], durationMs: 240, error: null })
        return { evaluated: sample.length, matched: matches.slice(0, 20).map((o) => ({ subject: o.number, actions: rule.actions.map((a) => `${a.type}: ${a.value}`) })) }
      },
      () => http.post(`/automation/rules/${id}/dry-run`),
    ),
}

export const executionsApi = createResourceApi<RuleExecution>('/automation/executions', db.executions)
