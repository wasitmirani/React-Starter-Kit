import { useEffect, useState } from 'react'
import { channelAccountsApi } from '@/api/endpoints/channels.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CopyButton } from '@/components/common/Misc'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { Panel } from '@/components/common/Panel'
import { MoreMenu } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { CHANNELS } from '@/constants/channels.constants'
import { PROVIDERS } from '@/constants/providers.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Channel, ChannelAccount } from '@/types/channel.types'

export function ConnectChannelModal({ channel, open, onClose }: { channel: Channel; open: boolean; onClose: () => void }) {
  const specs = PROVIDERS[channel] ?? []
  const [provider, setProvider] = useState(specs[0]?.provider ?? '')
  const [name, setName] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const spec = specs.find((s) => s.provider === provider)

  useEffect(() => {
    if (open) {
      setProvider(PROVIDERS[channel]?.[0]?.provider ?? '')
      setName(`${CHANNELS[channel].label} account`)
      setValues({})
    }
  }, [open, channel])

  const connect = useAction(
    'channel-accounts',
    () =>
      channelAccountsApi.connect({
        channel,
        name: name.trim(),
        provider,
        identifier: values[spec!.identifier] || provider,
        credentials: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
      }),
    { success: (a) => `${a.name} is connected`, onSuccess: onClose },
  )
  // Gmail / Outlook: leave for the provider's sign-in page; it redirects back to the Email page.
  const signIn = useAction('channel-accounts', () => channelAccountsApi.startOAuth(spec!.oauth!, name.trim()), {
    onSuccess: ({ url }) => window.location.assign(url),
  })
  const missing = spec?.fields.filter((f) => !f.optional).some((f) => !values[f.key]?.trim()) ?? true
  const busy = connect.isPending || signIn.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Connect ${CHANNELS[channel].label}`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          {spec?.oauth ? (
            <button type="button" className="btn btn-primary" disabled={!name.trim() || busy} onClick={() => signIn.mutate(undefined)}>
              <i className={spec.oauth === 'gmail' ? 'ri-google-fill' : 'ri-microsoft-fill'} />
              {signIn.isPending ? 'Opening…' : `Continue with ${spec.oauth === 'gmail' ? 'Google' : 'Microsoft'}`}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={missing || !name.trim() || busy} onClick={() => connect.mutate(undefined)}>{connect.isPending ? 'Checking credentials…' : 'Connect'}</button>
          )}
        </>
      }
    >
      {specs.length > 1 && (
        <div className="segmented segmented-block mb-2" role="group" aria-label="Provider">
          {specs.map((s) => <button key={s.provider} type="button" className={provider === s.provider ? 'active' : ''} aria-pressed={provider === s.provider} onClick={() => setProvider(s.provider)}>{s.provider}</button>)}
        </div>
      )}
      {spec?.note && <p className="text-muted fs-sm mb-4">{spec.note}</p>}
      <FormField id="acc-name" label="Display name" className="mb-3">
        <input id="acc-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      {spec?.fields.map((f) => (
        <FormField key={f.key} id={`acc-${f.key}`} label={f.label} hint={f.hint} className="mb-3">
          <input id={`acc-${f.key}`} type={f.secret ? 'password' : 'text'} autoComplete="off" className="form-control" placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
        </FormField>
      ))}
      <p className="text-muted fs-sm mb-0">
        <i className="ri-lock-line me-1" />
        {spec?.oauth
          ? 'You sign in on the provider’s page. We store only an encrypted access grant, never your password, and you can revoke it from your account at any time.'
          : 'We check the credentials with the provider before saving. They are stored encrypted and never shown again.'}
      </p>
    </Modal>
  )
}

/** Where the provider must send incoming messages: copyable URL and verify token. */
function WebhookSetup({ setup }: { setup: NonNullable<ChannelAccount['setup']> }) {
  const [open, setOpen] = useState(setup.registered === false)
  return (
    <div className="webhook-setup mt-2">
      <button type="button" className="btn btn-link btn-sm p-0 fs-sm" onClick={() => setOpen(!open)} aria-expanded={open}>
        <i className={open ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} /> Webhook setup{setup.registered ? ' · registered automatically' : ''}
      </button>
      {open && (
        <div className="webhook-setup-body">
          {setup.note && <p className="text-muted fs-sm mb-2">{setup.note}</p>}
          <div className="endpoint-box mb-2"><span className="http-method">URL</span><code className="text-truncate">{setup.inboundUrl}</code><CopyButton value={setup.inboundUrl} label="" className="btn btn-sm btn-light btn-icon" /></div>
          {setup.verifyToken && <div className="endpoint-box"><span className="http-method bg-secondary">Token</span><code className="text-truncate">{setup.verifyToken}</code><CopyButton value={setup.verifyToken} label="" className="btn btn-sm btn-light btn-icon" /></div>}
        </div>
      )}
    </div>
  )
}

/** Connected accounts for one channel with check/default/disconnect actions. */
export function ChannelAccountsPanel({ channel, title = 'Connected accounts' }: { channel: Channel; title?: string }) {
  const accounts = useAll('channel-accounts', channelAccountsApi.list, { channel })
  const [connecting, setConnecting] = useState(false)
  const [removing, setRemoving] = useState<ChannelAccount | null>(null)
  const check = useAction('channel-accounts', channelAccountsApi.check, { success: (a) => (a.status === 'connected' ? `${a.name} is working` : `${a.name}: ${a.statusDetail ?? 'connection problem'}`) })
  const update = useAction('channel-accounts', ({ id, patch }: { id: string; patch: Partial<ChannelAccount> }) => channelAccountsApi.update(id, patch), { success: 'Account updated' })
  const remove = useAction('channel-accounts', channelAccountsApi.remove, { success: 'Account disconnected', onSuccess: () => setRemoving(null) })
  const rows = accounts.data?.data ?? []

  return (
    <>
      <Panel title={title} actions={<button type="button" className="btn btn-sm btn-primary" onClick={() => setConnecting(true)}><i className="ri-add-line me-1" />Connect account</button>} flush className="mb-4">
        {accounts.isLoading ? (
          <div className="p-4"><SkeletonLines lines={3} /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={CHANNELS[channel].icon} title={`No ${CHANNELS[channel].label} account yet`} description={CHANNELS[channel].description} action={<button type="button" className="btn btn-primary btn-sm" onClick={() => setConnecting(true)}>Connect</button>} />
        ) : (
          <ul className="list-group list-group-flush">
            {rows.map((a) => (
              <li key={a.id} className="list-group-item d-flex flex-wrap align-items-center gap-3 py-3">
                <span className={`icon-tile bg-${CHANNELS[channel].tone}-subtle text-${CHANNELS[channel].tone}`}><i className={CHANNELS[channel].icon} /></span>
                <div className="min-w-0 flex-1">
                  <div className="fw-medium d-flex align-items-center gap-2">{a.name}{a.isDefault && <ToneBadge tone="primary">Default</ToneBadge>}</div>
                  <div className="text-muted fs-sm">{a.provider} · {a.identifier}{a.throughput ? ` · ${a.throughput} msg/s` : ''}</div>
                  {a.statusDetail && <div className={`fs-sm ${a.status === 'error' ? 'text-danger' : 'text-warning'}`}>{a.statusDetail}</div>}
                  {a.setup && <WebhookSetup setup={a.setup} />}
                </div>
                {a.quality && <span className="fs-sm text-muted">Quality: <StatusBadge status={a.quality} /></span>}
                <StatusBadge status={a.status} />
                <MoreMenu
                  items={[
                    { key: 'check', label: 'Check connection', icon: 'ri-pulse-line', onSelect: () => check.mutate(a.id) },
                    ...(!a.isDefault ? [{ key: 'default', label: 'Make default', icon: 'ri-star-line', onSelect: () => update.mutate({ id: a.id, patch: { isDefault: true } }) }] : []),
                    ...(a.status === 'error' ? [{ key: 'reconnect', label: 'Reconnect', icon: 'ri-refresh-line', onSelect: () => setConnecting(true) }] : []),
                    'divider',
                    { key: 'remove', label: 'Disconnect', icon: 'ri-link-unlink', danger: true, onSelect: () => setRemoving(a) },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <ConnectChannelModal channel={channel} open={connecting} onClose={() => setConnecting(false)} />
      <ConfirmDialog
        open={removing !== null}
        title="Disconnect account?"
        message={<>Campaigns and automations sending from <strong>{removing?.name}</strong> will fail until another account is chosen. Inbound messages stop arriving.</>}
        confirmLabel="Disconnect"
        danger
        busy={remove.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => remove.mutate(removing!.id)}
      />
    </>
  )
}
