import { useEffect, useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { channelAccountsApi, sendersApi } from '@/api/endpoints/channels.api'
import { listsApi, segmentsApi } from '@/api/endpoints/crm.api'
import { campaignProblems, campaignsApi, templatesApi } from '@/api/endpoints/messaging.api'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { EmailBlocks, PhonePreview } from '@/components/features/messaging/MessagePreview'
import { OptionCard, Stepper, Switch } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { ChannelBadge } from '@/components/ui/StatusBadge'
import { CAMPAIGN_CHANNELS, CHANNELS } from '@/constants/channels.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import type { Channel } from '@/types/channel.types'
import type { Campaign } from '@/types/messaging.types'
import { toLocalInput } from '@/utils/formatters/date.formatter'
import { smsInfo } from '@/utils/helpers/sms'

type Draft = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>

const STEPS = ['Setup', 'Audience', 'Content', 'Schedule', 'Review']

const blank = (channel: Channel = 'email'): Draft => ({
  name: '',
  channel,
  status: 'draft',
  senderAccountId: null,
  senderLabel: null,
  subject: '',
  previewText: '',
  templateId: null,
  body: '',
  audience: { listIds: [], segmentIds: [], excludeListIds: [] },
  schedule: { type: 'now', at: null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, respectQuietHours: true },
  abTest: null,
  tags: [],
  stats: { recipients: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, unsubscribed: 0, failed: 0, revenue: 0 },
  sentAt: null,
})

/** Multi-select as a list of checkboxes. */
function CheckList({ items, value, onChange, disabled = [] }: { items: { id: string; label: string; hint?: string }[]; value: string[]; onChange: (v: string[]) => void; disabled?: string[] }) {
  return (
    <div className="d-flex flex-column gap-2" style={{ maxHeight: 280, overflowY: 'auto' }}>
      {items.map((item) => (
        <label key={item.id} className={`d-flex align-items-center gap-3 border rounded-3 px-3 py-2 ${value.includes(item.id) ? 'border-primary bg-primary-subtle' : ''}`}>
          <input
            type="checkbox"
            className="form-check-input m-0"
            checked={value.includes(item.id)}
            disabled={disabled.includes(item.id)}
            onChange={(e) => onChange(e.target.checked ? [...value, item.id] : value.filter((v) => v !== item.id))}
          />
          <span className="flex-1">{item.label}</span>
          {item.hint && <span className="text-muted fs-sm">{item.hint}</span>}
        </label>
      ))}
      {items.length === 0 && <span className="text-muted">Nothing to choose yet.</span>}
    </div>
  )
}

export function CampaignEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const existing = useOne('campaigns', campaignsApi.get, id)
  const [search] = useSearchParams()
  const [draft, setDraft] = useState<Draft>(() => blank((search.get('channel') as Channel | null) ?? undefined))
  const [prefilled, setPrefilled] = useState(false)
  const [step, setStep] = useState(0)
  const [testTo, setTestTo] = useState<string[]>([])
  const lists = useAll('lists', listsApi.list)
  const segments = useAll('segments', segmentsApi.list)
  const templates = useAll('templates', templatesApi.list)
  const accounts = useAll('channel-accounts', channelAccountsApi.list)
  const senders = useAll('senders', sendersApi.list)

  useEffect(() => {
    if (existing.data) setDraft(existing.data)
  }, [existing.data])

  // Opened from a template's "Use in a campaign": start with its content (once, as soon as templates load).
  const fromTemplate = search.get('template')
  if (!id && !prefilled && fromTemplate && templates.data) {
    const t = templates.data.data.find((x) => x.id === fromTemplate)
    setPrefilled(true)
    if (t) setDraft((d) => ({ ...d, channel: t.channel as Draft['channel'], name: t.name, templateId: t.id, subject: t.subject ?? d.subject, body: t.channel !== 'email' ? t.body : d.body }))
  }

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const debouncedAudience = useDebounce(draft.audience, 300)
  const estimate = useTenantQuery('campaigns', { estimate: debouncedAudience, channel: draft.channel }, () => campaignsApi.estimateAudience(debouncedAudience, draft.channel), { placeholderData: (p) => p })

  const save = useAction('campaigns', () => (id ? campaignsApi.update(id, draft) : campaignsApi.create(draft)))
  const launch = useAction('campaigns', (cid: string) => campaignsApi.launch(cid), {
    success: (c) => (c.status === 'scheduled' ? 'Campaign scheduled' : 'Campaign is sending'),
    onSuccess: (c) => navigate(to(ROUTES.CAMPAIGN, { id: c.id })),
  })
  const sendTest = useAction('campaigns', (cid: string) => campaignsApi.sendTest(cid, testTo), { success: (r) => `Test sent to ${r.sent} recipient${r.sent === 1 ? '' : 's'}` })

  const saveDraft = async () => {
    const saved = await save.mutateAsync(undefined)
    toast.success('Draft saved')
    if (!id) navigate(to(ROUTES.CAMPAIGN_EDIT, { id: saved.id }), { replace: true })
    return saved
  }
  const doLaunch = async () => {
    const saved = await save.mutateAsync(undefined)
    launch.mutate(saved.id)
  }
  const doTest = async () => {
    const saved = await save.mutateAsync(undefined)
    if (!id) navigate(to(ROUTES.CAMPAIGN_EDIT, { id: saved.id }), { replace: true })
    sendTest.mutate(saved.id)
  }

  if (id && existing.isLoading) return <SkeletonLines lines={10} />
  if (existing.data && !['draft', 'scheduled'].includes(existing.data.status)) {
    return (
      <Panel>
        <p className="mb-3">This campaign has already been sent and can no longer be edited.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate(to(ROUTES.CAMPAIGN, { id: id! }))}>View report</button>
      </Panel>
    )
  }

  const channelTemplates = (templates.data?.data ?? []).filter((t) => t.channel === draft.channel && ['active', 'approved'].includes(t.status))
  const template = channelTemplates.find((t) => t.id === draft.templateId)
  const senderOptions =
    draft.channel === 'email'
      ? (senders.data?.data ?? []).filter((s) => s.verified).map((s) => `${s.name} <${s.email}>`)
      : (accounts.data?.data ?? []).filter((a) => a.channel === draft.channel && a.status === 'connected').map((a) => (draft.channel === 'whatsapp' ? a.name : a.identifier))
  const problems = campaignProblems(draft)
  const sms = draft.channel === 'sms' ? smsInfo(draft.body) : null
  const stepValid = [Boolean(draft.name.trim() && draft.senderLabel), draft.audience.listIds.length + draft.audience.segmentIds.length > 0, true, true, problems.length === 0]

  return (
    <>
      <PageHeader
        back={{ label: 'Campaigns', to: ROUTES.CAMPAIGNS }}
        title={draft.name || 'New campaign'}
        meta={<ChannelBadge channel={draft.channel} />}
        actions={<button type="button" className="btn btn-light" onClick={saveDraft} disabled={save.isPending || !draft.name.trim()}>{save.isPending ? 'Saving…' : 'Save draft'}</button>}
      />

      <div className="card mb-4">
        <div className="card-body">
          <Stepper steps={STEPS} current={step} onStep={setStep} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          {step === 0 && (
            <Panel title="Channel and sender">
              <div className="row g-3 mb-4">
                {CAMPAIGN_CHANNELS.map((ch) => (
                  <div key={ch} className="col-sm-6 col-lg-4">
                    <OptionCard
                      selected={draft.channel === ch}
                      onSelect={() => patch({ channel: ch, senderLabel: null, templateId: null })}
                      icon={CHANNELS[ch].icon}
                      tone={CHANNELS[ch].tone}
                      title={CHANNELS[ch].label}
                      disabled={Boolean(id)}
                    />
                  </div>
                ))}
              </div>
              <div className="row g-4">
                <FormField id="cmp-name" label="Campaign name" hint="Internal only; recipients never see it." className="col-md-6">
                  <input id="cmp-name" className="form-control" value={draft.name} onChange={(e) => patch({ name: e.target.value })} autoFocus />
                </FormField>
                <FormField id="cmp-sender" label={draft.channel === 'email' ? 'From' : 'Send from'} hint={senderOptions.length === 0 ? 'No verified sender for this channel. Set one up under Channels.' : undefined} className="col-md-6">
                  <select id="cmp-sender" className="form-select" value={draft.senderLabel ?? ''} onChange={(e) => patch({ senderLabel: e.target.value || null })}>
                    <option value="">Choose a sender…</option>
                    {senderOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField id="cmp-tags" label="Tags" className="col-12">
                  <TagInput id="cmp-tags" value={draft.tags} onChange={(tags) => patch({ tags })} />
                </FormField>
              </div>
            </Panel>
          )}

          {step === 1 && (
            <Panel title="Who should receive it?">
              <div className="row g-4">
                <div className="col-lg-6">
                  <h6 className="fs-sm text-muted text-uppercase">Send to lists</h6>
                  <CheckList items={(lists.data?.data ?? []).map((l) => ({ id: l.id, label: l.name, hint: l.contactCount.toLocaleString() }))} value={draft.audience.listIds} onChange={(listIds) => patch({ audience: { ...draft.audience, listIds } })} disabled={draft.audience.excludeListIds} />
                </div>
                <div className="col-lg-6">
                  <h6 className="fs-sm text-muted text-uppercase">Send to segments</h6>
                  <CheckList items={(segments.data?.data ?? []).map((s) => ({ id: s.id, label: s.name, hint: s.contactCount.toLocaleString() }))} value={draft.audience.segmentIds} onChange={(segmentIds) => patch({ audience: { ...draft.audience, segmentIds } })} />
                </div>
                <div className="col-12">
                  <h6 className="fs-sm text-muted text-uppercase">Exclude lists</h6>
                  <CheckList items={(lists.data?.data ?? []).map((l) => ({ id: l.id, label: l.name }))} value={draft.audience.excludeListIds} onChange={(excludeListIds) => patch({ audience: { ...draft.audience, excludeListIds } })} disabled={draft.audience.listIds} />
                </div>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel title="Content">
              <div className="row g-4">
                <FormField id="cmp-template" label="Start from a template" className="col-12">
                  <select id="cmp-template" className="form-select" value={draft.templateId ?? ''} onChange={(e) => {
                    const t = channelTemplates.find((x) => x.id === e.target.value)
                    patch({ templateId: t?.id ?? null, subject: t?.subject ?? draft.subject, body: t && draft.channel !== 'email' ? t.body : draft.body })
                  }}>
                    <option value="">{draft.channel === 'whatsapp' ? 'Choose an approved template…' : 'No template (write below)'}</option>
                    {channelTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </FormField>
                {draft.channel === 'email' && (
                  <>
                    <FormField id="cmp-subject" label="Subject line" className="col-md-7">
                      <input id="cmp-subject" className="form-control" value={draft.subject ?? ''} onChange={(e) => patch({ subject: e.target.value })} maxLength={150} />
                    </FormField>
                    <FormField id="cmp-preview" label="Preview text" hint="Shown after the subject in most inboxes." className="col-md-5">
                      <input id="cmp-preview" className="form-control" value={draft.previewText ?? ''} onChange={(e) => patch({ previewText: e.target.value })} maxLength={150} />
                    </FormField>
                    {!template && (
                      <FormField id="cmp-body" label="Message" hint="Plain text. Use a template for designed emails." className="col-12">
                        <textarea id="cmp-body" rows={8} className="form-control" value={draft.body} onChange={(e) => patch({ body: e.target.value })} />
                      </FormField>
                    )}
                    <div className="col-12">
                      <Switch
                        id="cmp-ab"
                        checked={Boolean(draft.abTest?.enabled)}
                        onChange={(on) => patch({ abTest: on ? { enabled: true, variantSubject: '', splitPercent: 20, winnerMetric: 'open' } : null })}
                        label="A/B test the subject line"
                        description="Send two subjects to a sample, then the winner to everyone else."
                      />
                      {draft.abTest?.enabled && (
                        <div className="row g-3 mt-1">
                          <FormField id="cmp-ab-subject" label="Subject B" className="col-md-6">
                            <input id="cmp-ab-subject" className="form-control" value={draft.abTest.variantSubject} onChange={(e) => patch({ abTest: { ...draft.abTest!, variantSubject: e.target.value } })} />
                          </FormField>
                          <FormField id="cmp-ab-split" label={`Test sample: ${draft.abTest.splitPercent}%`} className="col-md-3">
                            <input id="cmp-ab-split" type="range" className="form-range" min={10} max={50} step={5} value={draft.abTest.splitPercent} onChange={(e) => patch({ abTest: { ...draft.abTest!, splitPercent: Number(e.target.value) } })} />
                          </FormField>
                          <FormField id="cmp-ab-metric" label="Winner by" className="col-md-3">
                            <select id="cmp-ab-metric" className="form-select" value={draft.abTest.winnerMetric} onChange={(e) => patch({ abTest: { ...draft.abTest!, winnerMetric: e.target.value as 'open' | 'click' } })}>
                              <option value="open">Open rate</option>
                              <option value="click">Click rate</option>
                            </select>
                          </FormField>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {draft.channel !== 'email' && (
                  <FormField
                    id="cmp-body"
                    label="Message"
                    hint={sms ? `${sms.length} characters · ${sms.encoding} · ${sms.segments} segment${sms.segments > 1 ? 's' : ''} per recipient · ${sms.remaining} left in this segment` : draft.channel === 'whatsapp' ? 'Marketing on WhatsApp must use an approved template.' : undefined}
                    className="col-12"
                  >
                    <textarea id="cmp-body" rows={6} className="form-control" value={draft.body} readOnly={draft.channel === 'whatsapp' && Boolean(template)} onChange={(e) => patch({ body: e.target.value })} />
                  </FormField>
                )}
                {sms?.encoding === 'UCS-2' && <div className="col-12"><div className="alert alert-warning mb-0 py-2">Emoji or special characters switch SMS to UCS-2: 70 characters per segment instead of 160.</div></div>}
              </div>
            </Panel>
          )}

          {step === 3 && (
            <Panel title="When should it go out?">
              <div className="row g-3 mb-4">
                {([['now', 'Send now', 'Start sending as soon as you launch.', 'ri-flashlight-line'], ['scheduled', 'Schedule', 'Pick a date and time.', 'ri-calendar-line'], ['best_time', 'Best time', 'Each contact gets it when they usually engage.', 'ri-magic-line']] as const).map(([value, title, desc, icon]) => (
                  <div key={value} className="col-md-4">
                    <OptionCard selected={draft.schedule.type === value} onSelect={() => patch({ schedule: { ...draft.schedule, type: value } })} icon={icon} title={title} description={desc} />
                  </div>
                ))}
              </div>
              {draft.schedule.type === 'scheduled' && (
                <div className="row g-4 mb-4">
                  <FormField id="cmp-at" label="Send at" className="col-md-6">
                    <input id="cmp-at" type="datetime-local" className="form-control" value={toLocalInput(draft.schedule.at)} onChange={(e) => patch({ schedule: { ...draft.schedule, at: e.target.value ? new Date(e.target.value).toISOString() : null } })} />
                  </FormField>
                  <FormField id="cmp-tz" label="Time zone" className="col-md-6">
                    <input id="cmp-tz" className="form-control" value={draft.schedule.timezone} readOnly />
                  </FormField>
                </div>
              )}
              <Switch id="cmp-quiet" checked={draft.schedule.respectQuietHours} onChange={(on) => patch({ schedule: { ...draft.schedule, respectQuietHours: on } })} label="Respect quiet hours" description="Hold SMS and WhatsApp messages between 21:00 and 08:00 in the recipient’s time zone." />
            </Panel>
          )}

          {step === 4 && (
            <Panel title="Review">
              {problems.length > 0 ? (
                <div className="alert alert-warning">
                  <strong>Fix these before launching:</strong>
                  <ul className="mb-0 mt-2">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              ) : (
                <div className="alert alert-success"><i className="ri-check-line me-1" />Ready to {draft.schedule.type === 'scheduled' ? 'schedule' : 'send'}.</div>
              )}
              <dl className="row mb-4">
                <dt className="col-sm-4 text-muted fw-normal">Channel</dt><dd className="col-sm-8">{CHANNELS[draft.channel].label}</dd>
                <dt className="col-sm-4 text-muted fw-normal">Sender</dt><dd className="col-sm-8">{draft.senderLabel ?? '—'}</dd>
                {draft.channel === 'email' && <><dt className="col-sm-4 text-muted fw-normal">Subject</dt><dd className="col-sm-8">{draft.subject || '—'}{draft.abTest?.enabled && <> / <em>{draft.abTest.variantSubject || '(B missing)'}</em></>}</dd></>}
                <dt className="col-sm-4 text-muted fw-normal">Audience</dt><dd className="col-sm-8">{estimate.data ? `${estimate.data.reachable.toLocaleString()} reachable contacts` : '…'}</dd>
                <dt className="col-sm-4 text-muted fw-normal">Schedule</dt><dd className="col-sm-8">{draft.schedule.type === 'now' ? 'Immediately' : draft.schedule.type === 'best_time' ? 'Best time per contact' : draft.schedule.at ? new Date(draft.schedule.at).toLocaleString() : 'Not set'}</dd>
              </dl>
              <h6>Send a test</h6>
              <div className="d-flex gap-2 align-items-start mb-4">
                <div className="flex-1"><TagInput id="cmp-test" value={testTo} onChange={setTestTo} placeholder={draft.channel === 'email' ? 'you@company.com' : '+14155550123'} /></div>
                <button type="button" className="btn btn-light" disabled={testTo.length === 0 || sendTest.isPending} onClick={doTest}>{sendTest.isPending ? 'Sending…' : 'Send test'}</button>
              </div>
              <Guard permission="campaigns.send">
                <button type="button" className="btn btn-primary btn-lg" disabled={problems.length > 0 || launch.isPending || save.isPending} onClick={doLaunch}>
                  <i className="ri-send-plane-line me-1" />
                  {launch.isPending ? 'Launching…' : draft.schedule.type === 'scheduled' ? 'Schedule campaign' : `Send to ${estimate.data?.reachable.toLocaleString() ?? ''} contacts`}
                </button>
              </Guard>
            </Panel>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-light" disabled={step === 0} onClick={() => setStep(step - 1)}><i className="ri-arrow-left-line me-1" />Back</button>
            {step < STEPS.length - 1 && <button type="button" className="btn btn-primary" disabled={!stepValid[step]} onClick={() => setStep(step + 1)}>Continue<i className="ri-arrow-right-line ms-1" /></button>}
          </div>
        </div>

        <div className="col-xl-4">
          <Panel title="Audience" className="mb-4">
            {estimate.data ? (
              <>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fs-2 fw-semibold tabular-nums">{estimate.data.reachable.toLocaleString()}</span>
                  <span className="text-muted">reachable</span>
                </div>
                <p className="text-muted fs-sm mb-0">
                  {estimate.data.total.toLocaleString()} in the audience; {estimate.data.excluded.toLocaleString()} skipped for missing consent, no {draft.channel === 'email' ? 'email' : 'phone'}, or blocklist.
                </p>
                {sms && estimate.data.reachable > 0 && <p className="fs-sm mt-2 mb-0">≈ {(estimate.data.reachable * sms.segments).toLocaleString()} SMS segments</p>}
              </>
            ) : (
              <SkeletonLines lines={2} />
            )}
          </Panel>
          <Panel title="Preview">
            {draft.channel === 'email' ? (
              <div className="email-canvas p-3">
                <div className="email-paper">
                  <div className="px-4 py-3 border-bottom fs-sm" style={{ color: '#4b5563' }}>
                    <div><strong>{draft.senderLabel ?? 'Sender'}</strong></div>
                    <div>{draft.subject || 'Subject line'}</div>
                    <div className="text-truncate" style={{ color: '#9ca3af' }}>{draft.previewText}</div>
                  </div>
                  {template ? <EmailBlocks blocks={template.blocks} /> : <div className="p-4" style={{ whiteSpace: 'pre-wrap' }}>{draft.body || 'Your message…'}</div>}
                </div>
              </div>
            ) : (
              <PhonePreview channel={draft.channel as 'sms'} sender={draft.senderLabel ?? ''} body={draft.body} />
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
