import type { ProductListProps } from './ProductList.types'
import { styles } from './ProductList.styles'

export function ProductList({ children, className = '', ...props }: ProductListProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
