import { useEffect, useRef, useState } from 'react'
import { useFetchers, useLocation, useNavigation } from 'react-router-dom'

type ProgressPhase = 'idle' | 'start' | 'complete'

/**
 * Modern top-of-viewport route progress (YouTube / GitHub style).
 * Driven by React Router navigation + fetcher state, with a short pulse
 * for instant/cached navigations that never enter a loading state.
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const location = useLocation()
  const fetchers = useFetchers()
  const [phase, setPhase] = useState<ProgressPhase>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFirstRender = useRef(true)
  const handledByNavigation = useRef(false)

  const fetcherBusy = fetchers.some(
    (f) => f.state === 'loading' || f.state === 'submitting',
  )
  const isNavigating =
    navigation.state === 'loading' ||
    navigation.state === 'submitting' ||
    fetcherBusy

  useEffect(() => {
    const clearTimers = () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
    }

    if (isNavigating) {
      handledByNavigation.current = true
      clearTimers()
      setPhase('start')
      return clearTimers
    }

    setPhase((current) => {
      if (current !== 'start') return current
      resetTimer.current = setTimeout(() => setPhase('idle'), 280)
      return 'complete'
    })

    return clearTimers
  }, [isNavigating])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Lazy / loader navigations already drove the bar via useNavigation.
    if (handledByNavigation.current) {
      handledByNavigation.current = false
      return
    }

    setPhase('start')
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    if (resetTimer.current) clearTimeout(resetTimer.current)

    pulseTimer.current = setTimeout(() => {
      setPhase('complete')
      resetTimer.current = setTimeout(() => setPhase('idle'), 280)
    }, 220)

    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [location.key])

  if (phase === 'idle') return null

  return (
    <div
      className={`route-progress ${phase === 'complete' ? 'route-progress--done' : 'route-progress--active'}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={phase === 'complete' ? 100 : 45}
      aria-label="Page loading"
    >
      <div className="route-progress__bar" />
      <div className="route-progress__glow" />
    </div>
  )
}
