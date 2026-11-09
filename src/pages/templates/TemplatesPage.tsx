import { useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { workflowsApi } from '@/api/endpoints/automation.api'
import { brandKitApi, campaignsApi, templatesApi } from '@/api/endpoints/messaging.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { TemplatePreview } from '@/components/features/messaging/TemplatePreview'
import { OptionCard, Switch } from '@/components/ui/Controls'
import { Drawer } from '@/components/ui/Drawer'
import { MoreMenu, type DropdownItem } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { CHANNELS } from '@/constants/channels.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { HTML_STARTER } from '@/constants/email-builder.constants'
import { TEMPLATE_STARTERS } from '@/constants/template-starters.constants'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Channel } from '@/types/channel.types'
import type { Template, TemplateCategory } from '@/types/messaging.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { plural } from '@/utils/formatters/number.formatter'
import { flattenSteps } from '@/utils/helpers/workflow'

const TEMPLATE_CHANNELS: Channel[] = ['email', 'sms', 'whatsapp', 'push']
const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'utility', label: 'Utility' },
  { value: 'authentication', label: 'Authentication' },
]
const STATUSES = [
  { value: 'ready', label: 'Ready to send' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'In review (WhatsApp)' },
  { value: 'rejected', label: 'Rejected' },
]

type Layout = 'grid' | 'list'
type Sort = 'updated' | 'name' | 'usage'
const LAYOUT_KEY = 'birdcrm.templates.layout'

const isReady = (t: Template) => t.status === 'active' || t.status === 'approved'
const whatsappName = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

