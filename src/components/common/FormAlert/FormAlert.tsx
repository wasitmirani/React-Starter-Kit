interface FormAlertProps {
  message: string | null
  variant?: 'danger' | 'success' | 'info' | 'warning'
  onClose?: () => void
}

/** Inline form-level message (server errors, confirmations). */
export function FormAlert({ message, variant = 'danger', onClose }: FormAlertProps) {
  if (!message) return null
  return (
    <div className={`alert alert-${variant}${onClose ? ' alert-dismissible' : ''}`} role="alert">
      <span>{message}</span>
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />}
    </div>
  )
}
