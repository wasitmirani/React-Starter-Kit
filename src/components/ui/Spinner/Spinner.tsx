import type { SpinnerProps } from './Spinner.types'
import { styles } from './Spinner.styles'

export function Spinner({ children, className = '', ...props }: SpinnerProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
