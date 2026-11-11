/** Event types an outbound webhook endpoint can subscribe to (LinqWorks Direct callbacks). */
export const WEBHOOK_EVENTS = [
  'order.accepted', 'order.on_hold', 'order.partially_fulfilled', 'order.dispatched', 'order.delivered', 'order.cancelled',
  'shipment.tracking_updated', 'inventory.available_changed', 'return.received', 'return.completed',
] as const
