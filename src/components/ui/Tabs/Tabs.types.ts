export interface TabItem<V extends string = string> {
  value: V
  label: string
  icon?: string
  count?: number
}

export interface TabsProps<V extends string = string> {
  items: TabItem<V>[]
  value: V
  onChange: (value: V) => void
  variant?: 'line' | 'pills'
  className?: string
}
