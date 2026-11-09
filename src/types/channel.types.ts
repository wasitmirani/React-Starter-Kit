import type { Entity } from './common.types'

/** Every channel the platform can send on or receive from. */
export type Channel =
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'voice'
  | 'push'
  | 'rcs'
  | 'livechat'
  | 'instagram'
  | 'messenger'
  | 'telegram'

export type ConnectionStatus = 'connected' | 'pending' | 'error' | 'disconnected'

export interface ChannelAccount extends Entity {
  channel: Channel
  name: string
  provider: string
  /** Phone number, domain, page name… whatever identifies the account. */
  identifier: string
  status: ConnectionStatus
  statusDetail: string | null
  /** Messages per second allowed by the provider for this account. */
  throughput: number | null
  /** WhatsApp quality rating, SMS sender reputation… */
  quality: 'high' | 'medium' | 'low' | null
  isDefault: boolean
}

export type DnsRecordStatus = 'verified' | 'pending' | 'failed'

export interface DnsRecord {
  type: 'TXT' | 'CNAME' | 'MX'
  purpose: 'spf' | 'dkim' | 'dmarc' | 'tracking' | 'return_path'
  host: string
  value: string
  status: DnsRecordStatus
}

export interface SenderDomain extends Entity {
  domain: string
  status: DnsRecordStatus
  records: DnsRecord[]
  lastCheckedAt: string | null
}

export interface EmailSender extends Entity {
  name: string
  email: string
  replyTo: string | null
  verified: boolean
  isDefault: boolean
}

export type NumberCapability = 'sms' | 'voice' | 'whatsapp' | 'mms'

export interface PhoneNumber extends Entity {
  number: string
  country: string
  type: 'local' | 'mobile' | 'toll_free' | 'short_code' | 'alphanumeric'
  capabilities: NumberCapability[]
  status: 'active' | 'pending' | 'released'
  provider: string
  monthlyCost: number
  label: string
}

export type CallStatus = 'completed' | 'no_answer' | 'busy' | 'failed' | 'in_progress' | 'voicemail'

export interface Call extends Entity {
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  contactName: string | null
  agentName: string | null
  status: CallStatus
  durationSec: number
  recorded: boolean
  cost: number
  startedAt: string
}

export interface IvrMenu extends Entity {
  name: string
  numberId: string | null
  greeting: string
  options: { digit: string; label: string; action: 'queue' | 'agent' | 'voicemail' | 'submenu' | 'hangup'; target: string }[]
  businessHours: { days: string; open: string; close: string; timezone: string }
}

export interface LiveChatWidget extends Entity {
  name: string
  domain: string
  color: string
  position: 'right' | 'left'
  greeting: string
  awayMessage: string
  collectEmail: boolean
  showAgentPhotos: boolean
  status: 'active' | 'disabled'
}
