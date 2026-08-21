import type { ChartProps } from './Chart.types'
import { styles } from './Chart.styles'

export function Chart({ children, className = '', ...props }: ChartProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
