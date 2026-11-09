import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ModalProps } from './Modal.types'
import { styles } from './Modal.styles'

/** React-controlled Bootstrap modal (no Bootstrap JS needed). Closes on Escape. */
export function Modal({ open, title, onClose, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className={`${styles.dialog} ${styles.sizes[size]}`.trim()}>
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title" id={titleId}>
                {title}
              </h6>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className={styles.backdrop} />
    </>,
    document.body,
  )
}
