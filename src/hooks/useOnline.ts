import { useSyncExternalStore } from 'react'

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/** Browser connection state; stock-changing scanner actions are blocked while offline. */
export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
}
