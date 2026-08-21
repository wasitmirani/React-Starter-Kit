import type { CardProps } from './Card.types'
import { styles } from './Card.styles'

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
