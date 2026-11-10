import { AppError } from '@/api/errors'
import { latency, nowIso } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { Conversation, ConversationMessage } from '@/types/inbox.types'

const call = callFor('inbox')

export interface ReplyInput {
  body: string
  /** `note` is internal and never sent to the contact. */
  kind: 'message' | 'note'
  authorName: string
  attachments?: { name: string; size: number }[]
}

export interface InboxCounts {
  mine: number
  unassigned: number
  open: number
  pending: number
  snoozed: number
  resolved: number
  byChannel: Partial<Record<Conversation['channel'], number>>
}

const conversations = createResourceApi('/conversations', db.conversations)

export const inboxApi = {
  ...conversations,

  counts: (me: string) =>
    call<InboxCounts>(
      async () => {
        await latency(60, 150)
        const rows = db.conversations.rows()
        const open = rows.filter((c) => c.status === 'open')
        const byChannel: InboxCounts['byChannel'] = {}
        for (const c of open) byChannel[c.channel] = (byChannel[c.channel] ?? 0) + 1
        return {
          mine: open.filter((c) => c.assigneeName === me).length,
          unassigned: open.filter((c) => !c.assigneeName).length,
          open: open.length,
          pending: rows.filter((c) => c.status === 'pending').length,
          snoozed: rows.filter((c) => c.status === 'snoozed').length,
          resolved: rows.filter((c) => c.status === 'resolved').length,
          byChannel,
        }
      },
      () => http.get('/conversations/counts'),
    ),

  messages: (conversationId: string) =>
    call<ConversationMessage[]>(
      async () => {
        await latency(80, 200)
        return db.conversationMessages
          .query({ sort: 'at', order: 'asc' })
          .filter((m) => m.conversationId === conversationId)
      },
      () => http.get(`/conversations/${conversationId}/messages`),
    ),

  /** Opening a conversation clears its unread badge. */
  markRead: (conversationId: string) =>
    call(() => db.conversations.update(conversationId, { unreadCount: 0 }), () => http.post<Conversation>(`/conversations/${conversationId}/read`)),

  reply: (conversationId: string, input: ReplyInput) =>
    call<ConversationMessage>(
      async () => {
        const conversation = db.conversations.find(conversationId)
        const windowClosed =
          conversation.channel === 'whatsapp' &&
          conversation.windowExpiresAt !== null &&
          Date.parse(conversation.windowExpiresAt) < Date.now()
        if (input.kind === 'message' && windowClosed) {
          throw new AppError(422, 'WHATSAPP_WINDOW_CLOSED', 'The 24-hour window has closed. Send an approved template instead.')
        }
        const at = nowIso()
        const message = await db.conversationMessages.create({
          conversationId,
          direction: 'outbound',
          kind: input.kind,
          body: input.body,
          authorName: input.authorName,
          status: input.kind === 'note' ? null : 'sent',
          attachments: input.attachments ?? [],
          at,
        })
        if (input.kind === 'message') {
          await db.conversations.update(conversationId, {
            lastMessagePreview: input.body,
            lastMessageAt: at,
            status: conversation.status === 'resolved' ? 'open' : conversation.status,
          })
        }
        return message
      },
      () => http.post(`/conversations/${conversationId}/messages`, input),
    ),
}

export const cannedRepliesApi = createResourceApi('/canned-replies', db.cannedReplies)
