import type { ButtonProps } from './Button.types'
import { buttonStyles } from './Button.styles'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    fullWidth ? buttonStyles.fullWidth : '',
    isLoading ? buttonStyles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading…' : children}
    </button>
  )
}
