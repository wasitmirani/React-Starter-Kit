import { Link } from 'react-router-dom'
import { ProductList } from '@/components/features/products/ProductList'
import { ProductFilters } from '@/components/features/products/ProductFilters'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/constants/routes.constants'

export function ProductListPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Browse and manage your catalog.</p>
        </div>
        <Link to={ROUTES.PRODUCT_CREATE}>
          <Button type="button">Add product</Button>
        </Link>
      </div>
      <ProductFilters>
        <p>Filters placeholder</p>
      </ProductFilters>
      <ProductList>
        <p>Product list placeholder</p>
      </ProductList>
    </section>
  )
}
