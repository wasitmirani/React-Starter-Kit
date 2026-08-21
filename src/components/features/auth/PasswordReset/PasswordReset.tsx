import type { PasswordResetProps } from './PasswordReset.types'
import { styles } from './PasswordReset.styles'

export function PasswordReset({ children, className = '', ...props }: PasswordResetProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
