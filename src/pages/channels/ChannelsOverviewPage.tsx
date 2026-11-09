import { useState } from 'react'
import { Link } from 'react-router-dom'
import { channelAccountsApi } from '@/api/endpoints/channels.api'
import { PageHeader } from '@/components/common/PageHeader'
import { ConnectChannelModal } from '@/components/features/channels/ChannelAccounts'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNEL_KEYS, CHANNELS } from '@/constants/channels.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import type { Channel } from '@/types/channel.types'

const DETAIL_ROUTE: Partial<Record<Channel, string>> = {
  email: ROUTES.CHANNEL_EMAIL,
  sms: ROUTES.CHANNEL_SMS,
  whatsapp: ROUTES.CHANNEL_WHATSAPP,
  voice: ROUTES.CHANNEL_VOICE,
  livechat: ROUTES.CHANNEL_LIVECHAT,
}

export function ChannelsOverviewPage() {
  const accounts = useAll('channel-accounts', channelAccountsApi.list)
  const [connecting, setConnecting] = useState<Channel | null>(null)
  const byChannel = (ch: Channel) => (accounts.data?.data ?? []).filter((a) => a.channel === ch)
  const problems = (accounts.data?.data ?? []).filter((a) => a.status === 'error')

  return (
    <>
      <PageHeader title="Channels" description="Connect the providers you send and receive messages through. Each workspace uses its own accounts." />
      {problems.map((a) => (
        <div key={a.id} className="alert alert-danger d-flex align-items-center gap-2">
          <i className="ri-error-warning-line" />
          <span className="flex-1"><strong>{a.name}</strong> ({CHANNELS[a.channel].label}): {a.statusDetail}</span>
          <button type="button" className="btn btn-sm btn-danger" onClick={() => setConnecting(a.channel)}>Reconnect</button>
        </div>
      ))}
      {accounts.isLoading ? (
        <SkeletonLines lines={8} />
      ) : (
        <div className="row g-4">
          {CHANNEL_KEYS.map((ch) => {
            const meta = CHANNELS[ch]
            const list = byChannel(ch)
            const connected = list.filter((a) => a.status === 'connected').length
            const status = list.length === 0 ? null : list.some((a) => a.status === 'error') ? 'error' : connected ? 'connected' : 'pending'
            const detail = DETAIL_ROUTE[ch]
            return (
              <div key={ch} className="col-md-6 col-xl-4">
                <div className="card h-100 mb-0">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <span className={`icon-tile icon-tile-lg bg-${meta.tone}-subtle text-${meta.tone}`}><i className={meta.icon} /></span>
                      <div className="flex-1">
                        <h6 className="mb-1">{meta.label}</h6>
                        {status ? <StatusBadge status={status} label={status === 'connected' ? `${connected} connected` : undefined} /> : <span className="text-muted fs-sm">Not connected</span>}
                      </div>
                    </div>
                    <p className="text-muted fs-sm flex-1">{meta.description}</p>
                    <div className="d-flex gap-2">
                      {detail && <Link to={detail} className="btn btn-light btn-sm">Manage</Link>}
                      {ch !== 'livechat' && <button type="button" className={`btn btn-sm ${list.length ? 'btn-light' : 'btn-primary'}`} onClick={() => setConnecting(ch)}>{list.length ? 'Add account' : 'Connect'}</button>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {connecting && <ConnectChannelModal channel={connecting} open onClose={() => setConnecting(null)} />}
    </>
  )
}
