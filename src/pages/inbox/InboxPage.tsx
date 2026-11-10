import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { inboxApi } from '@/api/endpoints/inbox.api'
import { SearchInput } from '@/components/common/FilterBar'
import { ConversationContext, ConversationThread } from '@/components/features/inbox/ConversationThread'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { CHANNELS, INBOX_CHANNELS } from '@/constants/channels.constants'
import { useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useAuth } from '@/hooks/useAuth'
import { useNow } from '@/hooks/useNow'
import type { Channel } from '@/types/channel.types'
import type { Conversation } from '@/types/inbox.types'
import { formatShortTime } from '@/utils/formatters/date.formatter'

type Folder = 'mine' | 'unassigned' | 'open' | 'pending' | 'snoozed' | 'resolved'
type Quick = 'all' | 'unread' | 'urgent' | 'waiting'
type Sort = 'newest' | 'oldest' | 'priority'

const FOLDERS: { key: Folder; label: string; icon: string }[] = [
  { key: 'mine', label: 'Assigned to me', icon: 'ri-user-star-line' },
  { key: 'unassigned', label: 'Unassigned', icon: 'ri-user-unfollow-line' },
  { key: 'open', label: 'All open', icon: 'ri-inbox-line' },
  { key: 'pending', label: 'Pending', icon: 'ri-hourglass-line' },
  { key: 'snoozed', label: 'Snoozed', icon: 'ri-alarm-snooze-line' },
  { key: 'resolved', label: 'Resolved', icon: 'ri-checkbox-circle-line' },
]

const PRIORITY_RANK: Record<Conversation['priority'], number> = { urgent: 0, high: 1, normal: 2, low: 3 }

