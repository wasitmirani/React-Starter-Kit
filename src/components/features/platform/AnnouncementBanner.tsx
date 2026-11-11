import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { announcementApi, type Announcement } from '@/api/endpoints/admin.api'
import { useAuth } from '@/hooks/useAuth'

const TONE = { info: 'info', warning: 'warning', critical: 'danger' } as const
const ICON = { info: 'ri-information-line', warning: 'ri-alarm-warning-line', critical: 'ri-error-warning-line' } as const
const dismissKey = (a: Announcement) => `announcement-dismissed:${a.level}:${a.message}`

/** The banner itself (also used as the preview in Platform settings). */
export function AnnouncementBar({ a, onDismiss }: { a: Announcement; onDismiss?: () => void }) {
  return (
    <div className={`alert alert-${TONE[a.level]} d-flex flex-wrap align-items-center gap-3`} role={a.level === 'critical' ? 'alert' : 'status'}>
      <i className={`${ICON[a.level]} fs-lg`} aria-hidden="true" />
      <span className="flex-grow-1">{a.message}</span>
      {a.link && (
        <a href={a.link} target="_blank" rel="noopener noreferrer" className="alert-link">
          Learn more
        </a>
      )}
      {onDismiss && a.level !== 'critical' && <button type="button" className="btn-close" aria-label="Hide this announcement" onClick={onDismiss} />}
    </div>
  )
}

/** Platform-wide announcement from the platform team. Hidden for the session once dismissed; critical ones stay. */
export function AnnouncementBanner() {
  const { user } = useAuth()
  const q = useQuery({
    queryKey: ['announcement'],
    queryFn: async () => (await announcementApi.current()).data.data,
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: false,
  })
  const [, rerender] = useState(0)
  const a = q.data
  if (!a) return null
  let hidden = false
  try {
    hidden = sessionStorage.getItem(dismissKey(a)) === '1'
  } catch {
    /* storage blocked: always show */
  }
  if (hidden && a.level !== 'critical') return null
  return (
    <AnnouncementBar
      a={a}
      onDismiss={() => {
        try {
          sessionStorage.setItem(dismissKey(a), '1')
        } catch {
          /* ignore */
        }
        rerender((n) => n + 1)
      }}
    />
  )
}
