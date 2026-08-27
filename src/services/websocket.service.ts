/**
 * WebSocket client for live call events.
 * Backend: ws://host/api/v1/ws/calls?token=<access_jwt>
 *
 * Publishes backend envelopes:
 * { event, call_id, organization_id, payload, created_at }
 */
import { WS_BASE_URL } from '@/config/env.config'
import { storageService } from '@/services/storage.service'
import { isDemoToken } from '@/constants/auth.constants'

export type WsConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'unavailable'

export type WsEventHandler = (event: string, payload: unknown) => void
export type WsStatusHandler = (status: WsConnectionStatus) => void

export interface CallWsEnvelope {
  event: string
  call_id: number | string
  organization_id?: number
  payload?: Record<string, unknown> | null
  created_at?: string
}

export class WebsocketService {
  private socket: WebSocket | null = null
  private handlers = new Set<WsEventHandler>()
  private statusHandlers = new Set<WsStatusHandler>()
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private path = '/api/v1/ws/calls'
  private intentionalClose = false
  private attempt = 0
  private status: WsConnectionStatus = 'idle'

  getStatus() {
    return this.status
  }

  private setStatus(next: WsConnectionStatus) {
    this.status = next
    this.statusHandlers.forEach((handler) => handler(next))
  }

  connect(path = '/api/v1/ws/calls') {
    this.path = path
    this.intentionalClose = false

    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return
    }

    const token = storageService.getAccessToken()
    if (!token || isDemoToken(token)) {
      this.setStatus('unavailable')
      return
    }

    this.clearReconnect()
    this.setStatus(this.attempt > 0 ? 'reconnecting' : 'connecting')

    const base = WS_BASE_URL.replace(/\/$/, '')
    const normalized = path.startsWith('/') ? path : `/${path}`
    const url = `${base}${normalized}?token=${encodeURIComponent(token)}`

    try {
      this.socket = new WebSocket(url)
    } catch {
      this.socket = null
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this.attempt = 0
      this.setStatus('connected')
      this.clearPing()
      this.pingTimer = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send('ping')
        }
      }, 25000)
    }

    this.socket.onmessage = (message) => {
      const raw = String(message.data)
      if (raw === 'pong' || raw === 'ping') return

      try {
        const parsed = JSON.parse(raw) as CallWsEnvelope & {
          event_type?: string
          type?: string
          data?: unknown
        }
        const event =
          parsed.event ?? parsed.event_type ?? parsed.type ?? 'message'
        const payload = parsed.payload ?? parsed.data ?? parsed
        this.handlers.forEach((handler) => handler(event, { ...parsed, payload }))
      } catch {
        this.handlers.forEach((handler) => handler('message', raw))
      }
    }

    this.socket.onerror = () => {
      // onclose handles reconnect
    }

    this.socket.onclose = () => {
      this.clearPing()
      this.socket = null
      if (this.intentionalClose) {
        this.setStatus('disconnected')
        return
      }
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    this.setStatus('reconnecting')
    this.clearReconnect()
    const delay = Math.min(1000 * 2 ** this.attempt, 15000)
    this.attempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.path)
    }, delay)
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  disconnect() {
    this.intentionalClose = true
    this.clearReconnect()
    this.clearPing()
    this.socket?.close()
    this.socket = null
    this.setStatus('disconnected')
  }

  subscribe(handler: WsEventHandler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  subscribeStatus(handler: WsStatusHandler) {
    this.statusHandlers.add(handler)
    handler(this.status)
    return () => this.statusHandlers.delete(handler)
  }

  send(payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        typeof payload === 'string' ? payload : JSON.stringify(payload),
      )
    }
  }
}

export const websocketService = new WebsocketService()
