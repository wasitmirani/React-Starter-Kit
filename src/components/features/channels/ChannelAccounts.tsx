import { useEffect, useState } from 'react'
import { channelAccountsApi } from '@/api/endpoints/channels.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
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
      channelAccountsApi.create({
        channel,
        name: name.trim(),
        provider,
        identifier: values[spec!.identifier] || provider,
        status: 'pending',
        statusDetail: 'Verifying credentials with the provider…',
        throughput: null,
        quality: null,
        isDefault: false,
      }),
    { success: 'Account added. We are verifying the credentials.', onSuccess: onClose },
  )
  const missing = spec?.fields.filter((f) => !f.hint?.startsWith('Optional')).some((f) => !values[f.key]?.trim()) ?? true

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Connect ${CHANNELS[channel].label}`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={missing || !name.trim() || connect.isPending} onClick={() => connect.mutate(undefined)}>{connect.isPending ? 'Connecting…' : 'Connect'}</button>
        </>
      }
    >
      {specs.length > 1 && (
        <div className="btn-group w-100 mb-4" role="group" aria-label="Provider">
          {specs.map((s) => <button key={s.provider} type="button" className={`btn ${provider === s.provider ? 'btn-primary' : 'btn-light'}`} onClick={() => setProvider(s.provider)}>{s.provider}</button>)}
        </div>
      )}
      <FormField id="acc-name" label="Display name" className="mb-3">
        <input id="acc-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      {spec?.fields.map((f) => (
        <FormField key={f.key} id={`acc-${f.key}`} label={f.label} hint={f.hint} className="mb-3">
          <input id={`acc-${f.key}`} type={f.secret ? 'password' : 'text'} autoComplete="off" className="form-control" placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
        </FormField>
      ))}
      <p className="text-muted fs-sm mb-0"><i className="ri-lock-line me-1" />Credentials are encrypted in the secret store and never displayed again.</p>
    </Modal>
  )
}

/** Connected accounts for one channel with check/default/disconnect actions. */
export function ChannelAccountsPanel({ channel, title = 'Connected accounts' }: { channel: Channel; title?: string }) {
  const accounts = useAll('channel-accounts', channelAccountsApi.list, { channel })
  const [connecting, setConnecting] = useState(false)
  const [removing, setRemoving] = useState<ChannelAccount | null>(null)
  const check = useAction('channel-accounts', channelAccountsApi.check, { success: 'Connection checked' })
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