export function TemplatesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const channel = (params.get('channel') as Channel | null) ?? ''
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [sort, setSort] = useState<Sort>('updated')
  const [layout, setLayoutState] = useState<Layout>(() => (localStorage.getItem(LAYOUT_KEY) as Layout) || 'grid')
  const [creating, setCreating] = useState(params.get('new') === '1')
  const [newChannel, setNewChannel] = useState<Channel>((params.get('channel') as Channel) || 'email')
  const [starter, setStarter] = useState('blank')
  const [newName, setNewName] = useState('')
  const [deleting, setDeleting] = useState<Template | null>(null)
  const [previewing, setPreviewing] = useState<Template | null>(null)

  const templates = useAll('templates', templatesApi.list)
  const kit = useTenantQuery('brand-kit', 'kit', brandKitApi.get, { staleTime: 60_000 })
  const [useKit, setUseKit] = useState(true)
  const campaigns = useAll('campaigns', campaignsApi.list)
  const workflows = useAll('workflows', workflowsApi.list)

  const setLayout = (l: Layout) => {
    localStorage.setItem(LAYOUT_KEY, l)
    setLayoutState(l)
  }

  const starters = TEMPLATE_STARTERS[newChannel] ?? []
  const chosen = starters.find((s) => s.key === starter) ?? starters[0]
  // An empty name falls back to the starter's title.
  const finalName = newName.trim() || (chosen && chosen.key !== 'blank' ? chosen.title : '')
  const create = useAction(
    'templates',
    () =>
      templatesApi.create({
        name: newChannel === 'whatsapp' ? whatsappName(finalName) : finalName,
        channel: newChannel,
        category: chosen?.category ?? 'marketing',
        status: 'draft',
        language: 'en',
        subject: newChannel === 'email' || newChannel === 'push' ? chosen?.subject ?? '' : null,
        body: chosen?.body ?? '',
        blocks: newChannel === 'email' ? (chosen?.blocks ?? []).map((b) => ({ ...b, id: crypto.randomUUID() })) : [],
        variables: [...new Set([...`${chosen?.subject ?? ''} ${chosen?.body ?? ''} ${(chosen?.blocks ?? []).map((b) => b.content).join(' ')}`.matchAll(/{{\s*([\w.]+)\s*}}/g)].map((m) => m[1]))],
        examples: chosen?.examples ?? {},
        rejectionReason: null,
        ...(newChannel === 'email' ? (chosen?.editor === 'html' ? { editor: 'html' as const, html: HTML_STARTER } : { editor: 'blocks' as const, brandHeader: useKit, brandFooter: useKit }) : {}),
        ...(newChannel === 'whatsapp' && kit.data?.whatsappFooter ? { whatsapp: { headerType: 'none' as const, header: '', footer: kit.data.whatsappFooter, buttons: [] } } : {}),
      }),
    { onSuccess: (t) => navigate(to(ROUTES.TEMPLATE, { id: t.id })) },
  )
  const duplicate = useAction('templates', templatesApi.duplicate, { success: 'Template duplicated' })
  const remove = useAction('templates', templatesApi.remove, { success: 'Template deleted', onSuccess: () => setDeleting(null) })

  const all = templates.data?.data ?? []

  /** Where each template is used: campaigns by id, automation steps by name. */
  const usage = (t: Template) => {
    const inCampaigns = (campaigns.data?.data ?? []).filter((c) => c.templateId === t.id).length
    const inFlows = (workflows.data?.data ?? []).filter((w) => flattenSteps(w.steps).some((s) => s.config.template === t.name)).length
    return { campaigns: inCampaigns, automations: inFlows, total: inCampaigns + inFlows }
  }
  const usageLabel = (t: Template) => {
    const u = usage(t)
    if (!u.total) return 'Not used yet'
    return [u.campaigns && plural(u.campaigns, 'campaign'), u.automations && plural(u.automations, 'automation')].filter(Boolean).join(' · ')
  }

  const rows = all
    .filter(
      (t) =>
        (!channel || t.channel === channel) &&
        (!category || t.category === category) &&
        (!status || (status === 'ready' ? isReady(t) : t.status === status)) &&
        (!search || `${t.name} ${t.subject ?? ''} ${t.body}`.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'usage' ? usage(b).total - usage(a).total : b.updatedAt.localeCompare(a.updatedAt)))

  const inChannel = all.filter((t) => !channel || t.channel === channel)
  const rejected = all.filter((t) => t.status === 'rejected')
  const pending = inChannel.filter((t) => t.status === 'pending').length
  const activeFilters = [search, category, status].filter(Boolean).length
  const clearFilters = () => {
    setSearch('')
    setCategory(undefined)
    setStatus(undefined)
  }

  const openCreate = (c: Channel = (channel as Channel) || 'email') => {
    setNewChannel(c)
    setStarter('blank')
    setCreating(true)
  }
  const closeCreate = () => {
    setCreating(false)
    setNewName('')
    if (params.get('new')) setParams(channel ? { channel } : {}, { replace: true })
  }

  const menu = (t: Template) => {
    const items: (DropdownItem | 'divider')[] = [
      { key: 'preview', label: 'Preview', icon: 'ri-eye-line', onSelect: () => setPreviewing(t) },
      { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => navigate(to(ROUTES.TEMPLATE, { id: t.id })) },
      { key: 'dup', label: 'Duplicate', icon: 'ri-file-copy-line', onSelect: () => duplicate.mutate(t.id) },
    ]
    if (isReady(t) && t.channel !== 'push') items.push({ key: 'use', label: 'Use in a campaign', icon: 'ri-send-plane-line', onSelect: () => navigate(`${ROUTES.CAMPAIGN_NEW}?channel=${t.channel}&template=${t.id}`) })
    items.push('divider', { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setDeleting(t) })
    return <MoreMenu items={items} />
  }

  const meta = (t: Template) => (
    <div className="d-flex flex-wrap gap-1">
      <ChannelBadge channel={t.channel} />
      <StatusBadge status={t.status} label={t.status === 'pending' ? 'In review' : undefined} />
      <span className="badge bg-light text-body border fw-normal text-capitalize">{t.category}</span>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Templates"
        description="Reusable content for campaigns, automations and transactional sends, previewed the way recipients see it."
        actions={
          <>
            <Link to={ROUTES.TEMPLATE_BRAND_KIT} className="btn btn-light"><i className="ri-palette-line me-1" />Brand kit</Link>
            <Guard permission="templates.manage">
              <button type="button" className="btn btn-primary" onClick={() => openCreate()}><i className="ri-add-line me-1" />New template</button>
            </Guard>
          </>
        }
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Templates" icon="ri-layout-2-line" loading={!templates.data} value={inChannel.length} hint={channel ? CHANNELS[channel].label : `across ${TEMPLATE_CHANNELS.length} channels`} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Ready to send" icon="ri-checkbox-circle-line" tone="success" loading={!templates.data} value={inChannel.filter(isReady).length} hint="active or approved" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="In review" icon="ri-time-line" tone="warning" loading={!templates.data} value={pending} hint={pending ? 'Meta usually decides within 24h' : 'nothing waiting'} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Unused" icon="ri-inbox-unarchive-line" tone="info" loading={!templates.data || !campaigns.data || !workflows.data} value={inChannel.filter((t) => usage(t).total === 0).length} hint="not in a campaign or automation" /></div>
      </div>

      {rejected.length > 0 && (
        <div className="card mb-4 border-danger-subtle">
          <div className="card-body d-flex flex-wrap align-items-center gap-3 py-3">
            <span className="icon-tile icon-tile-sm bg-danger-subtle text-danger"><i className="ri-close-circle-line" /></span>
            <div className="flex-1 min-w-0">
              <strong className="d-block">{plural(rejected.length, 'template')} rejected by Meta</strong>
              <span className="text-muted fs-sm">{rejected[0].name}: {rejected[0].rejectionReason ?? 'No reason given.'} Edit the content and resubmit.</span>
            </div>
            <Link to={to(ROUTES.TEMPLATE, { id: rejected[0].id })} className="btn btn-sm btn-light">Fix &amp; resubmit</Link>
          </div>
        </div>
      )}

      <Tabs
        className="mb-4"
        value={channel}
        onChange={(v) => setParams(v ? { channel: v } : {}, { replace: true })}
        items={[{ value: '', label: 'All', count: all.length }, ...TEMPLATE_CHANNELS.map((c) => ({ value: c, label: CHANNELS[c].label, icon: CHANNELS[c].icon, count: all.filter((t) => t.channel === c).length }))]}
      />
      <FilterBar
        activeCount={activeFilters}
        onClear={clearFilters}
        end={
          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm w-auto" aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="updated">Recently edited</option>
              <option value="usage">Most used</option>
              <option value="name">Name A–Z</option>
            </select>
            <Segmented<Layout> ariaLabel="Layout" value={layout} onChange={setLayout} options={[{ value: 'grid', label: '', icon: 'ri-layout-grid-line', title: 'Grid view' }, { value: 'list', label: '', icon: 'ri-list-unordered', title: 'List view' }]} />
          </div>
        }
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or content…" />
        <FilterSelect value={category} onChange={setCategory} allLabel="All categories" options={CATEGORIES} />
        <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={STATUSES} />
      </FilterBar>

      {templates.isLoading ? (
        <SkeletonLines lines={6} />
      ) : rows.length === 0 ? (
        <div className="card">
          {activeFilters ? (
            <EmptyState icon="ri-filter-off-line" title="No templates match these filters" action={<button type="button" className="btn btn-light btn-sm" onClick={clearFilters}>Clear filters</button>} />
          ) : (
            <EmptyState icon="ri-layout-2-line" title={channel ? `No ${CHANNELS[channel].label} templates yet` : 'No templates yet'} description="Start from a ready-made layout and adjust it to your brand." action={<button type="button" className="btn btn-primary" onClick={() => openCreate()}>New template</button>} />
          )}
        </div>
      ) : layout === 'grid' ? (
        <div className="tpl-grid">
          {rows.map((t) => (
            <article key={t.id} className="tpl-card">
              <div className="tpl-card-media">
                <Link to={to(ROUTES.TEMPLATE, { id: t.id })} className="d-block text-reset" aria-label={`Edit ${t.name}`}>
                  <TemplatePreview template={t} />
                </Link>
                <button type="button" className="btn btn-sm btn-light shadow-sm tpl-quick" onClick={() => setPreviewing(t)}><i className="ri-eye-line me-1" />Preview</button>
              </div>
              <div className="tpl-card-body">
                <div className="d-flex align-items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Link to={to(ROUTES.TEMPLATE, { id: t.id })} className="fw-semibold text-reset d-block text-truncate">{t.name}</Link>
                  </div>
                  {menu(t)}
                </div>
                {meta(t)}
                {t.status === 'rejected' && t.rejectionReason && <div className="tpl-reject"><i className="ri-error-warning-line me-1" />{t.rejectionReason}</div>}
                <div className="tpl-card-foot">
                  <span><i className="ri-links-line me-1" />{usageLabel(t)}</span>
                  <span className="text-nowrap">{formatRelativeTime(t.updatedAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Variables</th>
                  <th>Used in</th>
                  <th>Edited</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="cursor-pointer" onClick={(e) => !(e.target as HTMLElement).closest('button, a') && navigate(to(ROUTES.TEMPLATE, { id: t.id }))}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <ChannelBadge channel={t.channel} iconOnly />
                        <div className="min-w-0">
                          <Link to={to(ROUTES.TEMPLATE, { id: t.id })} className="fw-medium text-reset d-block text-truncate">{t.name}</Link>
                          <span className="text-muted fs-sm d-block text-truncate" style={{ maxWidth: '28rem' }}>{t.subject || t.body || 'No content yet'}</span>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={t.status} label={t.status === 'pending' ? 'In review' : undefined} /></td>
                    <td className="text-capitalize">{t.category}</td>
                    <td>{t.variables.length ? <div className="d-flex flex-wrap gap-1">{t.variables.slice(0, 3).map((v) => <code key={v} className="var-chip">{`{{${v}}}`}</code>)}{t.variables.length > 3 && <span className="text-muted fs-xs">+{t.variables.length - 3}</span>}</div> : <span className="text-muted">—</span>}</td>
                    <td className="text-muted text-nowrap">{usageLabel(t)}</td>
                    <td className="text-muted text-nowrap">{formatRelativeTime(t.updatedAt)}</td>
                    <td className="text-end">{menu(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={creating}
        onClose={closeCreate}
        title="New template"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={closeCreate}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={!finalName || create.isPending} onClick={() => create.mutate(undefined)}>{create.isPending ? 'Creating…' : 'Create and edit'}</button>
          </>
        }
      >
        <div className="form-label">Channel</div>
        <div className="row g-2 mb-4">
          {TEMPLATE_CHANNELS.map((c) => (
            <div key={c} className="col-6 col-md-3">
              <OptionCard selected={newChannel === c} onSelect={() => { setNewChannel(c); setStarter('blank') }} icon={CHANNELS[c].icon} tone={CHANNELS[c].tone} title={CHANNELS[c].label} compact />
            </div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-md-8">
            <div className="form-label">Start from</div>
            <div className="starter-grid mb-4">
              {starters.map((s) => (
                <OptionCard key={s.key} selected={chosen?.key === s.key} onSelect={() => setStarter(s.key)} icon={s.icon} title={s.title} description={s.description} compact />
              ))}
            </div>
            <FormField id="tpl-name" label="Name" hint={newChannel === 'whatsapp' ? `Saved as “${whatsappName(finalName) || 'template_name'}”. WhatsApp names use lowercase letters, digits and _.` : 'Only your team sees the name.'}>
              <input id="tpl-name" className="form-control" value={newName} placeholder={chosen && chosen.key !== 'blank' ? chosen.title : 'e.g. Spring launch'} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </FormField>
            {newChannel === 'email' && chosen?.editor !== 'html' && (
              <div className="mt-3">
                <Switch id="tpl-kit" checked={useKit} onChange={setUseKit} label="Use the brand kit header & footer" description={<>Shared logo, social links, address and unsubscribe. <Link to={ROUTES.TEMPLATE_BRAND_KIT}>Edit brand kit</Link></>} />
              </div>
            )}
            {newChannel === 'whatsapp' && <p className="form-text mb-0 mt-2"><i className="ri-information-line me-1" />WhatsApp templates go to Meta for review when you submit them. Category <strong className="text-capitalize">{chosen?.category}</strong> affects price and approval.</p>}
          </div>
          <div className="col-md-4">
            <div className="form-label">Preview</div>
            <TemplatePreview
              size="full"
              template={{ name: newName, channel: newChannel, subject: chosen?.subject ?? null, body: chosen?.body ?? '', blocks: (chosen?.blocks ?? []).map((b, i) => ({ ...b, id: `p${i}` })), examples: chosen?.examples, editor: chosen?.editor === 'html' ? 'html' : 'blocks', html: chosen?.editor === 'html' ? HTML_STARTER : undefined, brandHeader: useKit, brandFooter: useKit, whatsapp: newChannel === 'whatsapp' && kit.data ? { headerType: 'none', header: '', footer: kit.data.whatsappFooter, buttons: [] } : undefined }}
            />
          </div>
        </div>
      </Modal>

      <Drawer
        open={previewing !== null}
        onClose={() => setPreviewing(null)}
        title={previewing?.name ?? ''}
        subtitle={previewing ? `${CHANNELS[previewing.channel].label} · ${previewing.category} · ${previewing.language.toUpperCase()}` : undefined}
        size="lg"
        footer={
          previewing && (
            <>
              <button type="button" className="btn btn-light" onClick={() => setPreviewing(null)}>Close</button>
              <Link to={to(ROUTES.TEMPLATE, { id: previewing.id })} className="btn btn-primary"><i className="ri-edit-line me-1" />Edit template</Link>
            </>
          )
        }
      >
        {previewing && (
          <>
            <div className="mb-3">{meta(previewing)}</div>
            <TemplatePreview template={previewing} size="full" />
            <h6 className="wf-library-group mt-4 mb-2">Variables</h6>
            {previewing.variables.length ? (
              <dl className="row fs-sm mb-0">
                {previewing.variables.map((v) => (
                  <div key={v} className="col-6 mb-2">
                    <dt className="fw-normal"><code className="var-chip">{`{{${v}}}`}</code></dt>
                    <dd className="text-muted mb-0">e.g. {previewing.examples?.[v] || '—'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted fs-sm">No personalisation. Everyone gets the same text.</p>
            )}
            <h6 className="wf-library-group mt-3 mb-2">Used in</h6>
            <p className="fs-sm mb-0">{usageLabel(previewing)}</p>
          </>
        )}
      </Drawer>

      <ConfirmDialog open={deleting !== null} title="Delete template?" message={<>Campaigns and automations using <strong>{deleting?.name}</strong> ({deleting ? usageLabel(deleting).toLowerCase() : ''}) will need another template.</>} confirmLabel="Delete" danger busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting!.id)} />
    </>
  )
}
