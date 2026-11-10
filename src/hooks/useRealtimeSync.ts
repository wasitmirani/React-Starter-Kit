import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import { isLive } from '@/api/resource'
import { COLLECTION_KEYS, connectRealtime, type RealtimeStatus } from '@/lib/realtime'
import { storageService } from '@/services/storage.service'
import { useAuthStore } from '@/store/auth.store'

/** Connection state for the "Live" indicator. */
export const useRealtimeStatus = create<{ status: RealtimeStatus | 'off'; set: (s: RealtimeStatus | 'off') => void }>((set) => ({
  status: 'off',
  set: (status) => set({ status }),
}))

/** How long changes are collected before refetching (a campaign can change thousands of rows). */
const BATCH_MS = 250

/**
 * Keeps the open workspace live: server change events refresh the matching
 * cached queries (lists, details, counts), so other people's and the system's
 * changes (new inbox messages, delivery statuses, automation runs) appear without
 * reloading. Mount once, in the app layout.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const tenantId = useAuthStore((s) => s.currentTenantId)
  const setStatus = useRealtimeStatus((s) => s.set)

  useEffect(() => {
    // The offline demo and mocked modules have no server to listen to.
    if (!tenantId || !isLive('crm')) {
      setStatus('off')
      return
    }
    const pending = new Set<string>()
    let timer: number | undefined
    const flush = () => {
      timer = undefined
      const all = pending.has('*')
      for (const resource of all ? [] : pending) {
        void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, resource] })
      }
      if (all) void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
      pending.clear()
    }
    const disconnect = connectRealtime({
      tenantId,
      getToken: () => storageService.getAccessToken(),
      onStatus: setStatus,
      onChanges: (changes) => {
        for (const c of changes) {
          if (c.collection === '*') pending.add('*')
          for (const key of COLLECTION_KEYS[c.collection] ?? []) pending.add(key)
        }
        if (pending.size && timer === undefined) timer = window.setTimeout(flush, BATCH_MS)
      },
    })
    return () => {
      window.clearTimeout(timer)
      disconnect()
      setStatus('off')
    }
  }, [tenantId, queryClient, setStatus])
}
