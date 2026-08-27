import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { callsService } from '@/services/calls.service'
import { useCallStore } from '@/store/call.store'
import { ROUTES } from '@/constants/routes.constants'
import {
  websocketService,
  type WsConnectionStatus,
} from '@/services/websocket.service'
import { liveCallFromWsEvent } from '@/lib/live-call-events'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function statusLabel(status: WsConnectionStatus) {
  switch (status) {
    case 'connected':
      return 'WebSocket live'
    case 'connecting':
      return 'Connecting…'
    case 'reconnecting':
      return 'Reconnecting… polling fallback'
    case 'unavailable':
      return 'WebSocket unavailable · polling'
    case 'disconnected':
      return 'Disconnected · polling'
    default:
      return 'Polling for updates'
  }
}

export function LiveCallsPage() {
  const queryClient = useQueryClient()
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>(
    websocketService.getStatus(),
  )
  const {
    liveCalls,
    setLiveCalls,
    selectedLiveCallId,
    selectLiveCall,
    upsertLiveCall,
    removeLiveCall,
  } = useCallStore()

  const wsLive = wsStatus === 'connected'
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['calls', 'live'],
    queryFn: () => callsService.live(),
    // Slow poll while WS is healthy; faster when falling back.
    refetchInterval: wsLive ? 30000 : 5000,
  })

  useEffect(() => {
    if (data?.success && data.data) setLiveCalls(data.data)
  }, [data, setLiveCalls])

  useEffect(() => {
    websocketService.connect('/api/v1/ws/calls')
    const unsubStatus = websocketService.subscribeStatus(setWsStatus)
    const unsub = websocketService.subscribe((event, payload) => {
      const existing = useCallStore
        .getState()
        .liveCalls.find((c) => {
          const envelope = payload as { call_id?: string | number }
          return c.id === String(envelope.call_id ?? '')
        })
      const mapped = liveCallFromWsEvent(event, payload, existing)
      if (!mapped) return
      if (mapped.kind === 'end') {
        removeLiveCall(mapped.id)
        void queryClient.invalidateQueries({ queryKey: ['calls'] })
        return
      }
      upsertLiveCall(mapped.call)
    })

    return () => {
      unsub()
      unsubStatus()
      websocketService.disconnect()
    }
  }, [upsertLiveCall, removeLiveCall, queryClient])

  const endMutation = useMutation({
    mutationFn: (id: string) => callsService.end(id),
    onSuccess: (_res, id) => {
      removeLiveCall(id)
      void refetch()
    },
  })

  const selected = liveCalls.find((c) => c.id === selectedLiveCallId) ?? liveCalls[0]

  return (
    <>
      <BreadCrumb
        activePage="Live Calls"
        breadcrumbs={[{ label: 'Calls', href: ROUTES.CALLS }]}
      />

      <div className="box mb-3">
        <div className="box-header flex items-center justify-between flex-wrap gap-2">
          <div className="box-title">Active Calls</div>
          <div className="flex items-center gap-2">
            <span
              className={`badge ${
                wsLive
                  ? 'bg-success-transparent'
                  : wsStatus === 'reconnecting' || wsStatus === 'connecting'
                    ? 'bg-warning-transparent'
                    : 'bg-secondary-transparent'
              }`}
            >
              {statusLabel(wsStatus)}
            </span>
            <button
              type="button"
              className="ti-btn ti-btn-outline-primary ti-btn-sm"
              onClick={() => void refetch()}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="box-body">
          {isError && <p className="text-danger">Failed to load live calls.</p>}
          {isLoading && liveCalls.length === 0 && (
            <p className="text-textmuted mb-0">Connecting…</p>
          )}
          {!isLoading && liveCalls.length === 0 && (
            <p className="text-textmuted mb-0">No active calls right now.</p>
          )}

          <div className="grid grid-cols-12 gap-4">
            <div className="xl:col-span-5 col-span-12">
              <div className="space-y-2">
                {liveCalls.map((call) => (
                  <button
                    key={call.id}
                    type="button"
                    className={`w-full text-start p-3 rounded border ${
                      selected?.id === call.id
                        ? 'border-primary bg-primary-transparent'
                        : 'border-defaultborder'
                    }`}
                    onClick={() => selectLiveCall(call.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{call.caller}</div>
                      <span className="badge bg-success-transparent">{call.status}</span>
                    </div>
                    <div className="text-textmuted fs-12 mt-1">
                      {call.agentName} · {formatDuration(call.durationSec)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="xl:col-span-7 col-span-12">
              <div className="box mb-0">
                <div className="box-header">
                  <div className="box-title">Current Transcript</div>
                </div>
                <div className="box-body">
                  {selected ? (
                    <>
                      <pre className="mb-3 whitespace-pre-wrap font-sans">
                        {selected.currentTranscript || 'Waiting for transcript…'}
                      </pre>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="ti-btn ti-btn-outline-danger ti-btn-sm"
                          disabled={endMutation.isPending}
                          onClick={() => endMutation.mutate(selected.id)}
                        >
                          End Call
                        </button>
                        <button
                          type="button"
                          className="ti-btn ti-btn-outline-light ti-btn-sm"
                          title="Listen-in requires WebRTC media from the backend"
                          disabled
                        >
                          Listen In
                        </button>
                      </div>
                      <p className="text-textmuted fs-12 mt-3 mb-0">
                        {wsLive
                          ? 'Streaming live events over WebSocket. Polling every 30s as a safety net.'
                          : 'WebSocket not connected — polling every 5s until the socket recovers.'}
                      </p>
                    </>
                  ) : (
                    <p className="text-textmuted mb-0">Select a live call.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
