import { useEffect, useState } from 'react'

type Props = {
  value: number
  delayMs?: number
  variant?: 'default' | 'success' | 'warning'
}

export function AnimatedProgress({ value, delayMs = 0, variant = 'default' }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs])

  const variantClass =
    variant === 'success'
      ? ' omi-progress__fill--success'
      : variant === 'warning'
        ? ' omi-progress__fill--warning'
        : ''

  return (
    <div className="omi-progress">
      <div
        className={`omi-progress__fill${variantClass}${ready ? ' is-ready' : ''}`}
        style={{ width: ready ? `${value}%` : '0%' }}
      />
    </div>
  )
}
