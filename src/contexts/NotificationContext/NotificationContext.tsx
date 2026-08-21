import { createContext } from 'react'

export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
}

export interface NotificationContextValue {
  notifications: Notification[]
  notify: (input: Omit<Notification, 'id'>) => void
  dismiss: (id: string) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
