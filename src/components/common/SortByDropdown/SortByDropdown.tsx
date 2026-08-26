import { useEffect, useRef, useState } from 'react'

export type SortByDropdownProps = {
  options?: string[]
  /** Nilova button variant classes, e.g. `ti-btn-light` or `ti-btn-primary` */
  buttonClassName?: string
  value?: string
  onSelect?: (option: string) => void
}

const DEFAULT_OPTIONS = ['Last Week', 'Last Month', 'Last Year']

/**
 * Template-looking Sort By menu with React positioning.
 * Avoids Preline/Popper misplacement after SPA navigation.
 */
export function SortByDropdown({
  options = DEFAULT_OPTIONS,
  buttonClassName = 'ti-btn-light',
  value,
  onSelect,
}: SortByDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="ti-dropdown relative inline-flex">
      <button
        type="button"
        className={`ti-btn ${buttonClassName} ti-btn-sm`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        Sort By
        <i className="ri-arrow-down-s-line middle ms-1 inline-block"></i>
      </button>
      <ul
        className={`ti-dropdown-menu absolute end-0 top-full z-50 min-w-40${open ? '' : ' hidden'}`}
        role="menu"
      >
        {options.map((label) => (
          <li key={label} role="none">
            <button
              type="button"
              role="menuitem"
              className={`ti-dropdown-item w-full text-start${value === label ? ' active' : ''}`}
              onClick={() => {
                onSelect?.(label)
                setOpen(false)
              }}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
