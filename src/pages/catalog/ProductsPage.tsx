import { Link } from 'react-router-dom'
import { productsApi } from '@/api/endpoints/commerce.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Guard } from '@/components/common/Guard'
import { PageHeader } from '@/components/common/PageHeader'
import { ResourceList } from '@/components/common/ResourceList'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { OPTIONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { useClientOptions } from '@/hooks/queries/reference.queries'
import { useCan } from '@/hooks/useCan'
import type { Product } from '@/types/commerce.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'

const CATEGORIES = ['Apparel', 'Beauty', 'Fragrance', 'Toys', 'Nutrition', 'Accessories', 'Packaging'].map((c) => ({ value: c, label: c }))

const columns: DataTableColumn<Product>[] = [
  {
    key: 'title',
    label: 'Product',
    sortable: true,
    render: (p) => (
      <div className="d-flex align-items-center gap-3">
        <span className="icon-tile bg-light text-muted"><i className="ri-price-tag-3-line" /></span>
        <div>
          <div className="fw-medium">{p.title}</div>
          <div className="text-muted fs-sm font-monospace">{p.variants.length > 1 ? `${p.variants.length} variants` : p.variants[0]?.sku}</div>
        </div>
      </div>
    ),
  },
  { key: 'brand', label: 'Brand', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'type', label: 'Type', render: (p) => <ToneBadge tone={p.type === 'bundle' ? 'info' : 'light'}>{humanize(p.type)}</ToneBadge> },
  { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  { key: 'clientName', label: 'Client', render: (p) => p.clientName ?? <span className="text-muted">Own stock</span> },
  { key: 'variants', label: 'Price', align: 'end', render: (p) => <span className="tabular-nums">{formatMoney(p.variants[0]?.price ?? 0, p.currency)}</span> },
  { key: 'onHand', label: 'On hand', align: 'end', render: (p) => <span className="tabular-nums">{p.onHand.toLocaleString()}</span> },
  { key: 'available', label: 'Available', align: 'end', render: (p) => <span className={`tabular-nums fw-medium ${p.available <= p.reorderPoint ? 'text-danger' : ''}`}>{p.available.toLocaleString()}</span> },
]

export function ProductsPage() {
  const can = useCan()
  const clients = useClientOptions()
  const setStatus = useAction('products', ({ ids, status }: { ids: string[]; status: Product['status'] }) => Promise.all(ids.map((id) => productsApi.update(id, { status }))), { success: (r) => `${r.length} products updated` })

  return (
    <>
      <PageHeader
        title="Products"
        description="Products, variants, SKUs and barcodes. Stock columns sum every warehouse."
        actions={
          <>
            <Guard permission="products.manage"><Link to={ROUTES.IMPORTS} className="btn btn-light"><i className="ri-upload-2-line me-1" />Import</Link></Guard>
            <Guard permission="products.manage"><Link to={ROUTES.PRODUCT_NEW} className="btn btn-primary"><i className="ri-add-line me-1" />New product</Link></Guard>
          </>
        }
      />
      <ResourceList<Product>
        resource="products"
        list={productsApi.list}
        columns={columns}
        itemsLabel="products"
        exportName="products"
        searchPlaceholder="Title, brand, category…"
        rowLink={(p) => to(ROUTES.PRODUCT, { id: p.id })}
        filters={[
          { key: 'status', allLabel: 'All statuses', options: OPTIONS.productStatus },
          { key: 'category', allLabel: 'All categories', options: CATEGORIES },
          { key: 'type', allLabel: 'All types', options: OPTIONS.productType },
          { key: 'clientId', allLabel: 'All owners', options: clients },
        ]}
        bulkActions={can('products.manage') ? [{ action: 'active', label: 'Activate' }, { action: 'archived', label: 'Archive' }, { action: 'draft', label: 'Move to draft' }] : undefined}
        onBulkAction={(status, rows) => setStatus.mutate({ ids: rows.map((r) => r.id), status: status as Product['status'] })}
      />
    </>
  )
}
