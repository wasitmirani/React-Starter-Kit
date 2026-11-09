import { offlineDemo } from '@/api/mock/offline-demo'

/** Shown while the demo runs without a backend, so nobody mistakes it for live data. */
export function OfflineDemoBanner() {
  if (!offlineDemo.isActive()) return null
  return (
    <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-4" role="status">
      <i className="ri-wifi-off-line" />
      <span className="flex-1">
        <strong>Offline demo.</strong> The backend is not connected, so everything runs and is saved in this browser only. Sign out and back in once the server is running to use real data.
      </span>
    </div>
  )
}
