import { useState } from 'react'
import { Link } from 'react-router-dom'
import { numbersApi } from '@/api/endpoints/channels.api'
import { templatesApi } from '@/api/endpoints/messaging.api'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ChannelAccountsPanel } from '@/components/features/channels/ChannelAccounts'
import { Switch } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import { useToast } from '@/hooks/useToast'

const SETTINGS_KEY = (channel: string) => `birdcrm.channel-settings.${channel}`

interface ChannelSettings {
  optOutKeywords: string[]
  optInKeywords: string[]
  autoReply: string
  quietHours: boolean
  quietFrom: string
  quietTo: string
}

const DEFAULTS: ChannelSettings = { optOutKeywords: ['stop', 'unsubscribe', 'cancel'], optInKeywords: ['start', 'unstop'], autoReply: 'You have been unsubscribed and will not receive more messages. Reply START to resubscribe.', quietHours: true, quietFrom: '21:00', quietTo: '08:00' }

/** SMS and WhatsApp share one layout: accounts, compliance settings and (SMS) numbers / (WhatsApp) templates. */
export function MessagingChannelPage({ channel }: { channel: 'sms' | 'whatsapp' }) {
  const toast = useToast()
  const meta = CHANNELS[channel]
  const numbers = useAll('numbers', numbersApi.list)
  const templates = useAll('templates', templatesApi.list, { channel: 'whatsapp' })
  const [settings, setSettings] = useState<ChannelSettings>(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY(channel)) ?? '{}') }
    } catch {
      return DEFAULTS
    }
  })
  const set = (patch: Partial<ChannelSettings>) => setSettings({ ...settings, ...patch })
  const smsNumbers = (numbers.data?.data ?? []).filter((n) => n.capabilities.includes(channel === 'sms' ? 'sms' : 'whatsapp'))
  const tplCounts = (templates.data?.data ?? []).reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), {})

  return (
    <>
      <PageHeader title={meta.label} description={meta.description} />
      <div className="row g-4">
        <div className="col-xl-7">
          <ChannelAccountsPanel channel={channel} title={channel === 'sms' ? 'Senders' : 'WhatsApp numbers'} />
          {channel === 'sms' ? (
            <Panel title="Phone numbers" actions={<Link to={ROUTES.CHANNEL_VOICE} className="btn btn-sm btn-light">Manage numbers</Link>} flush>
              <ul className="list-group list-group-flush">
                {smsNumbers.map((n) => (
                  <li key={n.id} className="list-group-item d-flex align-items-center gap-3">
                    <span className="fw-medium tabular-nums">{n.number}</span>
                    <span className="text-muted fs-sm flex-1">{n.label} · {n.country} · {n.type.replace('_', ' ')}</span>
                    <StatusBadge status={n.status} />
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <Panel title="Message templates" description="Business-initiated WhatsApp messages need an approved template." actions={<Link to={`${ROUTES.TEMPLATES}?channel=whatsapp`} className="btn btn-sm btn-light">Manage templates</Link>}>
              <div className="d-flex gap-5">
                {['approved', 'pending', 'rejected', 'draft'].map((s) => (
                  <div key={s}>
                    <div className="fs-4 fw-semibold">{tplCounts[s] ?? 0}</div>
                    <StatusBadge status={s} />
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
        <div className="col-xl-5">
          <Panel title="Compliance" description="Applied to every workspace message on this channel.">
            <FormField id="kw-out" label="Opt-out keywords" hint="Inbound messages matching these unsubscribe the contact from this channel." className="mb-3">
              <TagInput id="kw-out" value={settings.optOutKeywords} onChange={(optOutKeywords) => set({ optOutKeywords })} />
            </FormField>
            <FormField id="kw-in" label="Opt-in keywords" className="mb-3">
              <TagInput id="kw-in" value={settings.optInKeywords} onChange={(optInKeywords) => set({ optInKeywords })} />
            </FormField>
            <FormField id="kw-reply" label="Opt-out confirmation" className="mb-4">
              <textarea id="kw-reply" rows={3} className="form-control" value={settings.autoReply} onChange={(e) => set({ autoReply: e.target.value })} />
            </FormField>
            <Switch id="quiet" checked={settings.quietHours} onChange={(quietHours) => set({ quietHours })} label="Quiet hours" description="Marketing messages wait until the window ends, in the contact’s time zone." />
            {settings.quietHours && (
              <div className="row g-3 mt-1">
                <FormField id="q-from" label="From" className="col-6"><input id="q-from" type="time" className="form-control" value={settings.quietFrom} onChange={(e) => set({ quietFrom: e.target.value })} /></FormField>
                <FormField id="q-to" label="Until" className="col-6"><input id="q-to" type="time" className="form-control" value={settings.quietTo} onChange={(e) => set({ quietTo: e.target.value })} /></FormField>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary mt-4"
              onClick={() => {
                localStorage.setItem(SETTINGS_KEY(channel), JSON.stringify(settings))
                toast.success('Settings saved')
              }}
            >
              Save settings
            </button>
          </Panel>
        </div>
      </div>
    </>
  )
}
