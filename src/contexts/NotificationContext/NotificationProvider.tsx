import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { appConfig } from '@/config/app.config'
import {
  NotificationContext,
  type Notification,
  type NotificationContextValue,
  type NotificationInput,
} from './NotificationContext'

interface NotificationProviderProps {
  children: ReactNode
}

/** At most this many toasts are visible; a new one replaces the oldest. */
const MAX_VISIBLE = 4

/** Errors and warnings stay longer than confirmations; toasts with an action longer still. */
function durationFor(input: NotificationInput) {
  if (input.duration) return input.duration
  const base = input.type === 'error' || input.type === 'warning' ? appConfig.toastDurationMs * 1.75 : appConfig.toastDurationMs
  return input.action ? base * 1.5 : base
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Closing on time is handled by the toast itself (it pauses on hover and focus).
  const notify = useCallback((input: NotificationInput) => {
    const id = crypto.randomUUID()
    setNotifications((prev) => {
      // The same message twice in a row (a double click) shows once.
      const last = prev[prev.length - 1]
      if (last && last.message === input.message && last.type === input.type) return prev
      return [...prev, { ...input, id, duration: durationFor(input) }].slice(-MAX_VISIBLE)
    })
    return id
  }, [])

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, notify, dismiss }),
    [notifications, notify, dismiss],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
