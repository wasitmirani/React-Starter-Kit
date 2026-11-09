import { useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useNavigate } from 'react-router-dom'
import { campaignsApi } from '@/api/endpoints/messaging.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { MoreMenu, type DropdownItem } from '@/components/ui/Dropdown'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { CAMPAIGN_CHANNELS, CHANNELS } from '@/constants/channels.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import type { Campaign } from '@/types/messaging.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'
import { formatCompact, formatRate } from '@/utils/formatters/number.formatter'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'running', label: 'Sending' },
  { value: 'completed', label: 'Sent' },
]

export function CampaignsPage() {
  const navigate = useNavigate()
  const { query, filters, setFilter, setSearch, setPage } = useListParams({ filterKeys: ['status', 'channel'] })
  const campaigns = useList('campaigns', campaignsApi.list, query)
  const [deleting, setDeleting] = useState<Campaign | null>(null)
  const [cancelling, setCancelling] = useState<Campaign | null>(null)

  const opts = (msg: string) => ({ success: msg })
  const duplicate = useAction('campaigns', campaignsApi.duplicate, { success: 'Campaign duplicated', onSuccess: (c: Campaign) => navigate(to(ROUTES.CAMPAIGN_EDIT, { id: c.id })) })
  const pause = useAction('campaigns', campaignsApi.pause, opts('Campaign paused'))
  const resume = useAction('campaigns', campaignsApi.resume, opts('Campaign resumed'))
  const cancel = useAction('campaigns', campaignsApi.cancel, { success: 'Campaign cancelled', onSuccess: () => setCancelling(null) })
  const remove = useAction('campaigns', campaignsApi.remove, { success: 'Campaign deleted', onSuccess: () => setDeleting(null) })

  const menu = (c: Campaign) => {
    const items: (DropdownItem | 'divider')[] = []
    if (['draft', 'scheduled'].includes(c.status)) items.push({ key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => navigate(to(ROUTES.CAMPAIGN_EDIT, { id: c.id })) })
    if (c.status !== 'draft') items.push({ key: 'report', label: 'View report', icon: 'ri-bar-chart-line', onSelect: () => navigate(to(ROUTES.CAMPAIGN, { id: c.id })) })
    if (c.status === 'running') items.push({ key: 'pause', label: 'Pause', icon: 'ri-pause-line', onSelect: () => pause.mutate(c.id) })
    if (c.status === 'paused') items.push({ key: 'resume', label: 'Resume', icon: 'ri-play-line', onSelect: () => resume.mutate(c.id) })
    items.push({ key: 'duplicate', label: 'Duplicate', icon: 'ri-file-copy-line', onSelect: () => duplicate.mutate(c.id) })
    if (['scheduled', 'running', 'paused'].includes(c.status)) items.push('divider', { key: 'cancel', label: 'Cancel sending', icon: 'ri-stop-circle-line', danger: true, onSelect: () => setCancelling(c) })
    if (['draft', 'completed', 'cancelled', 'failed'].includes(c.status)) items.push('divider', { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(c) })
    return <MoreMenu items={items} />
  }

  const columns: DataTableColumn<Campaign>[] = [
    {
      key: 'name',
      label: 'Campaign',
      render: (c) => (
        <div className="d-flex align-items-center gap-3 min-w-0">
          <ChannelBadge channel={c.channel} iconOnly />
          <div className="min-w-0">
            <Link to={c.status === 'draft' ? to(ROUTES.CAMPAIGN_EDIT, { id: c.id }) : to(ROUTES.CAMPAIGN, { id: c.id })} className="fw-medium text-reset d-block text-truncate">{c.name}</Link>
            <span className="text-muted fs-sm">
              {c.status === 'scheduled' && c.schedule.at ? `Scheduled for ${formatDateTime(c.schedule.at)}` : c.sentAt ? `Sent ${formatDateTime(c.sentAt)}` : `Edited ${formatRelativeTime(c.updatedAt)}`}
            </span>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} label={c.status === 'running' ? 'Sending' : undefined} /> },
    { key: 'stats', label: 'Recipients', align: 'end', render: (c) => (c.stats.recipients ? <span className="tabular-nums">{formatCompact(c.stats.recipients)}</span> : '—') },
    { key: 'channel', label: 'Opened / read', align: 'end', render: (c) => <span className="tabular-nums">{c.stats.opened ? formatRate(c.stats.opened, c.stats.delivered) : '—'}</span> },
    { key: 'senderLabel', label: 'Clicked', align: 'end', render: (c) => <span className="tabular-nums">{c.stats.delivered ? formatRate(c.stats.clicked, c.stats.delivered) : '—'}</span> },
    { key: 'id', label: '', align: 'end', render: menu },
  ]

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="One-off sends to a list or segment on email, SMS, WhatsApp, push and RCS."
        actions={<Guard permission="campaigns.manage">
  <Link to={ROUTES.CAMPAIGN_NEW} className="btn btn-primary"><i className="ri-add-line me-1" />Create campaign</Link>
</Guard>}
      />
      <div className="card">
        <div className="card-header pb-0 border-0">
          <Tabs value={filters.status ?? ''} onChange={(v) => setFilter('status', v || undefined)} items={STATUS_TABS} />
        </div>
        <div className="card-body pb-0">
          <FilterBar>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search campaigns…" />
            <FilterSelect value={filters.channel} onChange={(v) => setFilter('channel', v)} allLabel="All channels" options={CAMPAIGN_CHANNELS.map((c) => ({ value: c, label: CHANNELS[c].label }))} />
          </FilterBar>
        </div>
        <DataTable<Campaign>
          columns={columns}
          rows={campaigns.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={campaigns.isLoading}
          itemsLabel="campaigns"
          emptyMessage="No campaigns here"
          emptyDescription="Create a campaign to reach a list or segment."
          fetchData={(page) => page && setPage(page)}
        />
      </div>

      <ConfirmDialog open={deleting !== null} title="Delete campaign?" message={<>Delete <strong>{deleting?.name}</strong>? Its report is deleted too.</>} confirmLabel="Delete" danger busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting!.id)} />
      <ConfirmDialog
        open={cancelling !== null}
        title="Cancel sending?"
        message={<>Recipients who have not received <strong>{cancelling?.name}</strong> yet will not get it. Messages already sent cannot be recalled.</>}
        confirmLabel="Cancel campaign"
        danger
        busy={cancel.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancel.mutate(cancelling!.id)}
      />
    </>
  )
}