/** "12m", "3h", "2d" since the contact's last message. */
function waitLabel(iso: string, now: number) {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000))
  return mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 1440)}d`
}

const isWide = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1200px)').matches

export function InboxPage() {
  const { user } = useAuth()
  const me = user?.name ?? ''
  const now = useNow(60_000)
  const [params, setParams] = useSearchParams()
  const folder = (params.get('folder') as Folder) || 'open'
  const channel = params.get('channel') as Channel | null
  const search = params.get('q') ?? ''
  const selectedId = params.get('c')
  const [quick, setQuick] = useState<Quick>('all')
  const [sort, setSort] = useState<Sort>('newest')
  /** Narrow screens: the contact panel opens as an overlay. */
  const [ctxOpen, setCtxOpen] = useState(false)

  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }

  const conversations = useAll('conversations', inboxApi.list)
  const counts = useTenantQuery('conversations', { counts: me }, () => inboxApi.counts(me))

  const inFolder = useMemo(() => {
    const q = search.toLowerCase()
    return (conversations.data?.data ?? [])
      .filter((c) => {
        if (folder === 'mine') return c.status === 'open' && c.assigneeName === me
        if (folder === 'unassigned') return c.status === 'open' && !c.assigneeName
        return c.status === folder
      })
      .filter((c) => !channel || c.channel === channel)
      .filter((c) => !q || `${c.contactName} ${c.contactHandle} ${c.lastMessagePreview} ${c.subject ?? ''}`.toLowerCase().includes(q))
  }, [conversations.data, folder, channel, search, me])

  const waiting = (c: Conversation) => c.status === 'open' && c.unreadCount > 0
  const visible = useMemo(
    () =>
      inFolder
        .filter((c) => (quick === 'unread' ? c.unreadCount > 0 : quick === 'urgent' ? c.priority === 'urgent' || c.priority === 'high' : quick === 'waiting' ? waiting(c) : true))
        .sort((a, b) => (sort === 'priority' ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.lastMessageAt.localeCompare(a.lastMessageAt) : sort === 'oldest' ? a.lastMessageAt.localeCompare(b.lastMessageAt) : b.lastMessageAt.localeCompare(a.lastMessageAt))),
    [inFolder, quick, sort],
  )

  // On wide screens the newest conversation opens by default, like a mail client.
  const effectiveId = selectedId ?? (isWide() ? visible[0]?.id ?? null : null)
  const selected = (conversations.data?.data ?? []).find((c) => c.id === effectiveId) ?? null
  const folderCount = (key: Folder) => counts.data?.[key]
  const folderLabel = FOLDERS.find((f) => f.key === folder)?.label ?? 'Inbox'
  // Keyboard triage: J/K (or arrows) move through the list, / focuses search, Esc closes the thread.
  const nav = useRef({ visible, effectiveId, set })
  nav.current = { visible, effectiveId, set }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.ctrlKey || e.metaKey || e.altKey || el.closest('input, textarea, select, [contenteditable="true"], .modal')) return
      const { visible: list, effectiveId: current, set: go } = nav.current
      const index = list.findIndex((c) => c.id === current)
      if (e.key === 'j' || e.key === 'ArrowDown') {
        const next = list[Math.min(list.length - 1, index + 1)]
        if (next) go({ c: next.id })
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        const prev = list[Math.max(0, index - 1)]
        if (prev) go({ c: prev.id })
      } else if (e.key === '/') {
        document.querySelector<HTMLInputElement>('.inbox-list input[type="search"]')?.focus()
      } else if (e.key === 'Escape') {
        go({ c: null })
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Keep the keyboard-selected row in view.
  useEffect(() => {
    // Scroll only the list pane; scrollIntoView would also shift the page sideways.
    const row = effectiveId ? document.querySelector<HTMLElement>(`[data-conversation="${CSS.escape(effectiveId)}"]`) : null
    const box = row?.closest<HTMLElement>('.inbox-scroll')
    if (!row || !box) return
    const top = row.offsetTop - box.offsetTop
    if (top < box.scrollTop) box.scrollTop = top
    else if (top + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top + row.offsetHeight - box.clientHeight
  }, [effectiveId])

  const quickCount = (q: Quick) => inFolder.filter((c) => (q === 'unread' ? c.unreadCount > 0 : q === 'urgent' ? c.priority === 'urgent' || c.priority === 'high' : q === 'waiting' ? waiting(c) : true)).length

  return (
    <div className={`inbox-shell modern${ctxOpen ? ' ctx-open' : ''}`} data-view={selected && selectedId ? 'thread' : 'list'}>
      <aside className="inbox-pane inbox-folders">
        <div className="inbox-folders-head">
          <span className="inbox-logo"><i className="ri-inbox-2-fill" /></span>
          <div>
            <strong>Inbox</strong>
            <span className="d-block text-muted fs-xs">{counts.data ? `${counts.data.open} open · ${counts.data.unassigned} unassigned` : 'Loading…'}</span>
          </div>
        </div>
        <nav className="inbox-nav" aria-label="Folders">
          {FOLDERS.map((f) => (
            <button key={f.key} type="button" className={`nav-link${folder === f.key ? ' active' : ''}`} onClick={() => set({ folder: f.key, c: null })}>
              <i className={f.icon} /> <span className="flex-1 text-start">{f.label}</span>
              {folderCount(f.key) ? <span className={`inbox-count${f.key === 'unassigned' && folderCount(f.key) ? ' warn' : ''}`}>{folderCount(f.key)}</span> : null}
            </button>
          ))}
        </nav>
        <div className="inbox-nav-heading">Channels</div>
        <nav className="inbox-nav" aria-label="Channels">
          <button type="button" className={`nav-link${!channel ? ' active' : ''}`} onClick={() => set({ channel: null, c: null })}>
            <i className="ri-apps-2-line" /> <span className="flex-1 text-start">All channels</span>
          </button>
          {INBOX_CHANNELS.filter((ch) => counts.data?.byChannel[ch] || channel === ch).map((ch) => (
            <button key={ch} type="button" className={`nav-link${channel === ch ? ' active' : ''}`} onClick={() => set({ channel: ch, c: null })}>
              <span className={`inbox-ch-dot bg-${CHANNELS[ch].tone}`}><i className={CHANNELS[ch].icon} /></span>
              <span className="flex-1 text-start">{CHANNELS[ch].label}</span>
              <span className="inbox-count">{counts.data?.byChannel[ch] ?? 0}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="inbox-pane inbox-list">
        <div className="inbox-list-head">
          <div className="d-flex align-items-center gap-2 mb-2">
            <h6 className="mb-0 flex-1 text-truncate">{channel ? `${folderLabel} · ${CHANNELS[channel].label}` : folderLabel}</h6>
            <select className="form-select form-select-sm w-auto" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <SearchInput value={search} onChange={(q) => set({ q })} placeholder="Search name, message, subject…" className="mw-100" />
          <div className="inbox-quick" role="group" aria-label="Quick filters">
            {([['all', 'All'], ['unread', 'Unread'], ['waiting', 'Waiting'], ['urgent', 'Urgent']] as [Quick, string][]).map(([q, label]) => (
              <button key={q} type="button" className={quick === q ? 'on' : ''} aria-pressed={quick === q} onClick={() => setQuick(q)}>
                {label}<span>{quickCount(q)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="inbox-scroll">
          {conversations.isLoading ? (
            <div className="p-4"><SkeletonLines lines={8} /></div>
          ) : visible.length === 0 ? (
            <EmptyState icon="ri-chat-check-line" title={quick !== 'all' ? 'Nothing here' : 'Inbox zero'} description={quick !== 'all' ? 'No conversations match this filter.' : folder === 'mine' ? 'Nothing assigned to you right now. Nice work.' : 'Nothing in this view.'} />
          ) : (
            visible.map((c) => (
              <button key={c.id} type="button" data-conversation={c.id} aria-current={c.id === effectiveId || undefined} className={`inbox-item${c.id === effectiveId ? ' active' : ''}${c.unreadCount ? ' unread' : ''}`} onClick={() => set({ c: c.id })}>
                <div className="position-relative flex-shrink-0">
                  <Avatar name={c.contactName} size={40} />
                  <span className={`inbox-item-ch bg-${CHANNELS[c.channel].tone}`} title={CHANNELS[c.channel].label}><i className={CHANNELS[c.channel].icon} /></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="inbox-item-name text-truncate">{c.contactName}</span>
                    <span className="ms-auto inbox-item-time">{formatShortTime(c.lastMessageAt)}</span>
                  </div>
                  {c.subject && <div className="inbox-item-subject text-truncate">{c.subject}</div>}
                  <div className="inbox-item-preview text-truncate">{c.lastMessagePreview}</div>
                  <div className="inbox-item-meta">
                    {(c.priority === 'urgent' || c.priority === 'high') && <span className={`chip ${c.priority}`}><i className="ri-flag-fill" />{c.priority}</span>}
                    {waiting(c) && <span className="chip wait" title="Waiting for a reply"><i className="ri-time-line" />{waitLabel(c.lastMessageAt, now)}</span>}
                    {c.tags.slice(0, 1).map((t) => <span key={t} className="chip tag">#{t}</span>)}
                    <span className="ms-auto d-inline-flex align-items-center gap-1">
                      {c.assigneeName ? <span title={`Assigned to ${c.assigneeName}`}><Avatar name={c.assigneeName} size={18} /></span> : <span className="chip ghost" title="Unassigned"><i className="ri-user-add-line" /></span>}
                      {c.unreadCount > 0 && <span className="inbox-unread">{c.unreadCount}</span>}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="inbox-pane inbox-thread">
        {selected ? (
          <ConversationThread conversation={selected} onBack={() => set({ c: null })} onToggleContext={() => setCtxOpen((o) => !o)} contextOpen={ctxOpen} />
        ) : (
          <div className="d-flex flex-1 align-items-center justify-content-center">
            <EmptyState icon="ri-chat-smile-2-line" title="Pick a conversation" description="Email, SMS, WhatsApp, live chat and social messages all land here. Use the filters to find who is waiting." />
          </div>
        )}
      </section>

      <aside className="inbox-pane inbox-context">
        {selected ? (
          <>
            <button type="button" className="btn btn-sm btn-icon btn-light ctx-close" aria-label="Close contact panel" onClick={() => setCtxOpen(false)}><i className="ri-close-line" /></button>
            <ConversationContext key={selected.id} conversation={selected} />
          </>
        ) : (
          <div className="inbox-tips">
            <h6 className="tpl-section-title mb-3">Tips</h6>
            <ul>
              <li><span className="kbd">J</span> <span className="kbd">K</span> next and previous conversation</li>
              <li><span className="kbd">/</span> searches here, and inserts a saved reply in the composer</li>
              <li><span className="kbd">Esc</span> closes the conversation</li>
              <li><span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> sends</li>
              <li><i className="ri-lock-line" /> Internal notes are only seen by your team</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
