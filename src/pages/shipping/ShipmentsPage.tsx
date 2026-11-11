import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { shipmentsApi } from '@/api/endpoints/shipping.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EntityFormModal } from '@/components/common/EntityFormModal'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { QueryError, Timeline } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { DetailList } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import { useCarrierOptions, useCarriers } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Shipment } from '@/types/shipping.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'

const columns: DataTableColumn<Shipment>[] = [
  { key: 'number', label: 'Shipment', sortable: true, render: (s) => <div><div className="fw-medium">{s.number}</div><Link to={to(ROUTES.ORDER, { id: s.orderId })} className="fs-sm" onClick={(e) => e.stopPropagation()}>{s.orderNumber}</Link></div> },
  { key: 'carrierName', label: 'Carrier', sortable: true, render: (s) => <div>{s.carrierName}<div className="text-muted fs-sm">{s.service}</div></div> },
  { key: 'trackingNumber', label: 'Tracking', render: (s) => (s.trackingNumber ? <span className="font-monospace">{s.trackingNumber}</span> : <span className="text-muted">Not booked</span>) },
  { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  { key: 'destinationCity', label: 'Destination', sortable: true, render: (s) => `${s.destinationCity}, ${s.country}` },
  { key: 'codAmount', label: 'COD', align: 'end', render: (s) => (s.codAmount ? <div className="tabular-nums">{formatMoney(s.codAmount, s.currency)}<div className="fs-xs text-muted">{humanize(s.codStatus)}</div></div> : <span className="text-muted">Prepaid</span>) },
  { key: 'exception', label: 'Exception', hidden: true, render: (s) => s.exception ?? '—' },
  { key: 'bookedAt', label: 'Booked', sortable: true, render: (s) => (s.bookedAt ? formatRelativeTime(s.bookedAt) : '—') },
]

/** Booking and cancellation shared by the list and the detail page. */
function useShipmentActions() {
  const [booking, setBooking] = useState<Shipment | null>(null)
  const carriers = useCarriers()
  const book = useAction('shipments', shipmentsApi.book, { invalidates: ['orders'], success: (s) => `${s.number} booked: ${s.trackingNumber}` })
  const cancel = useAction('shipments', shipmentsApi.cancel, { invalidates: ['orders'], success: 'Shipment cancelled' })
  const carrier = carriers.data?.data.find((c) => c.id === booking?.carrierId)
  const modal = (
    <EntityFormModal
      open={booking !== null}
      title={`Book ${booking?.number ?? ''}`}
      submitLabel="Book with carrier"
      intro="If the carrier rejects the booking, the shipment stays pending and the order is not marked shipped. Retrying is safe."
      onClose={() => setBooking(null)}
      initial={{ carrierId: booking?.carrierId, service: booking?.service }}
      fields={[
        { name: 'carrierId', label: 'Carrier', type: 'select', required: true, options: (carriers.data?.data ?? []).filter((c) => c.country === booking?.country).map((c) => ({ value: c.id, label: `${c.name}${c.status !== 'connected' ? ` (${c.status})` : ''}` })) },
        { name: 'service', label: 'Service', type: 'select', required: true, options: (carrier?.services ?? [booking?.service ?? '']).map((s) => ({ value: s, label: s })) },
      ]}
      onSubmit={(v) => book.mutateAsync({ id: booking!.id, carrierId: String(v.carrierId), service: String(v.service) })}
    />
  )
  return { setBooking, cancel, modal }
}

function ShipmentList({ scope, title, description }: { scope?: Record<string, string>; title: string; description: string }) {
  const can = useCan()
  const carriers = useCarrierOptions()
  const { setBooking, cancel, modal } = useShipmentActions()
  const resolve = useAction('shipments', shipmentsApi.resolveException, { success: (s) => `${s.number}: ${humanize(s.status)}` })
  return (
    <>
      <PageHeader title={title} description={description} />
      <ResourceList<Shipment>
        resource="shipments"
        list={shipmentsApi.list}
        scope={scope}
        columns={scope ? columns.map((c) => (c.key === 'exception' ? { ...c, hidden: false } : c)) : columns}
        itemsLabel="shipments"
        exportName="shipments"
        searchPlaceholder="Shipment, order, tracking, city…"
        rowLink={(s) => to(ROUTES.SHIPMENT, { id: s.id })}
        filters={[...(scope ? [] : [{ key: 'status', allLabel: 'All statuses', options: OPTIONS.shipmentStatus }]), { key: 'carrierId', allLabel: 'All carriers', options: carriers }, { key: 'codStatus', allLabel: 'Any COD state', options: OPTIONS.codStatus }]}
        actions={[
          ...(can('shipping.book') ? [{ key: 'book', label: 'Book', icon: 'ri-truck-line', condition: (s: Shipment) => s.status === 'pending' }, { key: 'reattempt', label: 'Reattempt delivery', icon: 'ri-refresh-line', condition: (s: Shipment) => s.status === 'delivery_failed' }, { key: 'rto', label: 'Return to origin', icon: 'ri-arrow-go-back-line', condition: (s: Shipment) => s.status === 'delivery_failed' }] : []),
          ...(can('shipping.cancel') ? [{ key: 'cancel', label: 'Cancel', icon: 'ri-close-line', variant: 'delete' as const, condition: (s: Shipment) => s.status === 'pending' || s.status === 'booked' }] : []),
        ]}
        onRowAction={(action, s) => (action === 'book' ? setBooking(s) : action === 'cancel' ? cancel.mutate(s.id) : resolve.mutate({ id: s.id, resolution: action as 'reattempt' | 'rto' }))}
      />
      {modal}
    </>
  )
}

export function ShipmentsPage() {
  return <ShipmentList title="Shipments" description="Every parcel from booking to delivery. Tracking events are deduplicated; COD settlement is tracked separately from delivery." />
}

export function TrackingExceptionsPage() {
  return <ShipmentList scope={{ status: 'delivery_failed' }} title="Tracking exceptions" description="Failed delivery attempts. Reattempt or return to origin; the customer and support are notified by automation." />
}

export function ShipmentDetailPage() {
  const { id } = useParams()
  const shipment = useOne('shipments', shipmentsApi.get, id)
  const { setBooking, cancel, modal } = useShipmentActions()
  if (shipment.isLoading) return <Loader label="Loading shipment…" />
  if (shipment.isError || !shipment.data) return <QueryError message={errorMessage(shipment.error)} onRetry={() => shipment.refetch()} />
  const s = shipment.data
  return (
    <>
      <PageHeader
        back={{ label: 'Shipments', to: ROUTES.SHIPMENTS }}
        title={s.number}
        meta={<StatusBadge status={s.status} />}
        description={<>For <Link to={to(ROUTES.ORDER, { id: s.orderId })}>{s.orderNumber}</Link> · {s.carrierName} {s.service}</>}
        actions={
          <>
            {s.status === 'pending' && <Guard permission="shipping.book"><button type="button" className="btn btn-primary" onClick={() => setBooking(s)}><i className="ri-truck-line me-1" />Book</button></Guard>}
            {s.trackingNumber && <Guard permission="shipping.book"><button type="button" className="btn btn-light" onClick={() => shipmentsApi.label(s.id).then((l) => window.open(l.url, '_blank'))}><i className="ri-printer-line me-1" />Label</button></Guard>}
            {(s.status === 'pending' || s.status === 'booked') && <Guard permission="shipping.cancel"><button type="button" className="btn btn-outline-danger" disabled={cancel.isPending} onClick={() => cancel.mutate(s.id)}>Cancel</button></Guard>}
          </>
        }
      />
      {s.exception && <div className="alert alert-danger"><i className="ri-error-warning-line me-1" />{s.exception}</div>}
      <div className="row g-4">
        <div className="col-xl-5">
          <Panel title="Shipment" icon="ri-truck-line">
            <DetailList
              items={[
                { label: 'Tracking number', value: s.trackingNumber && <span className="font-monospace">{s.trackingNumber}</span> },
                { label: 'Packages', value: `${s.packages} · ${s.weightKg} kg` },
                { label: 'Destination', value: `${s.destinationCity}, ${s.country}` },
                { label: 'COD amount', value: s.codAmount ? formatMoney(s.codAmount, s.currency) : 'Prepaid' },
                { label: 'COD settlement', value: <StatusBadge status={s.codStatus} /> },
                { label: 'Booked', value: s.bookedAt && formatDateTime(s.bookedAt) },
                { label: 'Delivered', value: s.deliveredAt && formatDateTime(s.deliveredAt) },
              ]}
            />
          </Panel>
        </div>
        <div className="col-xl-7">
          <Panel title="Tracking events" icon="ri-map-pin-time-line" description="Normalised from carrier webhooks and polling; raw payloads are kept for audit.">
            {s.events.length ? (
              <Timeline items={[...s.events].reverse().map((e, i) => ({ id: String(i), icon: e.status === 'delivered' ? 'ri-checkbox-circle-line' : e.status.includes('fail') ? 'ri-error-warning-line' : 'ri-map-pin-line', tone: e.status === 'delivered' ? 'success' : e.status.includes('fail') || e.status === 'rto' ? 'danger' : 'info', title: e.description, description: [humanize(e.status), e.location].filter(Boolean).join(' · '), at: formatDateTime(e.at) }))} />
            ) : <p className="text-muted mb-0">No tracking events yet.</p>}
          </Panel>
        </div>
      </div>
      {modal}
    </>
  )
}
