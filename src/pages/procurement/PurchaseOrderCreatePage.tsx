import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchaseOrdersApi } from '@/api/endpoints/procurement.api'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { DetailList } from '@/components/ui/Controls'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useSuppliers, useWarehouseOptions } from '@/hooks/queries/reference.queries'
import { formatMoney } from '@/utils/formatters/currency.formatter'

export function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const suppliers = useSuppliers()
  const warehouses = useWarehouseOptions()
  const skus = useSkus()
  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [expectedAt, setExpectedAt] = useState(new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10))
  const [taxRate, setTaxRate] = useState(18)
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: 10, price: 0 }])
  const [error, setError] = useState<string>()
  const create = useAction('purchase-orders', purchaseOrdersApi.create, { success: (p) => `${p.number} saved as draft`, onSuccess: (p) => navigate(to(ROUTES.PURCHASE_ORDER, { id: p.id })) })

  const active = (suppliers.data?.data ?? []).filter((s) => s.status === 'active')
  const supplier = active.find((s) => s.id === supplierId) ?? active[0]
  const wh = warehouseId || warehouses[0]?.value || ''
  const currency = supplier?.currency ?? 'PKR'
  const subtotal = lines.reduce((n, l) => n + l.quantity * (l.price ?? 0), 0)

  const submit = () => {
    const problem = !supplier ? 'Choose a supplier.' : validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null) ?? (lines.some((l) => !l.price) ? 'Enter a unit cost for every line.' : null)
    setError(problem ?? undefined)
    if (!problem) create.mutate({ supplierId: supplier!.id, warehouseId: wh, expectedAt: new Date(expectedAt).toISOString(), notes, taxRate, lines: lines.map((l) => ({ sku: l.sku, ordered: l.quantity, unitCost: l.price ?? 0 })) })
  }

  return (
    <>
      <PageHeader back={{ label: 'Purchase orders', to: ROUTES.PURCHASE_ORDERS }} title="New purchase order" description="Saved as a draft; submit it for approval when ready." actions={<><button type="button" className="btn btn-light" onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}>Cancel</button><button type="button" className="btn btn-primary" disabled={create.isPending} onClick={submit}>Save draft</button></>} />
      <div className="row g-4">
        <div className="col-xl-8">
          <Panel title="Lines" icon="ri-list-check">
            <LineItemsEditor lines={lines} onChange={setLines} priceLabel={`Unit cost (${currency})`} error={error} />
          </Panel>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Order" icon="ri-file-list-3-line">
            <div className="row g-4">
              <FormField id="po-sup" label="Supplier" required className="col-12" hint={supplier && `${supplier.paymentTerms} · lead time ${supplier.leadTimeDays} days`}>
                <select id="po-sup" className="form-select" value={supplier?.id ?? ''} onChange={(e) => setSupplierId(e.target.value)}>{active.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.currency})</option>)}</select>
              </FormField>
              <FormField id="po-wh" label="Deliver to" required className="col-12"><select id="po-wh" className="form-select" value={wh} onChange={(e) => setWarehouseId(e.target.value)}>{warehouses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
              <FormField id="po-date" label="Expected delivery" required className="col-md-7"><input id="po-date" type="date" className="form-control" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} /></FormField>
              <FormField id="po-tax" label="Tax %" className="col-md-5"><input id="po-tax" type="number" min={0} max={50} className="form-control" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></FormField>
              <FormField id="po-notes" label="Notes to supplier" className="col-12"><textarea id="po-notes" rows={2} className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} /></FormField>
            </div>
          </Panel>
          <Panel title="Summary" icon="ri-calculator-line">
            <DetailList items={[{ label: 'Subtotal', value: formatMoney(subtotal, currency) }, { label: `Tax (${taxRate}%)`, value: formatMoney((subtotal * taxRate) / 100, currency) }, { label: 'Total', value: <strong>{formatMoney(subtotal * (1 + taxRate / 100), currency)}</strong> }]} />
          </Panel>
        </div>
      </div>
    </>
  )
}
