import { useNotification } from '@/contexts/NotificationContext'
import type { NotificationAction } from '@/contexts/NotificationContext/NotificationContext'

export interface ToastOptions {
  /** Bold first line; the message becomes the description. */
  title?: string
  /** A button inside the toast, e.g. `{ label: 'Undo', onClick }`. */
  action?: NotificationAction
  /** Milliseconds before it closes (paused while hovered). */
  duration?: number
}

/**
 * Toast notifications:
 * `toast.success('Saved')`, or with options
 * `toast.warning('Your plan is full', { title: 'Limit reached', action: { label: 'Upgrade', onClick } })`.
 */
export function useToast() {
  const { notify, dismiss } = useNotification()

  return {
    success: (message: string, options?: ToastOptions) => notify({ type: 'success', message, ...options }),
    error: (message: string, options?: ToastOptions) => notify({ type: 'error', message, ...options }),
    warning: (message: string, options?: ToastOptions) => notify({ type: 'warning', message, ...options }),
    info: (message: string, options?: ToastOptions) => notify({ type: 'info', message, ...options }),
    dismiss,
  }
}
