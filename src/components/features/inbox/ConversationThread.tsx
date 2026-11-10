import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cannedRepliesApi, inboxApi } from '@/api/endpoints/inbox.api'
import { templatesApi } from '@/api/endpoints/messaging.api'
import { CopyButton } from '@/components/common/Misc'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { TEAM_MEMBERS } from '@/constants/crm.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useAuth } from '@/hooks/useAuth'
import { useCan } from '@/hooks/useCan'
import type { Conversation, ConversationMessage } from '@/types/inbox.types'
import { formatDateTime, formatShortTime } from '@/utils/formatters/date.formatter'
import { formatBytes } from '@/utils/formatters/number.formatter'

const SNOOZE_OPTIONS: [string, number][] = [['1 hour', 1], ['Tomorrow', 24], ['Next week', 24 * 7]]
const PRIORITIES: Conversation['priority'][] = ['low', 'normal', 'high', 'urgent']

const dayLabel = (iso: string) => {
  const d = new Date(iso)
  const today = new Date()
  const y = new Date(today)
  y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function MessageBubble({ m, contactName, grouped }: { m: ConversationMessage; contactName: string; grouped: boolean }) {
  const out = m.direction === 'outbound'
  if (m.kind === 'note') {
    return (
      <div className="msg-row note">
        <div className="bubble bubble-note">
          <div className="fs-xs fw-semibold mb-1"><i className="ri-lock-line me-1" />Internal note · {m.authorName}</div>
          {m.body}
        </div>
      </div>
    )
  }
  return (
    <div className={`msg-row ${out ? 'out' : 'in'}${grouped ? ' grouped' : ''}`}>
      {!out && <span className="msg-avatar">{!grouped && <Avatar name={contactName} size={28} />}</span>}
      <div className="msg-col">
        <div className={`bubble ${out ? 'bubble-out' : 'bubble-in'}`}>
          {m.body}
          {m.attachments.map((a) => (
            <div key={a.name} className="msg-attachment"><i className="ri-file-3-line" /><span className="text-truncate">{a.name}</span><span className="opacity-75">{formatBytes(a.size)}</span></div>
          ))}
        </div>
        <div className="msg-meta">
          {out && `${m.authorName} · `}
          {formatShortTime(m.at)}
          {out && m.status && <i className={`ms-1 ${m.status === 'read' ? 'ri-check-double-line text-primary' : m.status === 'delivered' ? 'ri-check-double-line' : m.status === 'failed' ? 'ri-error-warning-line text-danger' : 'ri-check-line'}`} title={m.status} />}
        </div>
      </div>
    </div>
  )
}

interface ThreadProps {
  conversation: Conversation
  onBack: () => void
  /** Narrow screens: toggles the contact panel overlay. */
  onToggleContext?: () => void
  contextOpen?: boolean
}

export function ConversationThread({ conversation: c, onBack, onToggleContext, contextOpen }: ThreadProps) {
  const { user } = useAuth()
  const can = useCan()
  const me = user?.name ?? 'You'
  const messages = useTenantQuery('conversations', { messages: c.id }, () => inboxApi.messages(c.id))
  const canned = useAll('canned-replies', cannedRepliesApi.list)
  const waTemplates = useAll('templates', templatesApi.list, { channel: 'whatsapp', status: 'approved' })
  const [mode, setMode] = useState<'message' | 'note'>('message')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const windowClosed = c.channel === 'whatsapp' && c.windowExpiresAt !== null && Date.parse(c.windowExpiresAt) < Date.now()
  const canReply = can('inbox.reply')
  const canAssign = can('inbox.assign')
  const update = useAction('conversations', (patch: Partial<Conversation>) => inboxApi.update(c.id, patch))
  const send = useAction('conversations', () => inboxApi.reply(c.id, { body: text.trim(), kind: mode, authorName: me, attachments: files.map((f) => ({ name: f.name, size: f.size })) }), {
    onSuccess: () => {
      setText('')
      setFiles([])
    },
  })
  const markRead = useAction('conversations', (id: string) => inboxApi.markRead(id))
  const opened = useRef({ markRead: markRead.mutate, unread: c.unreadCount })
  opened.current = { markRead: markRead.mutate, unread: c.unreadCount }

  // Runs once per conversation switch: clear the unread badge and reset the composer.
  useEffect(() => {
    if (opened.current.unread > 0) opened.current.markRead(c.id)
    setMode('message')
    setText('')
  }, [c.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.data])

  const slash = text.startsWith('/') ? text.slice(1).toLowerCase() : null
  const suggestions = useMemo(() => (slash === null ? [] : (canned.data?.data ?? []).filter((r) => r.shortcut.slice(1).startsWith(slash) || r.title.toLowerCase().includes(slash))), [slash, canned.data])
  const canSend = canReply && text.trim().length > 0 && !send.isPending && !(mode === 'message' && windowClosed)
  const list = messages.data ?? []

  return (
    <>
      <header className="thread-head">
        <button type="button" className="btn btn-sm btn-icon btn-light d-lg-none" onClick={onBack} aria-label="Back to list"><i className="ri-arrow-left-line" /></button>
        <Avatar name={c.contactName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-truncate">{c.contactName}</span>
            <StatusBadge status={c.status} />
          </div>
          <div className="text-muted fs-sm text-truncate">
            <span className={`text-${CHANNELS[c.channel].tone}`}><i className={`${CHANNELS[c.channel].icon} me-1`} />{CHANNELS[c.channel].label}</span>
            {' · '}{c.contactHandle}
            {c.subject && ` · ${c.subject}`}
          </div>
        </div>
        <div className="thread-actions">
          <Dropdown
            label={<>{c.assigneeName ? <Avatar name={c.assigneeName} size={20} /> : <i className="ri-user-add-line" />}<span className="d-none d-xl-inline">{c.assigneeName ?? 'Assign'}</span><i className="ri-arrow-down-s-line" /></>}
            buttonClassName="btn btn-sm btn-light text-nowrap"
            ariaLabel="Assign"
            items={[
              { key: 'me', label: 'Assign to me', icon: 'ri-user-star-line', disabled: !canAssign, onSelect: () => update.mutate({ assigneeName: me }) },
              ...TEAM_MEMBERS.filter((m) => m !== me).map((m) => ({ key: m, label: m, icon: 'ri-user-line', disabled: !canAssign, onSelect: () => update.mutate({ assigneeName: m }) })),
              'divider' as const,
              { key: 'none', label: 'Unassign', icon: 'ri-user-unfollow-line', disabled: !canAssign, onSelect: () => update.mutate({ assigneeName: null }) },
            ]}
          />
          <Dropdown
            label={<i className="ri-alarm-snooze-line" />}
            ariaLabel="Snooze"
            buttonClassName="btn btn-sm btn-icon btn-light"
            items={SNOOZE_OPTIONS.map(([label]) => ({ key: label, label: `Snooze until ${label.toLowerCase()}`, icon: 'ri-time-line', disabled: !canAssign, onSelect: () => update.mutate({ status: 'snoozed' }) }))}
          />
          {onToggleContext && <button type="button" className={`btn btn-sm btn-icon ${contextOpen ? 'btn-primary' : 'btn-light'} ctx-toggle`} title="Contact details" aria-label="Contact details" aria-pressed={contextOpen} onClick={onToggleContext}><i className="ri-contacts-line" /></button>}
          {c.status === 'resolved' ? (
            <button type="button" className="btn btn-sm btn-light" disabled={!canAssign} onClick={() => update.mutate({ status: 'open' })}><i className="ri-inbox-unarchive-line" />Reopen</button>
          ) : (
            <button type="button" className="btn btn-sm btn-success text-nowrap" disabled={!canAssign} title={canAssign ? 'Mark as resolved' : 'You need inbox.assign'} onClick={() => update.mutate({ status: 'resolved' })}><i className="ri-check-double-line" />Resolve</button>
          )}
        </div>
      </header>

      <div className="inbox-scroll thread-body">
        {messages.isLoading ? (
          <SkeletonLines lines={6} />
        ) : (
          list.map((m, i) => {
            const prev = list[i - 1]
            const newDay = !prev || new Date(prev.at).toDateString() !== new Date(m.at).toDateString()
            const grouped = !newDay && !!prev && prev.direction === m.direction && prev.kind === m.kind && Date.parse(m.at) - Date.parse(prev.at) < 5 * 60_000
            return (
              <Fragment key={m.id}>
                {newDay && <div className="day-sep"><span>{dayLabel(m.at)}</span></div>}
                <MessageBubble m={m} contactName={c.contactName} grouped={grouped} />
              </Fragment>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {windowClosed && mode === 'message' && (
        <div className="thread-alert">
          <i className="ri-time-line" />
          <span className="flex-1">The 24-hour WhatsApp window has closed. Only approved templates can be sent.</span>
          <Dropdown label="Use a template" buttonClassName="btn btn-sm btn-warning" items={(waTemplates.data?.data ?? []).map((t) => ({ key: t.id, label: t.name, onSelect: () => setText(t.body) }))} />
        </div>
      )}

      <div className="composer-wrap">
        <div className={`composer-card${mode === 'note' ? ' note' : ''}${!canReply ? ' locked' : ''}`}>
          <div className="composer-top">
            <Segmented<'message' | 'note'> ariaLabel="Composer mode" value={mode} onChange={setMode} options={[{ value: 'message', label: 'Reply', icon: 'ri-reply-line' }, { value: 'note', label: 'Note', icon: 'ri-lock-line' }]} />
            <span className="ms-auto text-muted fs-xs composer-hints">
              <span className="kbd">/</span> saved replies · <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> send
            </span>
          </div>
          <div className="position-relative">
            {suggestions.length > 0 && (
              <div className="composer-suggest">
                {suggestions.map((r) => (
                  <button key={r.id} type="button" onClick={() => setText(r.body)}>
                    <code>{r.shortcut}</code> <span className="text-muted">{r.title}</span>
                  </button>
                ))}
              </div>
            )}
            <textarea
              className="composer-input"
              rows={3}
              disabled={!canReply}
              placeholder={!canReply ? 'Your role can read conversations but not reply (needs inbox.reply).' : mode === 'note' ? 'Write a note only your team sees… mention a colleague by name' : `Reply to ${c.contactName.split(' ')[0]} on ${CHANNELS[c.channel].label}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canSend) send.mutate(undefined)
              }}
              aria-label="Message"
            />
          </div>
          {files.length > 0 && (
            <div className="d-flex flex-wrap gap-2 px-3 pb-2">
              {files.map((f) => (
                <span key={f.name} className="composer-file">
                  <i className="ri-attachment-2" />{f.name}
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((x) => x !== f))}><i className="ri-close-line" /></button>
                </span>
              ))}
            </div>
          )}
          <div className="composer-bottom">
            <input ref={fileRef} type="file" multiple className="d-none" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
            <button type="button" className="btn btn-sm btn-icon btn-light" title="Attach files" aria-label="Attach files" onClick={() => fileRef.current?.click()} disabled={mode === 'note' || !canReply}><i className="ri-attachment-2" /></button>
            <Dropdown label={<i className="ri-chat-quote-line" />} ariaLabel="Saved replies" align="start" buttonClassName="btn btn-sm btn-icon btn-light" items={(canned.data?.data ?? []).map((r) => ({ key: r.id, label: r.title, disabled: !canReply, onSelect: () => setText(r.body) }))} />
            <span className="ms-auto text-muted fs-xs tabular-nums">{text.length ? `${text.length} chars` : ''}</span>
            <button type="button" className={`btn ${mode === 'note' ? 'btn-warning' : 'btn-primary'}`} disabled={!canSend} onClick={() => send.mutate(undefined)}>
              {send.isPending ? 'Sending…' : mode === 'note' ? 'Add note' : 'Send'} <i className="ri-send-plane-2-fill" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/** Right-hand contact context. */
export function ConversationContext({ conversation: c }: { conversation: Conversation }) {
  const can = useCan()
  const update = useAction('conversations', (patch: Partial<Conversation>) => inboxApi.update(c.id, patch))
  const windowOpen = c.windowExpiresAt && Date.parse(c.windowExpiresAt) > Date.now()
  const canTag = can('inbox.assign')
  const [tagDraft, setTagDraft] = useState('')
  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-')
    setTagDraft('')
    if (tag && !c.tags.includes(tag)) update.mutate({ tags: [...c.tags, tag] })
  }
  return (
    <div className="inbox-scroll ctx">
      <div className="ctx-card">
        <div className="ctx-cover" />
        <Avatar name={c.contactName} size={64} className="ctx-avatar" />
        <h6 className="mb-0 mt-2">{c.contactName}</h6>
        <div className="text-muted fs-sm text-break px-3">{c.contactHandle}</div>
        <div className="d-flex justify-content-center gap-2 mt-3">
          {c.contactId && <Link to={to(ROUTES.CONTACT, { id: c.contactId })} className="btn btn-sm btn-light"><i className="ri-user-3-line" />Profile</Link>}
          <CopyButton value={c.contactHandle} label="Copy" />
        </div>
      </div>

      <section className="ctx-section">
        <h6 className="tpl-section-title mb-2">Conversation</h6>
        <dl className="ctx-list">
          <div><dt>Channel</dt><dd><ChannelBadge channel={c.channel} /></dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={c.status} /></dd></div>
          <div><dt>Team</dt><dd>{c.teamName ?? '—'}</dd></div>
          <div><dt>Started</dt><dd>{formatDateTime(c.createdAt)}</dd></div>
          {c.windowExpiresAt && <div><dt>WhatsApp window</dt><dd className={windowOpen ? 'text-success' : 'text-danger'}>{windowOpen ? `Open until ${formatShortTime(c.windowExpiresAt)}` : 'Closed'}</dd></div>}
        </dl>
      </section>

      <section className="ctx-section">
        <h6 className="tpl-section-title mb-2">Priority</h6>
        <div className="ctx-priority" role="group" aria-label="Priority">
          {PRIORITIES.map((p) => (
            <button key={p} type="button" className={`${p}${c.priority === p ? ' on' : ''}`} aria-pressed={c.priority === p} disabled={!can('inbox.assign')} onClick={() => update.mutate({ priority: p })}>
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="ctx-section">
        <h6 className="tpl-section-title mb-2">Tags</h6>
        <div className="d-flex flex-wrap gap-1">
          {c.tags.length === 0 && <span className="text-muted fs-sm">No tags</span>}
          {c.tags.map((t) => (
            <span key={t} className="ctx-tag">
              #{t}
              {canTag && <button type="button" aria-label={`Remove tag ${t}`} onClick={() => update.mutate({ tags: c.tags.filter((x) => x !== t) })}><i className="ri-close-line" /></button>}
            </span>
          ))}
        </div>
        {canTag && (
          <form className="input-group input-group-sm mt-2" onSubmit={(e) => { e.preventDefault(); addTag() }}>
            <input className="form-control" placeholder="Add a tag…" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} aria-label="New tag" maxLength={32} />
            <button type="submit" className="btn btn-light" disabled={!tagDraft.trim()}><i className="ri-add-line" />Add</button>
          </form>
        )}
      </section>
    </div>
  )
}
