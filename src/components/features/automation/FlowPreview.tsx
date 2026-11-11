import { Fragment } from 'react'
import { humanize } from '@/constants/status.constants'
import type { AutomationRule, RuleActionType, RuleTrigger } from '@/types/integration.types'

const TRIGGER_ICONS: Partial<Record<RuleTrigger, string>> = {
  order_imported: 'ri-shopping-bag-3-line',
  order_cancelled: 'ri-close-circle-line',
  inventory_below_reorder: 'ri-stack-line',
  stock_out: 'ri-inbox-unarchive-line',
  shipment_dispatched: 'ri-truck-line',
  shipment_delivered: 'ri-map-pin-user-line',
  delivery_failed: 'ri-error-warning-line',
  listing_error: 'ri-alert-line',
  marketplace_sla_risk: 'ri-timer-flash-line',
  schedule_every_15_min: 'ri-time-line',
  schedule_daily: 'ri-calendar-schedule-line',
}

const ACTION_ICONS: Partial<Record<RuleActionType, string>> = {
  add_tag: 'ri-price-tag-3-line',
  place_hold: 'ri-pause-circle-line',
  assign_warehouse: 'ri-building-4-line',
  select_shipping_service: 'ri-truck-line',
  book_cheapest_courier: 'ri-scales-3-line',
  split_order: 'ri-git-branch-line',
  notify_user: 'ri-notification-3-line',
  set_priority: 'ri-flag-line',
  create_replenishment: 'ri-refresh-line',
  create_purchase_order: 'ri-file-list-3-line',
  sync_inventory_to_channels: 'ri-upload-cloud-2-line',
  update_listing_price: 'ri-exchange-dollar-line',
  send_whatsapp: 'ri-whatsapp-line',
  send_email: 'ri-mail-send-line',
  request_review: 'ri-star-smile-line',
  call_webhook: 'ri-webhook-line',
}

const OPERATOR_TEXT: Record<string, string> = { equals: 'is', not_equals: 'is not', greater_than: '>', less_than: '<', contains: 'contains', in: 'is one of' }

/** Read-only When → If → Then diagram of a rule. */
export function FlowPreview({ rule }: { rule: Pick<AutomationRule, 'trigger' | 'conditions' | 'actions'> }) {
  return (
    <div className="flow" aria-label="Automation flow">
      <div className="flow-node trigger">
        <span className="flow-icon"><i className={TRIGGER_ICONS[rule.trigger] ?? 'ri-flashlight-line'} /></span>
        <div><div className="flow-kicker">When</div><div className="fw-medium">{humanize(rule.trigger)}</div></div>
      </div>
      <div className="flow-link" />
      <div className="flow-node condition">
        <span className="flow-icon"><i className="ri-filter-3-line" /></span>
        <div className="min-w-0">
          <div className="flow-kicker">If</div>
          {rule.conditions.length ? rule.conditions.map((c, i) => <div key={i} className="fs-sm">{i > 0 && <span className="text-muted">and </span>}<strong>{humanize(c.field)}</strong> {OPERATOR_TEXT[c.operator] ?? c.operator} <code>{c.value || '…'}</code></div>) : <div className="fs-sm text-muted">Always</div>}
        </div>
      </div>
      {rule.actions.map((a, i) => (
        <Fragment key={i}>
          <div className="flow-link" />
          <div className="flow-node action">
            <span className="flow-icon"><i className={ACTION_ICONS[a.type] ?? 'ri-play-line'} /></span>
            <div className="min-w-0"><div className="flow-kicker">Then {rule.actions.length > 1 ? `(${i + 1})` : ''}</div><div className="fw-medium">{humanize(a.type)}</div>{a.value && <div className="text-muted fs-sm text-truncate">{a.value}</div>}</div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
