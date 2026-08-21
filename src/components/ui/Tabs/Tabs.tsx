import type { TabsProps } from './Tabs.types'
import { styles } from './Tabs.styles'

export function Tabs({ children, className = '', ...props }: TabsProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
