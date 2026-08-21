import type { ReactNode } from 'react'

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface WithChildren {
  children: ReactNode
}

export interface SelectOption<T = string> {
  label: string
  value: T
}

export type Status = 'idle' | 'loading' | 'success' | 'error'
