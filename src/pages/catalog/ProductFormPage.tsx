import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { productsApi } from '@/api/endpoints/commerce.api'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { OPTIONS } from '@/constants/domain.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useOne } from '@/hooks/queries/resource.queries'
import { useClientOptions, useSupplierOptions, useSuppliers, useClients } from '@/hooks/queries/reference.queries'
import type { Product } from '@/types/commerce.types'

const variantSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, 'Required'),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/, '3–32 letters, digits or dashes'),
  barcode: z.string().trim().regex(/^\d{8,14}$/, '8–14 digits'),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  weightKg: z.coerce.number().min(0),
})

const schema = z
  .object({
    title: z.string().trim().min(2, 'Title is required'),
    brand: z.string().trim().min(1, 'Brand is required'),
    category: z.string().trim().min(1, 'Category is required'),
    description: z.string().trim(),
    status: z.enum(['draft', 'active', 'archived']),
    type: z.enum(['simple', 'variant', 'bundle']),
    currency: z.enum(['AED', 'SAR', 'USD', 'GBP', 'AUD', 'EUR', 'PKR']),
    clientId: z.string(),
    supplierId: z.string(),
    reorderPoint: z.coerce.number().int().min(0),
    lotTracked: z.boolean(),
    length: z.coerce.number().min(0),
    width: z.coerce.number().min(0),
    height: z.coerce.number().min(0),
    variants: z.array(variantSchema).min(1, 'Add at least one variant'),
    bundle: z.array(z.object({ sku: z.string().trim().toUpperCase().min(1, 'Required'), quantity: z.coerce.number().int().min(1) })),
  })
  .superRefine((v, ctx) => {
    const skus = v.variants.map((x) => x.sku.toUpperCase())
    skus.forEach((s, i) => skus.indexOf(s) !== i && ctx.addIssue({ code: 'custom', path: ['variants', i, 'sku'], message: 'Duplicate SKU' }))
    if (v.type === 'bundle' && !v.bundle.length) ctx.addIssue({ code: 'custom', path: ['bundle'], message: 'A bundle needs components' })
    if (v.bundle.some((b) => skus.includes(b.sku))) ctx.addIssue({ code: 'custom', path: ['bundle'], message: 'A bundle cannot contain itself' })
  })

type Values = z.infer<typeof schema>
const blankVariant = () => ({ id: '', title: 'Default', sku: '', barcode: '', price: 0, cost: 0, weightKg: 0.5 })

function toValues(p?: Product): z.input<typeof schema> {
  if (!p) return { title: '', brand: '', category: '', description: '', status: 'draft', type: 'simple', currency: 'PKR', clientId: '', supplierId: '', reorderPoint: 10, lotTracked: false, length: 20, width: 15, height: 5, variants: [blankVariant()], bundle: [] }
  return { ...p, clientId: p.clientId ?? '', supplierId: p.supplierId ?? '', length: p.dimensionsCm.length, width: p.dimensionsCm.width, height: p.dimensionsCm.height }
}

