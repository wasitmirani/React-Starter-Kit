import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import type { Notification } from '@/contexts/NotificationContext/NotificationContext'

const ICON: Record<Notification['type'], string> = {
  success: 'ri-checkbox-circle-fill',
  error: 'ri-error-warning-fill',
  warning: 'ri-alert-fill',
  info: 'ri-information-fill',
}

const EXIT_MS = 180

/** One toast: closes on its own, pauses while hovered or focused, can carry an action. */
function ToastItem({ toast, onDismiss }: { toast: Notification; onDismiss: (id: string) => void }) {
  const [leaving, setLeaving] = useState(false)
  const [paused, setPaused] = useState(false)
  const remaining = useRef(toast.duration)
  const started = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  const close = useCallback(() => {
    window.clearTimeout(timer.current)
    setLeaving(true)
    window.setTimeout(() => onDismiss(toast.id), EXIT_MS)
  }, [onDismiss, toast.id])

  // Countdown with pause: the remaining time is kept while hovered or focused.
  useEffect(() => {
    if (paused || leaving) return
    started.current = Date.now()
    timer.current = window.setTimeout(close, remaining.current)
    return () => {
      window.clearTimeout(timer.current)
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current))
    }
  }, [paused, leaving, close])

  const urgent = toast.type === 'error' || toast.type === 'warning'
  return (
    <div
      className={`app-toast app-toast-${toast.type}${leaving ? ' leaving' : ''}${paused ? ' paused' : ''}`}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ ['--toast-duration' as string]: `${toast.duration}ms` }}
    >
      <span className="app-toast-icon" aria-hidden="true"><i className={ICON[toast.type]} /></span>
      <div className="app-toast-content">
        {toast.title && <div className="app-toast-title">{toast.title}</div>}
        <div className={toast.title ? 'app-toast-description' : 'app-toast-title'}>{toast.message}</div>
        {toast.action && (
          <button
            type="button"
            className="app-toast-action"
            onClick={() => {
              toast.action!.onClick()
              close()
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button type="button" className="app-toast-close" aria-label="Dismiss notification" onClick={close}>
        <i className="ri-close-line" />
      </button>
      <span className="app-toast-progress" aria-hidden="true" />
    </div>
  )
}

/** Stack of toasts: bottom-right on desktop, top-centre on phones. */
export function ToastViewport() {
  const { notifications, dismiss } = useNotification()
  return (
    <section className="app-toaster" aria-label="Notifications">
      {notifications.map((n) => (
        <ToastItem key={n.id} toast={n} onDismiss={dismiss} />
      ))}
    </section>
  )
}
