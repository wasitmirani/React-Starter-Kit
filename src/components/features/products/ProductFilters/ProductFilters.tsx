import type { ProductFiltersProps } from './ProductFilters.types'
import { styles } from './ProductFilters.styles'

export function ProductFilters({ children, className = '', ...props }: ProductFiltersProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
