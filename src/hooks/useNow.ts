import { useEffect, useState } from 'react'

/** Current time that re-renders every `intervalMs` (for countdowns and "x seconds ago"). */
export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
  return now
}

/** "in 32s", "in 4m", "in 2h 5m", "in 3d". */
export function countdown(targetMs: number, now: number): string {
  const s = Math.max(0, Math.round((targetMs - now) / 1000))
  if (s < 60) return `in ${s}s`
  if (s < 3600) return `in ${Math.round(s / 60)}m`
  if (s < 86_400) return `in ${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`
  return `in ${Math.round(s / 86_400)}d`
}
