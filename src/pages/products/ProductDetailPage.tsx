import { Link, useParams } from 'react-router-dom'
import BreadCrumb from '@/components/common/BreadCrumb'
import { ProductCard } from '@/components/features/products/ProductCard'
import { ROUTES } from '@/constants/routes.constants'

export function ProductDetailPage() {
  const { id } = useParams()

  return (
    <>
      <BreadCrumb
        activePage="Product detail"
        breadcrumbs={[
          { label: 'Dashboards', href: '/dashboard' },
          { label: 'Products', href: ROUTES.PRODUCTS },
        ]}
      />
      <div className="box">
        <div className="box-header justify-between">
          <div className="box-title">Product {id}</div>
          <Link to={ROUTES.PRODUCTS} className="ti-btn ti-btn-light ti-btn-sm">
            Back to products
          </Link>
        </div>
        <div className="box-body">
          <ProductCard>
            <p className="text-textmuted mb-0">Product details placeholder</p>
          </ProductCard>
        </div>
      </div>
    </>
  )
}
