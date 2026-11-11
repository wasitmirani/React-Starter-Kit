import { env } from '@/config/env.config'

/**
 * Realtime connection to the API (`/realtime`) with the browser's native WebSocket.
 * Authenticates in the first message (no token in the URL), reconnects with
 * backoff, and reports changed collections; the app refetches through the API.
 */
export interface RealtimeChange {
  collection: string
  /** Changed row ids, or null when many rows changed. */
  ids: string[] | null
}

export type RealtimeStatus = 'connecting' | 'live' | 'offline'

interface Options {
  getToken: () => string | null
  tenantId: string
  onChanges: (changes: RealtimeChange[]) => void
  onStatus?: (status: RealtimeStatus) => void
}

/** `http://host:8888/api/v1` → `ws://host:8888/realtime`. */
export function realtimeUrl(apiBase = env.apiBaseUrl) {
  const url = new URL(apiBase, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/realtime'
  url.search = ''
  return url.toString()
}

const MAX_BACKOFF = 30_000

export function connectRealtime({ getToken, tenantId, onChanges, onStatus }: Options) {
  let socket: WebSocket | null = null
  let attempt = 0
  let stopped = false
  let retry: number | undefined

  const status = (s: RealtimeStatus) => onStatus?.(s)

  const open = () => {
    if (stopped) return
    const token = getToken()
    if (!token) return schedule()
    status('connecting')
    socket = new WebSocket(realtimeUrl())
    socket.onopen = () => socket?.send(JSON.stringify({ type: 'auth', token, tenantId }))
    socket.onmessage = (ev) => {
      let msg: { type?: string; events?: RealtimeChange[] }
      try {
        msg = JSON.parse(String(ev.data))
      } catch {
        return
      }
      if (msg.type === 'ready') {
        attempt = 0
        status('live')
        // Anything may have changed while we were away: refresh what is on screen.
        if (wasOffline) onChanges([{ collection: '*', ids: null }])
        wasOffline = false
      } else if (msg.type === 'changes' && msg.events) {
        onChanges(msg.events)
      }
    }
    socket.onclose = () => {
      socket = null
      wasOffline = true
      status('offline')
      schedule()
    }
    socket.onerror = () => socket?.close()
  }
  let wasOffline = false

  /** Exponential backoff with jitter: 1 s, 2 s, 4 s … up to 30 s. */
  const schedule = () => {
    if (stopped) return
    const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** attempt) * (0.75 + Math.random() * 0.5)
    attempt += 1
    retry = window.setTimeout(open, delay)
  }

  // Reconnect at once when the tab comes back or the network returns.
  const wake = () => {
    if (!socket && !stopped && document.visibilityState === 'visible') {
      window.clearTimeout(retry)
      attempt = 0
      open()
    }
  }
  window.addEventListener('online', wake)
  document.addEventListener('visibilitychange', wake)

  open()
  return () => {
    stopped = true
    window.clearTimeout(retry)
    window.removeEventListener('online', wake)
    document.removeEventListener('visibilitychange', wake)
    socket?.close()
  }
}

/** Server collection → the app's query-cache resources to refresh. */
export const COLLECTION_KEYS: Record<string, string[]> = {
  orders: ['orders', 'dashboard', 'reservations'],
  customers: ['customers'],
  products: ['products'],
  channels: ['channels'],
  'inventory/balances': ['balances', 'dashboard'],
  'inventory/ledger': ['ledger'],
  'inventory/reservations': ['reservations', 'balances'],
  'inventory/adjustments': ['adjustments', 'balances'],
  'inventory/transfers': ['transfers', 'balances'],
  'inventory/stock-counts': ['stock-counts'],
  'warehouse/tasks': ['tasks', 'dashboard'],
  'warehouse/receipts': ['receipts'],
  'warehouse/pick-waves': ['waves'],
  'warehouse/packing-sessions': ['packing'],
  'warehouse/dispatch-batches': ['dispatch'],
  'purchase-orders': ['purchase-orders'],
  shipments: ['shipments', 'orders', 'dashboard'],
  returns: ['returns'],
  'sync-jobs': ['sync-jobs'],
  'failed-events': ['failed-events'],
  'automation/executions': ['automation-runs'],
  notifications: ['notifications'],
  'webhook-endpoints': ['webhooks'],
  'webhook-deliveries': ['webhooks'],
  'billing/subscription': ['billing'],
}
