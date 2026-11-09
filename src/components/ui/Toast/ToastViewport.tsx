import { useNotification } from '@/contexts/NotificationContext'

const VARIANT: Record<string, string> = {
  success: 'text-bg-success',
  error: 'text-bg-danger',
  info: 'text-bg-primary',
}

/** Renders queued notifications as Bootstrap toasts in the top-right corner. */
export function ToastViewport() {
  const { notifications, dismiss } = useNotification()

  return (
    <div className="toast-container position-fixed top-0 end-0 p-4" style={{ zIndex: 1090 }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`toast show align-items-center border-0 ${VARIANT[n.type] ?? VARIANT.info}`}
          role={n.type === 'error' ? 'alert' : 'status'}
          aria-live={n.type === 'error' ? 'assertive' : 'polite'}
        >
          <div className="d-flex">
            <div className="toast-body">{n.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => dismiss(n.id)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
