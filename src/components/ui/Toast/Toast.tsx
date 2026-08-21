import type { ToastProps } from './Toast.types'
import { styles } from './Toast.styles'

export function Toast({ children, className = '', ...props }: ToastProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
