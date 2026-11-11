import { channelsApi } from '@/api/endpoints/commerce.api'
import { AppLogo } from '@/components/features/apps/AppLogo'

import { CHANNEL_META } from '@/constants/domain.constants'
import { regionOf } from '@/constants/regions.constants'
import { humanize } from '@/constants/status.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/commerce.types'


/** Logo tile for the sales channel an order came from (cached channel list). */
export function ChannelLogo({ channelId, size = 'sm' }: { channelId: string; size?: 'sm' | 'md' | 'lg' }) {
  const channels = useAll('channels', channelsApi.list)
  const ch = channels.data?.data.find((c) => c.id === channelId)
  return <AppLogo appId={ch?.type ?? 'manual'} size={size} fallbackIcon={ch ? CHANNEL_META[ch.type]?.icon : 'ri-store-2-line'} />
}

export function CountryFlag({ code, withName = false }: { code: string; withName?: boolean }) {
  const r = regionOf(code)
  return <span title={r?.name ?? code}>{r?.flag ?? code}{withName && <span className="ms-1">{r?.name ?? code}</span>}</span>
}

const PAYMENT_ICON: Record<PaymentMethod, string> = { cod: 'ri-hand-coin-line', prepaid: 'ri-bank-card-line', bank_transfer: 'ri-bank-line' }
const PAYMENT_TONE: Record<PaymentStatus, string> = { pending: 'warning', paid: 'success', cod_pending: 'orange', cod_collected: 'success', refunded: 'secondary' }

export function PaymentPill({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const tone = PAYMENT_TONE[status]
  return (
    <span className={`pay-pill tone-${tone}`}>
      <i className={PAYMENT_ICON[method]} />
      <span>{method === 'cod' ? 'COD' : humanize(method)}</span>
      <span className="pay-pill-status">{humanize(status.replace('cod_', ''))}</span>
    </span>
  )
}

/** Coloured initials tile standing in for a product image. */
export function ItemThumb({ title, size = 44 }: { title: string; size?: number }) {
  const hue = [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
  const letters = title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return <span className="item-thumb" style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue} 70% 92%), hsl(${(hue + 40) % 360} 70% 84%))`, color: `hsl(${hue} 55% 32%)` }} aria-hidden="true">{letters}</span>
}

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'pending_validation', label: 'Placed', icon: 'ri-shopping-bag-3-line' },
  { key: 'ready_to_allocate', label: 'Validated', icon: 'ri-shield-check-line' },
  { key: 'allocated', label: 'Allocated', icon: 'ri-stack-line' },
  { key: 'picking', label: 'Picking', icon: 'ri-hand-coin-line' },
  { key: 'packed', label: 'Packed', icon: 'ri-archive-2-line' },
  { key: 'dispatched', label: 'Dispatched', icon: 'ri-truck-line' },
  { key: 'delivered', label: 'Delivered', icon: 'ri-home-smile-line' },
]
const STEP_INDEX: Record<OrderStatus, number> = { pending_validation: 0, on_hold: 0, ready_to_allocate: 1, partially_allocated: 1, allocated: 2, picking: 3, packed: 4, dispatched: 5, delivered: 6, delivery_failed: 5, returned: 6, cancelled: -1 }

/** Horizontal fulfilment stepper; exceptions (hold, failed delivery, return, cancel) colour the current step. */
export function OrderProgress({ status }: { status: OrderStatus }) {
  const current = STEP_INDEX[status]
  const problem = status === 'on_hold' || status === 'delivery_failed' || status === 'cancelled' || status === 'returned'
  const pct = current < 0 ? 0 : (current / (STEPS.length - 1)) * 100
  return (
    <div className={`order-steps ${problem ? `has-${status}` : ''}`} aria-label={`Fulfilment progress: ${humanize(status)}`}>
      <div className="order-steps-track"><span style={{ width: `${pct}%` }} /></div>
      {STEPS.map((s, i) => {
        const state = current < 0 ? 'todo' : i < current ? 'done' : i === current ? (problem ? 'problem' : 'current') : 'todo'
        const label = i === current && problem ? humanize(status) : s.label
        return (
          <div key={s.key} className={`order-step ${state}`}>
            <span className="order-step-dot"><i className={state === 'done' ? 'ri-check-line' : state === 'problem' ? 'ri-error-warning-line' : s.icon} /></span>
            <span className="order-step-label">{label}</span>
          </div>
        )
      })}
      {status === 'cancelled' && <div className="order-steps-banner"><i className="ri-close-circle-line" /> Cancelled</div>}
    </div>
  )
}
