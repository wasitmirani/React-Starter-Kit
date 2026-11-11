import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { shipmentsApi } from '@/api/endpoints/shipping.api'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { AirwayBill, TaxInvoice } from '@/components/features/documents/Documents'
import { Switch } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Tabs } from '@/components/ui/Tabs'
import { LABEL_SIZES, type AwbTemplate, type DocumentTemplates, type InvoiceTemplate, type LabelSize } from '@/constants/documents.constants'
import { TARGET_REGIONS } from '@/constants/regions.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { useToast } from '@/hooks/useToast'

type Tab = 'awb' | 'invoice' | 'sender'

const AWB_TOGGLES: [keyof AwbTemplate, string, string][] = [
  ['showLogo', 'Courier logo', 'Carrier tile in the header'],
  ['showArabicLabels', 'Arabic labels', 'Bilingual field labels for UAE and KSA couriers'],
  ['showCodBox', 'COD amount box', 'Large cash-to-collect amount, or PREPAID'],
  ['showWeight', 'Weight, pieces and date', ''],
  ['showSender', 'Sender block', 'Your warehouse name, phone and address'],
  ['showItems', 'Contents list', 'Up to 4 lines with SKUs for the packer'],
  ['showOrderBarcode', 'Order barcode', 'Second barcode for warehouse scanning'],
  ['showReturnAddress', 'Return address', 'Where undeliverable parcels go'],
  ['showNotes', 'Handling note', 'Fragile, keep upright…'],
]
const INVOICE_TOGGLES: [keyof InvoiceTemplate, string, string][] = [
  ['showLogo', 'Logo', ''],
  ['bilingual', 'Arabic / English', 'For UAE and KSA invoices'],
  ['showSku', 'SKU column', ''],
  ['showPaymentDetails', 'Payment details', ''],
  ['showSignature', 'Signature line', ''],
]

