import { useEffect, useState, type ReactNode } from 'react'
import { Modal } from '@/components/common/Modal'

interface PromptDialogProps {
  open: boolean
  title: string
  message?: ReactNode
  label: string
  confirmLabel: string
  /** Reason is mandatory (holds, cancellations, short picks). */
  required?: boolean
  danger?: boolean
  busy?: boolean
  onConfirm: (value: string) => void
  onClose: () => void
}

/** Confirmation that captures a reason, recorded in the audit trail / timeline. */
export function PromptDialog({ open, title, message, label, confirmLabel, required = true, danger, busy, onConfirm, onClose }: PromptDialogProps) {
  const [value, setValue] = useState('')
  useEffect(() => {
    if (open) setValue('')
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} disabled={busy || (required && !value.trim())} onClick={() => onConfirm(value.trim())}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      {message && <div className="text-muted mb-3">{message}</div>}
      <label htmlFor="prompt-value" className={`form-label${required ? ' required' : ''}`}>{label}</label>
      <textarea id="prompt-value" className="form-control" rows={3} value={value} autoFocus onChange={(e) => setValue(e.target.value)} />
    </Modal>
  )
}
