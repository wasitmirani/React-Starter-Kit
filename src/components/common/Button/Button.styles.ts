import type { ButtonSize, ButtonVariant } from './Button.types'

export const buttonStyles = {
  base: 'ti-btn',
  variants: {
    primary: 'ti-btn-primary',
    secondary: 'ti-btn-secondary',
    ghost: 'ti-btn-light',
    danger: 'ti-btn-danger',
  } satisfies Record<ButtonVariant, string>,
  sizes: {
    sm: 'ti-btn-sm',
    md: '',
    lg: 'ti-btn-lg',
  } satisfies Record<ButtonSize, string>,
  fullWidth: 'ti-btn--full',
  loading: 'ti-btn--loading',
} as const
