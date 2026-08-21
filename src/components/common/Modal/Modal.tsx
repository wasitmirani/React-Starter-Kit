import type { ModalProps } from './Modal.types'
import { styles } from './Modal.styles'

export function Modal({ children, className = '', ...props }: ModalProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
