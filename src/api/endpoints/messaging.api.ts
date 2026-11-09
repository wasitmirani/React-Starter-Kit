import { AppError } from '@/api/errors'
import { latency, stripMeta } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { seedTemplates } from '@/api/mock/seed'
import { matchesSegment } from '@/api/mock/segment-engine'
import { call, createResourceApi, http } from '@/api/resource'
import type { Channel } from '@/types/channel.types'
import type { BrandKit, Campaign, CampaignAudience, CampaignStatus, Template } from '@/types/messaging.types'

/** Contacts reachable on the channel: consent given and not blocklisted. */
function audienceFor(audience: CampaignAudience, channel: Channel) {
  const segments = audience.segmentIds.map((id) => db.segments.find(id))
  const all = db.contacts.rows()
  const included = all.filter(
    (c) =>
      audience.listIds.some((l) => c.listIds.includes(l)) || segments.some((s) => matchesSegment(c, s.rules)),
  )
  const audienceRows = included.filter((c) => !audience.excludeListIds.some((l) => c.listIds.includes(l)))
  const consentKey = channel === 'email' ? 'email' : channel === 'whatsapp' ? 'whatsapp' : 'sms'
  const address = (c: (typeof all)[number]) => (channel === 'email' ? c.email : c.phone)
  const reachable = audienceRows.filter((c) => !c.blocklisted && address(c) && c.consents[consentKey] === 'subscribed')
  return { total: audienceRows.length, reachable: reachable.length, excluded: audienceRows.length - reachable.length }
}

export interface AudienceEstimate {
  total: number
  reachable: number
  /** No consent, no address or blocklisted. */
  excluded: number
}

/** Content and setup checks a campaign must pass before it can be sent or scheduled. */
export function campaignProblems(c: Pick<Campaign, 'channel' | 'subject' | 'body' | 'templateId' | 'audience' | 'senderLabel' | 'schedule'>): string[] {
  const problems: string[] = []
  if (!c.senderLabel) problems.push('Choose a sender.')
  if (c.channel === 'email' && !c.subject?.trim()) problems.push('Add a subject line.')
  if (!c.body.trim() && !c.templateId) problems.push('Add content or pick a template.')
  if (c.audience.listIds.length + c.audience.segmentIds.length === 0) problems.push('Choose at least one list or segment.')
  if (c.schedule.type === 'scheduled' && (!c.schedule.at || Date.parse(c.schedule.at) < Date.now())) problems.push('Pick a send time in the future.')
  return problems
}

const campaignsResource = createResourceApi('/campaigns', db.campaigns)

function transition(id: string, from: CampaignStatus[], to: CampaignStatus, extra: Partial<Campaign> = {}) {
  const campaign = db.campaigns.find(id)
  if (!from.includes(campaign.status)) {
    throw new AppError(409, 'INVALID_STATE', `A ${campaign.status} campaign cannot be changed to ${to}.`)
  }
  return db.campaigns.update(id, { status: to, ...extra })
}

export const campaignsApi = {
  ...campaignsResource,

  estimateAudience: (audience: CampaignAudience, channel: Channel) =>
    call<AudienceEstimate>(
      async () => {
        await latency(150, 300)
        return audienceFor(audience, channel)
      },
      () => http.post('/campaigns/audience-estimate', { audience, channel }),
    ),

  /** Sends now or schedules, depending on `schedule.type`. The server re-validates. */
  launch: (id: string) =>
    call<Campaign>(
      async () => {
        const campaign = db.campaigns.find(id)
        const problems = campaignProblems(campaign)
        if (problems.length) throw new AppError(422, 'CAMPAIGN_INVALID', problems.join(' '))
        const { reachable } = audienceFor(campaign.audience, campaign.channel)
        if (campaign.schedule.type === 'scheduled') return transition(id, ['draft'], 'scheduled')
        return transition(id, ['draft', 'scheduled'], 'running', {
          sentAt: new Date().toISOString(),
          stats: { ...campaign.stats, recipients: reachable, sent: Math.round(reachable * 0.35) },
        })
      },
      () => http.post(`/campaigns/${id}/launch`),
    ),
  pause: (id: string) => call(() => transition(id, ['running'], 'paused'), () => http.post<Campaign>(`/campaigns/${id}/pause`)),
  resume: (id: string) => call(() => transition(id, ['paused'], 'running'), () => http.post<Campaign>(`/campaigns/${id}/resume`)),
  cancel: (id: string) =>
    call(() => transition(id, ['scheduled', 'running', 'paused'], 'cancelled'), () => http.post<Campaign>(`/campaigns/${id}/cancel`)),
  /** Back to draft (only from scheduled). */
  unschedule: (id: string) => call(() => transition(id, ['scheduled'], 'draft'), () => http.post<Campaign>(`/campaigns/${id}/unschedule`)),

  duplicate: (id: string) =>
    call<Campaign>(
      async () => {
        const source = stripMeta(db.campaigns.find(id))
        return db.campaigns.create({
          ...source,
          name: `${source.name} (copy)`,
          status: 'draft',
          sentAt: null,
          stats: { recipients: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, unsubscribed: 0, failed: 0, revenue: 0 },
        })
      },
      () => http.post(`/campaigns/${id}/duplicate`),
    ),

  sendTest: (id: string, recipients: string[]) =>
    call(
      async () => {
        await latency(300, 600)
        return { sent: recipients.length }
      },
      () => http.post<{ sent: number }>(`/campaigns/${id}/test`, { recipients }),
    ),
}

