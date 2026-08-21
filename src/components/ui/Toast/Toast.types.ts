import type { HTMLAttributes, ReactNode } from 'react'

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}
