import type { LoaderProps } from './Loader.types'
import { styles } from './Loader.styles'

/**
 * Inline / block loading indicator for content areas.
 * Use AppSplash for boot; use this for panels, drawers, and async sections.
 */
export function Loader({
  label = 'Loading…',
  size = 'md',
  fullScreen = false,
  className = '',
  children,
  ...props
}: LoaderProps) {
  const rootClass = [
    styles.root,
    fullScreen ? styles.fullScreen : '',
    styles[`size_${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-busy="true" {...props}>
      <span className={styles.spinner} aria-hidden="true" />
      {(children ?? label) ? (
        <span className={styles.label}>{children ?? label}</span>
      ) : null}
    </div>
  )
}
