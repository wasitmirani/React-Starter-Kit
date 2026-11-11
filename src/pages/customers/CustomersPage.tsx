import { useParams } from 'react-router-dom'
import { customersApi, ordersApi } from '@/api/endpoints/commerce.api'
import { errorMessage } from '@/api/errors'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Loader } from '@/components/common/Loader'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { StatCard } from '@/components/common/StatCard'
import { Avatar } from '@/components/ui/Avatar'
import { DetailList } from '@/components/ui/Controls'
import { TagList } from '@/components/ui/StatusBadge'
import { ROUTES, to } from '@/constants/routes.constants'
import { useOne } from '@/hooks/queries/resource.queries'
import type { Customer, Order } from '@/types/commerce.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'
import { formatDate, formatRelativeTime } from '@/utils/formatters/date.formatter'
import { orderColumns } from '@/pages/orders/OrdersPage'

const columns: DataTableColumn<Customer>[] = [
  { key: 'name', label: 'Customer', sortable: true, render: (c) => <div className="d-flex align-items-center gap-3"><Avatar name={c.name} size={32} /><div><div className="fw-medium">{c.name}</div><div className="text-muted fs-sm">{c.email ?? c.phone}</div></div></div> },
  { key: 'phone', label: 'Phone' },
  { key: 'city', label: 'City', sortable: true, render: (c) => `${c.city}, ${c.country}` },
  { key: 'ordersCount', label: 'Orders', align: 'end', sortable: true, render: (c) => <span className="tabular-nums">{c.ordersCount}</span> },
  { key: 'totalSpent', label: 'Lifetime value', align: 'end', sortable: true, render: (c) => <span className="tabular-nums fw-medium">{formatMoney(c.totalSpent, c.currency)}</span> },
  { key: 'tags', label: 'Tags', render: (c) => <TagList tags={c.tags} /> },
  { key: 'lastOrderAt', label: 'Last order', sortable: true, render: (c) => (c.lastOrderAt ? <span className="text-muted">{formatRelativeTime(c.lastOrderAt)}</span> : '—') },
]

export function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" description="Buyers across every channel, matched by phone number." />
      <ResourceList<Customer>
        resource="customers"
        list={customersApi.list}
        columns={columns}
        itemsLabel="customers"
        exportName="customers"
        searchPlaceholder="Name, phone, email, city…"
        rowLink={(c) => to(ROUTES.CUSTOMER, { id: c.id })}
        filters={[{ key: 'country', allLabel: 'All countries', options: [{ value: 'PK', label: 'Pakistan' }, { value: 'AE', label: 'UAE' }] }, { key: 'tags', allLabel: 'Any tag', options: ['vip', 'repeat', 'cod_risk', 'wholesale'].map((t) => ({ value: t, label: t })) }]}
      />
    </>
  )
}

export function CustomerDetailPage() {
  const { id } = useParams()
  const customer = useOne('customers', customersApi.get, id)
  if (customer.isLoading) return <Loader label="Loading customer…" />
  if (customer.isError || !customer.data) return <QueryError message={errorMessage(customer.error)} onRetry={() => customer.refetch()} />
  const c = customer.data
  return (
    <>
      <PageHeader back={{ label: 'Customers', to: ROUTES.CUSTOMERS }} title={c.name} meta={<TagList tags={c.tags} />} description={`${c.city}, ${c.country} · customer since ${formatDate(c.createdAt)}`} />
      <div className="row g-4 mb-4">
        <div className="col-md-4"><StatCard label="Orders" value={c.ordersCount} icon="ri-shopping-bag-3-line" /></div>
        <div className="col-md-4"><StatCard label="Lifetime value" value={formatMoney(c.totalSpent, c.currency)} icon="ri-money-dollar-circle-line" tone="success" /></div>
        <div className="col-md-4"><StatCard label="Average order" value={formatMoney(c.ordersCount ? c.totalSpent / c.ordersCount : 0, c.currency)} icon="ri-scales-3-line" tone="info" /></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-4">
          <Panel title="Contact" icon="ri-contacts-line">
            <DetailList items={[{ label: 'Phone', value: c.phone }, { label: 'Email', value: c.email }, { label: 'Last order', value: c.lastOrderAt ? formatDate(c.lastOrderAt) : null }]} />
          </Panel>
        </div>
        <div className="col-xl-8">
          <h6 className="mb-3">Order history</h6>
          <ResourceList<Order> resource="orders" list={ordersApi.list} scope={{ customerId: c.id }} columns={orderColumns.filter((col) => col.key !== 'customerName')} itemsLabel="orders" perPage={10} rowLink={(o) => to(ROUTES.ORDER, { id: o.id })} />
        </div>
      </div>
    </>
  )
}
