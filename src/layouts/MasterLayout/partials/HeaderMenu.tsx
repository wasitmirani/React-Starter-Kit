import { Link, useNavigate } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { UserMenu } from '@/components/features/account/UserMenu'
import { CommandPalette } from '@/components/features/shell/CommandPalette'
import { NotificationsMenu } from '@/components/features/shell/NotificationsMenu'
import { WorkspaceSwitcher } from '@/components/features/workspace/WorkspaceSwitcher'
import { Dropdown } from '@/components/ui/Dropdown'
import { ROUTES } from '@/constants/routes.constants'
import { useCan } from '@/hooks/useCan'
import { useRealtimeStatus } from '@/hooks/useRealtimeSync'

export function HeaderMenu() {
  const navigate = useNavigate()
  // Create actions the role cannot perform stay visible but disabled.
  const can = useCan()
  const live = useRealtimeStatus((s) => s.status)
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

  return (
    <header className="main-topbar" id="main-topbar">
      <div className="navbar-brand">
        <div className="logos">
          <Link to={ROUTES.DASHBOARD} aria-label="Home">
            <BrandMark />
          </Link>
        </div>
        <button type="button" id="toggleSidebar" className="sidebar-toggle btn p-0" aria-label="Toggle sidebar">
          <i className="mgc_layout_rightbar_open_line"></i>
        </button>
      </div>

      <button
        type="button"
        className="btn btn-light topbar-search d-none d-md-flex align-items-center gap-2 text-muted ms-3"
        style={{ minWidth: 260 }}
        onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      >
        <i className="ri-search-line" />
        <span className="flex-1 text-start">Search or jump to…</span>
        <span className="kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
      </button>
      <CommandPalette />

      <div className="d-flex align-items-center gap-1 gap-md-2 gap-xl-10px ms-auto">
        <Dropdown
          label={
            <>
              <i className="ri-add-line" /> <span className="d-none d-lg-inline">Create</span>
            </>
          }
          buttonClassName="btn btn-primary btn-sm d-flex align-items-center gap-1"
          items={[
            { key: 'order', label: 'Order', icon: 'ri-shopping-bag-3-line', disabled: !can('orders.create'), onSelect: () => navigate(ROUTES.ORDER_NEW) },
            { key: 'product', label: 'Product', icon: 'ri-price-tag-3-line', disabled: !can('products.manage'), onSelect: () => navigate(ROUTES.PRODUCT_NEW) },
            { key: 'po', label: 'Purchase order', icon: 'ri-file-list-3-line', disabled: !can('procurement.create'), onSelect: () => navigate(ROUTES.PURCHASE_ORDER_NEW) },
            { key: 'adjustment', label: 'Stock adjustment', icon: 'ri-equalizer-line', disabled: !can('inventory.adjust'), onSelect: () => navigate(`${ROUTES.ADJUSTMENTS}?new=1`) },
            { key: 'transfer', label: 'Transfer', icon: 'ri-arrow-left-right-line', disabled: !can('inventory.transfer'), onSelect: () => navigate(`${ROUTES.TRANSFERS}?new=1`) },
            'divider',
            { key: 'import', label: 'Import catalog', icon: 'ri-upload-2-line', disabled: !can('products.manage'), onSelect: () => navigate(ROUTES.IMPORTS) },
          ]}
        />
        {live !== 'off' && (
          <span className={`live-indicator ${live}`} role="status" title={live === 'live' ? 'Live: changes appear as they happen' : live === 'connecting' ? 'Connecting to live updates…' : 'Live updates paused; reconnecting'}>
            <span className="live-indicator-dot" aria-hidden="true" />
            <span className="d-none d-xl-inline">{live === 'live' ? 'Live' : live === 'connecting' ? 'Connecting' : 'Offline'}</span>
          </span>
        )}
        <WorkspaceSwitcher />
        <NotificationsMenu />
        <button type="button" id="fullscreenButton" className="topbar-link btn d-none d-xl-flex" aria-label="Fullscreen">
          <span className="topbar-icon">
            <i data-lucide="maximize" className="size-4-5"></i>
          </span>
        </button>
        <button type="button" id="darkModeButton" className="topbar-link topbar-mode btn d-none d-md-block" aria-label="Toggle dark mode">
          <span className="topbar-icon">
            <i data-lucide="moon" className="size-4-5 dark"></i>
            <i data-lucide="sun-medium" className="size-4-5 light"></i>
          </span>
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
export default HeaderMenu
