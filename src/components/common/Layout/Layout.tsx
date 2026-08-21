import type { LayoutProps } from './Layout.types'
import { styles } from './Layout.styles'

export function Layout({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
