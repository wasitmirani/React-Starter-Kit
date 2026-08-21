import type { LoaderProps } from './Loader.types'
import { styles } from './Loader.styles'

export function Loader({ children, className = '', ...props }: LoaderProps) {
  return (
    <div className={`${styles.root} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
