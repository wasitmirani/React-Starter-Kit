import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { contactsApi, dealsApi, listsApi, tasksApi } from '@/api/endpoints/crm.api'
import { inboxApi } from '@/api/endpoints/inbox.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryError, Timeline, type TimelineEntry } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ContactFormModal } from '@/components/features/contacts/ContactFormModal'
import { Avatar } from '@/components/ui/Avatar'
import { DetailList } from '@/components/ui/Controls'
import { MoreMenu } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { ChannelBadge, StatusBadge, TagList } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { LIFECYCLE_STAGES } from '@/constants/crm.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Activity } from '@/types/crm.types'
import { formatCurrency } from '@/utils/formatters/currency.formatter'
import { formatDate, formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'
import { fullName } from '@/utils/helpers/contact'

const ACTIVITY_ICON: Record<Activity['type'], [string, string]> = {
  created: ['ri-user-add-line', 'primary'],
  message_sent: ['ri-send-plane-line', 'info'],
  message_delivered: ['ri-check-double-line', 'success'],
  message_opened: ['ri-mail-open-line', 'success'],
  message_clicked: ['ri-cursor-line', 'success'],
  message_received: ['ri-chat-download-line', 'primary'],
  call: ['ri-phone-line', 'info'],
  note: ['ri-sticky-note-line', 'warning'],
  form_submitted: ['ri-file-list-3-line', 'secondary'],
  deal_updated: ['ri-briefcase-line', 'orange'],
  tag_added: ['ri-price-tag-3-line', 'secondary'],
  unsubscribed: ['ri-forbid-line', 'danger'],
  event: ['ri-code-s-slash-line', 'info'],
}

type Tab = 'activity' | 'conversations' | 'deals' | 'tasks'

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const contact = useOne('contacts', contactsApi.get, id)
  const activities = useTenantQuery('activities', id, () => contactsApi.activities(id!), { enabled: Boolean(id) })
  const deals = useAll('deals', dealsApi.list, { contactId: id })
  const tasks = useAll('tasks', tasksApi.list)
  const conversations = useAll('conversations', inboxApi.list, { contactId: id })
  const lists = useAll('lists', listsApi.list)
  const [tab, setTab] = useState<Tab>('activity')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [note, setNote] = useState('')

  const addNote = useAction('activities', (text: string) => contactsApi.addNote(id!, text), { success: 'Note added', onSuccess: () => setNote('') })
  const remove = useAction('contacts', () => contactsApi.remove(id!), { success: 'Contact deleted', onSuccess: () => navigate(ROUTES.CONTACTS) })
  const block = useAction('contacts', (blocklisted: boolean) => contactsApi.update(id!, { blocklisted }), { success: (c) => (c.blocklisted ? 'Contact blocklisted' : 'Contact unblocked') })

  if (contact.isError) return <QueryError message={errorMessage(contact.error)} onRetry={() => contact.refetch()} />
  if (!contact.data) return <SkeletonLines lines={8} />
  const c = contact.data
  const name = fullName(c)
  const contactTasks = (tasks.data?.data ?? []).filter((t) => t.related?.id === c.id)

  const timeline: TimelineEntry[] = (activities.data ?? []).map((a) => {
    const [icon, tone] = ACTIVITY_ICON[a.type]
    return { id: a.id, icon, tone, title: a.title, description: a.channel ? <ChannelBadge channel={a.channel} /> : undefined, at: formatRelativeTime(a.at) }
  })

  return (
    <>
      <PageHeader
        back={{ label: 'Contacts', to: ROUTES.CONTACTS }}
        title={
          <span className="d-inline-flex align-items-center gap-3">
            <Avatar name={name} size={44} /> {name}
          </span>
        }
        meta={c.blocklisted && <StatusBadge status="blocklisted" />}
        description={[c.jobTitle, c.companyName].filter(Boolean).join(' at ') || undefined}
        actions={
          <>
            <Link to={`${ROUTES.CAMPAIGN_NEW}?contact=${c.id}`} className="btn btn-light">
              <i className="ri-send-plane-line me-1" /> Message
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
              <i className="ri-edit-line me-1" /> Edit
            </button>
            <MoreMenu
              items={[
                { key: 'block', label: c.blocklisted ? 'Remove from blocklist' : 'Blocklist', icon: 'ri-forbid-line', onSelect: () => block.mutate(!c.blocklisted) },
                'divider',
                { key: 'delete', label: 'Delete contact', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(true) },
              ]}
            />
          </>
        }
      />

      <div className="row g-4">
        <div className="col-xl-4">
          <Panel title="Profile" className="mb-4">
            <DetailList
              items={[
                { label: 'Email', value: c.email },
                { label: 'Phone', value: c.phone },
                { label: 'Company', value: c.companyName },
                { label: 'Location', value: [c.city, c.country].filter(Boolean).join(', ') || null },
                { label: 'Lifecycle stage', value: LIFECYCLE_STAGES.find((s) => s.value === c.lifecycleStage)?.label },
                { label: 'Lead score', value: <span className="fw-medium">{c.score}</span> },
                { label: 'Owner', value: c.ownerName },
                { label: 'Source', value: <span className="text-capitalize">{c.source}</span> },
                { label: 'Created', value: formatDate(c.createdAt) },
              ]}
            />
          </Panel>
          <Panel title="Consent" description="Required before sending marketing on a channel." className="mb-4">
            <DetailList
              items={(['email', 'sms', 'whatsapp'] as const).map((ch) => ({
                label: { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' }[ch],
                value: <StatusBadge status={c.consents[ch] ?? 'none'} label={c.consents[ch] === 'none' || !c.consents[ch] ? 'No consent' : undefined} />,
              }))}
            />
          </Panel>
          <Panel title="Lists & tags" className="mb-4">
            <div className="mb-3">
              {c.listIds.length === 0 ? (
                <span className="text-muted">Not in any list</span>
              ) : (
                <div className="d-flex flex-wrap gap-1">
                  {c.listIds.map((lid) => (
                    <Link key={lid} to={`${ROUTES.CONTACTS}?listId=${lid}`} className="badge bg-primary-subtle text-primary fw-normal">
                      {lists.data?.data.find((l) => l.id === lid)?.name ?? 'List'}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <TagList tags={c.tags} max={20} />
          </Panel>
          <Panel title="Attributes">
            <DetailList items={Object.entries(c.attributes).map(([key, value]) => ({ label: key.replace(/_/g, ' '), value: value === null ? null : String(value) }))} />
          </Panel>
        </div>

        <div className="col-xl-8">
          <div className="card">
            <div className="card-header pb-0 border-0">
              <Tabs<Tab>
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'activity', label: 'Activity', icon: 'ri-history-line' },
                  { value: 'conversations', label: 'Conversations', count: conversations.data?.total },
                  { value: 'deals', label: 'Deals', count: deals.data?.total },
                  { value: 'tasks', label: 'Tasks', count: contactTasks.length },
                ]}
              />
            </div>
            <div className="card-body">
              {tab === 'activity' && (
                <>
                  <form
                    className="d-flex gap-2 mb-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (note.trim()) addNote.mutate(note.trim())
                    }}
                  >
                    <input className="form-control" placeholder="Add a note about this contact…" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" />
                    <button type="submit" className="btn btn-primary text-nowrap" disabled={!note.trim() || addNote.isPending}>
                      Add note
                    </button>
                  </form>
                  {activities.isLoading ? <SkeletonLines lines={6} /> : timeline.length ? <Timeline items={timeline} /> : <EmptyState title="No activity yet" />}
                </>
              )}
              {tab === 'conversations' &&
                ((conversations.data?.data.length ?? 0) === 0 ? (
                  <EmptyState icon="ri-chat-3-line" title="No conversations" description="Messages this contact sends on any channel appear here." />
                ) : (
                  <ul className="list-group list-group-flush">
                    {conversations.data!.data.map((cv) => (
                      <li key={cv.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <ChannelBadge channel={cv.channel} iconOnly />
                        <Link to={`${ROUTES.INBOX}?c=${cv.id}`} className="min-w-0 flex-1 text-reset">
                          <div className="fw-medium text-truncate">{cv.subject ?? cv.lastMessagePreview}</div>
                          <div className="text-muted fs-sm">{formatDateTime(cv.lastMessageAt)}</div>
                        </Link>
                        <StatusBadge status={cv.status} />
                      </li>
                    ))}
                  </ul>
                ))}
              {tab === 'deals' &&
                ((deals.data?.data.length ?? 0) === 0 ? (
                  <EmptyState icon="ri-briefcase-line" title="No deals" action={<Link to={`${ROUTES.DEALS}?new=1`} className="btn btn-sm btn-primary">Create deal</Link>} />
                ) : (
                  <ul className="list-group list-group-flush">
                    {deals.data!.data.map((d) => (
                      <li key={d.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <div className="min-w-0 flex-1">
                          <div className="fw-medium text-truncate">{d.title}</div>
                          <div className="text-muted fs-sm">{d.ownerName}{d.expectedCloseDate && ` · closes ${formatDate(d.expectedCloseDate)}`}</div>
                        </div>
                        <span className="fw-medium tabular-nums">{formatCurrency(d.value)}</span>
                        <StatusBadge status={d.status} />
                      </li>
                    ))}
                  </ul>
                ))}
              {tab === 'tasks' &&
                (contactTasks.length === 0 ? (
                  <EmptyState icon="ri-task-line" title="No tasks" action={<Link to={ROUTES.TASKS} className="btn btn-sm btn-primary">Go to tasks</Link>} />
                ) : (
                  <ul className="list-group list-group-flush">
                    {contactTasks.map((t) => (
                      <li key={t.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <i className={t.done ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'} />
                        <span className={`flex-1 ${t.done ? 'text-decoration-line-through text-muted' : ''}`}>{t.title}</span>
                        <span className="text-muted fs-sm">{t.dueAt ? formatDate(t.dueAt) : ''}</span>
                      </li>
                    ))}
                  </ul>
                ))}
            </div>
          </div>
        </div>
      </div>

      <ContactFormModal open={editing} onClose={() => setEditing(false)} contact={c} />
      <ConfirmDialog
        open={deleting}
        title="Delete contact?"
        message={<>Delete <strong>{name}</strong> and their history permanently? Messages already sent are kept in the logs.</>}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onClose={() => setDeleting(false)}
        onConfirm={() => remove.mutate(undefined)}
      />
    </>
  )
}
