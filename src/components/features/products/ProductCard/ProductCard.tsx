import type { ProductCardProps } from './ProductCard.types'
import { styles } from './ProductCard.styles'

export function ProductCard({ children, className = '', ...props }: ProductCardProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
