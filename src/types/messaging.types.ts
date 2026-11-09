import type { Channel } from './channel.types'
import type { Entity } from './common.types'

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'

export interface CampaignStats {
  recipients: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  unsubscribed: number
  failed: number
  revenue: number
}

export interface CampaignAudience {
  listIds: string[]
  segmentIds: string[]
  excludeListIds: string[]
}

export interface CampaignSchedule {
  type: 'now' | 'scheduled' | 'best_time'
  at: string | null
  timezone: string
  respectQuietHours: boolean
}

export interface Campaign extends Entity {
  name: string
  channel: Channel
  status: CampaignStatus
  senderAccountId: string | null
  senderLabel: string | null
  subject: string | null
  previewText: string | null
  templateId: string | null
  body: string
  audience: CampaignAudience
  schedule: CampaignSchedule
  abTest: { enabled: boolean; variantSubject: string; splitPercent: number; winnerMetric: 'open' | 'click' } | null
  tags: string[]
  stats: CampaignStats
  sentAt: string | null
}

export type TemplateCategory = 'marketing' | 'transactional' | 'utility' | 'authentication'
export type TemplateStatus = 'draft' | 'active' | 'pending' | 'approved' | 'rejected'

export type EmailBlockType = 'heading' | 'text' | 'button' | 'image' | 'divider' | 'spacer' | 'social' | 'footer' | 'html'

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube'

export interface EmailBlock {
  id: string
  type: EmailBlockType
  content: string
  /** Button/image link. */
  href?: string
  align?: 'left' | 'center' | 'right'
  /** Heading size. */
  level?: 1 | 2 | 3
  /** Text size in px. */
  size?: number
  /** Text colour, or the fill of a button. Defaults to the design. */
  color?: string
  /** Button label colour. */
  textColor?: string
  /** Button spans the content width. */
  fullWidth?: boolean
  /** Image width as a percentage of the content width. */
  width?: number
  /** Image alt text (shown when images are blocked, read by screen readers). */
  alt?: string
  /** Spacer height in px. */
  height?: number
  links?: Partial<Record<SocialNetwork, string>>
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Block background. */
  bg?: string
}

/** Look of an email: brand colour, canvas and content background, font and corner radius. */
export interface EmailDesign {
  accent: string
  background: string
  paper: string
  text: string
  font: 'Inter' | 'Helvetica' | 'Georgia' | 'Trebuchet MS'
  radius: number
}

export interface WhatsAppButton {
  id: string
  type: 'quick_reply' | 'url' | 'phone'
  text: string
  /** URL or phone number. */
  value?: string
}

/** Header, footer and buttons of a WhatsApp template (the body is `Template.body`). */
export interface WhatsAppParts {
  headerType: 'none' | 'text' | 'image'
  /** Header text, or image URL when `headerType` is `image`. */
  header: string
  footer: string
  buttons: WhatsAppButton[]
}

export interface Template extends Entity {
  name: string
  channel: Channel
  category: TemplateCategory
  status: TemplateStatus
  language: string
  subject: string | null
  /** Plain body for SMS/WhatsApp; generated text for email. */
  body: string
  blocks: EmailBlock[]
  /** `{{first_name}}` style placeholders found in the content. */
  variables: string[]
  rejectionReason: string | null
  /** Sample value per placeholder, shown in previews and sent to Meta for review. */
  examples?: Record<string, string>
  /** Email: inbox preview line shown after the subject. */
  previewText?: string
  /** Email: brand look. */
  design?: EmailDesign
  whatsapp?: WhatsAppParts
  /** Push: tap target and optional big picture. */
  push?: { url: string; image: string }
  /** Email: build with blocks (default) or write the whole email as HTML. */
  editor?: 'blocks' | 'html'
  /** Email in HTML mode: the full document. */
  html?: string
  /** Email: wrap the content in the workspace brand header / footer (blocks mode). */
  brandHeader?: boolean
  brandFooter?: boolean
}

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced' | 'unknown' | 'received'

export interface MessageEvent {
  status: MessageStatus | 'opened' | 'clicked' | 'accepted' | 'retrying'
  at: string
  detail: string | null
}

export interface MessageLog extends Entity {
  channel: Channel
  direction: 'outbound' | 'inbound'
  to: string
  from: string
  contactName: string | null
  subject: string | null
  preview: string
  status: MessageStatus
  provider: string
  /** SMS segments. */
  segments: number | null
  cost: number
  campaignId: string | null
  campaignName: string | null
  errorCode: string | null
  events: MessageEvent[]
}

/** Workspace-wide header, footer and defaults shared by every template that opts in. */
export interface BrandKit extends Entity {
  header: EmailBlock[]
  footer: EmailBlock[]
  design: EmailDesign
  /** Default footer for new WhatsApp templates. */
  whatsappFooter: string
  /** Sender prefix suggested for SMS, e.g. "Northwind:". */
  smsPrefix: string
}
