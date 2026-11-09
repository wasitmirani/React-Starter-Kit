import { useState } from 'react'
import { Link } from 'react-router-dom'
import { messagesApi } from '@/api/endpoints/messaging.api'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { Timeline } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { DetailList } from '@/components/ui/Controls'
import { Drawer } from '@/components/ui/Drawer'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { humanize, statusTone } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import type { MessageLog } from '@/types/messaging.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'

const STATUS_OPTIONS = ['queued', 'sent', 'delivered', 'read', 'received', 'failed', 'bounced', 'unknown'].map((s) => ({ value: s, label: humanize(s) }))

export function MessageLogsPage() {
  const { query, filters, activeFilters, setSearch, setFilter, setPage, clear } = useListParams({ perPage: 25, filterKeys: ['channel', 'status', 'direction', 'campaignId'] })
  const messages = useList('messages', messagesApi.list, query)
  const [open, setOpen] = useState<MessageLog | null>(null)
  const retry = useAction('messages', messagesApi.retry, { success: 'Message queued for retry', onSuccess: (m) => setOpen(m) })

  const columns: DataTableColumn<MessageLog>[] = [
    { key: 'channel', label: 'Channel', render: (m) => <ChannelBadge channel={m.channel} iconOnly /> , width: '4rem' },
    {
      key: 'to',
      label: 'Recipient',
      render: (m) => (
        <div className="min-w-0">
          <div className="fw-medium text-truncate">{m.contactName ?? m.to}</div>
          <div className="text-muted fs-sm">{m.direction === 'inbound' ? <><i className="ri-arrow-left-down-line" /> from {m.from}</> : m.to}</div>
        </div>
      ),
    },
    { key: 'preview', label: 'Message', render: (m) => <span className="text-truncate d-inline-block" style={{ maxWidth: 320 }}>{m.subject ?? m.preview}</span> },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    { key: 'provider', label: 'Provider', render: (m) => <span className="text-muted">{m.provider}</span> },
    { key: 'createdAt', label: 'Time', render: (m) => <span className="text-nowrap">{formatDateTime(m.createdAt)}</span> },
  ]

  return (
    <>
      <PageHeader title="Message logs" description="Every message sent or received, with its full delivery timeline. Kept for 30 days." />
      <div className="card">
        <div className="card-body pb-0">
          <FilterBar onClear={clear} activeCount={activeFilters + (query.search ? 1 : 0)}>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search recipient, subject, content…" />
            <FilterSelect value={filters.channel} onChange={(v) => setFilter('channel', v)} allLabel="All channels" options={(['email', 'sms', 'whatsapp'] as const).map((c) => ({ value: c, label: CHANNELS[c].label }))} />
            <FilterSelect value={filters.status} onChange={(v) => setFilter('status', v)} allLabel="Any status" options={STATUS_OPTIONS} />
            <FilterSelect value={filters.direction} onChange={(v) => setFilter('direction', v)} allLabel="Both directions" options={[{ value: 'outbound', label: 'Outbound' }, { value: 'inbound', label: 'Inbound' }]} />
          </FilterBar>
        </div>
        <DataTable<MessageLog>
          columns={columns}
          rows={messages.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={messages.isLoading}
          itemsLabel="messages"
          onRowClick={setOpen}
          fetchData={(page) => page && setPage(page)}
        />
      </div>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.subject ?? `${open ? CHANNELS[open.channel].label : ''} message`}
        subtitle={open && <><StatusBadge status={open.status} /> <span className="ms-2">{open.direction === 'inbound' ? `From ${open.from}` : `To ${open.to}`}</span></>}
        footer={open?.status === 'failed' && <button type="button" className="btn btn-primary" disabled={retry.isPending} onClick={() => retry.mutate(open.id)}><i className="ri-refresh-line me-1" />Retry</button>}
      >
        {open && (
          <>
            {open.status === 'unknown' && <div className="alert alert-warning">The provider did not confirm this message. It is being reconciled; it will not be sent again until the outcome is known.</div>}
            <h6 className="fs-sm text-muted text-uppercase">Content</h6>
            <div className="bg-light-subtle border rounded-3 p-3 mb-4 text-pre-wrap">{open.preview}</div>
            <h6 className="fs-sm text-muted text-uppercase">Timeline</h6>
            <Timeline
              items={open.events.map((e, i) => ({
                id: String(i),
                icon: e.status === 'failed' || e.status === 'bounced' ? 'ri-close-line' : e.status === 'retrying' ? 'ri-refresh-line' : e.status === 'unknown' ? 'ri-question-line' : 'ri-check-line',
                tone: e.status === 'retrying' ? 'warning' : statusTone(e.status),
                title: humanize(e.status),
                description: e.detail,
                at: new Date(e.at).toLocaleTimeString(),
              }))}
            />
            <h6 className="fs-sm text-muted text-uppercase mt-4">Details</h6>
            <DetailList
              items={[
                { label: 'Message ID', value: <code>{open.id}</code> },
                { label: 'Channel', value: <ChannelBadge channel={open.channel} /> },
                { label: 'From', value: open.from },
                { label: 'To', value: open.to },
                { label: 'Provider', value: open.provider },
                ...(open.segments ? [{ label: 'Segments', value: open.segments }] : []),
                { label: 'Cost', value: `$${open.cost.toFixed(4)}` },
                { label: 'Campaign', value: open.campaignId ? <Link to={to(ROUTES.CAMPAIGN, { id: open.campaignId })}>{open.campaignName}</Link> : 'Transactional / API' },
                ...(open.errorCode ? [{ label: 'Error', value: <code className="text-danger">{open.errorCode}</code> }] : []),
                { label: 'Created', value: formatDateTime(open.createdAt) },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  )
}
