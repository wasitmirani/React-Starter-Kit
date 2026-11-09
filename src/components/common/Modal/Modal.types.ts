import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title: ReactNode
  onClose: () => void
  children?: ReactNode
  /** Footer content, usually action buttons. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}
