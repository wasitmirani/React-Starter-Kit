import type { TabsProps } from './Tabs.types'

/** Controlled tab strip. Render the active panel yourself based on `value`. */
export function Tabs<V extends string>({ items, value, onChange, variant = 'line', className = '' }: TabsProps<V>) {
  return (
    <ul className={`nav ${variant === 'pills' ? 'nav-pills' : 'nav-tabs'} gap-1 flex-nowrap overflow-x-auto ${className}`} role="tablist">
      {items.map((item) => (
        <li className="nav-item" key={item.value} role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={item.value === value}
            className={`nav-link text-nowrap d-flex align-items-center gap-1${item.value === value ? ' active' : ''}`}
            onClick={() => onChange(item.value)}
          >
            {item.icon && <i className={item.icon} />}
            {item.label}
            {item.count !== undefined && (
              <span className={`badge rounded-pill ms-1 ${item.value === value ? 'bg-primary' : 'bg-light text-muted'}`}>{item.count}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
