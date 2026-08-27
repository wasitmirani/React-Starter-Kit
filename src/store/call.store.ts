import { create } from 'zustand'
import type { LiveCall } from '@/types/call.types'

interface CallUiState {
  liveCalls: LiveCall[]
  selectedLiveCallId: string | null
  isListening: boolean
  setLiveCalls: (calls: LiveCall[]) => void
  selectLiveCall: (id: string | null) => void
  setListening: (value: boolean) => void
  upsertLiveCall: (call: LiveCall) => void
  removeLiveCall: (id: string) => void
}

export const useCallStore = create<CallUiState>((set) => ({
  liveCalls: [],
  selectedLiveCallId: null,
  isListening: false,
  setLiveCalls: (calls) =>
    set((state) => ({
      liveCalls: calls,
      selectedLiveCallId:
        state.selectedLiveCallId && calls.some((c) => c.id === state.selectedLiveCallId)
          ? state.selectedLiveCallId
          : (calls[0]?.id ?? null),
    })),
  selectLiveCall: (id) => set({ selectedLiveCallId: id }),
  setListening: (value) => set({ isListening: value }),
  upsertLiveCall: (call) =>
    set((state) => {
      const exists = state.liveCalls.some((c) => c.id === call.id)
      return {
        liveCalls: exists
          ? state.liveCalls.map((c) => (c.id === call.id ? call : c))
          : [call, ...state.liveCalls],
      }
    }),
  removeLiveCall: (id) =>
    set((state) => ({
      liveCalls: state.liveCalls.filter((c) => c.id !== id),
      selectedLiveCallId:
        state.selectedLiveCallId === id ? null : state.selectedLiveCallId,
    })),
}))
