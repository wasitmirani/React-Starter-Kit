import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface DropdownItem {
  key: string
  label: ReactNode
  icon?: string
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
}

interface DropdownProps {
  /** Button content. */
  label: ReactNode
  items: (DropdownItem | 'divider')[]
  buttonClassName?: string
  align?: 'start' | 'end'
  ariaLabel?: string
}

/** React-controlled Bootstrap dropdown; closes on outside click and Escape. */
export function Dropdown({ label, items, buttonClassName = 'btn btn-light', align = 'end', ariaLabel }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="dropdown position-relative d-inline-block" ref={ref}>
      <button type="button" className={buttonClassName} aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open && (
        <ul className={`dropdown-menu show shadow-sm ${align === 'end' ? 'dropdown-menu-end end-0' : 'start-0'}`} style={{ top: '100%', minWidth: '11rem' }}>
          {items.map((item, i) =>
            item === 'divider' ? (
              <li key={`d${i}`}>
                <hr className="dropdown-divider" />
              </li>
            ) : (
              <li key={item.key}>
                <button
                  type="button"
                  className={`dropdown-item d-flex align-items-center gap-2${item.danger ? ' text-danger' : ''}`}
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                >
                  {item.icon && <i className={item.icon} />}
                  {item.label}
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}

/** The common "⋯" row menu. */
export function MoreMenu({ items }: { items: (DropdownItem | 'divider')[] }) {
  return <Dropdown label={<i className="ri-more-2-fill" />} items={items} buttonClassName="btn btn-sm btn-light btn-icon" ariaLabel="More actions" />
}
