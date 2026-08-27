import { useEffect } from 'react'
import { registerApiErrorToast } from '@/lib/api-toast'
import { useNotification } from '@/contexts/NotificationContext'

/** Bridges axios interceptor errors to the notification toast UI. */
export function ApiToastBridge() {
  const { notify } = useNotification()

  useEffect(() => {
    return registerApiErrorToast((message) => notify({ type: 'error', message }))
  }, [notify])

  return null
}
