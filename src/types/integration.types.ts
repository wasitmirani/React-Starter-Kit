import type { Entity } from './common.types'

export type ConnectorKind = 'marketplace' | 'storefront' | 'courier' | 'payments' | 'accounting' | 'messaging' | 'marketing'

export interface Connector extends Entity {
  provider: string
  kind: ConnectorKind
  name: string
  /** Market the account sells or ships in (AE, SA, US, GB, AU…); null for global apps. */
  region?: string | null
  status: 'connected' | 'error' | 'disconnected'
  mode: 'live' | 'sandbox'
  account: string | null
  capabilities: string[]
  lastSyncAt: string | null
  errors24h: number
}

export interface SyncJob extends Entity {
  connectorId: string
  connectorName: string
  type: 'orders_import' | 'inventory_publish' | 'product_sync' | 'tracking_pull' | 'fulfillment_ack'
  status: 'queued' | 'running' | 'completed' | 'failed' | 'partial'
  processed: number
  failed: number
  startedAt: string
  finishedAt: string | null
}

export interface FailedEvent extends Entity {
  source: string
  eventType: string
  externalId: string
  error: string
  attempts: number
  status: 'failed' | 'retrying' | 'resolved' | 'ignored'
  lastAttemptAt: string
  payload: string
}

export interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in'
  value: string
}

export interface RuleAction {
  type: RuleActionType
  value: string
}

export type RuleActionType =
  | 'add_tag'
  | 'place_hold'
  | 'assign_warehouse'
  | 'select_shipping_service'
  | 'notify_user'
  | 'set_priority'
  | 'create_replenishment'
  | 'book_cheapest_courier'
  | 'sync_inventory_to_channels'
  | 'update_listing_price'
  | 'split_order'
  | 'send_whatsapp'
  | 'send_email'
  | 'request_review'
  | 'create_purchase_order'
  | 'call_webhook'

export type RuleTrigger =
  | 'order_imported'
  | 'order_total_above'
  | 'order_cancelled'
  | 'inventory_below_reorder'
  | 'stock_out'
  | 'po_received'
  | 'task_overdue'
  | 'shipment_dispatched'
  | 'shipment_delivered'
  | 'delivery_failed'
  | 'return_received'
  | 'listing_error'
  | 'marketplace_sla_risk'
  | 'schedule_every_15_min'
  | 'schedule_daily'

export interface AutomationRule extends Entity {
  name: string
  description: string
  trigger: RuleTrigger
  conditions: RuleCondition[]
  actions: RuleAction[]
  status: 'active' | 'paused' | 'draft'
  version: number
  runs30d: number
  lastRunAt: string | null
}

export interface RuleExecution extends Entity {
  ruleId: string
  ruleName: string
  trigger: AutomationRule['trigger']
  subject: string
  result: 'success' | 'skipped' | 'failed' | 'dry_run'
  actionsApplied: string[]
  durationMs: number
  error: string | null
}
