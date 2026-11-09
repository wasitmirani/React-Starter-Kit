/** Event types an outbound webhook endpoint can subscribe to. */
export const WEBHOOK_EVENTS = [
  'message.sent', 'message.delivered', 'message.failed', 'message.received', 'contact.created', 'contact.updated',
  'contact.unsubscribed', 'campaign.completed', 'conversation.created', 'conversation.resolved', 'call.completed', 'form.submitted',
] as const
