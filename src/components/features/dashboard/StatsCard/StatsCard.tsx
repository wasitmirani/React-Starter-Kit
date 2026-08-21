import type { StatsCardProps } from './StatsCard.types'
import { styles } from './StatsCard.styles'

export function StatsCard({ children, className = '', ...props }: StatsCardProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
