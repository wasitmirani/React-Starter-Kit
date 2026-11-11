import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/endpoints/platform.api'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import type { AppNotification } from '@/types/platform.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

const ICON: Record<AppNotification['type'], string> = {
  info: 'ri-information-line text-info',
  success: 'ri-checkbox-circle-line text-success',
  warning: 'ri-alert-line text-warning',
  error: 'ri-error-warning-line text-danger',
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const list = useList('notifications', notificationsApi.list, { perPage: 10 })
  const markAll = useAction('notifications', () => notificationsApi.markAllRead())
  const markOne = useAction('notifications', (id: string) => notificationsApi.update(id, { read: true }))
  const items = list.data?.data ?? []
  const unread = items.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="dropdown position-relative" ref={ref}>
      <button type="button" className="topbar-link btn position-relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="topbar-icon">
          <i className="ri-notification-3-line fs-lg" />
        </span>
        {unread > 0 && (
          <span className="notification-count badge rounded-pill bg-danger">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="dropdown-menu dropdown-menu-end show p-0 notification-menu shadow end-0" style={{ top: '100%' }}>
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unread > 0 && (
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => markAll.mutate(undefined)}>
                Mark all as read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">You’re all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notification-item dropdown-item d-flex gap-3 py-3 px-4 border-bottom text-wrap${n.read ? '' : ' unread'}`}
                  onClick={() => {
                    if (!n.read) markOne.mutate(n.id)
                    setOpen(false)
                    if (n.link) navigate(n.link)
                  }}
                >
                  <i className={`${ICON[n.type]} fs-5 mt-n1`} />
                  <span className="min-w-0 flex-1">
                    <span className="d-block fw-medium">{n.title}</span>
                    <span className="d-block text-muted fs-sm">{n.body}</span>
                    <span className="d-block text-muted fs-xs mt-1">{formatRelativeTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="legend-dot bg-primary mt-2" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
