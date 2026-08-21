import { useParams } from 'react-router-dom'
import { ProductCard } from '@/components/features/products/ProductCard'

export function ProductDetailPage() {
  const { id } = useParams()

  return (
    <section className="page">
      <h1>Product detail</h1>
      <p>Viewing product: {id}</p>
      <ProductCard>
        <p>Product details placeholder</p>
      </ProductCard>
    </section>
  )
}
