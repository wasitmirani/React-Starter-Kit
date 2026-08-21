import { useNotification } from '@/contexts/NotificationContext'

export function useToast() {
  const { notify } = useNotification()

  return {
    success: (message: string) => notify({ type: 'success', message }),
    error: (message: string) => notify({ type: 'error', message }),
    info: (message: string) => notify({ type: 'info', message }),
  }
}
