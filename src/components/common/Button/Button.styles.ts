import type { ButtonSize, ButtonVariant } from './Button.types'

export const buttonStyles = {
  base: 'btn',
  variants: {
    primary: 'btn--primary',
    secondary: 'btn--secondary',
    ghost: 'btn--ghost',
    danger: 'btn--danger',
  } satisfies Record<ButtonVariant, string>,
  sizes: {
    sm: 'btn--sm',
    md: 'btn--md',
    lg: 'btn--lg',
  } satisfies Record<ButtonSize, string>,
  fullWidth: 'btn--full',
  loading: 'btn--loading',
} as const
