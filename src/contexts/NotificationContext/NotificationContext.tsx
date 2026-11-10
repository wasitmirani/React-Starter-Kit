import { createContext } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationAction {
  label: string
  onClick: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  /** Optional bold first line; the message becomes the description. */
  title?: string
  /** One button inside the toast (e.g. "Go to billing", "Undo"). */
  action?: NotificationAction
  /** Milliseconds before it closes; paused while hovered or focused. */
  duration: number
}

export type NotificationInput = Omit<Notification, 'id' | 'duration'> & { duration?: number }

export interface NotificationContextValue {
  notifications: Notification[]
  notify: (input: NotificationInput) => string
  dismiss: (id: string) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
