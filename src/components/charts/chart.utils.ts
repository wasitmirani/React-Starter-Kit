import { useEffect, useRef, useState } from 'react'

export interface Series {
  key: string
  label: string
  /** CSS colour, normally `seriesColor(n)`. */
  color: string
  values: number[]
}

/** Categorical slot colour (1-based, fixed order). Defined in app.css for light and dark. */
export const seriesColor = (slot: number) => `var(--series-${Math.min(Math.max(slot, 1), 7)})`

/** Fixed slot per channel so a channel keeps its colour on every chart. */
export const CHANNEL_SERIES_SLOT: Record<string, number> = { email: 1, sms: 2, whatsapp: 3, voice: 4, push: 5, rcs: 7 }

export function compact(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/** 3–5 rounded ticks from 0 to just above max. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw
  const top = Math.ceil(max / step) * step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
}

export function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

/** Width of a container, updated on resize. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}
