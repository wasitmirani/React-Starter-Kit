import type { BadgeProps } from './Badge.types'
import { styles } from './Badge.styles'

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