export function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useOne('products', productsApi.get, id)
  const clients = useClientOptions()
  const suppliers = useSupplierOptions()
  const supplierRows = useSuppliers()
  const clientRows = useClients()
  const [formError, setFormError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<z.input<typeof schema>, unknown, Values>({ resolver: zodResolver(schema), defaultValues: toValues() })
  const variants = useFieldArray({ control, name: 'variants' })
  const bundle = useFieldArray({ control, name: 'bundle' })
  const type = watch('type')

  useEffect(() => {
    if (existing.data) reset(toValues(existing.data))
  }, [existing.data, reset])

  const save = useAction('products', (v: Values) => {
    const supplier = supplierRows.data?.data.find((s) => s.id === v.supplierId)
    const client = clientRows.data?.data.find((c) => c.id === v.clientId)
    const body = {
      title: v.title, brand: v.brand, category: v.category, description: v.description, status: v.status, type: v.type, currency: v.currency, reorderPoint: v.reorderPoint, lotTracked: v.lotTracked,
      clientId: client?.id ?? null, clientName: client?.name ?? null, supplierId: supplier?.id ?? null, supplierName: supplier?.name ?? null, imageUrl: null,
      dimensionsCm: { length: v.length, width: v.width, height: v.height }, variants: v.variants, bundle: v.type === 'bundle' ? v.bundle : [], onHand: 0, available: 0,
    }
    return id ? productsApi.update(id, body) : productsApi.create(body)
  }, { success: id ? 'Product saved' : 'Product created', onSuccess: (p) => navigate(to(ROUTES.PRODUCT, { id: p.id })) })

  if (id && existing.isLoading) return <Loader label="Loading product…" />

  const input = (name: Parameters<typeof register>[0], label: string, opts: { col?: number; type?: string; required?: boolean } = {}) => {
    const error = name.split('.').reduce<unknown>((e, k) => (e as Record<string, unknown> | undefined)?.[k], errors) as { message?: string } | undefined
    return (
      <FormField id={name} label={label} required={opts.required} error={error?.message} className={`col-md-${opts.col ?? 6}`}>
        <input id={name} type={opts.type ?? 'text'} step="any" className="form-control" {...register(name)} />
      </FormField>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit((v) => { setFormError(null); save.mutate(v, { onError: (e) => setFormError(toApiError(e).message) }) })}>
      <PageHeader
        back={{ label: id ? 'Product' : 'Products', to: id ? to(ROUTES.PRODUCT, { id }) : ROUTES.PRODUCTS }}
        title={id ? `Edit ${existing.data?.title ?? 'product'}` : 'New product'}
        description="Edits never change price snapshots on existing orders."
        actions={<><button type="button" className="btn btn-light" onClick={() => navigate(-1)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save product'}</button></>}
      />
      <FormAlert message={formError} onClose={() => setFormError(null)} />
      <div className="row g-4">
        <div className="col-xl-8 d-flex flex-column gap-4">
          <Panel title="Identity" icon="ri-price-tag-3-line">
            <div className="row g-4">
              {input('title', 'Title', { col: 12, required: true })}
              {input('brand', 'Brand', { required: true })}
              {input('category', 'Category', { required: true })}
              <FormField id="description" label="Description" className="col-12"><textarea id="description" rows={3} className="form-control" {...register('description')} /></FormField>
            </div>
          </Panel>
          <Panel title="Variants and SKUs" icon="ri-barcode-line" description="SKUs are unique per tenant / client scope." actions={type !== 'simple' || variants.fields.length === 0 ? <button type="button" className="btn btn-sm btn-light" onClick={() => variants.append(blankVariant())}><i className="ri-add-line" /> Add variant</button> : undefined}>
            {variants.fields.map((f, i) => (
              <div key={f.id} className="row g-3 align-items-end border-bottom border-dashed pb-3 mb-3">
                {input(`variants.${i}.title`, 'Option', { col: 2 })}
                {input(`variants.${i}.sku`, 'SKU', { col: 2, required: true })}
                {input(`variants.${i}.barcode`, 'Barcode', { col: 2, required: true })}
                {input(`variants.${i}.price`, 'Price', { col: 2, type: 'number' })}
                {input(`variants.${i}.cost`, 'Cost', { col: 2, type: 'number' })}
                {input(`variants.${i}.weightKg`, 'Weight (kg)', { col: 1, type: 'number' })}
                <div className="col-md-1"><button type="button" className="btn btn-light btn-icon" aria-label="Remove variant" disabled={variants.fields.length === 1} onClick={() => variants.remove(i)}><i className="ri-delete-bin-line" /></button></div>
              </div>
            ))}
            {errors.variants?.root?.message && <div className="invalid-feedback d-block">{errors.variants.root.message}</div>}
          </Panel>
          {type === 'bundle' && (
            <Panel title="Bundle components" icon="ri-gift-line" actions={<button type="button" className="btn btn-sm btn-light" onClick={() => bundle.append({ sku: '', quantity: 1 })}><i className="ri-add-line" /> Add component</button>}>
              {bundle.fields.map((f, i) => (
                <div key={f.id} className="row g-3 align-items-end mb-2">
                  {input(`bundle.${i}.sku`, 'Component SKU', { col: 7 })}
                  {input(`bundle.${i}.quantity`, 'Quantity', { col: 3, type: 'number' })}
                  <div className="col-md-2"><button type="button" className="btn btn-light btn-icon" aria-label="Remove component" onClick={() => bundle.remove(i)}><i className="ri-delete-bin-line" /></button></div>
                </div>
              ))}
              {errors.bundle?.message && <div className="invalid-feedback d-block">{errors.bundle.message}</div>}
              {errors.bundle?.root?.message && <div className="invalid-feedback d-block">{errors.bundle.root.message}</div>}
            </Panel>
          )}
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Status and ownership" icon="ri-settings-4-line">
            <div className="row g-4">
              {([['status', 'Status', OPTIONS.productStatus], ['type', 'Type', OPTIONS.productType], ['currency', 'Currency', OPTIONS.currency]] as const).map(([name, label, options]) => (
                <FormField key={name} id={name} label={label} className="col-12"><select id={name} className="form-select" {...register(name)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
              ))}
              <FormField id="clientId" label="3PL client (owner)" className="col-12" hint="Leave empty for your own stock."><select id="clientId" className="form-select" {...register('clientId')}><option value="">Own stock</option>{clients.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
              <FormField id="supplierId" label="Default supplier" className="col-12"><select id="supplierId" className="form-select" {...register('supplierId')}><option value="">—</option>{suppliers.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormField>
            </div>
          </Panel>
          <Panel title="Inventory and shipping" icon="ri-ruler-line">
            <div className="row g-4">
              {input('reorderPoint', 'Reorder point', { col: 12, type: 'number' })}
              {input('length', 'L (cm)', { col: 4, type: 'number' })}
              {input('width', 'W (cm)', { col: 4, type: 'number' })}
              {input('height', 'H (cm)', { col: 4, type: 'number' })}
              <div className="col-12 form-check ms-1"><input id="lotTracked" type="checkbox" className="form-check-input" {...register('lotTracked')} /><label htmlFor="lotTracked" className="form-check-label">Track lots and expiry (FEFO)</label></div>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  )
}
