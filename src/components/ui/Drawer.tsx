import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  open: boolean
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

/** Right-side panel for details and quick edits (Bootstrap offcanvas markup). */
export function Drawer({ open, title, subtitle, onClose, children, footer, size = 'md' }: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div className={`offcanvas offcanvas-end show drawer-panel${size === 'lg' ? ' drawer-lg' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="offcanvas-header border-bottom align-items-start">
          <div className="min-w-0">
            <h6 className="offcanvas-title mb-0 text-truncate" id={titleId}>
              {title}
            </h6>
            {subtitle && <div className="text-muted fs-sm mt-1">{subtitle}</div>}
          </div>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
        <div className="offcanvas-body">{children}</div>
        {footer && <div className="border-top p-4 d-flex justify-content-end gap-2">{footer}</div>}
      </div>
      <div className="offcanvas-backdrop fade show" onClick={onClose} />
    </>,
    document.body,
  )
}
