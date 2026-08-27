import type { HTMLAttributes, ReactNode } from 'react'

export type LoaderSize = 'sm' | 'md' | 'lg'

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Accessible status text shown beside the spinner */
  label?: string
  size?: LoaderSize
  /** Cover the viewport (modal-like overlay) */
  fullScreen?: boolean
}
