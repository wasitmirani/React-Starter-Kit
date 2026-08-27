import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/config/env.config'

export type BackendReadyState = 'checking' | 'online' | 'offline'

export function useBackendReady() {
  const [status, setStatus] = useState<BackendReadyState>('checking')
  const [detail, setDetail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const root = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

    void (async () => {
      try {
        const res = await fetch(`${root}/health`, { signal: AbortSignal.timeout(4000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = (await res.json()) as { status?: string; version?: string }
        if (!cancelled) {
          setStatus('online')
          setDetail(body.version ? `API v${body.version}` : 'API connected')
        }
      } catch {
        if (!cancelled) {
          setStatus('offline')
          setDetail(
            'Start backend: cd ai-crm-backend → uvicorn app.main:app --reload --port 8000',
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { status, detail }
}
