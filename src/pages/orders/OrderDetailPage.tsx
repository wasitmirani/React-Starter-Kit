import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { reservationsApi } from '@/api/endpoints/inventory.api'
import { returnsApi, shipmentsApi } from '@/api/endpoints/shipping.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError, Timeline } from '@/components/common/Misc'
import { Panel } from '@/components/common/Panel'
import { PromptDialog } from '@/components/common/PromptDialog'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { ChannelLogo, CountryFlag, ItemThumb, OrderProgress, PaymentPill } from '@/components/features/orders/OrderVisuals'
import { appIdByName } from '@/constants/apps.constants'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, TagList, ToneBadge } from '@/components/ui/StatusBadge'
import { ORDER_ACTIONS, ORDER_ACTION_META, type OrderAction } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useList, useOne } from '@/hooks/queries/resource.queries'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

const EVENT_ICONS: [RegExp, string, string][] = [
  [/cancel/i, 'ri-close-circle-line', 'secondary'],
  [/hold/i, 'ri-pause-circle-line', 'orange'],
  [/fail/i, 'ri-error-warning-line', 'danger'],
  [/deliver/i, 'ri-checkbox-circle-line', 'success'],
  [/dispatch|ship/i, 'ri-truck-line', 'info'],
  [/pack/i, 'ri-archive-2-line', 'primary'],
  [/pick|wave/i, 'ri-hand-coin-line', 'primary'],
  [/allocat/i, 'ri-stack-line', 'primary'],
  [/return/i, 'ri-arrow-go-back-line', 'pink'],
]

const digits = (phone: string) => phone.replace(/[^\d]/g, '')

