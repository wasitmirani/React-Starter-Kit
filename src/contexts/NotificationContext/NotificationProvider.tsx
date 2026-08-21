import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { appConfig } from '@/config/app.config'
import {
  NotificationContext,
  type Notification,
  type NotificationContextValue,
} from './NotificationContext'

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    (input: Omit<Notification, 'id'>) => {
      const id = crypto.randomUUID()
      setNotifications((prev) => [...prev, { ...input, id }])
      window.setTimeout(() => dismiss(id), appConfig.toastDurationMs)
    },
    [dismiss],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, notify, dismiss }),
    [notifications, notify, dismiss],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}