const PLACEHOLDER = /{{\s*([\w.]+)\s*}}/g

export function extractVariables(...texts: (string | null | undefined)[]): string[] {
  const found = new Set<string>()
  for (const text of texts) for (const match of (text ?? '').matchAll(PLACEHOLDER)) found.add(match[1])
  return [...found]
}

const LEGACY_LOGO = '/assets/images/main-logo.webp'
const BRAND_LOGO = '/assets/images/email/northwind-logo.svg'

/** Sample values of the seeded templates, for rows stored before `examples` existed. */
let seeded: Map<string, Record<string, string>> | null = null
const seedExamples = () => (seeded ??= new Map(seedTemplates().filter((s) => s.examples).map((s) => [s.name, s.examples!])))

/** Rows saved before brand logos and sample values existed are upgraded on read. */
const upgradeTemplate = (t: Template): Template => ({
  ...t,
  examples: t.examples ?? seedExamples().get(t.name) ?? {},
  // Older rows: kit logo → brand logo, sized like a logo rather than a hero image.
  blocks: t.blocks.map((b) => (b.type === 'image' && (b.content === LEGACY_LOGO || b.content === BRAND_LOGO) && b.width == null ? { ...b, content: BRAND_LOGO, width: 40, alt: b.alt ?? 'Northwind Traders' } : b)),
})

const templatesResource = createResourceApi('/templates', db.templates, { decorate: upgradeTemplate })

export const templatesApi = {
  ...templatesResource,
  duplicate: (id: string) =>
    call<Template>(
      async () => {
        const source = stripMeta(db.templates.find(id))
        return db.templates.create({ ...source, name: `${source.name} copy`, status: 'draft', rejectionReason: null })
      },
      () => http.post(`/templates/${id}/duplicate`),
    ),
  /** WhatsApp templates must be approved by Meta before use. */
  submitForApproval: (id: string) =>
    call(() => db.templates.update(id, { status: 'pending', rejectionReason: null }), () => http.post<Template>(`/templates/${id}/submit`)),
  sendTest: (id: string, to: string) =>
    call(
      async () => {
        await latency(300, 600)
        return { to }
      },
      () => http.post<{ to: string }>(`/templates/${id}/test`, { to }),
    ),
}

export const messagesApi = {
  ...createResourceApi('/messages', db.messages),
  /** Retries a failed message with a new attempt; the idempotency key prevents duplicates. */
  retry: (id: string) =>
    call(
      async () => {
        const message = db.messages.find(id)
        if (message.status !== 'failed') throw new AppError(409, 'INVALID_STATE', 'Only failed messages can be retried.')
        return db.messages.update(id, {
          status: 'queued',
          events: [...message.events, { status: 'queued', at: new Date().toISOString(), detail: 'Manual retry' }],
        })
      },
      () => http.post(`/messages/${id}/retry`),
    ),
}

/** Workspace brand kit: shared email header/footer and defaults. A single record per workspace. */
export const brandKitApi = {
  get: () =>
    call<BrandKit>(
      async () => {
        await latency(60, 150)
        return db.brandKit.find('brand-kit')
      },
      () => http.get('/brand-kit'),
    ),
  update: (patch: Partial<Omit<BrandKit, 'id' | 'createdAt' | 'updatedAt'>>) =>
    call<BrandKit>(async () => db.brandKit.update('brand-kit', patch), () => http.put('/brand-kit', patch)),
}