export function OrderDetailPage() {
  const { id } = useParams()
  const order = useOne('orders', ordersApi.get, id)
  const reservations = useList('reservations', reservationsApi.list, { perPage: 50, filters: { orderId: id } })
  const shipment = useOne('shipments', shipmentsApi.get, order.data?.shipmentId ?? undefined)
  const returns = useList('returns', returnsApi.list, { perPage: 10, filters: { orderId: id } })
  const [prompt, setPrompt] = useState<OrderAction | null>(null)
  const [confirm, setConfirm] = useState<OrderAction | null>(null)
  const [copied, setCopied] = useState(false)
  const act = useAction('orders', ordersApi.action, { invalidates: ['reservations', 'balances', 'dashboard'], success: (o) => `${o.number}: ${humanize(o.status)}`, onSuccess: () => { setPrompt(null); setConfirm(null) } })

  if (order.isLoading) return <Loader label="Loading order…" />
  if (order.isError || !order.data) return <QueryError message={errorMessage(order.error)} onRetry={() => order.refetch()} />
  const o = order.data
  const money = (v: number) => formatMoney(v, o.currency)
  const allowed = ORDER_ACTIONS[o.status]
  const trigger = (a: OrderAction) => (a === 'hold' || a === 'cancel' ? setPrompt(a) : a === 'release' ? act.mutate({ id: o.id, action: a }) : setConfirm(a))
  const units = o.items.reduce((n, i) => n + i.quantity, 0)
  const allocatedUnits = o.items.reduce((n, i) => n + i.allocated, 0)
  const fulfilledUnits = o.items.reduce((n, i) => n + i.fulfilled, 0)
  const s = shipment.data
  const copyNumber = () => {
    navigator.clipboard?.writeText(o.number).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => undefined)
  }

  return (
    <>
      <Link to={ROUTES.ORDERS} className="d-inline-flex align-items-center gap-1 text-muted fs-sm mb-3 link-primary"><i className="ri-arrow-left-line" /> Orders</Link>

      <div className="order-hero fade-up">
        <div className="order-hero-main">
          <ChannelLogo channelId={o.channelId} size="lg" />
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h3 className="mb-0">{o.number}</h3>
              <button type="button" className="btn btn-sm btn-icon btn-light" onClick={copyNumber} aria-label="Copy order number" title="Copy"><i className={copied ? 'ri-check-line text-success' : 'ri-file-copy-line'} /></button>
              <StatusBadge status={o.status} />
              {o.priority !== 'normal' && <ToneBadge tone={o.priority === 'urgent' ? 'danger' : 'orange'} icon="ri-flashlight-line">{humanize(o.priority)}</ToneBadge>}
            </div>
            <div className="order-hero-meta">
              <span><i className="ri-store-2-line" /> {o.channelName}</span>
              {o.externalId && <span><i className="ri-hashtag" /> {o.externalId}</span>}
              <span><i className="ri-calendar-line" /> {formatDateTime(o.placedAt)}</span>
              <span><CountryFlag code={o.shippingAddress.country} /> {o.shippingAddress.city}</span>
              {o.warehouseName && <span><i className="ri-building-4-line" /> {o.warehouseName}</span>}
            </div>
          </div>
        </div>
        <div className="order-hero-total">
          <div className="text-muted fs-sm">Order total</div>
          <div className="order-total-amount tabular-nums">{money(o.total)}</div>
          <PaymentPill method={o.paymentMethod} status={o.paymentStatus} />
        </div>
        <div className="order-hero-actions">
          {allowed.map((a) => (
            <Guard key={a} permission={ORDER_ACTION_META[a].permission}>
              <button type="button" className={`btn btn-sm ${ORDER_ACTION_META[a].danger ? 'btn-outline-danger' : a === 'allocate' || a === 'validate' ? 'btn-primary' : 'btn-light'}`} disabled={act.isPending} onClick={() => trigger(a)}>
                <i className={`${ORDER_ACTION_META[a].icon} me-1`} />{ORDER_ACTION_META[a].label}
              </button>
            </Guard>
          ))}
          {['delivered', 'dispatched'].includes(o.status) && (
            <Guard permission="returns.approve">
              <Link className="btn btn-sm btn-light" to={`${ROUTES.RETURNS}?new=${o.id}`}><i className="ri-arrow-go-back-line me-1" />Create return</Link>
            </Guard>
          )}
          <Link className="btn btn-sm btn-light" to={`${ROUTES.DOCUMENTS_PRINT}?type=awb&ids=${o.id}`}><i className="ri-barcode-box-line me-1" />Airway bill</Link>
          <Link className="btn btn-sm btn-light" to={`${ROUTES.DOCUMENTS_PRINT}?type=invoice&ids=${o.id}`}><i className="ri-file-list-3-line me-1" />Invoice</Link>
        </div>
        <OrderProgress status={o.status} />
      </div>

      {o.holdReason && (
        <div className="alert alert-warning d-flex align-items-center gap-2"><i className="ri-pause-circle-line fs-5" /><div><strong>On hold:</strong> {o.holdReason}</div></div>
      )}

      <div className="row g-3 mb-4 fade-up d1">
        {[
          { label: 'Items', value: `${o.items.length} lines · ${units} units`, icon: 'ri-shopping-basket-2-line', tone: 'primary' },
          { label: 'Allocated', value: `${allocatedUnits} / ${units}`, icon: 'ri-stack-line', tone: allocatedUnits >= units ? 'success' : 'warning', pct: units ? allocatedUnits / units : 0 },
          { label: 'Fulfilled', value: `${fulfilledUnits} / ${units}`, icon: 'ri-archive-2-line', tone: fulfilledUnits >= units ? 'success' : 'info', pct: units ? fulfilledUnits / units : 0 },
          { label: 'Shipment', value: s ? humanize(s.status) : 'Not created', icon: 'ri-truck-line', tone: s?.status === 'delivered' ? 'success' : s ? 'info' : 'secondary' },
        ].map((k) => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="mini-kpi">
              <span className={`mini-kpi-icon bg-${k.tone}-subtle text-${k.tone}`}><i className={k.icon} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-muted fs-xs">{k.label}</div>
                <div className="fw-semibold text-truncate">{k.value}</div>
                {k.pct !== undefined && <div className="line-progress mt-1"><span className={`bg-${k.tone}`} style={{ width: `${Math.round(k.pct * 100)}%` }} /></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-xl-8 d-flex flex-column gap-4 fade-up d2">
          <Panel title="Line items" icon="ri-list-check" flush description="Price snapshots at order time; later catalog edits do not change them.">
            <ul className="order-lines">
              {o.items.map((i) => (
                <li key={i.sku}>
                  <ItemThumb title={i.title} />
                  <div className="flex-1 min-w-0">
                    <div className="fw-medium text-truncate">{i.title}</div>
                    <div className="text-muted fs-xs font-monospace">{i.sku}</div>
                    <div className="d-flex gap-3 fs-xs mt-1">
                      <span className={i.allocated < i.quantity && !['cancelled', 'pending_validation', 'on_hold'].includes(o.status) ? 'text-warning' : 'text-muted'}><i className="ri-stack-line" /> {i.allocated}/{i.quantity} allocated</span>
                      <span className="text-muted"><i className="ri-archive-2-line" /> {i.fulfilled}/{i.quantity} fulfilled</span>
                    </div>
                    <div className="line-progress mt-1" style={{ maxWidth: 220 }}><span className="bg-primary" style={{ width: `${(i.allocated / i.quantity) * 100}%` }} /></div>
                  </div>
                  <div className="text-end">
                    <div className="tabular-nums fw-semibold">{money(i.unitPrice * i.quantity)}</div>
                    <div className="text-muted fs-xs tabular-nums">{i.quantity} × {money(i.unitPrice)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="order-summary">
              {[['Subtotal', o.subtotal], ['Discount', -o.discount], ['Shipping', o.shipping], ['Tax', o.tax]].filter(([label, v]) => label === 'Subtotal' || v !== 0).map(([label, v]) => (
                <div key={label as string} className="d-flex justify-content-between"><span className="text-muted">{label}</span><span className={`tabular-nums ${(v as number) < 0 ? 'text-success' : ''}`}>{money(v as number)}</span></div>
              ))}
              <div className="d-flex justify-content-between order-summary-total"><span>Total</span><span className="tabular-nums">{money(o.total)}</span></div>
            </div>
          </Panel>

          <Panel title="Shipment and tracking" icon="ri-truck-line" actions={s && <Link to={to(ROUTES.SHIPMENT, { id: s.id })} className="btn btn-sm btn-light">Open shipment</Link>}>
            {s ? (
              <>
                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                  <AppLogo appId={appIdByName(s.carrierName)} fallbackIcon="ri-truck-line" />
                  <div className="flex-1 min-w-0"><div className="fw-semibold">{s.carrierName}</div><div className="text-muted fs-sm">{s.service} · {s.packages} parcel{s.packages > 1 ? 's' : ''} · {s.weightKg} kg</div></div>
                  <div className="text-end"><div className="font-monospace fw-medium">{s.trackingNumber ?? 'Not booked yet'}</div><StatusBadge status={s.status} /></div>
                </div>
                {s.codAmount > 0 && <div className="alert alert-light d-flex justify-content-between align-items-center py-2 mb-3"><span><i className="ri-hand-coin-line me-1" />Cash on delivery</span><strong>{money(s.codAmount)} · {humanize(s.codStatus)}</strong></div>}
                {s.events.length ? (
                  <ul className="track-list">
                    {[...s.events].reverse().map((e, i) => (
                      <li key={i} className={i === 0 ? 'latest' : ''}>
                        <span className="track-dot" />
                        <div className="d-flex justify-content-between gap-2"><span className="fw-medium">{e.description}</span><span className="text-muted fs-xs text-nowrap">{formatRelativeTime(e.at)}</span></div>
                        <div className="text-muted fs-xs">{e.location} · {humanize(e.status)}</div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted mb-0">No tracking events yet. They appear once the courier scans the parcel.</p>}
              </>
            ) : (
              <div className="empty-inline"><i className="ri-truck-line" /><div><div className="fw-medium">No shipment yet</div><div className="text-muted fs-sm">A shipment is created when the order is packed. The cheapest courier can be booked automatically.</div></div><Link to={ROUTES.COURIERS} className="btn btn-sm btn-light ms-auto">Compare couriers</Link></div>
            )}
          </Panel>

          <Panel title="Inventory allocation" icon="ri-stack-line" flush description={o.warehouseName ? `Reserved in ${o.warehouseName}` : 'Not allocated yet'}>
            {reservations.data?.data.length ? (
              <table className="table align-middle mb-0">
                <thead><tr className="text-muted fs-sm"><th>SKU</th><th>Warehouse</th><th className="text-end">Quantity</th><th>Status</th></tr></thead>
                <tbody>
                  {reservations.data.data.map((r) => (
                    <tr key={r.id}><td className="font-monospace">{r.sku}</td><td>{r.warehouseName}</td><td className="text-end tabular-nums">{r.quantity}</td><td><StatusBadge status={r.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted p-4 mb-0">No reservations. Stock is reserved when the order is allocated.</p>
            )}
          </Panel>

          {!!returns.data?.data.length && (
            <Panel title="Returns" icon="ri-arrow-go-back-line" flush>
              <ul className="list-group list-group-flush">
                {returns.data.data.map((r) => (
                  <li key={r.id} className="list-group-item d-flex justify-content-between gap-3">
                    <Link to={to(ROUTES.RETURN, { id: r.id })}>{r.number}</Link>
                    <span className="text-muted">{r.reason}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <div className="col-xl-4 d-flex flex-column gap-4 fade-up d3">
          <Panel title="Customer" icon="ri-user-3-line" actions={<Link to={to(ROUTES.CUSTOMER, { id: o.customerId })} className="btn btn-sm btn-light">History</Link>}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={o.customerName} size={48} />
              <div className="min-w-0"><div className="fw-semibold text-truncate">{o.customerName}</div><div className="text-muted fs-sm text-truncate">{o.customerEmail ?? 'No email'}</div></div>
            </div>
            <div className="contact-actions mb-3">
              <a href={`tel:${digits(o.customerPhone)}`} className="contact-btn"><i className="ri-phone-line" />Call</a>
              <a href={`https://wa.me/${digits(o.customerPhone)}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp"><i className="ri-whatsapp-line" />WhatsApp</a>
              {o.customerEmail ? <a href={`mailto:${o.customerEmail}?subject=${encodeURIComponent(`Your order ${o.number}`)}`} className="contact-btn"><i className="ri-mail-line" />Email</a> : <span className="contact-btn disabled"><i className="ri-mail-line" />Email</span>}
            </div>
            <div className="address-card">
              <i className="ri-map-pin-2-line" />
              <address className="mb-0">
                <strong>{o.shippingAddress.name}</strong><br />{o.shippingAddress.line1}<br />{o.shippingAddress.area}, {o.shippingAddress.city}<br />{o.shippingAddress.province}, <CountryFlag code={o.shippingAddress.country} withName />
                <div className="text-muted fs-sm mt-1"><i className="ri-phone-line" /> {o.customerPhone}</div>
              </address>
            </div>
          </Panel>

          <Panel title="Payment and channel" icon="ri-bank-card-line">
            <div className="detail-grid">
              <span>Payment</span><span><PaymentPill method={o.paymentMethod} status={o.paymentStatus} /></span>
              <span>Currency</span><span>{o.currency}</span>
              <span>Channel</span><span className="d-flex align-items-center gap-2"><ChannelLogo channelId={o.channelId} />{o.channelName}</span>
              {o.clientName && <><span>3PL client</span><span>{o.clientName}</span></>}
              <span>Tags</span><span>{o.tags.length ? <TagList tags={o.tags} /> : <span className="text-muted">None</span>}</span>
            </div>
          </Panel>

          <Panel title="Activity" icon="ri-history-line" description="Every transition with actor, time and reason.">
            <Timeline
              items={[...o.timeline].reverse().map((e, i) => {
                const [, icon, tone] = EVENT_ICONS.find(([re]) => re.test(e.event)) ?? [null, 'ri-record-circle-line', 'secondary']
                return { id: String(i), icon, tone, title: e.event, description: [e.actor, e.note].filter(Boolean).join(' · '), at: formatDateTime(e.at) }
              })}
            />
          </Panel>
        </div>
      </div>

      <PromptDialog
        open={prompt !== null}
        title={prompt ? ORDER_ACTION_META[prompt].label : ''}
        message={prompt === 'cancel' ? 'Active reservations are released. Dispatched goods are never reversed automatically.' : 'The order stops until someone releases the hold.'}
        label="Reason"
        confirmLabel={prompt ? ORDER_ACTION_META[prompt].label : ''}
        danger={prompt === 'cancel'}
        busy={act.isPending}
        onClose={() => setPrompt(null)}
        onConfirm={(reason) => prompt && act.mutate({ id: o.id, action: prompt, reason })}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? `${ORDER_ACTION_META[confirm].label}?` : ''}
        message={confirm === 'allocate' ? 'Reserves available stock in the order’s warehouse (or the nearest one). Lines without stock stay unallocated.' : 'Marks the order as validated and ready to allocate.'}
        confirmLabel={confirm ? ORDER_ACTION_META[confirm].label : ''}
        busy={act.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && act.mutate({ id: o.id, action: confirm })}
      />
    </>
  )
}
