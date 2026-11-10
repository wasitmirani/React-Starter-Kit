import { latency } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { ChannelAccount, SenderDomain } from '@/types/channel.types'

const call = callFor('channels')

export interface ConnectAccountInput {
  channel: ChannelAccount['channel']
  name: string
  provider: string
  identifier: string
  /** Sent once, verified with the provider and stored encrypted; never returned. */
  credentials: Record<string, string>
}

export const channelAccountsApi = {
  ...createResourceApi('/channel-accounts', db.channelAccounts),
  /** Adds an account. The server checks the credentials with the provider first. */
  connect: ({ credentials, ...input }: ConnectAccountInput) =>
    call<ChannelAccount>(
      async () => {
        await latency(500, 900)
        // The demo never keeps credentials.
        return db.channelAccounts.create({ ...input, status: 'connected', statusDetail: null, throughput: null, quality: null, isDefault: db.channelAccounts.rows().every((a) => a.channel !== input.channel) })
      },
      () => http.post('/channel-accounts', { ...input, credentials }),
    ),
  /** Gmail / Outlook: the sign-in URL to open; the provider redirects back to the Email page. */
  startOAuth: (provider: 'gmail' | 'outlook', name: string) =>
    call<{ url: string }>(
      async () => {
        throw new Error('Signing in with Google or Microsoft needs the live backend.')
      },
      () => http.post(`/channel-accounts/oauth/${provider}/start`, { name }),
    ),
  /** Re-runs the provider health check (token validity, number status). */
  check: (id: string) =>
    call<ChannelAccount>(
      async () => {
        await latency(500, 900)
        return db.channelAccounts.find(id)
      },
      () => http.post(`/channel-accounts/${id}/check`),
    ),
}

export const domainsApi = {
  ...createResourceApi('/sender-domains', db.domains),
  /** Looks up the DNS records again. */
  verify: (id: string) =>
    call<SenderDomain>(
      async () => {
        await latency(700, 1200)
        const domain = db.domains.find(id)
        const records = domain.records.map((r) => (r.status === 'pending' && Math.random() > 0.5 ? { ...r, status: 'verified' as const } : r))
        const status = records.every((r) => r.status === 'verified') ? 'verified' : records.some((r) => r.status === 'failed') ? 'failed' : 'pending'
        return db.domains.update(id, { records, status, lastCheckedAt: new Date().toISOString() })
      },
      () => http.post(`/sender-domains/${id}/verify`),
    ),
}

export const sendersApi = createResourceApi('/email-senders', db.senders)
export const numbersApi = createResourceApi('/phone-numbers', db.numbers)
export const callsApi = createResourceApi('/calls', db.calls)
export const ivrApi = createResourceApi('/ivr-menus', db.ivr)
export const widgetsApi = createResourceApi('/livechat-widgets', db.widgets)
