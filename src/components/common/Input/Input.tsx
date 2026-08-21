import type { InputProps } from './Input.types'
import { styles } from './Input.styles'

export function Input({ children, className = '', ...props }: InputProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