/** Custom airway bill and invoice designer with a live preview on a real order. */
export function DocumentTemplatesPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'awb'
  const toast = useToast()
  const { templates, save, reset } = useDocumentTemplates()
  const [draft, setDraft] = useState<DocumentTemplates>(templates)
  // Re-sync the draft when saved templates change (save, reset, workspace switch).
  const [base, setBase] = useState(templates)
  if (base !== templates) {
    setBase(templates)
    setDraft(templates)
  }
  const sample = useTenantQuery('orders', 'document-sample', async () => {
    const page = await ordersApi.list({ perPage: 20 })
    const order = page.data.find((o) => o.shipmentId && o.paymentMethod === 'cod') ?? page.data[0]
    if (!order) return null
    const shipment = order.shipmentId ? await shipmentsApi.get(order.shipmentId).catch(() => null) : null
    return { order, shipment }
  })
  const awb = (patch: Partial<AwbTemplate>) => setDraft({ ...draft, awb: { ...draft.awb, ...patch } })
  const inv = (patch: Partial<InvoiceTemplate>) => setDraft({ ...draft, invoice: { ...draft.invoice, ...patch } })
  const snd = (patch: Partial<DocumentTemplates['sender']>) => setDraft({ ...draft, sender: { ...draft.sender, ...patch } })
  const dirty = JSON.stringify(draft) !== JSON.stringify(templates)

  return (
    <>
      <PageHeader
        title="Airway bill and invoice templates"
        description="Design your own shipping labels and tax invoices. Every airway bill and invoice printed from Orders uses these templates."
        actions={<><button type="button" className="btn btn-light" onClick={() => { reset(); toast.success('Templates reset to defaults') }}>Reset to defaults</button><button type="button" className="btn btn-primary" disabled={!dirty} onClick={() => { save(draft); toast.success('Templates saved') }}><i className="ri-save-line me-1" />Save templates</button></>}
      />
      <Tabs className="mb-4" value={tab} onChange={(v) => setParams({ tab: v }, { replace: true })} items={[{ value: 'awb', label: 'Airway bill', icon: 'ri-barcode-box-line' }, { value: 'invoice', label: 'Invoice', icon: 'ri-file-list-3-line' }, { value: 'sender', label: 'Sender & company', icon: 'ri-building-line' }]} />
      <div className="row g-4">
        <div className="col-xl-5">
          {tab === 'awb' && (
            <Panel title="Label layout" icon="ri-layout-4-line">
              <label className="form-label">Label size</label>
              <div className="row g-2 mb-3">
                {LABEL_SIZES.map((s) => (
                  <div key={s.value} className="col-6"><button type="button" className={`choice-card w-100 text-start ${draft.awb.size === s.value ? 'selected' : ''}`} onClick={() => awb({ size: s.value as LabelSize })}><div className="fw-medium">{s.label}</div></button></div>
                ))}
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4"><label className="form-label" htmlFor="awb-color">Accent</label><input id="awb-color" type="color" className="form-control form-control-color w-100" value={draft.awb.accentColor} onChange={(e) => awb({ accentColor: e.target.value })} /></div>
                <div className="col-8"><label className="form-label" htmlFor="awb-footer">Footer text</label><input id="awb-footer" className="form-control" value={draft.awb.footerText} onChange={(e) => awb({ footerText: e.target.value })} /></div>
                {draft.awb.showNotes && <div className="col-12"><label className="form-label" htmlFor="awb-notes">Handling note</label><input id="awb-notes" className="form-control" value={draft.awb.notes} onChange={(e) => awb({ notes: e.target.value })} /></div>}
              </div>
              <div className="d-flex flex-column gap-2">
                {AWB_TOGGLES.map(([key, label, hint]) => (
                  <div key={key} className="d-flex justify-content-between align-items-center gap-3 py-1 border-bottom border-dashed">
                    <div><div className="fw-medium fs-sm">{label}</div>{hint && <div className="text-muted fs-xs">{hint}</div>}</div>
                    <Switch id={`awb-${key}`} checked={Boolean(draft.awb[key])} onChange={(v) => awb({ [key]: v } as Partial<AwbTemplate>)} />
                  </div>
                ))}
              </div>
            </Panel>
          )}
          {tab === 'invoice' && (
            <Panel title="Invoice details" icon="ri-file-list-3-line">
              <div className="row g-3">
                <div className="col-12"><label className="form-label" htmlFor="inv-name">Company name</label><input id="inv-name" className="form-control" value={draft.invoice.companyName} onChange={(e) => inv({ companyName: e.target.value })} /></div>
                <div className="col-12"><label className="form-label" htmlFor="inv-addr">Company address</label><input id="inv-addr" className="form-control" value={draft.invoice.companyAddress} onChange={(e) => inv({ companyAddress: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="inv-trn">TRN / VAT / ABN</label><input id="inv-trn" className="form-control" value={draft.invoice.taxNumber} onChange={(e) => inv({ taxNumber: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="inv-color">Accent colour</label><input id="inv-color" type="color" className="form-control form-control-color w-100" value={draft.invoice.accentColor} onChange={(e) => inv({ accentColor: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="inv-email">Billing email</label><input id="inv-email" className="form-control" value={draft.invoice.email} onChange={(e) => inv({ email: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="inv-phone">Phone</label><input id="inv-phone" className="form-control" value={draft.invoice.phone} onChange={(e) => inv({ phone: e.target.value })} /></div>
                <div className="col-12"><label className="form-label" htmlFor="inv-terms">Terms</label><textarea id="inv-terms" rows={2} className="form-control" value={draft.invoice.terms} onChange={(e) => inv({ terms: e.target.value })} /></div>
                <div className="col-12"><label className="form-label" htmlFor="inv-footer">Footer</label><input id="inv-footer" className="form-control" value={draft.invoice.footerText} onChange={(e) => inv({ footerText: e.target.value })} /></div>
              </div>
              <div className="d-flex flex-column gap-2 mt-3">
                {INVOICE_TOGGLES.map(([key, label, hint]) => (
                  <div key={key} className="d-flex justify-content-between align-items-center gap-3 py-1 border-bottom border-dashed">
                    <div><div className="fw-medium fs-sm">{label}</div>{hint && <div className="text-muted fs-xs">{hint}</div>}</div>
                    <Switch id={`inv-${key}`} checked={Boolean(draft.invoice[key])} onChange={(v) => inv({ [key]: v } as Partial<InvoiceTemplate>)} />
                  </div>
                ))}
              </div>
            </Panel>
          )}
          {tab === 'sender' && (
            <Panel title="Sender (ship from)" icon="ri-building-line" description="Printed on airway bills and used as the return address.">
              <div className="row g-3">
                <div className="col-12"><label className="form-label" htmlFor="s-name">Sender name</label><input id="s-name" className="form-control" value={draft.sender.name} onChange={(e) => snd({ name: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="s-phone">Phone</label><input id="s-phone" className="form-control" value={draft.sender.phone} onChange={(e) => snd({ phone: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="s-country">Country</label><select id="s-country" className="form-select" value={draft.sender.country} onChange={(e) => snd({ country: e.target.value })}>{TARGET_REGIONS.map((r) => <option key={r.code} value={r.code}>{r.flag} {r.name}</option>)}</select></div>
                <div className="col-12"><label className="form-label" htmlFor="s-addr">Address</label><input id="s-addr" className="form-control" value={draft.sender.address} onChange={(e) => snd({ address: e.target.value })} /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="s-city">City</label><input id="s-city" className="form-control" value={draft.sender.city} onChange={(e) => snd({ city: e.target.value })} /></div>
              </div>
            </Panel>
          )}
          {dirty && <div className="alert alert-warning mt-3 mb-0">You have unsaved changes.</div>}
        </div>
        <div className="col-xl-7">
          <Panel title="Live preview" icon="ri-eye-line" description={sample.data ? `Using order ${sample.data.order.number}` : 'Using a recent order'}>
            <div className="doc-preview-stage">
              {!sample.data ? (sample.isLoading ? <SkeletonLines lines={10} /> : <p className="text-muted mb-0">Create an order to preview templates.</p>) : tab === 'invoice' ? <div className="doc-preview-scale"><TaxInvoice order={sample.data.order} templates={draft} /></div> : <AirwayBill order={sample.data.order} shipment={sample.data.shipment} templates={draft} />}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
