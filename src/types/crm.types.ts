import type { Channel } from './channel.types'
import type { Entity } from './common.types'

export type ConsentStatus = 'subscribed' | 'unsubscribed' | 'pending' | 'none'
export type LifecycleStage = 'subscriber' | 'lead' | 'qualified' | 'customer' | 'churned'
export type ContactSource = 'manual' | 'import' | 'form' | 'api' | 'inbound' | 'integration'

export interface Contact extends Entity {
  firstName: string
  lastName: string
  email: string | null
  /** E.164, e.g. +14155550123 */
  phone: string | null
  companyId: string | null
  companyName: string | null
  jobTitle: string | null
  country: string | null
  city: string | null
  lifecycleStage: LifecycleStage
  source: ContactSource
  ownerName: string | null
  score: number
  tags: string[]
  listIds: string[]
  consents: Partial<Record<'email' | 'sms' | 'whatsapp', ConsentStatus>>
  blocklisted: boolean
  attributes: Record<string, string | number | boolean | null>
  lastActivityAt: string | null
}

export interface ContactList extends Entity {
  name: string
  description: string
  folder: string
  contactCount: number
}

export type SegmentOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_set'
  | 'is_not_set'
  | 'greater_than'
  | 'less_than'
  | 'in_list'
  | 'not_in_list'
  | 'has_tag'
  | 'within_days'

export interface SegmentRule {
  id: string
  field: string
  operator: SegmentOperator
  value: string
}

export interface SegmentRuleGroup {
  match: 'all' | 'any'
  rules: SegmentRule[]
}

export interface Segment extends Entity {
  name: string
  description: string
  rules: SegmentRuleGroup
  contactCount: number
  lastComputedAt: string | null
}

export type AttributeType = 'text' | 'number' | 'date' | 'boolean' | 'select'

export interface ContactAttribute extends Entity {
  key: string
  label: string
  type: AttributeType
  options: string[]
  system: boolean
}

export type ActivityType =
  | 'message_sent'
  | 'message_delivered'
  | 'message_opened'
  | 'message_clicked'
  | 'message_received'
  | 'call'
  | 'note'
  | 'form_submitted'
  | 'deal_updated'
  | 'tag_added'
  | 'unsubscribed'
  | 'created'

export interface Activity extends Entity {
  contactId: string
  type: ActivityType
  channel: Channel | null
  title: string
  description: string
  at: string
}

export interface Company extends Entity {
  name: string
  domain: string
  industry: string
  size: string
  country: string
  ownerName: string
  contactCount: number
  openDealsValue: number
}

export interface PipelineStage {
  id: string
  name: string
  probability: number
}

export interface Pipeline extends Entity {
  name: string
  stages: PipelineStage[]
}

export type DealStatus = 'open' | 'won' | 'lost'

export interface Deal extends Entity {
  title: string
  value: number
  currency: string
  pipelineId: string
  stageId: string
  status: DealStatus
  companyId: string | null
  companyName: string | null
  contactId: string | null
  contactName: string | null
  ownerName: string
  expectedCloseDate: string | null
}

export type TaskType = 'todo' | 'call' | 'email' | 'meeting'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task extends Entity {
  title: string
  type: TaskType
  priority: TaskPriority
  dueAt: string | null
  done: boolean
  assigneeName: string
  related: { type: 'contact' | 'company' | 'deal'; id: string; name: string } | null
  notes: string
}

export interface ImportJob extends Entity {
  fileName: string
  status: 'processing' | 'completed' | 'failed'
  totalRows: number
  created: number
  updated: number
  skipped: number
  listId: string | null
}
