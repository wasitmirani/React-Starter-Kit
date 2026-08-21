import type { ActivityFeedProps } from './ActivityFeed.types'
import { styles } from './ActivityFeed.styles'

export function ActivityFeed({ children, className = '', ...props }: ActivityFeedProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
