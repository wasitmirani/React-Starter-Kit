import type { PathCondition, Workflow } from '@/types/automation.types'
import type {
  Call,
  ChannelAccount,
  EmailSender,
  IvrMenu,
  LiveChatWidget,
  PhoneNumber,
  SenderDomain,
} from '@/types/channel.types'
import type { Entity } from '@/types/common.types'
import type {
  Activity,
  Company,
  Contact,
  ContactAttribute,
  ContactList,
  Deal,
  Pipeline,
  Segment,
  Task,
} from '@/types/crm.types'
import type { CannedReply, Conversation, ConversationMessage } from '@/types/inbox.types'
import type { BrandKit, Campaign, MessageLog, Template } from '@/types/messaging.types'
import type { AppNotification, Integration, Invoice, SignupForm, WebhookDelivery, WebhookEndpoint } from '@/types/platform.types'
import {
  COMPANIES,
  COUNTRIES,
  FIRST_NAMES,
  JOB_TITLES,
  LAST_NAMES,
  TAGS,
  TEAM,
  createFaker,
} from './faker'
import { WEBHOOK_EVENTS } from '@/constants/webhooks.constants'
import { defaultSettings } from '@/utils/helpers/workflow'

const stamp = (createdAt: string): Pick<Entity, 'createdAt' | 'updatedAt'> => ({ createdAt, updatedAt: createdAt })
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`

export const CONTACT_COUNT = 240

const LISTS = [
  ['Newsletter subscribers', 'Opted in through the website footer.', 'Marketing'],
  ['Customers', 'Everyone with at least one order.', 'Sales'],
  ['Trial users', 'Product trials started in the last 30 days.', 'Product'],
  ['Webinar attendees', 'Registered for the 2026 webinar series.', 'Events'],
  ['VIP', 'High-value accounts handled by account managers.', 'Sales'],
  ['Re-engagement', 'Inactive for 90+ days.', 'Marketing'],
] as const

export function seedLists(): ContactList[] {
  const f = createFaker(11)
  return LISTS.map(([name, description, folder], i) => ({
    id: id('list', i + 1),
    name,
    description,
    folder,
    contactCount: 0,
    ...stamp(f.pastDate(300, 60)),
  }))
}

export function seedCompanies(): Company[] {
  const f = createFaker(12)
  return COMPANIES.map(([name, domain, industry], i) => {
    const [country] = f.pick(COUNTRIES)
    return {
      id: id('company', i + 1),
      name,
      domain,
      industry,
      size: f.pick(['1-10', '11-50', '51-200', '201-1000', '1000+']),
      country,
      ownerName: f.pick(TEAM),
      contactCount: 0,
      openDealsValue: 0,
      ...stamp(f.pastDate(400, 20)),
    }
  })
}

export function seedContacts(): Contact[] {
  const f = createFaker(13)
  return Array.from({ length: CONTACT_COUNT }, (_, i) => {
    const firstName = f.pick(FIRST_NAMES)
    const lastName = f.pick(LAST_NAMES)
    const [country, city, dial] = f.pick(COUNTRIES)
    const companyIndex = f.chance(0.75) ? f.int(0, COMPANIES.length - 1) : -1
    const company = companyIndex >= 0 ? COMPANIES[companyIndex] : null
    const domain = company ? company[1] : f.pick(['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me'])
    const email = f.chance(0.93)
      ? `${firstName}.${lastName}${i}`.toLowerCase().normalize('NFD').replace(/[^a-z0-9.]/g, '') + `@${domain}`
      : null
    const phone = f.chance(0.8) ? `${dial}${f.int(200, 999)}${f.int(1000000, 9999999)}` : null
    const emailConsent = email ? f.pick(['subscribed', 'subscribed', 'subscribed', 'unsubscribed', 'pending'] as const) : 'none'
    const createdAt = f.pastDate(420, 1)
    return {
      id: id('contact', i + 1),
      firstName,
      lastName,
      email,
      phone,
      companyId: company ? id('company', companyIndex + 1) : null,
      companyName: company ? company[0] : null,
      jobTitle: company ? f.pick(JOB_TITLES) : null,
      country,
      city,
      lifecycleStage: f.pick(['subscriber', 'subscriber', 'lead', 'lead', 'qualified', 'customer', 'customer', 'churned'] as const),
      source: f.pick(['manual', 'import', 'import', 'form', 'form', 'api', 'inbound', 'integration'] as const),
      ownerName: f.chance(0.6) ? f.pick(TEAM) : null,
      score: f.int(0, 100),
      tags: f.some(TAGS, 0, 3),
      listIds: f.some(LISTS.map((_, n) => id('list', n + 1)), 0, 3),
      consents: {
        email: emailConsent,
        sms: phone ? f.pick(['subscribed', 'unsubscribed', 'none'] as const) : 'none',
        whatsapp: phone ? f.pick(['subscribed', 'subscribed', 'none'] as const) : 'none',
      },
      blocklisted: f.chance(0.03),
      attributes: {
        plan: f.pick(['Free', 'Starter', 'Business', 'Enterprise']),
        lifetime_value: f.int(0, 12000),
        birthday: f.chance(0.4) ? `19${f.int(60, 99)}-${String(f.int(1, 12)).padStart(2, '0')}-${String(f.int(1, 28)).padStart(2, '0')}` : null,
        language: f.pick(['en', 'en', 'de', 'fr', 'es', 'ar']),
      },
      lastActivityAt: f.chance(0.85) ? f.pastDate(60) : null,
      ...stamp(createdAt),
    }
  })
}

export function seedAttributes(): ContactAttribute[] {
  const at = new Date(Date.now() - 200 * 86_400_000).toISOString()
  const rows: Omit<ContactAttribute, keyof Entity>[] = [
    { key: 'first_name', label: 'First name', type: 'text', options: [], system: true },
    { key: 'last_name', label: 'Last name', type: 'text', options: [], system: true },
    { key: 'email', label: 'Email', type: 'text', options: [], system: true },
    { key: 'phone', label: 'Phone', type: 'text', options: [], system: true },
    { key: 'country', label: 'Country', type: 'text', options: [], system: true },
    { key: 'plan', label: 'Plan', type: 'select', options: ['Free', 'Starter', 'Business', 'Enterprise'], system: false },
    { key: 'lifetime_value', label: 'Lifetime value', type: 'number', options: [], system: false },
    { key: 'birthday', label: 'Birthday', type: 'date', options: [], system: false },
    { key: 'language', label: 'Language', type: 'select', options: ['en', 'de', 'fr', 'es', 'ar'], system: false },
    { key: 'accepts_marketing', label: 'Accepts marketing', type: 'boolean', options: [], system: false },
  ]
  return rows.map((row, i) => ({ ...row, id: id('attr', i + 1), ...stamp(at) }))
}

export function seedSegments(): Segment[] {
  const f = createFaker(14)
  const rows: [string, string, Segment['rules']][] = [
    ['Engaged last 30 days', 'Opened or clicked any message in the last 30 days.', { match: 'all', rules: [{ id: 'r1', field: 'lastActivityAt', operator: 'within_days', value: '30' }] }],
    ['High-value customers', 'Customers with lifetime value above 5,000.', { match: 'all', rules: [{ id: 'r1', field: 'lifecycleStage', operator: 'equals', value: 'customer' }, { id: 'r2', field: 'attributes.lifetime_value', operator: 'greater_than', value: '5000' }] }],
    ['UK & Germany leads', 'Open leads in two priority markets.', { match: 'all', rules: [{ id: 'r1', field: 'lifecycleStage', operator: 'equals', value: 'lead' }, { id: 'r2', field: 'country', operator: 'in_list', value: 'United Kingdom,Germany' }] }],
    ['Churn risk', 'Tagged churn-risk or inactive for 45 days.', { match: 'any', rules: [{ id: 'r1', field: 'tags', operator: 'has_tag', value: 'churn-risk' }, { id: 'r2', field: 'lifecycleStage', operator: 'equals', value: 'churned' }] }],
    ['WhatsApp reachable', 'Phone on file and WhatsApp opt-in.', { match: 'all', rules: [{ id: 'r1', field: 'phone', operator: 'is_set', value: '' }, { id: 'r2', field: 'consents.whatsapp', operator: 'equals', value: 'subscribed' }] }],
  ]
  return rows.map(([name, description, rules], i) => ({
    id: id('segment', i + 1),
    name,
    description,
    rules,
    contactCount: 0,
    lastComputedAt: f.pastDate(1),
    ...stamp(f.pastDate(200, 10)),
  }))
}

export function seedActivities(contacts: Contact[]): Activity[] {
  const f = createFaker(15)
  const kinds: [Activity['type'], Activity['channel'], string][] = [
    ['message_sent', 'email', 'Received email “Spring collection is here”'],
    ['message_opened', 'email', 'Opened “Spring collection is here”'],
    ['message_clicked', 'email', 'Clicked “Shop now” in “Spring collection is here”'],
    ['message_sent', 'sms', 'Received SMS “Your order has shipped”'],
    ['message_received', 'whatsapp', 'Sent a WhatsApp message: “Is this available in blue?”'],
    ['call', 'voice', 'Inbound call answered by Daniel Brooks (4m 12s)'],
    ['form_submitted', null, 'Submitted form “Newsletter signup”'],
    ['tag_added', null, 'Tag “vip” added'],
    ['note', null, 'Note: interested in the annual plan, follow up next week'],
    ['deal_updated', null, 'Deal “Annual plan upgrade” moved to Proposal'],
  ]
  return contacts.flatMap((contact, ci) => {
    const count = f.int(3, 7)
    const created: Activity = {
      id: id(`act-${ci + 1}`, 0),
      contactId: contact.id,
      type: 'created',
      channel: null,
      title: `Contact created from ${contact.source}`,
      description: '',
      at: contact.createdAt,
      ...stamp(contact.createdAt),
    }
    const events = Array.from({ length: count }, (_, n) => {
      const [type, channel, title] = f.pick(kinds)
      const at = f.pastDate(Math.max(1, (Date.now() - Date.parse(contact.createdAt)) / 86_400_000))
      return { id: id(`act-${ci + 1}`, n + 1), contactId: contact.id, type, channel, title, description: '', at, ...stamp(at) }
    })
    return [created, ...events]
  })
}

export const PIPELINE_ID = 'pipeline-0001'

export function seedPipelines(): Pipeline[] {
  return [
    {
      id: PIPELINE_ID,
      name: 'Sales pipeline',
      stages: [
        { id: 'stage-new', name: 'New', probability: 10 },
        { id: 'stage-qualified', name: 'Qualified', probability: 25 },
        { id: 'stage-demo', name: 'Demo', probability: 45 },
        { id: 'stage-proposal', name: 'Proposal', probability: 65 },
        { id: 'stage-negotiation', name: 'Negotiation', probability: 85 },
      ],
      ...stamp(new Date(Date.now() - 300 * 86_400_000).toISOString()),
    },
  ]
}

export function seedDeals(contacts: Contact[]): Deal[] {
  const f = createFaker(16)
  const titles = ['Annual plan upgrade', 'WhatsApp rollout', 'Enterprise onboarding', 'SMS bundle', 'Seat expansion', 'Agency partnership', 'Renewal 2027', 'Voice add-on']
  const stages = seedPipelines()[0].stages
  return Array.from({ length: 36 }, (_, i) => {
    const contact = f.pick(contacts.filter((c) => c.companyId))
    const status = f.pick(['open', 'open', 'open', 'open', 'won', 'lost'] as const)
    return {
      id: id('deal', i + 1),
      title: `${f.pick(titles)} — ${contact.companyName}`,
      value: f.int(8, 240) * 100,
      currency: 'USD',
      pipelineId: PIPELINE_ID,
      stageId: f.pick(stages).id,
      status,
      companyId: contact.companyId,
      companyName: contact.companyName,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      ownerName: f.pick(TEAM),
      expectedCloseDate: status === 'open' ? f.futureDate(90, 3) : f.pastDate(60),
      ...stamp(f.pastDate(120, 2)),
    }
  })
}

export function seedTasks(contacts: Contact[]): Task[] {
  const f = createFaker(17)
  const titles: [Task['type'], string][] = [
    ['call', 'Discovery call'],
    ['email', 'Send proposal'],
    ['meeting', 'Product demo'],
    ['todo', 'Update CRM notes'],
    ['call', 'Renewal check-in'],
    ['email', 'Share WhatsApp pricing'],
  ]
  return Array.from({ length: 24 }, (_, i) => {
    const [type, title] = f.pick(titles)
    const contact = f.pick(contacts)
    const done = f.chance(0.3)
    return {
      id: id('task', i + 1),
      title: `${title} with ${contact.firstName}`,
      type,
      priority: f.pick(['low', 'medium', 'medium', 'high'] as const),
      dueAt: done ? f.pastDate(10) : f.chance(0.25) ? f.pastDate(5) : f.futureDate(14),
      done,
      assigneeName: f.pick(TEAM),
      related: { type: 'contact', id: contact.id, name: `${contact.firstName} ${contact.lastName}` },
      notes: '',
      ...stamp(f.pastDate(30, 1)),
    }
  })
}

export function seedChannelAccounts(): ChannelAccount[] {
  const at = new Date(Date.now() - 120 * 86_400_000).toISOString()
  const rows: Omit<ChannelAccount, keyof Entity>[] = [
    { channel: 'email', name: 'Marketing email', provider: 'Amazon SES', identifier: 'mail.northwind.io', status: 'connected', statusDetail: null, throughput: 50, quality: 'high', isDefault: true },
    { channel: 'email', name: 'Transactional SMTP', provider: 'SMTP', identifier: 'smtp.northwind.io:587', status: 'connected', statusDetail: null, throughput: 10, quality: 'high', isDefault: false },
    { channel: 'sms', name: 'US long code', provider: 'Twilio', identifier: '+1 415 555 0142', status: 'connected', statusDetail: null, throughput: 1, quality: 'high', isDefault: true },
    { channel: 'sms', name: 'Alphanumeric sender', provider: 'Twilio', identifier: 'NORTHWIND', status: 'pending', statusDetail: 'Sender ID registration in review (UK).', throughput: null, quality: null, isDefault: false },
    { channel: 'whatsapp', name: 'Northwind Support', provider: 'Meta Cloud API', identifier: '+1 415 555 0199', status: 'connected', statusDetail: null, throughput: 80, quality: 'high', isDefault: true },
    { channel: 'voice', name: 'Support line', provider: 'Twilio', identifier: '+1 415 555 0100', status: 'connected', statusDetail: null, throughput: null, quality: null, isDefault: true },
    { channel: 'livechat', name: 'Website chat', provider: 'BirdCRM', identifier: 'northwind.io', status: 'connected', statusDetail: null, throughput: null, quality: null, isDefault: true },
    { channel: 'instagram', name: '@northwind', provider: 'Meta', identifier: '@northwind', status: 'error', statusDetail: 'Access token expired. Reconnect the account.', throughput: null, quality: null, isDefault: false },
  ]
  return rows.map((row, i) => ({ ...row, id: id('account', i + 1), ...stamp(at) }))
}

export function seedDomains(): SenderDomain[] {
  const at = new Date(Date.now() - 100 * 86_400_000).toISOString()
  const records = (domain: string, ok: boolean): SenderDomain['records'] => [
    { type: 'TXT', purpose: 'spf', host: domain, value: 'v=spf1 include:amazonses.com ~all', status: 'verified' },
    { type: 'CNAME', purpose: 'dkim', host: `bird1._domainkey.${domain}`, value: 'bird1.dkim.amazonses.com', status: ok ? 'verified' : 'pending' },
    { type: 'CNAME', purpose: 'dkim', host: `bird2._domainkey.${domain}`, value: 'bird2.dkim.amazonses.com', status: ok ? 'verified' : 'pending' },
    { type: 'TXT', purpose: 'dmarc', host: `_dmarc.${domain}`, value: 'v=DMARC1; p=none; rua=mailto:dmarc@' + domain, status: ok ? 'verified' : 'failed' },
    { type: 'CNAME', purpose: 'tracking', host: `link.${domain}`, value: 'track.birdcrm.app', status: ok ? 'verified' : 'pending' },
  ]
  return [
    { id: id('domain', 1), domain: 'northwind.io', status: 'verified', records: records('northwind.io', true), lastCheckedAt: new Date().toISOString(), ...stamp(at) },
    { id: id('domain', 2), domain: 'mail.northwind-shop.com', status: 'pending', records: records('mail.northwind-shop.com', false), lastCheckedAt: new Date().toISOString(), ...stamp(at) },
  ]
}

export function seedSenders(): EmailSender[] {
  const at = new Date(Date.now() - 90 * 86_400_000).toISOString()
  return [
    { id: id('sender', 1), name: 'Northwind', email: 'hello@northwind.io', replyTo: 'support@northwind.io', verified: true, isDefault: true, ...stamp(at) },
    { id: id('sender', 2), name: 'Northwind Billing', email: 'billing@northwind.io', replyTo: null, verified: true, isDefault: false, ...stamp(at) },
    { id: id('sender', 3), name: 'Northwind Shop', email: 'news@mail.northwind-shop.com', replyTo: null, verified: false, isDefault: false, ...stamp(at) },
  ]
}

export function seedNumbers(): PhoneNumber[] {
  const at = new Date(Date.now() - 150 * 86_400_000).toISOString()
  const rows: Omit<PhoneNumber, keyof Entity>[] = [
    { number: '+14155550100', country: 'US', type: 'local', capabilities: ['voice', 'sms'], status: 'active', provider: 'Twilio', monthlyCost: 1.15, label: 'Support line' },
    { number: '+14155550142', country: 'US', type: 'local', capabilities: ['sms', 'mms'], status: 'active', provider: 'Twilio', monthlyCost: 1.15, label: 'Marketing SMS' },
    { number: '+14155550199', country: 'US', type: 'mobile', capabilities: ['whatsapp'], status: 'active', provider: 'Meta', monthlyCost: 0, label: 'WhatsApp Business' },
    { number: '+18005550123', country: 'US', type: 'toll_free', capabilities: ['voice', 'sms'], status: 'pending', provider: 'Twilio', monthlyCost: 2.15, label: 'Sales toll-free' },
    { number: '+442045550111', country: 'GB', type: 'local', capabilities: ['voice'], status: 'active', provider: 'Twilio', monthlyCost: 1.5, label: 'London office' },
  ]
  return rows.map((row, i) => ({ ...row, id: id('number', i + 1), ...stamp(at) }))
}

export function seedCalls(contacts: Contact[]): Call[] {
  const f = createFaker(18)
  return Array.from({ length: 60 }, (_, i) => {
    const contact = f.pick(contacts.filter((c) => c.phone))
    const direction = f.pick(['inbound', 'inbound', 'outbound'] as const)
    const status = f.pick(['completed', 'completed', 'completed', 'no_answer', 'busy', 'voicemail', 'failed'] as const)
    const startedAt = f.pastDate(30)
    return {
      id: id('call', i + 1),
      direction,
      from: direction === 'inbound' ? contact.phone! : '+14155550100',
      to: direction === 'inbound' ? '+14155550100' : contact.phone!,
      contactName: `${contact.firstName} ${contact.lastName}`,
      agentName: status === 'completed' ? f.pick(TEAM) : null,
      status,
      durationSec: status === 'completed' ? f.int(20, 900) : status === 'voicemail' ? f.int(10, 60) : 0,
      recorded: status === 'completed' && f.chance(0.6),
      cost: Number((f.rand() * 0.4).toFixed(3)),
      startedAt,
      ...stamp(startedAt),
    }
  })
}

export function seedIvr(): IvrMenu[] {
  const at = new Date(Date.now() - 60 * 86_400_000).toISOString()
  return [
    {
      id: id('ivr', 1),
      name: 'Main support menu',
      numberId: id('number', 1),
      greeting: 'Thanks for calling Northwind. For orders press 1, for billing press 2, to talk to an agent press 0.',
      options: [
        { digit: '1', label: 'Orders', action: 'queue', target: 'Orders team' },
        { digit: '2', label: 'Billing', action: 'queue', target: 'Billing team' },
        { digit: '0', label: 'Agent', action: 'agent', target: 'Next available' },
      ],
      businessHours: { days: 'Mon–Fri', open: '09:00', close: '18:00', timezone: 'America/Los_Angeles' },
      ...stamp(at),
    },
  ]
}

export function seedWidgets(): LiveChatWidget[] {
  const at = new Date(Date.now() - 45 * 86_400_000).toISOString()
  return [
    {
      id: id('widget', 1),
      name: 'Website chat',
      domain: 'northwind.io',
      color: '#647ee8',
      position: 'right',
      greeting: 'Hi there 👋 How can we help today?',
      awayMessage: 'We are offline right now. Leave a message and we will reply by email.',
      collectEmail: true,
      showAgentPhotos: true,
      status: 'active',
      ...stamp(at),
    },
  ]
}

const EMAIL_BLOCKS = (headline: string): Template['blocks'] => [
  { id: 'b1', type: 'image', content: '/assets/images/email/northwind-logo.svg', align: 'center' },
  { id: 'b2', type: 'heading', content: headline, align: 'center' },
  { id: 'b3', type: 'text', content: 'Hi {{first_name}}, we picked a few things we think you will love. Free shipping on orders over $50 this week only.', align: 'left' },
  { id: 'b4', type: 'button', content: 'Shop the collection', href: 'https://northwind.io/shop', align: 'center' },
  { id: 'b5', type: 'divider', content: '' },
  { id: 'b6', type: 'footer', content: 'Northwind Traders · 100 Market St, San Francisco · Unsubscribe', align: 'center' },
]

export function seedTemplates(): Template[] {
  const f = createFaker(19)
  const rows: Omit<Template, keyof Entity>[] = [
    { name: 'Spring collection launch', channel: 'email', category: 'marketing', status: 'active', language: 'en', subject: 'Spring collection is here 🌸', body: '', blocks: EMAIL_BLOCKS('The spring collection is here'), variables: ['first_name'], rejectionReason: null },
    { name: 'Welcome series — day 1', channel: 'email', category: 'marketing', status: 'active', language: 'en', subject: 'Welcome to Northwind, {{first_name}}', body: '', blocks: EMAIL_BLOCKS('Welcome aboard!'), variables: ['first_name'], rejectionReason: null },
    { name: 'Order confirmation', channel: 'email', category: 'transactional', status: 'active', language: 'en', subject: 'Order {{order_id}} confirmed', body: '', blocks: EMAIL_BLOCKS('Thanks for your order'), variables: ['first_name', 'order_id'], rejectionReason: null },
    { name: 'Password reset', channel: 'email', category: 'transactional', status: 'active', language: 'en', subject: 'Reset your password', body: '', blocks: EMAIL_BLOCKS('Reset your password'), variables: ['reset_link'], rejectionReason: null },
    { name: 'Black Friday teaser', channel: 'email', category: 'marketing', status: 'draft', language: 'en', subject: 'Something big is coming…', body: '', blocks: EMAIL_BLOCKS('Black Friday starts Thursday'), variables: ['first_name'], rejectionReason: null },
    { name: 'order_shipped', channel: 'whatsapp', category: 'utility', status: 'approved', language: 'en', subject: null, body: 'Hi {{1}}, your order {{2}} is on its way! Track it here: {{3}}', blocks: [], variables: ['1', '2', '3'], rejectionReason: null, examples: { '1': 'Olivia', '2': '#10482', '3': 'nwd.io/t/8f2k' } },
    { name: 'appointment_reminder', channel: 'whatsapp', category: 'utility', status: 'approved', language: 'en', subject: null, body: 'Reminder: your appointment is on {{1}} at {{2}}. Reply YES to confirm.', blocks: [], variables: ['1', '2'], rejectionReason: null, examples: { '1': 'Tuesday 12 Nov', '2': '10:30' } },
    { name: 'spring_sale_offer', channel: 'whatsapp', category: 'marketing', status: 'pending', language: 'en', subject: null, body: '🌸 Spring sale! Get 20% off with code {{1}} until Sunday.', blocks: [], variables: ['1'], rejectionReason: null, examples: { '1': 'SPRING20' } },
    { name: 'login_code', channel: 'whatsapp', category: 'authentication', status: 'approved', language: 'en', subject: null, body: '{{1}} is your verification code. For your security, do not share this code.', blocks: [], variables: ['1'], rejectionReason: null, examples: { '1': '482913' } },
    { name: 'winback_discount', channel: 'whatsapp', category: 'marketing', status: 'rejected', language: 'en', subject: null, body: 'We miss you! Click here for a FREE gift!!!', blocks: [], variables: [], rejectionReason: 'Content does not meet WhatsApp commerce policy.' },
    { name: 'Shipping update', channel: 'sms', category: 'transactional', status: 'active', language: 'en', subject: null, body: 'Northwind: your order {{order_id}} has shipped. Track: {{tracking_url}}', blocks: [], variables: ['order_id', 'tracking_url'], rejectionReason: null },
    { name: 'Flash sale', channel: 'sms', category: 'marketing', status: 'active', language: 'en', subject: null, body: 'Northwind: 24h flash sale, 30% off everything with code FLASH30. Reply STOP to opt out.', blocks: [], variables: [], rejectionReason: null },
    { name: 'OTP code', channel: 'sms', category: 'authentication', status: 'active', language: 'en', subject: null, body: 'Your Northwind code is {{code}}. It expires in 10 minutes.', blocks: [], variables: ['code'], rejectionReason: null },
    { name: 'Cart reminder', channel: 'push', category: 'marketing', status: 'active', language: 'en', subject: 'You left something behind', body: 'Your cart is waiting — complete checkout and get free shipping.', blocks: [], variables: [], rejectionReason: null },
  ]
  return rows.map((row, i) => ({ ...row, id: id('template', i + 1), ...stamp(f.pastDate(180, 2)) }))
}

const EMPTY_STATS = { recipients: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, unsubscribed: 0, failed: 0, revenue: 0 }

export function seedCampaigns(): Campaign[] {
  const f = createFaker(20)
  const names: [Campaign['channel'], string, string | null][] = [
    ['email', 'Spring collection launch', 'Spring collection is here 🌸'],
    ['email', 'Monthly newsletter — October', 'What’s new at Northwind'],
    ['sms', 'Flash sale 24h', null],
    ['whatsapp', 'Order follow-up', null],
    ['email', 'Webinar invite: Omnichannel 101', 'Join us live on Thursday'],
    ['whatsapp', 'Spring sale offer', null],
    ['email', 'Product update: new dashboard', 'Meet the new dashboard'],
    ['sms', 'Appointment reminders', null],
    ['email', 'Win-back: we miss you', 'It’s been a while, {{first_name}}'],
    ['push', 'Cart reminder push', 'You left something behind'],
    ['email', 'Black Friday early access', 'Your early access starts now'],
    ['whatsapp', 'VIP preview', null],
    ['email', 'Customer survey', 'Two minutes to make us better?'],
    ['rcs', 'New arrivals carousel', null],
  ]
  return names.map(([channel, name, subject], i) => {
    const status = i < 2 ? (i === 0 ? 'draft' : 'scheduled') : i === 2 ? 'running' : i === 3 ? 'paused' : f.pick(['completed', 'completed', 'completed', 'completed', 'cancelled'] as const)
    const recipients = status === 'draft' ? 0 : f.int(800, 24000)
    const sent = ['draft', 'scheduled'].includes(status) ? 0 : status === 'running' ? Math.round(recipients * 0.6) : recipients
    const delivered = Math.round(sent * (0.93 + f.rand() * 0.06))
    const opened = channel === 'email' || channel === 'whatsapp' ? Math.round(delivered * (0.18 + f.rand() * 0.5)) : 0
    const clicked = Math.round((opened || delivered) * (0.03 + f.rand() * 0.12))
    const createdAt = f.pastDate(150, 3)
    return {
      id: id('campaign', i + 1),
      name,
      channel,
      status,
      senderAccountId: null,
      senderLabel: channel === 'email' ? 'Northwind <hello@northwind.io>' : channel === 'sms' ? '+1 415 555 0142' : channel === 'whatsapp' ? 'Northwind Support' : null,
      subject,
      previewText: channel === 'email' ? 'Fresh picks, free shipping this week.' : null,
      templateId: null,
      body: channel === 'email' ? '' : 'Hi {{first_name}}, our spring sale is live — 20% off with code SPRING20. Reply STOP to opt out.',
      audience: { listIds: [id('list', f.int(1, 6))], segmentIds: f.chance(0.4) ? [id('segment', f.int(1, 5))] : [], excludeListIds: [] },
      schedule: {
        type: status === 'scheduled' ? 'scheduled' : 'now',
        at: status === 'scheduled' ? f.futureDate(7, 1) : null,
        timezone: 'America/Los_Angeles',
        respectQuietHours: true,
      },
      abTest: channel === 'email' && f.chance(0.3) ? { enabled: true, variantSubject: `${subject} (B)`, splitPercent: 20, winnerMetric: 'open' } : null,
      tags: f.some(['seasonal', 'newsletter', 'promo', 'lifecycle'], 0, 2),
      stats: status === 'draft' ? EMPTY_STATS : {
        recipients,
        sent,
        delivered,
        opened,
        clicked,
        replied: channel === 'whatsapp' || channel === 'sms' ? Math.round(delivered * f.rand() * 0.08) : 0,
        bounced: sent - delivered,
        unsubscribed: Math.round(delivered * f.rand() * 0.006),
        failed: Math.round(sent * f.rand() * 0.01),
        revenue: f.int(0, 40) * 250,
      },
      sentAt: ['completed', 'running', 'paused', 'cancelled'].includes(status) ? f.pastDate(60, 1) : null,
      ...stamp(createdAt),
    }
  })
}

export function seedMessages(contacts: Contact[]): MessageLog[] {
  const f = createFaker(21)
  const campaigns = seedCampaigns().filter((c) => c.sentAt)
  return Array.from({ length: 220 }, (_, i) => {
    const contact = f.pick(contacts)
    const channel = f.pick(['email', 'email', 'email', 'sms', 'sms', 'whatsapp', 'whatsapp'] as const)
    const direction = channel !== 'email' && f.chance(0.15) ? 'inbound' : 'outbound'
    const status = direction === 'inbound'
      ? 'received'
      : f.pick(['delivered', 'delivered', 'delivered', 'delivered', 'read', 'sent', 'failed', 'bounced', 'queued', 'unknown'] as const)
    const createdAt = f.pastDate(14)
    const t = (mins: number) => new Date(Date.parse(createdAt) + mins * 60_000).toISOString()
    const campaign = f.chance(0.55) ? f.pick(campaigns.filter((c) => c.channel === channel).concat(campaigns.slice(0, 1))) : null
    const events: MessageLog['events'] = direction === 'inbound'
      ? [{ status: 'received', at: createdAt, detail: null }]
      : [
          { status: 'accepted', at: createdAt, detail: 'Accepted by API' },
          { status: 'queued', at: t(0.1), detail: null },
          ...(status !== 'queued' ? [{ status: 'sent' as const, at: t(0.4), detail: `Handed to ${channel === 'email' ? 'Amazon SES' : channel === 'sms' ? 'Twilio' : 'Meta'}` }] : []),
          ...(status === 'unknown' ? [{ status: 'unknown' as const, at: t(2), detail: 'Provider timed out; reconciling before any retry' }] : []),
          ...(['delivered', 'read'].includes(status) ? [{ status: 'delivered' as const, at: t(1.2), detail: null }] : []),
          ...(status === 'read' ? [{ status: 'read' as const, at: t(14), detail: null }] : []),
          ...(status === 'failed' ? [{ status: 'retrying' as const, at: t(1), detail: 'Attempt 1 failed: 503 from provider' }, { status: 'failed' as const, at: t(6), detail: 'Max attempts reached' }] : []),
          ...(status === 'bounced' ? [{ status: 'bounced' as const, at: t(1), detail: '550 5.1.1 mailbox does not exist' }] : []),
        ]
    return {
      id: id('msg', i + 1),
      channel,
      direction,
      to: direction === 'inbound' ? (channel === 'whatsapp' ? '+14155550199' : '+14155550142') : (channel === 'email' ? contact.email ?? 'unknown@example.com' : contact.phone ?? '+10000000000'),
      from: direction === 'inbound' ? contact.phone ?? '+10000000000' : channel === 'email' ? 'hello@northwind.io' : channel === 'sms' ? '+14155550142' : '+14155550199',
      contactName: `${contact.firstName} ${contact.lastName}`,
      subject: channel === 'email' ? f.pick(['Spring collection is here 🌸', 'Order #10482 confirmed', 'Reset your password', 'What’s new at Northwind']) : null,
      preview: channel === 'email' ? 'Hi there, we picked a few things we think you will love…' : direction === 'inbound' ? f.pick(['Is this available in blue?', 'YES', 'What time do you open?', 'STOP']) : 'Northwind: your order has shipped. Track: nwd.io/t/8f2k',
      status,
      provider: channel === 'email' ? f.pick(['Amazon SES', 'SMTP']) : channel === 'sms' ? 'Twilio' : 'Meta Cloud API',
      segments: channel === 'sms' ? f.int(1, 3) : null,
      cost: channel === 'email' ? 0.0001 : channel === 'sms' ? 0.0079 * f.int(1, 3) : 0.0147,
      campaignId: direction === 'outbound' && campaign ? campaign.id : null,
      campaignName: direction === 'outbound' && campaign ? campaign.name : null,
      errorCode: status === 'failed' ? 'PROVIDER_UNAVAILABLE' : status === 'bounced' ? 'HARD_BOUNCE' : null,
      events,
      ...stamp(createdAt),
    }
  })
}

const CONVERSATION_SCRIPTS: [Conversation['channel'], string | null, [ConversationMessage['direction'], string][]][] = [
  ['whatsapp', null, [['inbound', 'Hi! Is the linen shirt available in blue, size M?'], ['outbound', 'Hi {{name}}! Yes, we have it in blue — want me to reserve one for you?'], ['inbound', 'Yes please 🙏 can I pick it up tomorrow?']]],
  ['email', 'Refund for order #10482', [['inbound', 'Hello, I received the wrong size and would like a refund for order #10482.'], ['outbound', 'Sorry about that! I have started the return. You will get a prepaid label shortly.'], ['inbound', 'Thanks, got the label. How long does the refund take?']]],
  ['sms', null, [['inbound', 'What time do you open on Saturday?']]],
  ['livechat', null, [['inbound', 'Do you ship to Canada?'], ['outbound', 'We do! Shipping to Canada takes 4–6 business days.'], ['inbound', 'Great, and are duties included?']]],
  ['instagram', null, [['inbound', 'Loved your latest post! Is the dress still in stock?']]],
  ['whatsapp', null, [['inbound', 'My package says delivered but I can’t find it'], ['outbound', 'I’m sorry to hear that. Could you share your order number?'], ['inbound', 'It’s 10511']]],
  ['messenger', null, [['inbound', 'Do you have gift cards?']]],
  ['email', 'Partnership inquiry', [['inbound', 'Hi team, we run a lifestyle blog with 200k readers and would love to collaborate.']]],
  ['voice', 'Missed call', [['inbound', 'Missed call · voicemail 0:42 — “Hi, calling about my subscription renewal, please call me back.”']]],
  ['telegram', null, [['inbound', '/start'], ['outbound', 'Welcome to Northwind! Type ORDER to track an order.'], ['inbound', 'ORDER 10533']]],
]

export function seedConversations(contacts: Contact[]): { conversations: Conversation[]; messages: ConversationMessage[] } {
  const f = createFaker(22)
  const conversations: Conversation[] = []
  const messages: ConversationMessage[] = []
  for (let i = 0; i < 32; i++) {
    const [channel, subject, script] = CONVERSATION_SCRIPTS[i % CONVERSATION_SCRIPTS.length]
    const contact = contacts[(i * 7) % contacts.length]
    const name = `${contact.firstName} ${contact.lastName}`
    const startedAt = Date.now() - f.int(5, 60 * 24 * 6) * 60_000
    const convId = id('conv', i + 1)
    const status = i < 14 ? 'open' : f.pick(['open', 'pending', 'snoozed', 'resolved', 'resolved'] as const)
    const assignee = i % 3 === 0 ? null : f.pick(TEAM)
    let at = startedAt
    script.forEach(([direction, body], n) => {
      at += f.int(1, 25) * 60_000
      messages.push({
        id: id(`cmsg-${i + 1}`, n + 1),
        conversationId: convId,
        direction,
        kind: 'message',
        body: body.replace('{{name}}', contact.firstName),
        authorName: direction === 'inbound' ? name : assignee ?? 'Daniel Brooks',
        status: direction === 'outbound' ? 'read' : null,
        attachments: [],
        at: new Date(at).toISOString(),
        ...stamp(new Date(at).toISOString()),
      })
    })
    const last = script[script.length - 1]
    const lastAt = new Date(at).toISOString()
    conversations.push({
      id: convId,
      contactId: contact.id,
      contactName: name,
      contactHandle: channel === 'email' ? contact.email ?? 'unknown@example.com' : channel === 'instagram' || channel === 'messenger' || channel === 'telegram' || channel === 'livechat' ? `@${contact.firstName.toLowerCase()}${i}` : contact.phone ?? '+10000000000',
      channel,
      subject,
      status,
      priority: f.pick(['normal', 'normal', 'normal', 'high', 'low', 'urgent'] as const),
      assigneeName: assignee,
      teamName: f.pick(['Support', 'Sales', 'Support']),
      unreadCount: last[0] === 'inbound' && status === 'open' ? f.int(1, 3) : 0,
      lastMessagePreview: last[1].replace('{{name}}', contact.firstName),
      lastMessageAt: lastAt,
      tags: f.some(['order', 'refund', 'shipping', 'vip', 'presale'], 0, 2),
      windowExpiresAt: channel === 'whatsapp' ? new Date(at + 24 * 3_600_000).toISOString() : null,
      ...stamp(new Date(startedAt).toISOString()),
    })
  }
  return { conversations, messages }
}

export function seedCannedReplies(): CannedReply[] {
  const at = new Date(Date.now() - 30 * 86_400_000).toISOString()
  return [
    { id: id('canned', 1), shortcut: '/thanks', title: 'Thanks', body: 'Thanks for reaching out! Is there anything else I can help you with?', ...stamp(at) },
    { id: id('canned', 2), shortcut: '/shipping', title: 'Shipping times', body: 'Orders ship within 1–2 business days. Delivery takes 3–5 business days in the US.', ...stamp(at) },
    { id: id('canned', 3), shortcut: '/refund', title: 'Refund policy', body: 'You can return any item within 30 days for a full refund. I have sent you a prepaid return label.', ...stamp(at) },
    { id: id('canned', 4), shortcut: '/hours', title: 'Opening hours', body: 'We are open Monday to Saturday, 9:00–18:00.', ...stamp(at) },
  ]
}

export function seedWorkflows(): Workflow[] {
  const f = createFaker(23)
  const cond = (id: string, variable: string, operator: PathCondition['operator'], value: string): PathCondition => ({ id, variable, operator, value })
  const rows: (Omit<Workflow, keyof Entity | 'versions' | 'settings'> & { settings?: Workflow['settings'] })[] = [
    {
      name: 'Welcome series',
      description: 'Greets new subscribers and nudges them to a first purchase.',
      status: 'active',
      trigger: { type: 'added_to_list', config: { listId: 'list-0001' } },
      variables: [{ id: 'v1', key: 'discount_code', value: 'WELCOME10', description: 'First-order discount code' }],
      steps: [
        { id: 's1', type: 'send_email', name: 'Welcome email', note: 'Copy owned by the brand team. Ask Mei before changing the subject line.', config: { template: 'Welcome series — day 1' } },
        {
          id: 's2',
          type: 'wait_for_event',
          name: 'Wait for open',
          config: { event: 'email_opened', timeoutAmount: '2', timeoutUnit: 'days' },
          paths: [
            { id: 'p1', label: 'Event happened', match: 'all', conditions: [], steps: [{ id: 's4', type: 'send_email', name: 'Spring picks', config: { template: 'Spring collection launch' } }] },
            { id: 'p2', label: 'Timed out', match: 'all', conditions: [], isElse: true, steps: [{ id: 's5', type: 'send_sms', name: 'SMS nudge', config: { template: 'Flash sale' } }] },
          ],
        },
        { id: 's6', type: 'goal', config: { goal: 'Places first order' } },
      ],
      version: 3,
      allowReentry: false,
      settings: {
        entry: { match: 'all', conditions: [cond('e1', 'contact.email', 'is_set', '')] },
        exit: { match: 'any', conditions: [cond('x1', 'contact.lifecycle_stage', 'equals', 'customer')] },
        reentryCooldownDays: 0,
        sendWindow: { enabled: false, days: [1, 2, 3, 4, 5], from: '09:00', to: '20:00' },
      },
      stats: { enrolled: 4820, active: 312, completed: 4310, goalReached: 1190 },
    },
    {
      name: 'Abandoned cart recovery',
      description: 'Looks up the cart in the shop, then routes by cart value.',
      status: 'active',
      trigger: { type: 'webhook', config: { event: 'cart.abandoned' } },
      variables: [{ id: 'v1', key: 'shop_api', value: 'https://api.northwind.io/v1', description: 'Shop API base URL' }],
      steps: [
        { id: 's1', type: 'delay', config: { amount: '1', unit: 'hours' } },
        {
          id: 's2',
          type: 'http_request',
          config: {},
          http: {
            method: 'GET',
            url: '{{vars.shop_api}}/carts?email={{contact.email}}',
            headers: [{ id: 'h1', key: 'Authorization', value: 'Bearer {{vars.shop_token}}' }],
            body: '',
            timeoutSeconds: 10,
            saveResponse: [
              { id: 'r1', path: 'data.total', variable: 'cart_total' },
              { id: 'r2', path: 'data.checkout_url', variable: 'checkout_url' },
            ],
            onError: 'stop',
          },
        },
        {
          id: 's3',
          type: 'condition',
          config: {},
          paths: [
            { id: 'p1', label: 'High value (≥ $200)', match: 'all', conditions: [cond('c1', 'vars.cart_total', 'greater_than', '199')], steps: [{ id: 's4', type: 'send_whatsapp', config: { template: 'order_shipped' } }, { id: 's5', type: 'create_task', config: { title: 'Call high-value cart: {{contact.first_name}}', assignee: 'Contact owner' } }] },
            { id: 'p2', label: 'Has checkout link', match: 'all', conditions: [cond('c2', 'vars.checkout_url', 'is_set', '')], steps: [{ id: 's6', type: 'send_email', config: { template: 'Spring collection launch' } }] },
            { id: 'p3', label: 'Else', match: 'all', conditions: [], isElse: true, steps: [] },
          ],
        },
      ],
      version: 2,
      allowReentry: true,
      settings: {
        entry: { match: 'all', conditions: [] },
        exit: { match: 'any', conditions: [cond('x1', 'contact.tags', 'contains', 'purchased')] },
        reentryCooldownDays: 7,
        sendWindow: { enabled: true, days: [0, 1, 2, 3, 4, 5, 6], from: '08:00', to: '21:00' },
      },
      stats: { enrolled: 2210, active: 145, completed: 1980, goalReached: 402 },
    },
    {
      name: 'Lead routing',
      description: 'Routes form leads by country and creates a follow-up task.',
      status: 'active',
      trigger: { type: 'form_submitted', config: { form: 'Book a demo' } },
      variables: [],
      steps: [
        { id: 's1', type: 'update_contact', config: { field: 'lifecycleStage', value: 'lead' } },
        {
          id: 's2',
          type: 'condition',
          config: {},
          paths: [
            { id: 'p1', label: 'Europe', match: 'any', conditions: [cond('c1', 'contact.country', 'equals', 'Germany'), cond('c2', 'contact.country', 'equals', 'France'), cond('c3', 'contact.country', 'equals', 'United Kingdom')], steps: [{ id: 's3', type: 'create_task', config: { title: 'Call new EU lead', assignee: 'Hannah Becker' } }] },
            { id: 'p2', label: 'North America', match: 'any', conditions: [cond('c4', 'contact.country', 'equals', 'United States')], steps: [{ id: 's4', type: 'create_task', config: { title: 'Call new US lead', assignee: 'Daniel Brooks' } }] },
            { id: 'p3', label: 'Else', match: 'all', conditions: [], isElse: true, steps: [{ id: 's5', type: 'add_tag', config: { tag: 'inbound-lead' } }] },
          ],
        },
      ],
      version: 1,
      allowReentry: false,
      stats: { enrolled: 380, active: 0, completed: 380, goalReached: 0 },
    },
    {
      name: 'Birthday offer',
      description: 'A/B tests two birthday offers.',
      status: 'paused',
      trigger: { type: 'date_attribute', config: { attribute: 'birthday' } },
      variables: [],
      steps: [
        {
          id: 's1',
          type: 'ab_split',
          config: {},
          paths: [
            { id: 'p1', label: 'A · email', match: 'all', conditions: [], weight: 50, steps: [{ id: 's2', type: 'send_email', config: { template: 'Black Friday teaser' } }] },
            { id: 'p2', label: 'B · SMS', match: 'all', conditions: [], weight: 50, steps: [{ id: 's3', type: 'send_sms', config: { template: 'Flash sale' } }] },
          ],
        },
      ],
      version: 1,
      allowReentry: true,
      stats: { enrolled: 640, active: 0, completed: 640, goalReached: 88 },
    },
    {
      name: 'Post-purchase review request',
      description: 'Asks for a review 7 days after delivery.',
      status: 'draft',
      trigger: { type: 'tag_added', config: { tag: 'delivered' } },
      variables: [],
      steps: [{ id: 's1', type: 'delay', config: { amount: '7', unit: 'days' } }],
      version: 1,
      allowReentry: false,
      stats: { enrolled: 0, active: 0, completed: 0, goalReached: 0 },
    },
  ]
  return rows.map((row, i) => ({ ...row, settings: row.settings ?? defaultSettings(), versions: [], id: id('workflow', i + 1), ...stamp(f.pastDate(200, 5)) }))
}

export function seedForms(): SignupForm[] {
  const f = createFaker(25)
  const base = [
    { id: 'f1', type: 'email' as const, label: 'Email', attribute: 'email', required: true, options: [] },
    { id: 'f2', type: 'text' as const, label: 'First name', attribute: 'first_name', required: false, options: [] },
  ]
  const rows: Omit<SignupForm, keyof Entity>[] = [
    { name: 'Newsletter signup', type: 'embedded', status: 'published', listId: 'list-0001', doubleOptIn: true, title: 'Get 10% off your first order', description: 'Join 40,000 readers. New arrivals and exclusive offers, once a week.', submitLabel: 'Subscribe', successMessage: 'Check your inbox to confirm your subscription.', fields: base, views: 18420, submissions: 1312 },
    { name: 'Exit-intent popup', type: 'popup', status: 'published', listId: 'list-0001', doubleOptIn: true, title: 'Wait! Don’t miss out', description: 'Free shipping on your first order when you sign up.', submitLabel: 'Claim offer', successMessage: 'Your code is on its way!', fields: base.slice(0, 1), views: 32110, submissions: 1544 },
    { name: 'Book a demo', type: 'landing_page', status: 'published', listId: 'list-0003', doubleOptIn: false, title: 'See BirdCRM in action', description: 'A 30-minute walkthrough tailored to your team.', submitLabel: 'Book my demo', successMessage: 'Thanks! We will email you a calendar link.', fields: [...base, { id: 'f3', type: 'phone', label: 'Phone', attribute: 'phone', required: false, options: [] }, { id: 'f4', type: 'select', label: 'Team size', attribute: 'team_size', required: true, options: ['1-10', '11-50', '51-200', '200+'] }], views: 2804, submissions: 211 },
    { name: 'Webinar registration', type: 'landing_page', status: 'draft', listId: 'list-0004', doubleOptIn: false, title: 'Omnichannel 101 — live webinar', description: 'Thursday 5pm CET. Save your seat.', submitLabel: 'Register', successMessage: 'You are registered! Check your email for the link.', fields: base, views: 0, submissions: 0 },
  ]
  return rows.map((row, i) => ({ ...row, id: id('form', i + 1), ...stamp(f.pastDate(150, 5)) }))
}


export function seedWebhooks(): WebhookEndpoint[] {
  const at = new Date(Date.now() - 40 * 86_400_000).toISOString()
  return [
    { id: id('webhook', 1), url: 'https://api.northwind.io/hooks/birdcrm', description: 'Order system sync', events: ['message.delivered', 'message.failed', 'contact.unsubscribed'], status: 'active', secretPrefix: 'whsec_3fk2', successRate: 99.2, lastDeliveryAt: new Date(Date.now() - 4 * 60_000).toISOString(), ...stamp(at) },
    { id: id('webhook', 2), url: 'https://hooks.zapier.com/hooks/catch/1234/abcd', description: 'Zapier — new leads to Slack', events: ['form.submitted', 'contact.created'], status: 'active', secretPrefix: 'whsec_9pq1', successRate: 87.5, lastDeliveryAt: new Date(Date.now() - 50 * 60_000).toISOString(), ...stamp(at) },
    { id: id('webhook', 3), url: 'https://staging.northwind.io/hooks', description: 'Staging', events: ['message.received'], status: 'disabled', secretPrefix: 'whsec_x81m', successRate: 0, lastDeliveryAt: null, ...stamp(at) },
  ]
}

export function seedDeliveries(): WebhookDelivery[] {
  const f = createFaker(26)
  return Array.from({ length: 50 }, (_, i) => {
    const endpointId = id('webhook', f.int(1, 2))
    const success = f.chance(0.9)
    const event = f.pick(WEBHOOK_EVENTS)
    const at = f.pastDate(3)
    return {
      id: id('delivery', i + 1),
      endpointId,
      event,
      statusCode: success ? 200 : f.pick([500, 502, 404, null]),
      success,
      attempt: success ? 1 : f.int(1, 5),
      durationMs: f.int(40, 1800),
      requestBody: JSON.stringify({ id: `evt_${i}`, type: event, createdAt: at, data: { id: `msg_${f.int(1000, 9999)}` } }, null, 2),
      responseBody: success ? '{"ok":true}' : 'upstream connect error',
      ...stamp(at),
    }
  })
}

export function seedInvoices(): Invoice[] {
  return Array.from({ length: 8 }, (_, i) => {
    const end = new Date()
    end.setMonth(end.getMonth() - i, 1)
    const start = new Date(end)
    start.setMonth(start.getMonth() - 1)
    return {
      id: id('invoice', i + 1),
      number: `INV-2026-${String(120 - i).padStart(4, '0')}`,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      amount: 299 + (i % 3) * 41.5,
      currency: 'USD',
      status: i === 0 ? 'open' : 'paid',
      ...stamp(end.toISOString()),
    }
  })
}

export function seedNotifications(): AppNotification[] {
  const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString()
  const rows: [string, string, AppNotification['type'], string | null, number, boolean][] = [
    ['Campaign completed', '“Webinar invite: Omnichannel 101” finished sending to 8,412 recipients.', 'success', '/campaigns', 12, false],
    ['New conversation assigned', 'Olivia Smith on WhatsApp was assigned to you.', 'info', '/inbox', 35, false],
    ['Instagram disconnected', 'The access token for @northwind expired. Reconnect to keep receiving messages.', 'error', '/channels', 180, false],
    ['WhatsApp template rejected', '“winback_discount” was rejected by Meta.', 'warning', '/templates', 600, true],
    ['Import finished', '1,204 contacts imported to “Webinar attendees”.', 'success', '/contacts', 1440, true],
  ]
  return rows.map(([title, body, type, link, mins, read], i) => ({ id: id('notification', i + 1), title, body, type, link, read, ...stamp(ago(mins)) }))
}

/** Demo: Slack, Google Sheets, HubSpot and Shopify are connected; Teams and Zapier are not. */
export function seedIntegrations(): Integration[] {
  const at = new Date(Date.now() - 40 * 86_400_000).toISOString()
  const rows: [Integration['app'], string | null][] = [
    ['slack', 'Northwind HQ'],
    ['google_sheets', 'ops@northwind.io'],
    ['hubspot', 'Northwind (portal 4823)'],
    ['shopify', 'northwind-shop.myshopify.com'],
    ['teams', null],
    ['zapier', null],
  ]
  return rows.map(([app, account], i) => ({
    id: id('integration', i + 1),
    app,
    status: account ? 'connected' : 'disconnected',
    account,
    connectedBy: account ? 'Ayesha Raza' : null,
    connectedAt: account ? at : null,
    ...stamp(at),
  }))
}

/** The workspace's shared email header and footer, applied to templates that opt in. */
export function seedBrandKit(): BrandKit[] {
  const at = new Date(Date.now() - 60 * 86_400_000).toISOString()
  return [
    {
      id: 'brand-kit',
      header: [{ id: 'bk-h1', type: 'image', content: '/assets/images/email/northwind-logo.svg', alt: 'Northwind Traders', align: 'center', width: 36, padding: 'md' }],
      footer: [
        { id: 'bk-f1', type: 'divider', content: '' },
        { id: 'bk-f2', type: 'social', content: '', align: 'center', links: { facebook: 'https://facebook.com/northwind', instagram: 'https://instagram.com/northwind', linkedin: 'https://linkedin.com/company/northwind' } },
        { id: 'bk-f3', type: 'footer', content: 'Northwind Traders · 100 Market St, San Francisco, CA 94105\nYou receive this because you subscribed at northwind.io · {{unsubscribe_url}}', align: 'center' },
      ],
      design: { accent: '#0f766e', background: '#f1f5f9', paper: '#ffffff', text: '#1f2937', font: 'Inter', radius: 10 },
      whatsappFooter: 'Northwind Traders · Reply STOP to opt out',
      smsPrefix: 'Northwind:',
      ...stamp(at),
    },
  ]
}
