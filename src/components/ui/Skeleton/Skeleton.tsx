import type { CSSProperties, HTMLAttributes } from 'react'

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
}

const variantClass: Record<SkeletonVariant, string> = {
  text: 'saas-skeleton saas-skeleton--text',
  circular: 'saas-skeleton saas-skeleton--circular',
  rectangular: 'saas-skeleton saas-skeleton--rectangular',
  rounded: 'saas-skeleton saas-skeleton--rounded',
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const merged: CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : null),
    ...(height !== undefined ? { height } : null),
  }

  return (
    <div
      className={`${variantClass[variant]} ${className}`.trim()}
      style={merged}
      aria-hidden="true"
      {...props}
    />
  )
}
