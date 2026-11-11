import { Link, useSearchParams } from 'react-router-dom'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { shipmentsApi } from '@/api/endpoints/shipping.api'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { AirwayBill, TaxInvoice } from '@/components/features/documents/Documents'
import { Segmented } from '@/components/ui/Segmented'
import { LABEL_SIZES } from '@/constants/documents.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'

type DocType = 'awb' | 'invoice'

/** Print preview for one or many orders: `/documents/print?type=awb&ids=a,b,c`. */
export function DocumentsPrintPage() {
  const [params, setParams] = useSearchParams()
  const type: DocType = params.get('type') === 'invoice' ? 'invoice' : 'awb'
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean).slice(0, 200)
  const { templates } = useDocumentTemplates()
  const docs = useTenantQuery('orders', ['documents', ids], () =>
    Promise.all(ids.map(async (id) => {
      const order = await ordersApi.get(id)
      const shipment = order.shipmentId ? await shipmentsApi.get(order.shipmentId).catch(() => null) : null
      return { order, shipment }
    })),
    { enabled: ids.length > 0 },
  )
  const size = LABEL_SIZES.find((s) => s.value === templates.awb.size)
  const unbooked = docs.data?.filter((d) => !d.shipment?.trackingNumber).length ?? 0

  return (
    <div className="print-shell">
      <div className="no-print">
        <PageHeader
          back={ids.length === 1 ? { label: 'Order', to: to(ROUTES.ORDER, { id: ids[0] }) } : { label: 'Orders', to: ROUTES.ORDERS }}
          title={type === 'awb' ? 'Airway bills' : 'Tax invoices'}
          description={`${ids.length} order${ids.length === 1 ? '' : 's'} · ${type === 'awb' ? `${size?.label ?? ''} labels` : 'A4 invoices'}. Templates are customisable.`}
          actions={
            <>
              <Segmented ariaLabel="Document" value={type} onChange={(v) => setParams({ type: v, ids: ids.join(',') }, { replace: true })} options={[{ value: 'awb', label: 'Airway bill' }, { value: 'invoice', label: 'Invoice' }]} />
              <Link to={`${ROUTES.SETTINGS_DOCUMENTS}?tab=${type}`} className="btn btn-light"><i className="ri-palette-line me-1" />Customize template</Link>
              <button type="button" className="btn btn-primary" disabled={!docs.data?.length} onClick={() => window.print()}><i className="ri-printer-line me-1" />Print {ids.length > 1 ? `all ${ids.length}` : ''}</button>
            </>
          }
        />
        {type === 'awb' && unbooked > 0 && <div className="alert alert-warning">{unbooked} order{unbooked === 1 ? ' has' : 's have'} no courier booking yet, so the tracking barcode is missing. Book the shipment first for a scannable airway bill.</div>}
      </div>
      {!ids.length && <div className="alert alert-light">No orders selected. Select orders on the Orders page and choose “Print airway bills” or “Print invoices”.</div>}
      {docs.isLoading && <Loader label="Preparing documents…" />}
      {docs.isError && <QueryError message={errorMessage(docs.error)} onRetry={() => docs.refetch()} />}
      {docs.data && (
        <div className={`print-area print-${type} print-size-${templates.awb.size}`}>
          {docs.data.map(({ order, shipment }) => (
            <div key={order.id} className="print-page">
              {type === 'awb' ? <AirwayBill order={order} shipment={shipment} templates={templates} /> : <TaxInvoice order={order} templates={templates} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
