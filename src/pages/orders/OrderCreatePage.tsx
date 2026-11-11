import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ordersApi } from '@/api/endpoints/commerce.api'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { LineItemsEditor, useSkus, validateLines, type LineDraft } from '@/components/features/shared/LineItemsEditor'
import { DetailList } from '@/components/ui/Controls'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useChannelOptions } from '@/hooks/queries/reference.queries'
import { formatMoney } from '@/utils/formatters/currency.formatter'

const schema = z.object({
  channelId: z.string().min(1, 'Choose a channel'),
  customerName: z.string().trim().min(2, 'Customer name is required'),
  customerPhone: z.string().trim().regex(/^\+?[0-9 ]{9,16}$/, 'Enter a phone number with country code, e.g. +92 300 1234567'),
  customerEmail: z.string().trim().refine((v) => !v || z.email().safeParse(v).success, 'Enter a valid email'),
  line1: z.string().trim().min(3, 'Address is required'),
  area: z.string().trim(),
  city: z.string().trim().min(2, 'City is required'),
  province: z.string().trim().min(2, 'Province / emirate is required'),
  country: z.enum(['PK', 'AE']),
  paymentMethod: z.enum(['cod', 'prepaid', 'bank_transfer']),
  currency: z.enum(['AED', 'SAR', 'USD', 'GBP', 'AUD', 'EUR', 'PKR']),
  priority: z.enum(['normal', 'high', 'urgent']),
  shipping: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  note: z.string().trim(),
})
type Values = z.infer<typeof schema>

export function OrderCreatePage() {
  const navigate = useNavigate()
  const channels = useChannelOptions()
  const skus = useSkus()
  const [lines, setLines] = useState<LineDraft[]>([{ sku: '', quantity: 1, price: 0 }])
  const [linesError, setLinesError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.input<typeof schema>, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { channelId: 'ch-manual', customerName: '', customerPhone: '', customerEmail: '', line1: '', area: '', city: '', province: '', country: 'PK', paymentMethod: 'cod', currency: 'PKR', priority: 'normal', shipping: 0, discount: 0, note: '' },
  })
  const create = useAction('orders', ordersApi.create, { success: (o) => `Order ${o.number} created`, invalidates: ['customers', 'dashboard'], onSuccess: (o) => navigate(to(ROUTES.ORDER, { id: o.id })) })

  const currency = watch('currency')
  const subtotal = lines.reduce((n, l) => n + l.quantity * (l.price ?? 0), 0)
  const shipping = Number(watch('shipping')) || 0
  const discount = Number(watch('discount')) || 0
  const tax = currency === 'AED' ? (subtotal - discount) * 0.05 : 0

  const submit = handleSubmit((v) => {
    const problem = validateLines(lines, skus.data ? new Set(skus.data.map((s) => s.sku)) : null)
    setLinesError(problem ?? undefined)
    if (problem) return
    setFormError(null)
    create.mutate(
      {
        channelId: v.channelId, customerName: v.customerName, customerPhone: v.customerPhone, customerEmail: v.customerEmail || null, paymentMethod: v.paymentMethod, currency: v.currency, priority: v.priority,
        shippingAddress: { name: v.customerName, phone: v.customerPhone, line1: v.line1, area: v.area, city: v.city, province: v.province, country: v.country },
        items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity, unitPrice: l.price ?? 0 })), shipping: v.shipping, discount: v.discount, note: v.note,
      },
      { onError: (e) => setFormError(e.message) },
    )
  })

  const field = (name: keyof Values, label: string, opts: { required?: boolean; col?: number; type?: string; placeholder?: string } = {}) => (
    <FormField id={name} label={label} required={opts.required} error={errors[name]?.message} className={`col-md-${opts.col ?? 6}`}>
      <input id={name} type={opts.type ?? 'text'} className="form-control" placeholder={opts.placeholder} {...register(name)} />
    </FormField>
  )
  const select = (name: keyof Values, label: string, options: { value: string; label: string }[], col = 4) => (
    <FormField id={name} label={label} required className={`col-md-${col}`} error={errors[name]?.message}>
      <select id={name} className="form-select" {...register(name)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    </FormField>
  )

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        back={{ label: 'Orders', to: ROUTES.ORDERS }}
        title="New order"
        description="Manual orders follow the same validation, allocation and fulfillment pipeline as channel orders."
        actions={<><button type="button" className="btn btn-light" onClick={() => navigate(ROUTES.ORDERS)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create order'}</button></>}
      />
      <FormAlert message={formError} onClose={() => setFormError(null)} />
      <div className="row g-4">
        <div className="col-xl-8 d-flex flex-column gap-4">
          <Panel title="Items" icon="ri-list-check">
            <LineItemsEditor lines={lines} onChange={setLines} priceLabel={`Unit price (${currency})`} error={linesError} />
          </Panel>
          <Panel title="Customer and delivery" icon="ri-map-pin-line">
            <div className="row g-4">
              {field('customerName', 'Customer name', { required: true })}
              {field('customerPhone', 'Phone', { required: true, type: 'tel', placeholder: '+92 300 1234567' })}
              {field('customerEmail', 'Email', { type: 'email' })}
              {select('country', 'Country', [{ value: 'PK', label: 'Pakistan' }, { value: 'AE', label: 'United Arab Emirates' }], 6)}
              {field('line1', 'Address', { required: true, col: 12, placeholder: 'House, street' })}
              {field('area', 'Area / block', { col: 4 })}
              {field('city', 'City', { required: true, col: 4 })}
              {field('province', 'Province / emirate', { required: true, col: 4 })}
            </div>
          </Panel>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Order settings" icon="ri-settings-4-line">
            <div className="row g-4">
              {select('channelId', 'Channel', channels, 12)}
              {select('paymentMethod', 'Payment', OPTIONS.paymentMethod, 6)}
              {select('currency', 'Currency', OPTIONS.currency, 6)}
              {select('priority', 'Priority', OPTIONS.priority, 12)}
              {field('shipping', 'Shipping charge', { type: 'number' })}
              {field('discount', 'Discount', { type: 'number' })}
              <FormField id="note" label="Internal note" className="col-12"><textarea id="note" rows={2} className="form-control" {...register('note')} /></FormField>
            </div>
          </Panel>
          <Panel title="Summary" icon="ri-calculator-line" description={currency === 'AED' ? 'UAE VAT 5% applied. Totals are recalculated by the server.' : 'Totals are recalculated by the server.'}>
            <DetailList
              items={[
                { label: 'Subtotal', value: formatMoney(subtotal, currency) },
                { label: 'Discount', value: formatMoney(-discount, currency) },
                { label: 'Shipping', value: formatMoney(shipping, currency) },
                { label: 'Tax', value: formatMoney(tax, currency) },
                { label: 'Total', value: <strong>{formatMoney(subtotal - discount + shipping + tax, currency)}</strong> },
              ]}
            />
          </Panel>
        </div>
      </div>
    </form>
  )
}
