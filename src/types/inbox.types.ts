import type { Channel } from './channel.types'
import type { Entity } from './common.types'

export type ConversationStatus = 'open' | 'pending' | 'snoozed' | 'resolved'
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Conversation extends Entity {
  contactId: string | null
  contactName: string
  /** Address on the channel: email, phone or handle. */
  contactHandle: string
  channel: Channel
  subject: string | null
  status: ConversationStatus
  priority: ConversationPriority
  assigneeName: string | null
  teamName: string | null
  unreadCount: number
  lastMessagePreview: string
  lastMessageAt: string
  tags: string[]
  /** WhatsApp customer-service window: free-form replies allowed until this time. */
  windowExpiresAt: string | null
}

export interface ConversationMessage extends Entity {
  conversationId: string
  direction: 'inbound' | 'outbound'
  kind: 'message' | 'note' | 'event'
  body: string
  authorName: string
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | null
  attachments: { name: string; size: number }[]
  at: string
}

export interface CannedReply extends Entity {
  shortcut: string
  title: string
  body: string
}
