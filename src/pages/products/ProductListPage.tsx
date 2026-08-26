import { Link } from 'react-router-dom'
import BreadCrumb from '@/components/common/BreadCrumb'
import { ProductList } from '@/components/features/products/ProductList'
import { ProductFilters } from '@/components/features/products/ProductFilters'
import { ROUTES } from '@/constants/routes.constants'

export function ProductListPage() {
  return (
    <>
      <BreadCrumb
        activePage="Products"
        breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}
      />
      <div className="box mb-4">
        <div className="box-header justify-between">
          <div className="box-title">Product catalog</div>
          <Link to={ROUTES.PRODUCT_CREATE} className="ti-btn ti-btn-primary ti-btn-sm">
            Add product
          </Link>
        </div>
        <div className="box-body">
          <ProductFilters>
            <p className="text-textmuted mb-0">Filters placeholder</p>
          </ProductFilters>
        </div>
      </div>
      <div className="box">
        <div className="box-header">
          <div className="box-title">Products</div>
        </div>
        <div className="box-body">
          <ProductList>
            <p className="text-textmuted mb-0">Product list placeholder</p>
          </ProductList>
        </div>
      </div>
    </>
  )
}
