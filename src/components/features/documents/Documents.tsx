import type { CSSProperties } from 'react'
import { appIdByName } from '@/constants/apps.constants'
import { LABEL_SIZES, type DocumentTemplates } from '@/constants/documents.constants'
import { regionOf } from '@/constants/regions.constants'
import { humanize } from '@/constants/status.constants'
import { AppLogo } from '@/components/features/apps/AppLogo'
import type { Order } from '@/types/commerce.types'
import type { Shipment } from '@/types/shipping.types'
import { encodeCode128B } from '@/utils/barcode/code128'
import { formatMoney } from '@/utils/formatters/currency.formatter'

/** Code 128 barcode as SVG; text that cannot be encoded renders a readable fallback. */
export function Barcode({ value, height = 56, showText = true, className = '' }: { value: string; height?: number; showText?: boolean; className?: string }) {
  let modules: number[] = []
  try {
    modules = encodeCode128B(value)
  } catch {
    return <div className={`doc-barcode-fallback ${className}`}>{value}</div>
  }
  const quiet = 10
  const total = modules.reduce((a, b) => a + b, 0) + quiet * 2
  const starts = modules.reduce<number[]>((acc, _w, i) => [...acc, i === 0 ? quiet : acc[i - 1] + modules[i - 1]], [])
  const bars = modules.map((w, i) => (i % 2 === 0 ? <rect key={i} x={starts[i]} y={0} width={w} height={height} /> : null))
  return (
    <div className={`doc-barcode ${className}`}>
      <svg viewBox={`0 0 ${total} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }} role="img" aria-label={`Barcode ${value}`} shapeRendering="crispEdges">
        <rect width={total} height={height} fill="#fff" />
        <g fill="#000">{bars}</g>
      </svg>
      {showText && <div className="doc-barcode-text">{value}</div>}
    </div>
  )
}

const dateText = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

/** Shipping label / airway bill sized for thermal or plain printers. */
export function AirwayBill({ order, shipment, templates }: { order: Order; shipment: Shipment | null; templates: DocumentTemplates }) {
  const t = templates.awb
  const sender = templates.sender
  const size = LABEL_SIZES.find((s) => s.value === t.size) ?? LABEL_SIZES[0]
  const tracking = shipment?.trackingNumber ?? null
  const cod = order.paymentMethod === 'cod' ? (shipment?.codAmount || order.total) : 0
  const ar = t.showArabicLabels
  const dest = regionOf(order.shippingAddress.country)
  const style = { '--doc-accent': t.accentColor, width: `${size.widthMm}mm`, minHeight: t.size === 'a4' ? '140mm' : `${size.heightMm}mm` } as CSSProperties
  const units = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className={`doc-awb size-${t.size}`} style={style}>
      <div className="awb-head">
        <div className="d-flex align-items-center gap-2 min-w-0">
          {t.showLogo && <AppLogo appId={appIdByName(shipment?.carrierName ?? 'courier')} size="sm" fallbackIcon="ri-truck-line" />}
          <div className="min-w-0"><div className="awb-carrier">{shipment?.carrierName ?? 'Courier not booked'}</div><div className="awb-service">{shipment?.service ?? 'Standard'}</div></div>
        </div>
        <div className="awb-dest">{dest?.flag} {order.shippingAddress.country}<span>{order.shippingAddress.city}</span></div>
      </div>

      <div className="awb-tracking">
        {tracking ? <Barcode value={tracking} height={t.size === '100x100' ? 46 : 62} /> : <div className="awb-unbooked">Book a courier to print the tracking barcode</div>}
        <div className="awb-label-sm">{ar ? 'AWB / رقم الشحنة' : 'Airway bill no.'}</div>
      </div>

      <div className="awb-to">
        <div className="awb-label-sm">{ar ? 'Ship to / إلى' : 'Ship to'}</div>
        <div className="awb-to-name">{order.shippingAddress.name || order.customerName}</div>
        <div>{order.shippingAddress.line1}</div>
        <div>{order.shippingAddress.area}, {order.shippingAddress.city}</div>
        <div>{order.shippingAddress.province}, {dest?.name ?? order.shippingAddress.country}</div>
        <div className="awb-phone">☎ {order.shippingAddress.phone || order.customerPhone}</div>
      </div>

      <div className="awb-grid">
        {t.showCodBox && (
          <div className={`awb-cod ${cod ? 'is-cod' : ''}`}>
            <div className="awb-label-sm">{ar ? 'COD / الدفع عند الاستلام' : 'Cash on delivery'}</div>
            <div className="awb-cod-amount">{cod ? formatMoney(cod, order.currency) : 'PREPAID'}</div>
          </div>
        )}
        {t.showWeight && (
          <div className="awb-meta">
            <div><span>{ar ? 'Weight / الوزن' : 'Weight'}</span><strong>{shipment?.weightKg ?? '—'} kg</strong></div>
            <div><span>{ar ? 'Pieces / القطع' : 'Pieces'}</span><strong>{shipment?.packages ?? 1}</strong></div>
            <div><span>Date</span><strong>{dateText(shipment?.bookedAt ?? order.placedAt)}</strong></div>
          </div>
        )}
      </div>

      {t.showSender && (
        <div className="awb-from">
          <div className="awb-label-sm">{ar ? 'From / من' : 'From'}</div>
          <strong>{sender.name}</strong> · {sender.phone}<br />{sender.address}, {sender.city}, {sender.country}
        </div>
      )}

      {t.showItems && (
        <div className="awb-items">
          <div className="awb-label-sm">Contents · {units} unit{units === 1 ? '' : 's'}</div>
          {order.items.slice(0, t.size === '100x100' ? 2 : 4).map((i) => <div key={i.sku} className="d-flex justify-content-between gap-2"><span className="text-truncate">{i.quantity} × {i.title}</span><span className="font-monospace">{i.sku}</span></div>)}
          {order.items.length > (t.size === '100x100' ? 2 : 4) && <div>+ {order.items.length - (t.size === '100x100' ? 2 : 4)} more lines</div>}
        </div>
      )}

      {t.showOrderBarcode && (
        <div className="awb-order">
          <Barcode value={order.number} height={30} />
          <div className="awb-label-sm">Order ref{order.externalId ? ` · ${order.channelName} ${order.externalId}` : ''}</div>
        </div>
      )}

      {t.showNotes && t.notes && <div className="awb-notes">⚠ {t.notes}</div>}
      {t.showReturnAddress && <div className="awb-return">If undeliverable return to: {sender.name}, {sender.address}, {sender.city}</div>}
      {t.footerText && <div className="awb-footer">{t.footerText}</div>}
    </div>
  )
}

/** Tax invoice with per-market VAT wording (UAE FTA, KSA ZATCA simplified invoice, UK VAT, AU GST). */
export function TaxInvoice({ order, templates }: { order: Order; templates: DocumentTemplates }) {
  const t = templates.invoice
  const region = regionOf(order.shippingAddress.country)
  const bilingual = t.bilingual && (order.shippingAddress.country === 'AE' || order.shippingAddress.country === 'SA')
  const taxRate = order.subtotal > 0 ? order.tax / Math.max(1, order.subtotal - order.discount) : 0
  const money = (v: number) => formatMoney(v, order.currency)
  const invoiceNo = `INV-${order.number.replace(/^[A-Z]+-/, '')}`
  const label = (en: string, arText: string) => (bilingual ? <>{en} <span className="inv-ar">{arText}</span></> : en)
  const heading = order.shippingAddress.country === 'SA' ? label('Simplified Tax Invoice', 'فاتورة ضريبية مبسطة') : region?.taxRate ? label('Tax Invoice', 'فاتورة ضريبية') : 'Invoice'

  return (
    <div className="doc-invoice" style={{ '--doc-accent': t.accentColor } as CSSProperties}>
      <div className="inv-head">
        <div>
          {t.showLogo && <div className="inv-logo">{t.companyName.slice(0, 1)}</div>}
          <div className="inv-company">{t.companyName}</div>
          <div className="inv-muted">{t.companyAddress}</div>
          <div className="inv-muted">{t.email} · {t.phone}</div>
          {t.taxNumber && <div className="inv-muted">{region?.code === 'AU' ? 'ABN' : region?.code === 'US' ? 'Tax ID' : 'TRN / VAT no.'}: <strong>{t.taxNumber}</strong></div>}
        </div>
        <div className="text-end">
          <div className="inv-title">{heading}</div>
          <table className="inv-meta">
            <tbody>
              <tr><td>{label('Invoice no.', 'رقم الفاتورة')}</td><td>{invoiceNo}</td></tr>
              <tr><td>{label('Issue date', 'تاريخ الإصدار')}</td><td>{dateText(order.placedAt)}</td></tr>
              <tr><td>{label('Order', 'الطلب')}</td><td>{order.number}</td></tr>
              {order.externalId && <tr><td>Channel ref</td><td>{order.channelName} {order.externalId}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="inv-parties">
        <div><div className="inv-label">{label('Bill to', 'فاتورة إلى')}</div><strong>{order.customerName}</strong><div>{order.customerEmail}</div><div>{order.customerPhone}</div></div>
        <div><div className="inv-label">{label('Ship to', 'الشحن إلى')}</div><strong>{order.shippingAddress.name || order.customerName}</strong><div>{order.shippingAddress.line1}, {order.shippingAddress.area}</div><div>{order.shippingAddress.city}, {region?.name ?? order.shippingAddress.country}</div></div>
      </div>

      <table className="inv-lines">
        <thead>
          <tr><th>#</th><th>{label('Description', 'الوصف')}</th>{t.showSku && <th>SKU</th>}<th className="text-end">{label('Qty', 'الكمية')}</th><th className="text-end">{label('Unit price', 'سعر الوحدة')}</th><th className="text-end">{label('Amount', 'المبلغ')}</th></tr>
        </thead>
        <tbody>
          {order.items.map((i, n) => (
            <tr key={i.sku}><td>{n + 1}</td><td>{i.title}</td>{t.showSku && <td className="font-monospace">{i.sku}</td>}<td className="text-end">{i.quantity}</td><td className="text-end">{money(i.unitPrice)}</td><td className="text-end">{money(i.unitPrice * i.quantity)}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="inv-bottom">
        <div className="inv-notes">
          {t.showPaymentDetails && <><div className="inv-label">Payment</div><div>{order.paymentMethod === 'cod' ? 'Cash on delivery' : humanize(order.paymentMethod)} · {humanize(order.paymentStatus)}</div></>}
          {order.shippingAddress.country === 'SA' && <div className="inv-zatca">ZATCA QR code is added when the invoice is reported through the e-invoicing integration.</div>}
          {t.terms && <><div className="inv-label mt-3">Terms</div><div>{t.terms}</div></>}
        </div>
        <table className="inv-totals">
          <tbody>
            <tr><td>{label('Subtotal', 'المجموع الفرعي')}</td><td>{money(order.subtotal)}</td></tr>
            {order.discount > 0 && <tr><td>{label('Discount', 'الخصم')}</td><td>−{money(order.discount)}</td></tr>}
            {order.shipping > 0 && <tr><td>{label('Shipping', 'الشحن')}</td><td>{money(order.shipping)}</td></tr>}
            <tr><td>{label(`${region?.code === 'AU' ? 'GST' : region?.code === 'US' ? 'Sales tax' : 'VAT'} ${(taxRate * 100).toFixed(taxRate * 100 % 1 ? 1 : 0)}%`, 'ضريبة القيمة المضافة')}</td><td>{money(order.tax)}</td></tr>
            <tr className="inv-grand"><td>{label('Total', 'الإجمالي')}</td><td>{money(order.total)}</td></tr>
          </tbody>
        </table>
      </div>

      {t.showSignature && <div className="inv-sign"><div>Authorised signature</div></div>}
      {t.footerText && <div className="inv-footer">{t.footerText}</div>}
    </div>
  )
}
